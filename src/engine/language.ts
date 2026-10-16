import type { CodeLanguage, StepDefinition } from '../types';

export const languageName = (language: CodeLanguage) => language === 'csharp' ? 'C#' : 'Python';
export function languageText(text: string, language: CodeLanguage): string {
  if (language === 'python') return text;
  return text.replace(/Use print\(result\)\./g, 'Use Console.WriteLine(result);').replace(/print\(result\)/g, 'Console.WriteLine(result);').replace(/Python/g, 'C#')
    .replace(/\bresult = (.+)$/, 'double result = $1;');
}
export function codeForStep(step: StepDefinition, language: CodeLanguage, includeStarter = true): string {
  const marker = language === 'csharp' ? '//' : '#';
  const notes = `${marker} ${step.id === 8 ? 'FINAL CASE NOTE' : 'CASE NOTE'}\n` + step.caseNote.map(line => `${marker} ${languageText(line, language)}`).join('\n');
  const guide = language === 'csharp' ? '\n// Declare numbers with double, e.g. double clues = 2;\n// End each statement with a semicolon (;). Use top-level statements.' : '';
  const starter = includeStarter && step.starterCode ? step.starterCode.map(line => language === 'python' ? line : line.startsWith('print(') ? 'Console.WriteLine(result);' : `double ${line};`).join('\n') + '\n' : '';
  return notes + guide + '\n\n' + starter;
}
