import { test, expect } from './fixtures';
import { case001 } from '../src/cases/case001';
import { codeForStep } from '../src/engine/language';

test('all eight C# editors remove the four extra saved comments', async ({ page }, testInfo) => {
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened === true);
  const guide = [
    '// Declare whole numbers with int, e.g. int clues = 2;',
    '// End each statement with a semicolon (;).',
    '// Replace each glowing VARIABLE name and fill its value from the Case Note.',
    '// Complete result with your calculation, then print result below.',
  ].join('\n');
  const codes = Object.fromEntries(case001.steps.map(step => {
    const starter = codeForStep(step, 'csharp').replace(/(?:FINAL )?CASE NOTE/, 'My edited case note');
    return [step.id, starter.replace('// Use Console.WriteLine(result);', `// Use Console.WriteLine(result);\n${guide}`)];
  }));
  await page.evaluate(codes => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { language: 'csharp', codes, solved: [1,2,3,4,5,6,7,8], currentStep: 3, cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true });
    localStorage.setItem(key, JSON.stringify(state));
  }, codes);
  await page.reload();
  const editor = page.getByRole('group', { name: 'C# code template', exact: true });
  for (const step of case001.steps) {
    await page.getByRole('navigation', { name: 'Investigation steps' }).getByRole('button').nth(step.id - 1).click();
    if (step.providedVariables) {
      await expect(editor.locator('.guided-notes')).toHaveCount(0);
      await expect(editor.locator('.syntax-value')).toHaveText(['?', '?']);
      continue;
    }
    await expect(editor).toContainText('// Use Console.WriteLine(result);');
    await expect(editor).not.toContainText(/Declare whole numbers|End each statement|Replace each glowing|Complete result/);
    await expect(editor).toContainText('// My edited case note');
    if (step.id === 3) await page.locator('.terminal-panel').screenshot({ path: `test-results/${testInfo.project.name}-clean-step-03.png` });
  }
  await page.getByRole('button', { name: 'HIDE CASE NOTE', exact: true }).click();
  await page.getByRole('button', { name: 'SHOW CASE NOTE', exact: true }).click();
  await expect(editor).not.toContainText(/Declare whole numbers|End each statement|Replace each glowing|Complete result/);
});
