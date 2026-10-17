import { expect, it } from 'vitest';
import { case001 } from '../src/cases/case001';
import { studentRegister } from '../src/cases/student-register';

it('keeps the printed register out of the digital evidence and unlock requirements', () => {
  expect(studentRegister).toHaveLength(30);
  expect(case001.documents.some(doc => doc.id === 'STUDENTS' || doc.title === 'Student number register')).toBe(false);
  expect(case001.steps.flatMap(step => [...step.requiredEvidence, ...step.unlockEvidence])).not.toContain('STUDENTS');
  expect(case001.steps[6].caseNote.join(' ')).toContain('printed student register');
  expect(case001.steps[7].caseNote.join(' ')).toContain('printed student register');
});
