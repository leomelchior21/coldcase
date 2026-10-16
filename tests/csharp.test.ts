import { describe, expect, it } from 'vitest';
import { executeCSharp } from '../src/engine/csharp';
import { validate } from '../src/engine/python/validator';
import { codeForStep, languageText } from '../src/engine/language';
import { case001 } from '../src/cases/case001';
import { freshState, loadState, saveState, STORAGE_KEY } from '../src/engine/storage';
import { acceptArchiveTime, acceptCameraCode, solveStep, stepBlockReason } from '../src/engine/caseEngine';
import { solutions } from './fixtures/casePrograms';

export const csharpSolutions = solutions.map(source => source.split('\n').map(line => line.startsWith('print(') ? 'Console.WriteLine(result);' : `double ${line};`).join('\n'));

describe('C# numeric classroom interpreter', () => {
  it('completes all eight steps and the evidence chain using real C# syntax', () => {
    let state = { ...freshState(), language: 'csharp' as const, languageChosen: true, tutorialCompleted: true };
    for (const step of case001.steps) {
      if (step.id === 4) state = { ...acceptArchiveTime(acceptCameraCode(state, '280'), 15, 40), language: 'csharp' };
      if (step.id === 7) state.selectedSuspect = 'emily';
      expect(stepBlockReason(state, step.id, case001)).toBeNull();
      expect(validate(csharpSolutions[step.id - 1], step, 'csharp').ok).toBe(true);
      state = { ...solveStep(state, step.id, case001), language: 'csharp' };
    }
    expect(state.solved).toHaveLength(8);
    expect(state.evidence).toContain('FINAL-01');
  });
  it('accepts comments, multiline expressions, multiple statements, reassignment and qualified output', () => {
    const code = 'using System; /* recovery\nnotes */ double camera_log = 0; camera_log = 257880;\ndouble backup_log = 921; // backup\nvar result = (camera_log /\nbackup_log); System.Console.WriteLine(result);';
    expect(validate(code, case001.steps[0], 'csharp').ok).toBe(true);
  });
  it('uses C# integer division and preserves double arithmetic and inferred types', () => {
    expect(executeCSharp('int a=5; int b=2; var result=a/b; Console.WriteLine(result);').output).toEqual([2]);
    expect(executeCSharp('double a=5; int b=2; var result=a/b; Console.WriteLine(result);').output).toEqual([2.5]);
    expect(executeCSharp('var a=5.0; double result=a/2; Console.WriteLine(result);').output).toEqual([2.5]);
    expect(() => executeCSharp('int a=2.0;')).toThrow();
    expect(() => executeCSharp('var a=2; a=2.5;')).toThrow();
  });
  it.each([
    'double result = 280', 'result = 280;', 'double a=1; double a=2;',
    'double result=unknown;', 'double result=1/0;', 'double result=1; print(result);',
    'double result=1; # python comment', 'double result=1; /* open comment',
    'double if=1;', 'double result=fetch("url");', 'while (true) {}',
  ])('rejects invalid or unsupported source: %s', code => {
    expect(validate(code, case001.steps[0], 'csharp').ok).toBe(false);
  });
  it('requires reported results and genuine dependencies rather than hardcoded answers', () => {
    const base = 'double camera_log=257880; double backup_log=921;';
    expect(validate(base + 'double result=280; Console.WriteLine(result);', case001.steps[0], 'csharp').ok).toBe(false);
    expect(validate(base + 'double result=280+(camera_log/backup_log)*0; Console.WriteLine(result);', case001.steps[0], 'csharp').ok).toBe(false);
    const feedback = validate(base + 'double result=camera_log/backup_log;', case001.steps[0], 'csharp');
    expect(feedback.message).toContain('Console.WriteLine(result);');
    expect(feedback.message).not.toContain('print(');
  });
  it('generates language-specific starters and clues without leaking later answers', () => {
    const first = codeForStep(case001.steps[0], 'csharp');
    expect(first).toContain('double camera_log = 257880;');
    expect(first).toContain('double result =;');
    expect(first).toContain('Console.WriteLine(result);');
    expect(first).not.toContain('print(');
    expect(validate(first.replace('double result =;', 'double result = camera_log / backup_log;'), case001.steps[0], 'csharp').ok).toBe(true);
    expect(languageText(case001.steps[0].hints[2], 'csharp')).toBe('double result = camera_log / backup_log;');
  });
  it('restores C# programs, language and completed tutorial without losing student work', () => {
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => data.get(key), setItem: (key: string, value: string) => data.set(key, value) } });
    const state = { ...freshState(), language: 'csharp' as const, languageChosen: true, tutorialCompleted: true, codes: { 1: csharpSolutions[0] } };
    saveState(state);
    const restored = loadState();
    expect(restored.codes[1]).toBe(csharpSolutions[0]);
    expect(restored.codes[2]).toContain('double inventory_checksum =;');
    expect(restored.language).toBe('csharp');
    expect(restored.tutorialCompleted).toBe(true);
    data.set(STORAGE_KEY, JSON.stringify({ ...state, language: 'invalid' }));
    expect(loadState().language).toBe('python');
  });
});
