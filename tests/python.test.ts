import { describe, it, expect } from 'vitest';
import { execute } from '../src/engine/python/evaluator';
import { validate } from '../src/engine/python/validator';
import { case001 } from '../src/cases/case001';
import { solveStep, acceptCameraCode, acceptArchiveTime } from '../src/engine/caseEngine';
import { freshState, loadState, saveState, STORAGE_KEY } from '../src/engine/storage';

describe('Python classroom subset', () => {
  it.each([
    ['a = 3\nprint(a)', [3]],
    ['name = "Brian"\nprint(name)', ['Brian']],
    ["name = 'Brian'\nprint(name)", ['Brian']],
    ['x = 1.5\nprint(x + .5)', [2]],
    ['print(2 + 3 * 4)', [14]],
    ['print((2 + 3) * 4)', [20]],
    ['print(10 - 3 - 2)', [5]],
    ['print(12 / 2 / 3)', [2]],
    ['print(7 / 2)', [3.5]],
    ['print(-2 * -3 + +1)', [7]],
    ['a=2\nb=a*3\na=4\nprint(a)\nprint(b)', [4,6]],
    ['# case note\n\nnumber = 3 # camera\n\nprint(number) # found', [3]],
    ['x="# not a comment"\nprint(x)', ['# not a comment']],
    ['print("Cold " + "Case")', ['Cold Case']],
    ['print("a" * 3)', ['aaa']],
    ['print(3 * "b")', ['bbb']],
    ['print("a" * -1)', ['']],
  ])('executes %s', (source, expected) => expect(execute(source as string).output).toEqual(expected));
  it('handles escaped quotes and newlines', () => expect(execute(String.raw`print("say \"hi\"\nBrian")`).output).toEqual(['say "hi"\nBrian']));
  it.each(['print(missing)','x=','result=1 +','result=(2+3','print(3','x = "unclosed','print(2/0)','x = 1; print(x)','import os','while True:','print("x" - 1)','x=__import__("os")','print(1 ** 2)','print(1 // 2)','print(1, 2)','print([1])','print("x" * 20001)'])('rejects invalid or unsupported code: %s', source => expect(() => execute(source)).toThrow());
  it('does not evaluate calls or access JavaScript globals', () => expect(() => execute('print(globalThis)')).toThrow());
  it('supports decimal assignment and reassignment with original dependency values', () => {
    const result = execute('a=1.5\nb=a*2\na=8\nresult=b\nprint(result)');
    expect(result.variables.get('result')?.refs.get('a')).toEqual([1.5]);
  });
  it('bounds deeply nested expressions', () => expect(() => execute('print(' + '('.repeat(200) + '1' + ')'.repeat(200) + ')')).toThrow());
});

