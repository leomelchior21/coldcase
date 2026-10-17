import type { CodeLanguage, StepDefinition } from '../types';

export const languageName = (language: CodeLanguage) => language === 'csharp' ? 'C#' : 'Python';
export function languageText(text: string, language: CodeLanguage): string {
  if (language === 'python') return text;
  return text.replace(/Use print\(result\)\./g, 'Use Console.WriteLine(result);').replace(/print\(result\)/g, 'Console.WriteLine(result);').replace(/Python/g, 'C#')
    .replace(/\bresult = (.+)$/, 'int result = $1;');
}
export function codeForStep(step: StepDefinition, language: CodeLanguage, includeStarter = true): string {
  const marker = language === 'csharp' ? '//' : '#';
  const notes = `${marker} ${step.id === 8 ? 'FINAL CASE NOTE' : 'CASE NOTE'}\n` + step.caseNote.map(line => `${marker} ${languageText(line, language)}`).join('\n');
  const guide = (language === 'csharp' ? '\n// Declare whole numbers with int, e.g. int clues = 2;\n// End each statement with a semicolon (;).' : '') + (step.id > 1 ? `\n${marker} Replace each glowing VARIABLE name and fill its value from the Case Note.\n${marker} Complete result with your calculation, then print result below.` : '');
  const lines = step.id === 1 ? step.starterCode! : [...Object.keys(step.requiredVariables).map((_, i) => `VARIABLE_${i + 1} =`), 'result =', 'print(result)'];
  const starter = includeStarter ? lines.map(line => language === 'python' ? line : line.startsWith('print(') ? 'Console.WriteLine(result);' : `int ${line};`).join('\n') + '\n' : '';
  return notes + guide + '\n\n' + starter;
}
