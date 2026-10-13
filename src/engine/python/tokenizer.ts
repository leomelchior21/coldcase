export type Token = { kind: 'number' | 'string' | 'name' | 'symbol' | 'end'; text: string; value?: number | string; column: number };
export class PythonError extends Error {
  constructor(public title: string, public help: string, public detail: string) { super(help); }
}
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '#') break;
    const column = i + 1;
    if (c === '"' || c === "'") {
      const quote = c; let value = ''; i++; let closed = false;
      while (i < source.length) {
        if (source[i] === quote) { i++; closed = true; break; }
        if (source[i] === '\\') {
          i++; const escape = source[i++];
          if (escape === undefined) break;
          value += ({ n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"' } as Record<string,string>)[escape] ?? '\\' + escape;
        } else value += source[i++];
      }
      if (!closed) throw new PythonError('Python needs quotes', 'Close your text with the same quotation mark.', `SyntaxError: unterminated string at column ${column}`);
      tokens.push({ kind: 'string', text: value, value, column }); continue;
    }
    const number = source.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (number) { tokens.push({ kind: 'number', text: number[0], value: Number(number[0]), column }); i += number[0].length; continue; }
    const name = source.slice(i).match(/^[A-Za-z_][A-Za-z_0-9]*/);
    if (name) { tokens.push({ kind: 'name', text: name[0], column }); i += name[0].length; continue; }
    if ('+-*/()='.includes(c)) { tokens.push({ kind: 'symbol', text: c, column }); i++; continue; }
    throw new PythonError('Check this symbol', 'Use variables, numbers, quoted text, +, -, *, /, and print().', `SyntaxError: unexpected '${c}' at column ${column}`);
  }
  return [...tokens, { kind: 'end', text: '', column: i + 1 }];
}
