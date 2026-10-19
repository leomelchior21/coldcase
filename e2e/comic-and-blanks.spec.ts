import { test, expect, fillTemplate } from './fixtures';

for (const language of ['python', 'csharp'] as const) test(`${language} fixed templates accept only values and operators and preserve answers`, async ({ page }, testInfo) => {
  await page.addInitScript(language => {
    const key = 'cold-case:001:v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...state, language }));
  }, language);
  await page.goto('/case/001');
  const template = page.getByRole('group', { name: `${language === 'python' ? 'Python' : 'C#'} code template` });
  await expect(template).toBeVisible();
  await expect(page.locator('[contenteditable="true"], textarea')).toHaveCount(0);
  await expect(template.locator('input')).toHaveCount(2);
  await expect(template.locator('select')).toHaveCount(1);
  await expect(template).not.toContainText('VARIABLE_');
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.error')).toContainText('Fill the blanks');
  await fillTemplate(page, 'camera_log = 257880\nbackup_log = 921\nresult = camera_log + backup_log\nprint(result)');
  const camera = page.getByLabel('Value for camera_log', {exact:true});
  await camera.fill('camera_log = 1');
  await expect(camera).toHaveValue('257880');
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.error')).toBeVisible();
  await page.getByLabel('Operator 1 for result', {exact:true}).selectOption('/');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[1]);
  expect(saved).not.toContain('camera_log = 1');
  await page.reload();
  await expect(camera).toHaveValue('257880');
  await expect(page.getByLabel('Operator 1 for result', {exact:true})).toHaveValue('/');
  for (const control of await template.locator('input, select').all()) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.locator('.terminal-panel').screenshot({path:`test-results/${testInfo.project.name}-${language}-fixed-template.png`});
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.success')).toContainText('280');
  await page.getByRole('dialog', { name: 'New evidence recovered' }).getByRole('button', { name: 'Close dialog' }).click();
  await page.locator('.step-tab').nth(1).click();
  await expect(page.getByLabel('Value for inventory_checksum', {exact:true})).toHaveValue('');
  await fillTemplate(page, 'inventory_checksum = 864\nreturned_checksum = 837\nresult = inventory_checksum - returned_checksum\nprint(result)');
  await page.getByRole('button', { name: 'RUN CASE', exact: true }).click();
  await expect(page.locator('.console-output.success')).toContainText('27');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await page.getByRole('button', { name: 'RESET PROGRAM', exact: true }).click();
  await expect(page.getByLabel('Value for inventory_checksum', {exact:true})).toHaveValue('');
  await expect(page.getByLabel('Operator 1 for result', {exact:true})).toHaveValue('');
  await page.reload();
  await expect(page.getByLabel('Value for inventory_checksum', {exact:true})).toHaveValue('');
  await expect(template).toContainText('inventory_checksum');
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
  await expect(comic.locator('img')).toHaveAttribute('src', '/cases/case001/evidence/opening-comic.jpg');
  await expect.poll(() => comic.locator('img').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-comic-brief.png` });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'HOW TO PLAY', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'BRIAN IS MISSING.' })).toBeVisible();
  await expect(page.locator('.onboarding-page .case-comic img')).toHaveAttribute('src', '/cases/case001/evidence/opening-comic.jpg');
  await page.getByRole('button', { name: 'NEXT', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'NEXT', exact: true })).toBeInViewport();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-comic-guide.png` });
});