import { solutions } from './fixtures/casePrograms';
describe('All eight case validators', () => {
  case001.steps.forEach((step,i) => {
    it(`step ${step.id} accepts the reference program and output ${step.expectedResult}`, () => {
      const feedback = validate(solutions[i], step); expect(feedback.ok).toBe(true); expect(feedback.output).toEqual([step.expectedResult]);
    });
    it(`step ${step.id} tolerates whitespace and comments`, () => expect(validate('# investigator\n' + solutions[i].replaceAll(' = ', '=').replaceAll('result =', 'result=') + '\n# done\n',step).ok).toBe(true));
    it(`step ${step.id} rejects an unstored answer`, () => expect(validate(`print(${step.expectedResult})`, step)).toMatchObject({ ok: false, title: 'Result found — but not stored' }));
    it(`step ${step.id} rejects hardcoded result`, () => {
      const code = Object.entries(step.requiredVariables).map(([name,value]) => `${name}=${value}`).join('\n') + `\nresult=${step.expectedResult}\nprint(result)`;
      expect(validate(code,step)).toMatchObject({ ok: false, title: 'Connect your variables' });
    });
    it(`step ${step.id} requires print(result)`, () => expect(validate(solutions[i].replace('print(result)', ''),step)).toMatchObject({ ok: false, title: 'Result found — but not reported' }));
    it(`step ${step.id} rejects printing only a literal`, () => expect(validate(solutions[i].replace('print(result)', `print(${step.expectedResult})`),step).ok).toBe(false));
    it(`step ${step.id} rejects wrong variable values`, () => {
      const [name,value] = Object.entries(step.requiredVariables)[0];
      expect(validate(solutions[i].replace(`${name} = ${value}`,`${name} = 99`),step)).toMatchObject({ ok: false, title: step.unorderedVariableGroups ? 'Check the suspect IDs' : 'The clue doesn’t match' });
    });
  });
  it('requires intended arithmetic', () => expect(validate('camera_log=257880\nbackup_log=921\nresult=camera_log*backup_log\nprint(result)',case001.steps[0]).ok).toBe(false));
  it('does not count operations in unused variables', () => expect(validate('camera_log=257880\nbackup_log=921\ndecoy=camera_log/backup_log\nresult=3\nprint(result)',case001.steps[0]).ok).toBe(false));
  it('accepts meaningful intermediary variables', () => expect(validate('camera_log=257880\nbackup_log=921\ntotal=camera_log/backup_log\nresult=total\nprint(result)',case001.steps[0]).ok).toBe(true));
  it('uses values at calculation time, not a later reassignment', () => expect(validate('camera_log=280\nbackup_log=1\nresult=camera_log/backup_log\ncamera_log=257880\nbackup_log=921\nprint(result)',case001.steps[0]).ok).toBe(false));
  it('does not accept printing an earlier hardcoded result', () => expect(validate('result=280\nprint(result)\ncamera_log=257880\nbackup_log=921\nresult=camera_log/backup_log',case001.steps[0]).ok).toBe(false));
  it('provides friendly technical details', () => expect(validate('print(unknown)',case001.steps[0])).toMatchObject({ ok:false, title:'Variable not found', detail:expect.stringContaining('NameError') }));
});
describe('Case state', () => {
  it('only starts with a brief and a name-only suspect board', () => expect(freshState().evidence).toEqual(['BRIEF','BOARD']));
  it('unlocks evidence once and supports out-of-order steps', () => { let state = solveStep(freshState(),3,case001); state = solveStep(state,3,case001); expect(state.solved).toEqual([3]); expect(state.evidence).toEqual(['BRIEF','BOARD']); });
  it('unlocks every digital document through the complete case', () => { let state = freshState(); case001.steps.forEach(step => { if(step.id===4) state=acceptArchiveTime(acceptCameraCode(state,'280'),15,40); if(step.id===7) state={...state,selectedSuspect:'emily'}; state=solveStep(state,step.id,case001); }); expect(state.evidence.sort()).toEqual(case001.documents.map(d=>d.id).sort()); });
  it('handles corrupt local storage gracefully', () => { Object.defineProperty(globalThis, 'localStorage', { configurable:true, value:{getItem:()=>'{bad'} }); expect(loadState()).toEqual(freshState()); });
  it('validates and restores saved progress', () => { const memory = new Map<string,string>(); Object.defineProperty(globalThis,'localStorage',{ configurable:true,value:{getItem:(key:string)=>memory.get(key),setItem:(key:string,value:string)=>memory.set(key,value)}}); const state=solveStep(freshState(),1,case001); state.codes[1]=solutions[0]; state.currentStep=2; expect(saveState(state)).toBe(true); expect(loadState()).toEqual(state); memory.set(STORAGE_KEY,JSON.stringify({version:1,caseId:'001',codes:{1:null},solved:'oops',evidence:['FINAL-01'],currentStep:100})); expect(loadState().currentStep).toBe(1); expect(loadState().evidence).toEqual(['BRIEF','BOARD']); });
});
