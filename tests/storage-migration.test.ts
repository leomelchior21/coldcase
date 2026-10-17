import { describe, it, expect } from 'vitest';
import { freshState, loadState, saveState, STORAGE_KEY } from '../src/engine/storage';
import { case001, initialCode } from '../src/cases/case001';
import { solveStep, acceptCameraCode, acceptArchiveTime } from '../src/engine/caseEngine';
import { solutions } from './fixtures/casePrograms';

function memory(value: unknown) {
  const data = new Map([[STORAGE_KEY, JSON.stringify(value)]]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => data.get(key), setItem: (key: string, value: string) => data.set(key,value) } });
}
function ready() { return [1,2,3].reduce((state,id) => solveStep(state,id,case001), freshState()); }

describe('Saved investigation migration', () => {
  it('returns a saved locked step to an unfinished opening step without erasing its code', () => {
    const state = solveStep(freshState(),1,case001);state.currentStep=5;state.codes[5]='# My saved work\nkey_code = 27';
    memory(state);const restored=loadState();expect(restored.currentStep).toBe(2);expect(restored.codes[5]).toBe(state.codes[5]);
  });
  it('returns an unauthenticated later step to the completed opening steps on reload', () => {
    const state = ready();state.currentStep=6;state.cameraCodeAccepted=true;state.codes[6]='# Keep my program';
    memory(state);const restored=loadState();expect(restored.currentStep).toBe(3);expect(restored.codes[6]).toBe(state.codes[6]);expect(restored.archive1220Unlocked).toBe(false);
  });
  it('preserves every earlier program and result without granting new evidence', () => {
    const codes = { 1: '# My own note\nhall_camera = 1\nextra_camera = 2\nresult = hall_camera + extra_camera\nprint(result)', 4: 'camera = 3\nresult = camera\nprint(result)' };
    memory({ version: 1, caseId: '001', notesRevision: 2, opened: true, codes, solved: [1,2,3,4], currentStep: 5, evidence: ['C03','C03-FRAME'] });
    const updated = loadState();
    expect(updated.previousWork?.codes).toEqual(codes);
    expect(updated.previousWork?.results).toEqual({1:3,2:27,3:1540,4:3});
    expect(updated.solved).toEqual([]); expect(updated.evidence).toEqual(['BRIEF','BOARD']);
    expect(updated.codes[1]).toBe(initialCode(case001.steps[0]));
    expect(updated.caseRevision).toBe(3);
    saveState(updated); expect(loadState()).toEqual(updated);
  });
  it('preserves a completed legacy investigation in the previous-work archive', () => {
    memory({ version:1, caseId:'001', codes:{8:solutions[7]}, solved:[1,2,3,4,5,6,7,8], closed:true });
    const updated=loadState(); expect(updated.previousWork?.closed).toBe(true); expect(updated.previousWork?.results[8]).toBe(68); expect(updated.closed).toBe(false);
  });
  it('persists camera acceptance independently and keeps the time gate unsolved', () => {
    const state=acceptCameraCode(ready(),'280'); state.codes[4]='# My theory\narchive_file = 1220'; state.hiddenNotes=[4];
    memory(state); expect(loadState()).toEqual(state);
    expect(loadState().timeAccepted).toBe(false); expect(loadState().evidence).not.toContain('A1220');
  });
  it('persists authenticated archive, restored footage, and all student code and results', () => {
    let state=acceptArchiveTime(acceptCameraCode(ready(),'280'),15,40);
    for(const step of case001.steps.slice(3)) { if(step.id===7)state.selectedSuspect='emily';state=solveStep(state,step.id,case001);state.codes[step.id]=solutions[step.id-1]; }
    state.closed=true;state.deduction={person:'emily',account:'prep'};
    memory(state);expect(loadState()).toEqual(state);expect(loadState().results[4]).toBe(2440);
  });
  it('drops forged downstream evidence when archive prerequisites are missing', () => {
    memory({...freshState(), solved:[4,7,8], evidence:['BP-BLUE','FINAL-01'], cameraCodeAccepted:true,timeAccepted:true,archive1220Unlocked:true,closed:true});
    expect(loadState().evidence).toEqual(['BRIEF','BOARD']);expect(loadState().archive1220Unlocked).toBe(false);
  });
  it('fresh reset clears every authentication phase, selection and result', () => {
    memory(acceptArchiveTime(acceptCameraCode(ready(),'280'),15,40)); saveState(freshState()); expect(loadState()).toEqual(freshState());
  });
});



it('archives revision 2 without carrying its Emily reveal into the password case', () => {
  memory({ ...freshState(), caseRevision: 2, language: 'csharp', codes: {7:'// old match program'}, solved:[1,2,3,4,5,6,7,8], results:{7:3,8:68}, closed:true });
  const state = loadState();
  expect(state.previousWork?.codes[7]).toBe('// old match program');
  expect(state.previousWork?.results[8]).toBe(68);
  expect(state.solved).toEqual([]);
  expect(state.evidence).toEqual(['BRIEF','BOARD']);
  expect(state.language).toBe('csharp');
  expect(state.codes[1]).toContain('int camera_log');
});
