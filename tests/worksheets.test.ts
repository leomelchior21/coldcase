import { describe, expect, it } from 'vitest';
import { worksheets } from '../src/cases/case001-worksheets';

describe('Student print worksheets', () => {
  it('contains writing spaces instead of solved records or identifying reveal images', () => {
    const data=JSON.stringify(worksheets);
    expect(data).not.toMatch(/\b280\b|\b27\b|15:40|1540|1220|2440|\b204\b|\bB4\b|\b68\b|BLUE BACKPACK|OPERATOR: BRIAN|ASSISTANT: EMILY/i);
    expect(worksheets.every(sheet=>sheet.fields.length>0)).toBe(true);
    expect(worksheets.some(sheet=>sheet.photo==='equipment-log')).toBe(false);
    expect(worksheets.filter(sheet=>sheet.photo==='hallway-footage').every(sheet=>sheet.monochrome)).toBe(true);
    expect(worksheets.find(sheet=>sheet.title==='Person of interest')?.fields).toContain('Person’s name');
  });
});
