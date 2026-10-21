import type { CodeLanguage, StepDefinition } from '../types';

export const isWholeNumber = (value: string) => /^-?\d{1,12}$/.test(value);
export type GuidedAnswers = { values: Record<string, string>; expression: string };

/** Keep numeric declarations fixed while preserving the student's result expression. */
export function readGuidedAnswers(code: string, step: StepDefinition): GuidedAnswers {
  const assignment = (name: string) => code.match(new RegExp(`(?:^|[;\\n])\\s*(?:int\\s+)?${name}\\s*=\\s*([^;\\n#]*)`))?.[1].trim() ?? '';
  const values = Object.fromEntries(Object.keys(step.requiredVariables).map((name, index) => {
    if (step.providedVariables) return [name, String(step.requiredVariables[name])];
    const value = assignment(name) || assignment(`VARIABLE_${index + 1}`);
    return [name, isWholeNumber(value) ? value : ''];
  }));
  // Preserve trailing spaces during typing, including unfinished or incorrect work.
  const saved = code.match(/(?:^|[;\n])\s*(?:int\s+)?result[ \t]*=[ \t]?([^\r\n]*)/)?.[1].replace(/;\s*$/, '') ?? '';
  // Incomplete programs from the previous operator menus must start with an empty field.
  const expression = /\?|\bVALUE_\d+\b/.test(saved) ? '' : saved;
  return { values, expression };
}

export function guidedAnswersComplete(answers: GuidedAnswers, step: StepDefinition): boolean {
  return Object.keys(step.requiredVariables).every(name => isWholeNumber(answers.values[name] ?? ''))
    && answers.expression.trim().length > 0;
}

/** Rebuild every fixed declaration and the output call from the allowed fields. */
export function writeGuidedCode(answers: GuidedAnswers, step: StepDefinition, language: CodeLanguage, previousCode: string): string {
  const marker = language === 'csharp' ? '//' : '#';
  const comments = (step.providedVariables ? [] : previousCode.split('\n').filter(line => /^\s*(?:#|\/\/)/.test(line)))
    .map(line => line.replace(/^(\s*)(?:#|\/\/)/, `$1${marker}`)).join('\n');
  const declaration = language === 'csharp' ? 'int ' : '';
  const end = language === 'csharp' ? ';' : '';
  const values = Object.keys(step.requiredVariables).map(name => `${declaration}${name} = ${step.providedVariables ? step.requiredVariables[name] : isWholeNumber(answers.values[name] ?? '') ? answers.values[name] : ''}${end}`);
  const expression = answers.expression.replace(/[\r\n;]/g, ' ');
  const spacing = step.providedVariables && !expression ? '' : ' ';
  return (comments ? comments + '\n\n' : '') + [...values, `${declaration}result =${spacing}${expression}${end}`, language === 'csharp' ? 'Console.WriteLine(result);' : 'print(result)'].join('\n') + '\n';
}
