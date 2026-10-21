import type { CodeLanguage, StepDefinition } from '../types';

export const languageName = (language: CodeLanguage) => language === 'csharp' ? 'C#' : 'Python';
export function languageText(text: string, language: CodeLanguage): string {
  if (language === 'python') return text;
  return text.replace(/Use print\(result\)\./g, 'Use Console.WriteLine(result);').replace(/print\(result\)/g, 'Console.WriteLine(result);').replace(/Python/g, 'C#')
    .replace(/\bresult = (.+)$/, 'int result = $1;');
}
export function codeForStep(step: StepDefinition, language: CodeLanguage, includeStarter = true): string {
  const marker = language === 'csharp' ? '//' : '#';
  const outputInstruction = step.caseNote.indexOf('Use print(result).');
  const noteLines = outputInstruction < 0 ? step.caseNote : step.caseNote.slice(0, outputInstruction + 1);
  const notes = `${marker} ${step.id === 8 ? 'FINAL CASE NOTE' : 'CASE NOTE'}\n` + noteLines.map(line => `${marker} ${languageText(line, language)}`).join('\n');
  const lines = [...Object.keys(step.requiredVariables).map(name => `${name} =`), 'result =', 'print(result)'];
  const starter = includeStarter ? lines.map(line => language === 'python' ? line : line.startsWith('print(') ? 'Console.WriteLine(result);' : `int ${line};`).join('\n') + '\n' : '';
  return notes + '\n\n' + starter;
}

export function refreshCaseNotes(code: string, step: StepDefinition, language: CodeLanguage): string {
  const revisedNotes: Record<string, string> = {
    'Brian was last seen during hour 15.': 'The inspector said that Brian left the room 20 minutes before 16:00.',
    'The color filter value is 2.': 'The color filter value is in your evidence.',
    'The correction value is 12.': 'The correction value is the number used as midday.',
    'Check the Last Seen Record and the access log.': 'Check the CCTV archive file and the access log.',
  };
  const outputInstruction = step.caseNote.indexOf('Use print(result).');
  const obsoleteNotes = new Set([
    'Declare whole numbers with int, e.g. int clues = 2;',
    'End each statement with a semicolon (;).',
    'Replace each glowing VARIABLE name and fill its value from the Case Note.',
    'Complete result with your calculation, then print result below.',
    ...(step.id === 3 ? ['The minute was 40.'] : []),
    ...(outputInstruction < 0 ? [] : step.caseNote.slice(outputInstruction + 1).map(line => languageText(line, language))),
  ]);
  // Remove obsolete generated lines even when students have edited the note header.
  return code.split('\n').filter(line => {
    const comment = line.trim().match(/^(?:\/\/|#)\s*(.*)$/);
    return !comment || !obsoleteNotes.has(comment[1]);
  }).map(line => line.replace(/^(\s*(?:\/\/|#)[ \t]*)(.*?)(\r?)$/, (original, prefix: string, text: string, ending: string) => revisedNotes[text] ? prefix + revisedNotes[text] + ending : original))
    .map(line => line.replace(/^(\s*(?:\/\/|#)\s*)Create the variable ([A-Za-z_]\w*)\.$/, (original, prefix: string, name: string) =>
    Object.prototype.hasOwnProperty.call(step.requiredVariables, name) ? `${prefix}Enter the value for ${name}.` : original)).join('\n');
}
