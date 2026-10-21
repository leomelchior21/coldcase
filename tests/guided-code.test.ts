import { describe, expect, it } from 'vitest';
import { case001 } from '../src/cases/case001';
import { codeForStep, refreshCaseNotes } from '../src/engine/language';
import { guidedAnswersComplete, readGuidedAnswers, writeGuidedCode } from '../src/engine/guidedCode';
import { validate } from '../src/engine/python/validator';
import { solutions } from './fixtures/casePrograms';

for (const language of ['python', 'csharp'] as const) describe(`${language} guided declarations and written calculations`, () => {
  it('supplies the hidden Step 2 checksums and requires only the written calculation', () => {
    const step = case001.steps[1], starter = codeForStep(step, language);
    expect(codeForStep(step, language, false)).toContain('Subtract returned_checksum from inventory_checksum.');
    const answers = readGuidedAnswers(starter, step);
    expect(guidedAnswersComplete(answers, step)).toBe(false);
    answers.expression = 'inventory_checksum - returned_checksum';
    answers.values = { inventory_checksum: '999', returned_checksum: '1' };
    const code = writeGuidedCode(answers, step, language, starter);
    expect(code).toContain('CASE NOTE');
    expect(code).toContain('Store the difference in the variable result.');
    expect(code).not.toContain('999');
    expect(validate(code, step, language)).toMatchObject({ ok: true, output: [27] });
  });
  it.each(case001.steps)('starts every value and result expression blank for step $id', step => {
    const code = codeForStep(step, language), answers = readGuidedAnswers(code, step);
    for (const name of Object.keys(step.requiredVariables)) {
      expect(code).toContain(`${name} =`);
      expect(answers.values[name]).toBe(step.providedVariables ? String(step.requiredVariables[name]) : '');
    }
    expect(answers.expression).toBe('');
    expect(guidedAnswersComplete(answers, step)).toBe(false);
  });
  it.each(case001.steps)('preserves saved values and expressions and solves step $id', step => {
    const source = solutions[step.id - 1];
    const oldCode = language === 'python' ? source : source.split('\n').map(line => line.startsWith('print(') ? 'Console.WriteLine(result);' : `int ${line};`).join('\n');
    const answers = readGuidedAnswers(oldCode, step);
    expect(guidedAnswersComplete(answers, step)).toBe(true);
    const code = writeGuidedCode(answers, step, language, oldCode);
    expect(validate(code, step, language).ok).toBe(true);
    expect(readGuidedAnswers(code, step)).toEqual(answers);
  });
  it('preserves unfinished typing, trailing spaces and parentheses across serialization', () => {
    const step = case001.steps[2], starter = codeForStep(step, language);
    for (const expression of ['h', 'hour ', '(hour * ', '(hour * 100) + minutes', 'wrong_name / 2']) {
      const answers = { values: { hour: '15', minutes: '' }, expression };
      const code = writeGuidedCode(answers, step, language, starter);
      expect(readGuidedAnswers(code, step)).toEqual(answers);
      expect(guidedAnswersComplete(answers, step)).toBe(false);
      expect(code).toContain('Enter the value for hour.');
    }
  });
  it('clears incomplete legacy menu expressions without losing numeric values', () => {
    const answers = readGuidedAnswers('hour = 15\nminutes = 40\nresult = hour ? VALUE_3 + minutes', case001.steps[2]);
    expect(answers).toEqual({ values: { hour: '15', minutes: '40' }, expression: '' });
  });
  it('keeps numeric fields numeric and prevents the expression from adding statements', () => {
    const step = case001.steps[0], starter = codeForStep(step, language);
    const answers = readGuidedAnswers(starter, step);
    answers.values.camera_log = '1; result = 280';
    answers.expression = 'camera_log / backup_log;\ninjected = 1';
    const code = writeGuidedCode(answers, step, language, starter);
    expect(code).not.toContain('result = 280');
    expect(code).not.toMatch(/\ninjected|;\s*injected/);
    expect(guidedAnswersComplete(answers, step)).toBe(false);
    expect(validate(code, step, language).ok).toBe(false);
  });
  it('accepts equivalent expressions and rejects hardcoded results or misspelled variables', () => {
    const step = case001.steps[0], answers = readGuidedAnswers(solutions[0], step);
    for (const expression of ['(camera_log) / (backup_log)', 'camera_log / backup_log']) {
      expect(validate(writeGuidedCode({ ...answers, expression }, step, language, ''), step, language).ok).toBe(true);
    }
    for (const expression of ['280', 'camera_log / typo', 'camera_log + backup_log', 'camera_log /']) {
      const code = writeGuidedCode({ ...answers, expression }, step, language, '');
      expect(readGuidedAnswers(code, step).expression).toBe(expression);
      expect(validate(code, step, language).ok).toBe(false);
    }
  });
  it('uses the chosen language for saved comments and fixed statements', () => {
    const step = case001.steps[0], saved = '# Existing note\n' + solutions[0];
    const code = writeGuidedCode(readGuidedAnswers(saved, step), step, language, saved);
    expect(code.startsWith(language === 'csharp' ? '// Existing note' : '# Existing note')).toBe(true);
    expect(validate(code, step, language).ok).toBe(true);
  });
  it('updates old instructions while preserving student comments and answers', () => {
    const marker = language === 'csharp' ? '//' : '#';
    const saved = `${marker} Create the variable camera_log.\n${marker} Create the variable my_note.\n` + solutions[0];
    const updated = refreshCaseNotes(saved, case001.steps[0], language);
    expect(updated).toContain(`${marker} Enter the value for camera_log.`);
    expect(updated).toContain(`${marker} Create the variable my_note.`);
    expect(updated).toContain(solutions[0]);
  });
  it.each(case001.steps)('still rejects the wrong operation for step $id', step => {
    const answers = readGuidedAnswers(solutions[step.id - 1], step);
    answers.expression = answers.expression.replace(/[+*/-]/, operator => operator === '+' ? '-' : '+');
    expect(validate(writeGuidedCode(answers, step, language, ''), step, language).ok).toBe(false);
  });
});
