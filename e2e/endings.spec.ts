import { test, expect, type Page } from './fixtures';

async function finalDeduction(page: Page) {
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened);
  await page.evaluate(() => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { solved: [1,2,3,4,5,6,7,8], currentStep: 8, cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true, closed: false, deduction: { person: '', account: '' } });
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page.getByRole('button', { name: 'RECONSTRUCT THE CASE', exact: true }).click();
}

test('the correct suspect celebrates and reveals the true story, including after reload', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await finalDeduction(page);
  await page.getByRole('button', { name: 'Emily Carter', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
  const ending = page.getByRole('main', { name: 'Case solved: Brian is safe' });
  await expect(ending).toBeFocused();
  await expect(ending.getByRole('heading', { name: 'YOU FOUND BRIAN!', exact: true })).toBeVisible();
  await expect(ending).toContainText('Brian was never in danger.');
  await expect(ending.locator('.ending-confetti i')).toHaveCount(48);
  await expect(ending.locator('.seal-check')).toHaveCSS('animation-name', 'draw-check');
  await expect(ending.locator('.story-beats article')).toHaveCount(3);
  await expect(ending.locator('.real-story')).toContainText('Key 27');
  await expect(ending.locator('.real-story')).toContainText('Room 204');
  await expect(ending.locator('.real-story')).toContainText('Maker demonstration');
  await expect(ending.locator('.real-story')).toContainText('15:50');
  await expect(ending.locator('.story-beats article').last()).toHaveCSS('opacity', '1');
  await expect.poll(() => ending.locator('.ending-scene img').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await ending.screenshot({ path: `test-results/${testInfo.project.name}-joyful-ending.png`, animations: 'disabled' });
  await ending.getByText('REPLAY THE EVIDENCE TRAIL', { exact: true }).click();
  await expect(ending.locator('.reconstruction-chain')).toBeVisible();
  await expect(ending.locator('.reconstruction-chain')).toContainText('72427');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'YOU FOUND BRIAN!', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'BACK TO THE DESK', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Restore the keypad scan', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a wrong suspect reveals a dramatic lost ending and allows another deduction', async ({ page }, testInfo) => {
  await finalDeduction(page);
  await page.getByRole('button', { name: 'Oliver Grant', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
  const ending = page.getByRole('alert', { name: 'Case unresolved: Brian was never found' });
  await expect(ending).toBeFocused();
  await expect(ending.getByRole('heading')).toHaveText(/BRIAN WAS\s*NEVER FOUND\./);
  await expect(ending.locator('.lost-hallway')).toHaveCSS('animation-name', 'hallway-recedes');
  await expect(ending.locator('.unresolved-stamp')).toHaveCSS('opacity', '1');
  await expect(ending).not.toContainText(/Emily|safe|demonstration/);
  await ending.screenshot({ path: `test-results/${testInfo.project.name}-dramatic-ending.png`, animations: 'disabled' });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).closed)).toBe(false);
  await ending.getByRole('button', { name: 'CHECK THE LEVELS AND TRY AGAIN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Restore the keypad scan', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'RECONSTRUCT THE CASE', exact: true }).click();
  await expect(page.locator('.deduction-suspects button[aria-pressed="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Emily Carter', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'YOU FOUND BRIAN!', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(false);
});

test('both endings remain readable with reduced motion enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await finalDeduction(page);
  await page.getByRole('button', { name: 'Maya Chen', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
  await expect(page.locator('.lost-message h1')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lost-message h1')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'CHECK THE LEVELS AND TRY AGAIN', exact: true }).click();
  await page.getByRole('button', { name: 'RECONSTRUCT THE CASE', exact: true }).click();
  await page.getByRole('button', { name: 'Emily Carter', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
  await expect(page.locator('.ending-confetti')).toBeHidden();
  await expect(page.locator('.seal-check')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.seal-check')).toHaveCSS('stroke-dashoffset', '0px');
  for (const beat of await page.locator('.story-beats article').all()) {
    await expect(beat).toHaveCSS('animation-name', 'none');
    await expect(beat).toHaveCSS('opacity', '1');
  }
});
