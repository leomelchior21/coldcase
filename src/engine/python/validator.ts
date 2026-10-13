import type { StepDefinition, Value } from '../../types';
import { execute, type Trace } from './evaluator';
import { PythonError } from './tokenizer';
import { parse, type Expr } from './parser';
// Compare the calculation tree, including intermediary variables, not source text.
function expressionKey(expr: Expr): string {
  if (expr.type === 'variable') return expr.name;
  if (expr.type === 'literal') return JSON.stringify(expr.value);
  if (expr.type === 'unary') return expr.op === '+' ? expressionKey(expr.child) : `neg(${expressionKey(expr.child)})`;
  if (expr.op === '+' || expr.op === '*') {
    const parts = (node: Expr): string[] => node.type === 'binary' && node.op === expr.op ? [...parts(node.left), ...parts(node.right)] : [expressionKey(node)];
    return `${expr.op}(${parts(expr).sort().join(',')})`;
  }
  return `${expr.op}(${expressionKey(expr.left)},${expressionKey(expr.right)})`;
}
export type Feedback = { ok: boolean; title: string; message: string; output: Value[]; detail?: string };
export function validate(source: string, step: StepDefinition): Feedback {
  try {
    const execution = execute(source);
    const fail = (title: string, message: string): Feedback => ({ ok: false, title, message, output: execution.output });
    const result = execution.variables.get('result');
    if (!result) return fail(execution.output.length ? 'Result found — but not stored' : 'Result not found', 'Create the variable result. Store your answer in it.');
    for (const [name, value] of Object.entries(step.requiredVariables)) {
      if (!execution.variables.has(name)) return fail('Variable not found', `Create the variable ${name}. Set its value using the Case Note or your evidence.`);
      if (execution.variables.get(name)!.value !== value) return fail('The clue doesn’t match', `Check the value stored in ${name}. Look at your evidence.`);
    }
    const expectedExpression = step.formula ? expressionKey(parse(`result = ${step.formula}`)[0].expression) : null;
    const matchesTrace = (trace: Trace) => step.requiredResultDependencies.every(name => trace.refs.get(name)?.includes(step.requiredVariables[name])) && step.requiredOperations.every(op => trace.operations.has(op)) && (!expectedExpression || expressionKey(trace.expression) === expectedExpression);
    if (!matchesTrace(result)) return fail('Connect your variables', 'Use the named variables and the operation in the Case Note to calculate result.');
    if (result.value !== step.expectedResult) return fail('The clue doesn’t match', 'The code runs. Check your values or operation.');
    if (!execution.printedResults.some(trace => trace.value === result.value && matchesTrace(trace))) return fail('Result found — but not reported', 'Use print(result) after you calculate result.');
    return { ok: true, title: step.stamp, message: 'New evidence is on your desk. Open it and take a look.', output: execution.output };
  } catch (error) {
    if (error instanceof PythonError) return { ok: false, title: error.title, message: error.help, detail: error.detail, output: [] };
    return { ok: false, title: 'Check your Python', message: 'Check your brackets and expressions, then try again.', output: [] };
  }
}
