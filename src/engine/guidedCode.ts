import type { CodeLanguage, StepDefinition } from '../types';

export const operators = ['+', '-', '*', '/'] as const;
export const isOperator = (token: string) => /^[+*/-]$/.test(token);
export const isNumberSlot = (token: string) => /^\d+$/.test(token);
export const isWholeNumber = (value: string) => /^-?\d{1,12}$/.test(value);
export type GuidedAnswers = { values: Record<string, string>; calculation: string[] };

export function calculationTokens(step: StepDefinition): string[] {
  return step.formula?.match(/[A-Za-z_]\w*|\d+|[+*/()-]/g) ?? [];
}

/** Recover existing answers without making saved free-form programs editable. */
export function readGuidedAnswers(code: string, step: StepDefinition): GuidedAnswers {
  const assignment = (name: string) => code.match(new RegExp(`(?:^|[;\\n])\\s*(?:int\\s+)?${name}\\s*=\\s*([^;\\n#]*)`))?.[1].trim() ?? '';
  const values = Object.fromEntries(Object.keys(step.requiredVariables).map((name, index) => {
    const value = assignment(name) || assignment(`VARIABLE_${index + 1}`);
    return [name, isWholeNumber(value) ? value : ''];
  }));
  const tokens = calculationTokens(step);
  const flat = tokens.filter(token => token !== '(' && token !== ')');
  // A minus between operands is an operator, not the sign of the next value.
  const expression = assignment('result').replace(/[()]/g, '').match(/[A-Za-z_]\w*|\d+|[+*/?-]/g) ?? [];
  const matches = flat.length === expression.length && flat.every((token, index) =>
    isOperator(token) ? isOperator(expression[index]) || expression[index] === '?'
      : isNumberSlot(token) ? isWholeNumber(expression[index]) || /^VALUE_\d+$/.test(expression[index])
      : token === expression[index]);
  let index = 0;
  const calculation = tokens.map(token => {
    if (token === '(' || token === ')') return token;
    const value = matches ? expression[index] : '';
    index++;
    return isOperator(token) ? isOperator(value) ? value : ''
      : isNumberSlot(token) ? isWholeNumber(value) ? value : '' : token;
  });
  return { values, calculation };
}

export function guidedAnswersComplete(answers: GuidedAnswers, step: StepDefinition): boolean {
  return Object.keys(step.requiredVariables).every(name => isWholeNumber(answers.values[name] ?? ''))
    && calculationTokens(step).every((token, index) => isOperator(token) ? isOperator(answers.calculation[index] ?? '')
      : !isNumberSlot(token) || isWholeNumber(answers.calculation[index] ?? ''));
}

/** Rebuild every fixed declaration and the output call from the allowed fields. */
export function writeGuidedCode(answers: GuidedAnswers, step: StepDefinition, language: CodeLanguage, previousCode: string): string {
  const marker = language === 'csharp' ? '//' : '#';
  const comments = previousCode.split('\n').filter(line => /^\s*(?:#|\/\/)/.test(line))
    .map(line => line.replace(/^(\s*)(?:#|\/\/)/, `$1${marker}`)).join('\n');
  const declaration = language === 'csharp' ? 'int ' : '';
  const end = language === 'csharp' ? ';' : '';
  const values = Object.keys(step.requiredVariables).map(name => `${declaration}${name} = ${isWholeNumber(answers.values[name] ?? '') ? answers.values[name] : ''}${end}`);
  const expression = calculationTokens(step).map((token, index) => isOperator(token)
    ? isOperator(answers.calculation[index] ?? '') ? answers.calculation[index] : '?'
    : isNumberSlot(token) ? isWholeNumber(answers.calculation[index] ?? '') ? answers.calculation[index] : `VALUE_${index + 1}` : token).join(' ');
  return (comments ? comments + '\n\n' : '') + [...values, `${declaration}result = ${expression}${end}`, language === 'csharp' ? 'Console.WriteLine(result);' : 'print(result)'].join('\n') + '\n';
}
