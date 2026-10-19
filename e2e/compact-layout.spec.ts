import { test, expect } from './fixtures';

test('the on-screen keyboard overlays the desk without shrinking its layout', async ({ page }) => {
  await page.goto('/case/001');
  const editor = page.getByRole('textbox', { name: 'Python code editor', exact: true });
  await expect(editor).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await editor.fill('# keyboard overlay draft\nresult = 280\nprint(result)');
  const measure = () => page.evaluate(() => Object.fromEntries([
    '.app-shell', '.site-header', '.investigation-grid', '.code-editor', '.step-dock', '.case-file-intro',
  ].map(selector => {
    const element = document.querySelector(selector)!;
    const rect = element.getBoundingClientRect();
    return [selector, { width: rect.width, height: rect.height, display: getComputedStyle(element).display }];
  })));
  const before = await measure();
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Object.defineProperty(viewport, 'height', { configurable: true, value: window.innerHeight * .45 });
    viewport.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
  });
  expect(await measure()).toEqual(before);
  await expect(editor).toContainText('# keyboard overlay draft');
  await expect(editor).toBeFocused();
  await page.evaluate(() => {
    delete (window.visualViewport as unknown as { height?: number }).height;
    window.visualViewport!.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
  });
  expect(await measure()).toEqual(before);
});

test('header and step dock are ten percent shorter and the case file scrolls independently',async({page})=>{
  await page.goto('/case/001');
  for(const [width,height,oldHeader,oldDock] of [[1440,900,92,98],[1024,768,77,86],[925,590,65,73],[844,390,43,55]]){
    await page.setViewportSize({width,height});
    await expect.poll(()=>page.locator('.site-header').evaluate(node=>node.getBoundingClientRect().height)).toBeCloseTo(oldHeader*.9,1);
    await expect.poll(()=>page.locator('.step-dock').evaluate(node=>node.getBoundingClientRect().height)).toBeCloseTo(oldDock*.9,1);
    await page.waitForFunction(()=>Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--app-height'))-innerHeight)<1);
    expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(false);
  }
  await page.setViewportSize({width:925,height:590});
  const file=page.getByRole('complementary',{name:'Case file',exact:true});
  await expect(file).toHaveCSS('overflow-y','auto');
  expect(await file.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
  await file.focus();await page.keyboard.press('End');
  await expect.poll(()=>file.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  await expect(file.locator('.objective')).toBeInViewport();
  await expect(page.locator('.desk-note')).toHaveCount(0);
  const desk=page.getByRole('complementary',{name:'Evidence desk'});
  await expect(desk).not.toContainText('People');
  expect(await page.locator('.evidence-stack').evaluate(node=>node.getBoundingClientRect().height)).toBeGreaterThan(200);
  await page.screenshot({path:'test-results/compact-scrollable-desk.png'});
});
