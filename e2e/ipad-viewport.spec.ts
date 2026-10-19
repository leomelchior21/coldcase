import { test, expect, type Page } from './fixtures';

async function visibleHeight(page: Page, height: number) {
  await page.evaluate(height => {
    Object.defineProperty(window.visualViewport!, 'height', { configurable: true, value: height });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  }, height);
}

async function expectNavigationToFit(page: Page, height: number) {
  const bounds = await page.locator('.site-header, .step-tab').evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  }));
  expect(bounds).toHaveLength(9);
  for (const rect of bounds) {
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(height);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({ x: 0, y: 0 });
}

test('iPad browser bars and safe-area padding leave the header and all eight steps visible', async ({ page }) => {
  await page.goto('/case/001');
  for (const [width, height, available] of [[1024, 768, 650], [1180, 820, 704], [1366, 1024, 896]]) {
    await page.setViewportSize({ width, height });
    await visibleHeight(page, available);
    await expect.poll(() => page.locator('.game-shell').evaluate(node => node.getBoundingClientRect().height)).toBe(available);
    // Simulate the additional insets used by iPads with a home indicator.
    await page.locator('.game-shell').evaluate(node => {
      (node as HTMLElement).style.paddingTop = '20px';
      (node as HTMLElement).style.paddingBottom = '24px';
    });
    await expectNavigationToFit(page, available);
    await expect(page.getByRole('button', { name: 'RUN CASE', exact: true })).toBeInViewport();
  }
});

test('case file, code and evidence scroll independently without moving the header or steps', async ({ page }) => {
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened);
  await page.evaluate(() => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { solved: [1,2,3,4,5,6,7,8], currentStep: 5, cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true });
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.reload();
  await visibleHeight(page, 620);
  await expect.poll(() => page.locator('.game-shell').evaluate(node => node.clientHeight)).toBe(620);
  const before = await page.locator('.site-header, .step-dock').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()));
  const selectors = ['.case-file-panel', '.guided-code', '.evidence-stack'];
  for (const selector of selectors) {
    const panel = page.locator(selector);
    await expect(panel).toHaveCSS('overflow-y', 'auto');
    await expect.poll(() => panel.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    const otherPositions = await page.locator(selectors.filter(other => other !== selector).join(',')).evaluateAll(nodes => nodes.map(node => node.scrollTop));
    await panel.focus();
    await page.keyboard.press('End');
    await expect.poll(() => panel.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    expect(await page.locator(selectors.filter(other => other !== selector).join(',')).evaluateAll(nodes => nodes.map(node => node.scrollTop))).toEqual(otherPositions);
    await expectNavigationToFit(page, 620);
  }
  expect(await page.locator('.site-header, .step-dock').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()))).toEqual(before);
  await page.screenshot({ path: 'test-results/ipad-independent-panels.png' });
});

test('the keyboard overlays an already fitted desk and browser bars can resize it again after closing', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/case/001');
  await visibleHeight(page, 668);
  await expect.poll(() => page.locator('.game-shell').evaluate(node => node.clientHeight)).toBe(668);
  const value = page.getByLabel('Value for camera_log', { exact: true });
  await value.fill('257880');
  const before = await page.locator('.game-shell, .guided-code, .step-dock').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()));
  await visibleHeight(page, 330);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  expect(await page.locator('.game-shell, .guided-code, .step-dock').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()))).toEqual(before);
  await value.blur();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await page.locator('.game-shell').evaluate(node => node.clientHeight)).toBe(668);
  await visibleHeight(page, 700);
  await expect.poll(() => page.locator('.game-shell').evaluate(node => node.clientHeight)).toBe(700);
  await expect(value).toHaveValue('257880');
  await expectNavigationToFit(page, 700);
});

test('the evidence drawer fits the visible screen and leaving the game releases the page lock', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 600 });
  await page.goto('/case/001');
  await visibleHeight(page, 500);
  await page.getByRole('button', { name: /EVIDENCE \(/ }).click();
  await expect.poll(() => page.locator('.evidence-panel').evaluate(node => node.getBoundingClientRect().bottom)).toBe(500);
  await page.getByRole('button', { name: 'Open Case brief', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect.poll(() => dialog.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(500);
  expect(await dialog.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.getByRole('button', { name: 'Close evidence desk', exact: true }).click();
  await page.getByRole('button', { name: 'CASE FILES', exact: true }).click();
  await expect(page.locator('html')).not.toHaveClass(/case-open/);
  await expect(page.locator('body')).toHaveCSS('position', 'static');
});
