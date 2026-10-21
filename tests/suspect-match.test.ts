import { describe, expect, it } from 'vitest';
import { case001 } from '../src/cases/case001';
import { validate } from '../src/engine/python/validator';
import { readGuidedAnswers, writeGuidedCode } from '../src/engine/guidedCode';

const step = case001.steps[6];
const permutations = [[24013,24005,24028], [24013,24028,24005], [24005,24013,24028], [24005,24028,24013], [24028,24013,24005], [24028,24005,24013]];
const program = (values: number[], expression = 'suspect_01_ID + suspect_02_ID + suspect_03_ID') =>
  values.map((value, index) => `suspect_0${index + 1}_ID = ${value}`).join('\n') + `\nresult = ${expression}\nprint(result)`;

for (const language of ['python', 'csharp'] as const) describe(`${language} unordered suspect IDs`, () => {
  const source = (values: number[], expression?: string) => {
    const code = program(values, expression);
    return writeGuidedCode(readGuidedAnswers(code, step), step, language, '');
  };
  it.each(permutations)('accepts the three correct IDs in order %j, %j, %j', (a, b, c) => {
    expect(validate(source([a,b,c]), step, language)).toMatchObject({ ok: true, output: [72046] });
  });
  it('accepts a different addition order while keeping all three variable dependencies', () => {
    expect(validate(source([24028,24013,24005], 'suspect_03_ID + (suspect_01_ID + suspect_02_ID)'), step, language).ok).toBe(true);
  });
  it.each([[24013,24013,24028], [24012,24006,24028], [24013,24005,24029]])('rejects duplicate or incorrect IDs: %j, %j, %j', (a, b, c) => {
    expect(validate(source([a,b,c]), step, language)).toMatchObject({ ok: false, title: 'Check the suspect IDs' });
  });
  it('rejects hardcoded totals and a calculation missing an ID variable', () => {
    for (const expression of ['72046', 'suspect_01_ID + suspect_02_ID + 24028', 'suspect_01_ID + suspect_02_ID + suspect_03_ID * 0 + 24028']) {
      expect(validate(source(permutations[0], expression), step, language).ok).toBe(false);
    }
  });
  it('uses the actual values at calculation time, even when IDs can be reordered', () => {
    const code = program([24013,24005,24028]).replace('result =', 'suspect_01_ID = 24028\nsuspect_03_ID = 24013\nresult =');
    const actual = language === 'python' ? code : code.split('\n').map((line, index) => line.startsWith('print(') ? 'Console.WriteLine(result);' : `${index < 3 || line.startsWith('result =') ? 'int ' : ''}${line};`).join('\n');
    expect(validate(actual, step, language).ok).toBe(true);
  });
});
