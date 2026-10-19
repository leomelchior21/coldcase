import { describe, expect, it } from 'vitest';
import { case001 } from '../src/cases/case001';
import { codeForStep, refreshCaseNotes } from '../src/engine/language';
import { calculationTokens, guidedAnswersComplete, isNumberSlot, isOperator, readGuidedAnswers, writeGuidedCode } from '../src/engine/guidedCode';
import { validate } from '../src/engine/python/validator';
import { solutions } from './fixtures/casePrograms';

for (const language of ['python', 'csharp'] as const) describe(`${language} fixed code templates`, () => {
  it.each(case001.steps)('keeps every name in place and every answer blank for step $id', step => {
    const code = codeForStep(step, language);
    const answers = readGuidedAnswers(code, step);
    for (const name of Object.keys(step.requiredVariables)) {
      expect(code).toContain(`${name} =`);
      expect(answers.values[name]).toBe('');
    }
    expect(code).not.toContain('VARIABLE_');
    expect(guidedAnswersComplete(answers, step)).toBe(false);
  });
  it.each(case001.steps)('preserves saved values and calculations and solves step $id', step => {
    const source = solutions[step.id - 1];
    const oldCode = language === 'python' ? source : source.split('\n').map(line => line.startsWith('print(') ? 'Console.WriteLine(result);' : `int ${line};`).join('\n');
    const answers = readGuidedAnswers(oldCode, step);
    expect(guidedAnswersComplete(answers, step)).toBe(true);
    const code = writeGuidedCode(answers, step, language, oldCode);
    expect(validate(code, step, language).ok).toBe(true);
    expect(readGuidedAnswers(code, step)).toEqual(answers);
  });
  it('keeps partially completed values and operators across serialization', () => {
    const step = case001.steps[2], starter = codeForStep(step, language);
    const answers = readGuidedAnswers(starter, step);
    answers.values.hour = '15';
    answers.calculation[1] = '*';
    const code = writeGuidedCode(answers, step, language, starter);
    expect(readGuidedAnswers(code, step)).toEqual(answers);
    expect(guidedAnswersComplete(answers, step)).toBe(false);
    expect(code).toContain('Enter the value for hour.');
  });
  it('does not accept a pasted program or expression in a number or operator field', () => {
    const step = case001.steps[0], starter = codeForStep(step, language);
    const answers = readGuidedAnswers(starter, step);
    answers.values.camera_log = '1; result = 280';
    answers.calculation[1] = '/ backup_log; injected = 1';
    const code = writeGuidedCode(answers, step, language, starter);
    expect(code).not.toMatch(/injected|result = 280/);
    expect(guidedAnswersComplete(answers, step)).toBe(false);
  });
  it('uses the chosen language for saved comments and fixed statements', () => {
    const step = case001.steps[0];
    const saved = '# Existing note\n' + solutions[0];
    const answers = readGuidedAnswers(saved, step);
    const code = writeGuidedCode(answers, step, language, saved);
    expect(code.startsWith(language === 'csharp' ? '// Existing note' : '# Existing note')).toBe(true);
    expect(validate(code, step, language).ok).toBe(true);
  });
  it('updates old variable instructions while preserving student comments and answers', () => {
    const marker = language === 'csharp' ? '//' : '#';
    const saved = `${marker} Create the variable camera_log.\n${marker} Create the variable my_note.\n` + solutions[0];
    const updated = refreshCaseNotes(saved, case001.steps[0], language);
    expect(updated).toContain(`${marker} Enter the value for camera_log.`);
    expect(updated).toContain(`${marker} Create the variable my_note.`);
    expect(updated).toContain(solutions[0]);
  });
  it.each(case001.steps)('still rejects the wrong operation for step $id', step => {
    const answers = readGuidedAnswers(solutions[step.id - 1], step);
    const index = calculationTokens(step).findIndex(isOperator);
    answers.calculation[index] = answers.calculation[index] === '+' ? '-' : '+';
    expect(validate(writeGuidedCode(answers, step, language, ''), step, language).ok).toBe(false);
    for (const [index, token] of calculationTokens(step).entries()) if (isNumberSlot(token)) expect(answers.calculation[index]).toBe(token);
  });
});
