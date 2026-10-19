import { test as base, expect, type Page } from '@playwright/test';

// Existing investigation tests start with the introduction already completed.
// onboarding.spec.ts exercises the real, fresh-student entry flow separately.
export const test = base.extend({ page: async ({ page }, use) => {
  await page.addInitScript(() => {
    const key = 'cold-case:001:v1';
    const state = JSON.parse(localStorage.getItem(key) || 'null') || { version: 1, caseId: '001', caseRevision: 3 };
    localStorage.setItem(key, JSON.stringify({ ...state, languageChosen: true, tutorialCompleted: true }));
  });
  await use(page);
} });
export { expect, type Page };
/** Enter a solution through the student's value fields and operator menus. */
export async function fillTemplate(page: Page, source: string) {
  for (const field of await page.locator('.guided-program input[aria-label^="Value for "]').all()) {
    const name = (await field.getAttribute('aria-label'))!.slice('Value for '.length);
    const value = source.match(new RegExp(`(?:^|\\n)(?:int )?${name}\\s*=\\s*(-?\\d+)`))?.[1] ?? '';
    await field.fill(value);
  }
  const expression = source.match(/(?:^|\n)(?:int )?result\s*=\s*([^;\n]*)/)?.[1] ?? '';
  const operations = expression.match(/[+*/-]/g) ?? [];
  for (const [index, field] of (await page.getByRole('combobox', { name: /Operator \d+ for result/ }).all()).entries()) await field.selectOption(operations[index] ?? '');
  const numbers = expression.match(/\b\d+\b/g) ?? [];
  for (const [index, field] of (await page.locator('.guided-program input[aria-label$="in calculation"]').all()).entries()) await field.fill(numbers[index] ?? '');
}
export async function unlockTeacher(page: Page) {
  await page.getByLabel('Password', { exact: true }).fill('leleomaker');
  await page.getByRole('button', { name: 'UNLOCK TEACHER TOOLS', exact: true }).click();
}
