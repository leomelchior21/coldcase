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
export async function unlockTeacher(page: Page) {
  await page.getByLabel('Password', { exact: true }).fill('leleomaker');
  await page.getByRole('button', { name: 'UNLOCK TEACHER TOOLS', exact: true }).click();
}
