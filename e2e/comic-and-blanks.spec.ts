import { test, expect } from './fixtures';

for (const language of ['python', 'csharp'] as const) test(`${language} glowing blanks accept typing, disappear, and preserve executable code`, async ({ page }) => {
  await page.addInitScript(language => {
    const key = 'cold-case:001:v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...state, language }));
  }, language);
  await page.goto('/case/001');
  const editor = page.getByRole('textbox', { name: `${language === 'python' ? 'Python' : 'C#'} code editor` });
  const resultBlank = page.getByRole('button', { name: 'Enter calculation for result' });
  await resultBlank.click();
  await page.keyboard.insertText('camera_log / backup_log');
  await expect(resultBlank).toHaveCount(0);
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.success')).toContainText('280');
  await page.getByRole('dialog', { name: 'New evidence recovered' }).getByRole('button', { name: 'Close dialog' }).click();
  await page.locator('.step-tab').nth(1).click();
  const incomplete = language === 'python'
    ? 'inventory_checksum =\nreturned_checksum =\nresult =\nprint(result)'
    : 'int inventory_checksum =;\nint returned_checksum =;\nint result =;\nConsole.WriteLine(result);';
  await editor.fill(incomplete);
  await expect(page.locator('.code-answer-blank')).toHaveCount(3);
  for (const [name, value] of [['inventory_checksum', '864'], ['returned_checksum', '837'], ['result', 'inventory_checksum - returned_checksum']]) {
    const field = page.getByRole('button', { name: name === 'result' ? 'Enter calculation for result' : `Enter value for ${name}` });
    // The result blank also supports keyboard activation.
    if (name === 'result') { await field.focus(); await page.keyboard.press('Enter'); }
    else await field.click();
    await page.keyboard.insertText(value);
    await expect(field).toHaveCount(0);
  }
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[2]);
  expect(saved).not.toMatch(/your calculation|<span|code-answer-blank/);
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.success')).toContainText('27');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await editor.fill(incomplete);
  await expect(page.locator('.code-answer-blank')).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(resultBlank).toHaveCSS('animation-name', 'none');
  await page.reload();
  await expect(page.locator('.code-answer-blank')).toHaveCount(3);
});

test('all suspect photos retain portrait proportions in records and the final choice', async ({ page }, testInfo) => {
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened === true);
  await page.evaluate(() => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { solved: [1,2,3,4,5,6,7,8], cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true });
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  for (const title of ['Suspect board', 'Detailed suspect files']) {
    await page.getByRole('button', { name: `Open ${title}`, exact: true }).click();
    await expect(page.locator('.suspect-card .portrait')).toHaveCount(9);
    for (const portrait of await page.locator('.suspect-card .portrait').all()) {
      // Use layout dimensions: the evidence modal has a decorative rotation.
      const size = await portrait.evaluate(node => ({ width: node.clientWidth, height: node.clientHeight }));
      expect(Math.abs(size.width - size.height * .75)).toBeLessThanOrEqual(1);
      await expect(portrait.locator('img')).toHaveCSS('object-fit', 'contain');
    }
    if (title === 'Suspect board') await page.screenshot({ path: `test-results/${testInfo.project.name}-portrait-board.png` });
    await page.getByRole('button', { name: 'Close dialog' }).click();
  }
  await page.getByRole('button', { name: 'FINAL DEDUCTION', exact: true }).click();
  for (const portrait of await page.locator('.deduction-suspects .portrait').all()) {
    // Small portraits can differ by one CSS pixel after WebKit rounds layout.
    const size = await portrait.evaluate(node => ({ width: node.clientWidth, height: node.clientHeight }));
    expect(Math.abs(size.width - size.height * .75)).toBeLessThanOrEqual(1);
  }
  await page.getByRole('button', { name: 'Oliver Grant', exact: true }).click();
  await expect(page.getByRole('button', { name: 'CLOSE THE CASE' })).toBeInViewport();
});

test('brief and first guide screen share the urgent comic story', async ({ page }, testInfo) => {
  await page.goto('/case/001');
  await page.getByRole('button', { name: 'Open Case brief', exact: true }).click();
  const comic = page.getByRole('dialog').locator('.case-comic');
  await expect(comic).toContainText('WHERE IS BRIAN?');
  await expect(comic).toContainText("DON'T LOSE THE TRAIL.");
  await expect(comic.locator('img')).toHaveAttribute('src', '/cases/case001/evidence/opening-comic.webp');
  await expect.poll(() => comic.locator('img').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-comic-brief.png` });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'HOW TO PLAY', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'BRIAN IS MISSING.' })).toBeVisible();
  await expect(page.locator('.onboarding-page .case-comic img')).toHaveAttribute('src', '/cases/case001/evidence/opening-comic.webp');
  await page.getByRole('button', { name: 'NEXT', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'NEXT', exact: true })).toBeInViewport();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-comic-guide.png` });
});
