import { test, expect, type Page } from '@playwright/test';
import { fillTemplate } from './fixtures';

async function next(page: Page) { await page.getByRole('button', { name: 'NEXT', exact: true }).click(); }

for (const language of ['Python', 'C#']) test(`fresh ${language} student chooses language, sees five screens and can replay without losing code`, async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'OPEN FILE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'CHOOSE YOUR CODE.' })).toBeVisible();
  await expect(page.locator('.investigation-page')).toHaveCount(0);
  await page.getByRole('button', { name: new RegExp(`START WITH ${language === 'C#' ? 'C#' : 'PYTHON'}`) }).click();
  const headings = ['BRIAN IS MISSING.', 'FOLLOW RECORDS. QUESTION ASSUMPTIONS.', 'THREE PLACES TO LOOK.', 'TURN CLUES INTO AN ANSWER.', 'RECOVER. COMPARE. RECONSTRUCT.'];
  for (let index = 0; index < 5; index++) {
    await expect(page.getByRole('heading', { name: headings[index], exact: true })).toBeVisible();
    await expect(page.getByLabel(`Screen ${index + 1} of 5`)).toBeVisible();
    await expect(page.locator('.investigation-page')).toHaveCount(0);
    if (index === 0) await expect(page.getByRole('button', { name: 'BACK', exact: true })).toBeDisabled();
    if (index === 3) {
      await expect(page.getByLabel(`${language} practice example`)).toContainText(language === 'C#' ? 'Console.WriteLine(result);' : 'print(result)');
      await page.getByRole('button', { name: 'BACK', exact: true }).click();
      await expect(page.getByRole('heading', { name: headings[2], exact: true })).toBeVisible();
      await next(page);
      await page.screenshot({ path: `test-results/${testInfo.project.name}-${language === 'C#' ? 'csharp' : 'python'}-tutorial.png` });
    }
    if (index < 4) await next(page);
  }
  await page.getByRole('button', { name: 'START INVESTIGATING', exact: true }).click();
  const editor = page.getByRole('group', { name: `${language} code template`, exact: true });
  await expect(editor).toBeVisible();
  await expect(page.locator('.subset-label')).toContainText(language.toUpperCase());
  await expect(editor).toContainText('camera_log');
  await page.getByLabel('Value for camera_log', {exact:true}).fill('257880');
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[1]);
  await page.getByRole('button', { name: 'HOW TO PLAY', exact: true }).click();
  await expect(page.getByRole('heading', { name: headings[0] })).toBeVisible();
  await next(page);
  await page.getByRole('button', { name: 'RETURN TO CASE', exact: true }).click();
  await expect(page.getByLabel('Value for camera_log', {exact:true})).toHaveValue('257880');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[1])).toBe(draft);
  await page.reload();
  await expect(page.getByLabel('Value for camera_log', {exact:true})).toHaveValue('257880');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[1])).toBe(draft);
  await expect(page.getByRole('button', { name: 'HOW TO PLAY', exact: true })).toBeVisible();
  await expect(page.getByText('SAVED ON THIS DEVICE', { exact: true })).toHaveCount(0);
  await fillTemplate(page, 'camera_log = 257880\nbackup_log = 921\nresult = camera_log / backup_log\nprint(result)');
  await expect(page.getByLabel('Value for camera_log', {exact:true})).toHaveCSS('color', 'rgb(255, 195, 66)');
  await expect(page.locator('.guided-program .syntax-variable').filter({ hasText: /^camera_log$/ }).first()).toHaveCSS('color', 'rgb(255, 83, 95)');
  await expect(page.locator('.guided-program .syntax-function').last()).toHaveCSS('color', 'rgb(54, 221, 255)');
  await expect(editor).toHaveCSS('background-color', 'rgb(8, 11, 25)');
  await page.screenshot({ path: `test-results/${testInfo.project.name}-${language === 'C#' ? 'csharp' : 'python'}-editor.png` });
});

test('direct case URL requires language and tutorial; partial tutorial is not counted as complete', async ({ page }) => {
  await page.goto('/case/001');
  await page.getByRole('button', { name: /START WITH C#/ }).click();
  await next(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'BRIAN IS MISSING.' })).toBeVisible();
  await expect(page.locator('.investigation-page')).toHaveCount(0);
});

test('an existing Python draft survives choosing C# for an older saved investigation', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => localStorage.getItem('cold-case:001:v1') !== null);
  const draft = '# our existing program\ncamera_log = 257880';
  await page.evaluate(draft => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    state.opened = true; state.codes[1] = draft;
    state.solved = [1]; state.results = { 1: 280 };
    delete state.language; delete state.languageChosen; delete state.tutorialCompleted;
    localStorage.setItem(key, JSON.stringify(state));
  }, draft);
  await page.goto('/case/001');
  await page.getByRole('button', { name: /START WITH C#/ }).click();
  for (let index = 0; index < 4; index++) await next(page);
  await page.getByRole('button', { name: 'START INVESTIGATING' }).click();
  await expect(page.getByRole('group', { name: 'C# code template' })).toContainText('camera_log');
  await page.getByRole('button', { name: 'PREVIOUS NOTES', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('our existing program');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!));
  expect(saved.previousWork.codes[1]).toBe(draft);
  expect(saved.solved).toEqual([1]);
});

test('teacher password gates homepage access, direct URLs, reloads and printable content', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /TEACHER TOOLS/ }).click();
  await expect(page.getByRole('heading', { name: 'TEACHER ACCESS.' })).toBeVisible();
  await expect(page.locator('.print-sheet')).toHaveCount(0);
  await page.getByLabel('Password', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'UNLOCK TEACHER TOOLS' }).click();
  await expect(page.getByRole('alert')).toContainText('doesn’t match');
  await expect(page.locator('.print-sheet')).toHaveCount(0);
  await page.getByLabel('Password', { exact: true }).fill('leleomaker');
  await page.getByRole('button', { name: 'UNLOCK TEACHER TOOLS' }).click();
  await expect(page.locator('.print-sheet')).toHaveCount(2);
  await page.reload();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(page.locator('.print-sheet')).toHaveCount(0);
});

test('tutorial remains readable and its navigation reachable on landscape tablets and short screens', async ({ page }) => {
  await page.goto('/case/001');
  await page.getByRole('button', { name: /START WITH C#/ }).click();
  for (const viewport of [{ width: 1024, height: 768 }, { width: 820, height: 600 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const nextButton = page.getByRole('button', { name: 'NEXT', exact: true });
    await nextButton.scrollIntoViewIfNeeded();
    await expect(nextButton).toBeInViewport();
    expect((await nextButton.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});
