import { parse, type Statement } from './python/parser';
import { executeStatements } from './python/evaluator';
import { PythonError } from './python/tokenizer';

const reserved = new Set(('abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile while var Console').split(' '));

// A bounded numeric C# classroom interpreter. No eval, network or native execution.
export function executeCSharp(source: string) {
  const fail = (help: string, line: number): never => { throw new PythonError('Check your C#', help, `Line ${line}: C# classroom syntax`); };
  if (source.length > 20000) fail('Keep this investigation under 20,000 characters.', 1);
  // Preserve line positions while removing C# comments.
  const clean = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n\r]*/g, comment => comment.replace(/[^\n\r]/g, ' '));
  if (clean.includes('/*')) fail('Close the comment with */.', 1);
  const statements: Statement[] = [], declared = new Set<string>();
  let offset = 0;
  for (const chunk of clean.split(';')) {
    const line = clean.slice(0, offset).split('\n').length + (chunk.match(/^\s*/)?.[0].match(/\n/g)?.length ?? 0);
    offset += chunk.length + 1;
    if (!chunk.trim()) continue;
    if (offset > clean.length) fail('End each C# statement with a semicolon (;).', line);
    if (statements.length >= 300) fail('Use fewer than 300 statements.', line);
    const text = chunk.trim();
    if (text === 'using System') continue;
    const output = text.match(/^(?:System\.)?Console\s*\.\s*WriteLine\s*\(([\s\S]*)\)$/);
    const assignment = text.match(/^(?:(int)\s+)?([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
    if (/=\s*$/.test(text)) fail('Complete the expression after = before running your program.', line);
    if (!output && !assignment) fail('Use int declarations, arithmetic, and Console.WriteLine(result); as top-level statements.', line);
    const expression = output ? output[1] : assignment![3];
    if (!/^[\d\w\s.+*/()=-]+$/.test(expression) || /\b(?:true|false|null|new)\b/.test(expression)) fail('Use numbers, variable names, parentheses, and + - * / in this terminal.', line);
    const normalized = output ? `print(${expression})` : `${assignment![2]} = ${expression}`;
    // The expression parser shares precedence and dependency tracking with Python.
    let statement: Statement;
    try { statement = parse(normalized.replace(/\r?\n/g, ' '))[0]; }
    catch (error) {
      if (error instanceof PythonError) error.detail = error.detail.replace(/^Line 1:/, `Line ${line}:`);
      throw error;
    }
    statement.line = line;
    if (statement.type === 'assign') {
      const declaration = assignment![1] as 'int' | undefined;
      if (reserved.has(statement.name)) fail('Choose a variable name that is not a C# keyword or Console.', line);
      if (declaration && declared.has(statement.name)) fail(`${statement.name} is already declared. Assign a new value without repeating its type.`, line);
      if (!declaration && !declared.has(statement.name)) fail(`Declare ${statement.name} first, for example: int ${statement.name} = 0;`, line);
      if (declaration) { declared.add(statement.name); statement.declaration = declaration; }
    }
    statements.push(statement);
  }
  return executeStatements(statements, true);
}
