import { parse, type Expr } from './parser';
import { PythonError } from './tokenizer';
import type { Value } from '../../types';
export type Trace = { value: Value; refs: Map<string, Value[]>; operations: Set<string>; expression: Expr };
export type Execution = { variables: Map<string, Trace>; output: Value[]; printedResults: Trace[] };
const blank = (value: Value): Trace => ({ value, refs: new Map(), operations: new Set(), expression: { type: 'literal', value } });
function merge(left: Trace, right: Trace, value: Value, op: string): Trace {
  const refs = new Map(left.refs);
  right.refs.forEach((values, name) => refs.set(name, [...(refs.get(name) ?? []), ...values]));
  const operations = new Set([...left.operations, ...right.operations]);
  if (refs.size) operations.add(op);
  return { value, refs, operations, expression: { type: 'binary', op, left: left.expression, right: right.expression } };
}
function calculate(expr: Expr, env: Map<string, Trace>, depth = 0): Trace {
  if (depth > 150) throw new PythonError('Program too complex', 'Try a shorter expression.', 'ResourceLimit: expression depth');
  if (expr.type === 'literal') return blank(expr.value);
  if (expr.type === 'variable') {
    const found = env.get(expr.name);
    if (!found) throw new PythonError('Variable not found', `Create the variable ${expr.name} and set its value before using it. Text needs quotation marks.`, `NameError: name '${expr.name}' is not defined`);
    return { value: found.value, operations: new Set(found.operations), refs: new Map([...found.refs, [expr.name, [found.value]]]), expression: found.refs.size ? found.expression : expr };
  }
  if (expr.type === 'unary') {
    const child = calculate(expr.child, env, depth + 1);
    if (typeof child.value !== 'number') throw new PythonError('Numbers needed', 'Use + and - signs with numbers.', 'TypeError: unary operator on text');
    return { ...child, value: expr.op === '-' ? -child.value : child.value, expression: { type: 'unary', op: expr.op, child: child.expression } };
  }
  const left = calculate(expr.left, env, depth + 1), right = calculate(expr.right, env, depth + 1);
  const a = left.value, b = right.value; let value: Value;
  if (typeof a === 'number' && typeof b === 'number') {
    if (expr.op === '/' && b === 0) throw new PythonError('Cannot divide by zero', 'Check the number after /. It must not be zero.', 'ZeroDivisionError: division by zero');
    value = expr.op === '+' ? a + b : expr.op === '-' ? a - b : expr.op === '*' ? a * b : a / b;
    if (!Number.isFinite(value)) throw new PythonError('Number too large', 'Try smaller numbers.', 'OverflowError: number outside supported range');
  } else if (expr.op === '+' && typeof a === 'string' && typeof b === 'string') value = a + b;
  else if (expr.op === '*' && ((typeof a === 'string' && typeof b === 'number') || (typeof a === 'number' && typeof b === 'string'))) {
    const text = typeof a === 'string' ? a : b as string, count = typeof a === 'number' ? a : b as number;
    if (!Number.isInteger(count) || text.length * Math.max(count, 0) > 20000) throw new PythonError('Check your values', 'Repeat text with a small whole number.', 'TypeError: invalid text repetition');
    value = text.repeat(Math.max(0, count));
  } else throw new PythonError('Check your value types', 'Use numbers for arithmetic. You can join two text values with +.', 'TypeError: incompatible values');
  if (typeof value === 'string' && value.length > 20000) throw new PythonError('Text too long', 'Use shorter text.', 'ResourceLimit: string length');
  return merge(left, right, value, expr.op);
}
export function execute(source: string): Execution {
  const variables = new Map<string, Trace>(), output: Value[] = [], printedResults: Trace[] = [];
  for (const statement of parse(source)) {
    try {
      const evaluated = calculate(statement.expression, variables);
      if (statement.type === 'assign') variables.set(statement.name, evaluated);
      else {
        output.push(evaluated.value);
        if (statement.expression.type === 'variable' && statement.expression.name === 'result') printedResults.push(evaluated);
      }
    } catch (error) { if (error instanceof PythonError) error.detail = `Line ${statement.line}: ${error.detail}`; throw error; }
  }
  return { variables, output, printedResults };
}
