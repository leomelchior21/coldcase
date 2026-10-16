import { PythonError, tokenize, type Token } from './tokenizer';
import type { Value } from '../../types';
export type Expr = { type: 'literal'; value: Value; numericType?: 'int' | 'double' } | { type: 'variable'; name: string } | { type: 'unary'; op: string; child: Expr } | { type: 'binary'; op: string; left: Expr; right: Expr };
export type Statement = { type: 'assign'; name: string; expression: Expr; line: number; declaration?: 'int' | 'double' | 'var' } | { type: 'print'; expression: Expr; line: number };
class Parser {
  private pos = 0;
  private depth = 0;
  constructor(private tokens: Token[]) {}
  peek() { return this.tokens[this.pos]; }
  take() { return this.tokens[this.pos++]; }
  fail(message = 'Check the order of your numbers, variables, and symbols.'): never { throw new PythonError('Check your Python', message, `SyntaxError: unexpected '${this.peek()?.text || 'end of line'}' at column ${this.peek()?.column}`); }
  expect(text: string) { if (this.peek().text !== text) this.fail(`Python needs ${text} here.`); this.take(); }
  expression(min = 0): Expr {
    if (++this.depth > 80) throw new PythonError('Too many brackets', 'Try a shorter expression.', 'SyntaxError: expression is too deeply nested');
    let left: Expr;
    const token = this.take();
    if (token.kind === 'number' || token.kind === 'string') left = { type: 'literal', value: token.value!, ...(token.kind === 'number' ? { numericType: token.text.includes('.') ? 'double' as const : 'int' as const } : {}) };
    else if (token.kind === 'name') left = { type: 'variable', name: token.text };
    else if (token.text === '+' || token.text === '-') left = { type: 'unary', op: token.text, child: this.expression(30) };
    else if (token.text === '(') { left = this.expression(); this.expect(')'); }
    else this.fail();
    const precedence: Record<string,number> = { '+': 10, '-': 10, '*': 20, '/': 20 };
    while (this.peek() && (precedence[this.peek().text] ?? -1) >= min) {
      const op = this.take().text;
      left = { type: 'binary', op, left, right: this.expression(precedence[op] + 1) };
    }
    this.depth--; return left;
  }
  statement(line: number): Statement | null {
    if (this.peek().kind === 'end') return null;
    const first = this.take();
    if (first.kind !== 'name') this.fail('Start with a variable name or print().');
    let statement: Statement;
    if (first.text === 'print') {
      this.expect('('); const expression = this.expression(); this.expect(')'); statement = { type: 'print', expression, line };
    } else {
      if (['if','else','for','while','def','class','import','return','True','False','None','and','or','not'].includes(first.text)) this.fail('This terminal supports assignments, arithmetic, and print().');
      this.expect('='); statement = { type: 'assign', name: first.text, expression: this.expression(), line };
    }
    if (this.peek().kind !== 'end') this.fail();
    return statement;
  }
}
export function parse(source: string): Statement[] {
  if (source.length > 20000) throw new PythonError('Program too long', 'Keep this investigation under 20,000 characters.', 'ResourceLimit: source length');
  return source.split(/\r?\n/).flatMap((line, i) => {
    try { const statement = new Parser(tokenize(line)).statement(i + 1); return statement ? [statement] : []; }
    catch (error) { if (error instanceof PythonError) error.detail = `Line ${i + 1}: ${error.detail}`; throw error; }
  });
}
