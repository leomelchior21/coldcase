import { describe, it, expect } from 'vitest';
import { freshState, loadState, saveState, STORAGE_KEY } from '../src/engine/storage';
import { case001, initialCode } from '../src/cases/case001';
import { solveStep, acceptCameraCode, acceptArchiveTime } from '../src/engine/caseEngine';
import { solutions } from './fixtures/casePrograms';
import { codeForStep, languageText } from '../src/engine/language';

function memory(value: unknown) {
  const data = new Map([[STORAGE_KEY, JSON.stringify(value)]]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => data.get(key), setItem: (key: string, value: string) => data.set(key,value) } });
}
function ready() { return [1,2,3].reduce((state,id) => solveStep(state,id,case001), freshState()); }

describe('Saved investigation migration', () => {
  it.each(['python', 'csharp'] as const)('refreshes revised %s clues without resetting saved answers or progress', language => {
    const state = acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40);
    state.language = language;
    const marker = language === 'csharp' ? '//' : '#';
    const oldNotes: Record<number, string[]> = {
      3: ['Brian was last seen during hour 15.', 'The minute was 40.'],
      4: ['The color filter value is 2.'],
      5: ['The correction value is 12.'],
      6: ['Check the Last Seen Record and the access log.'],
    };
    for (const [id, notes] of Object.entries(oldNotes)) {
      const source = language === 'python' ? solutions[+id - 1] : solutions[+id - 1].split('\n').map(line => line.startsWith('print(') ? 'Console.WriteLine(result);' : `int ${line};`).join('\n');
      state.codes[+id] = notes.map(note => `${marker} ${note}\n`).join('') + source;
    }
    memory({ ...state, evidence: [...state.evidence, 'T1540'] });
    const restored = loadState();
    expect(restored.solved).toEqual(state.solved);
    expect(restored.archive1220Unlocked).toBe(true);
    expect(restored.evidence).not.toContain('T1540');
    for (const [id, notes] of Object.entries(oldNotes)) {
      const program = state.codes[+id].split('\n').filter(line => !line.startsWith(marker)).join('\n');
      expect(restored.codes[+id]).toContain(program);
      for (const note of notes) expect(restored.codes[+id]).not.toContain(note);
    }
    expect(restored.codes[3]).toContain('The inspector said that Brian left the room 20 minutes before 16:00.');
    expect(restored.codes[4]).toContain('The color filter value is in your evidence.');
    expect(restored.codes[5]).toContain('The correction value is the number used as midday.');
    expect(restored.codes[6]).toContain('Check the CCTV archive file and the access log.');
  });
  it.each(['python', 'csharp'] as const)('removes the four extra comments from every saved %s step with edited headers', language => {
    const state = freshState(), marker = language === 'csharp' ? '//' : '#';
    const newline = language === 'csharp' ? '\r\n' : '\n';
    const obsolete = [
      'Declare whole numbers with int, e.g. int clues = 2;',
      'End each statement with a semicolon (;).',
      'Replace each glowing VARIABLE name and fill its value from the Case Note.',
      'Complete result with your calculation, then print result below.',
    ];
    state.language = language;
    const expected: Record<number, string> = {};
    for (const step of case001.steps) {
      const notes = codeForStep(step, language, false).trimEnd().replace(/(?:FINAL )?CASE NOTE/, 'My edited case note').split('\n');
      const draft = [`${marker} My calculation`, language === 'csharp' ? 'int result = 42;' : 'result = 42'];
      state.codes[step.id] = [...notes, ...obsolete.map(line => `  ${marker} ${line}  `), '', ...draft].join(newline);
      expected[step.id] = [...notes, '', ...draft].join(newline);
    }
    memory(state);
    expect(loadState().codes).toEqual(expected);
  });
  it.each(['python', 'csharp'] as const)('cleans saved %s Case Notes without changing student code or comments', language => {
    const step = case001.steps[7], marker = language === 'csharp' ? '//' : '#';
    const oldNotes = `${marker} FINAL CASE NOTE\n` + step.caseNote.map(line => `${marker} ${languageText(line, language)}`).join('\n');
    const oldGuide = (language === 'csharp' ? '\n// Declare whole numbers with int, e.g. int clues = 2;\n// End each statement with a semicolon (;).' : '') + `\n${marker} Replace each glowing VARIABLE name and fill its value from the Case Note.\n${marker} Complete result with your calculation, then print result below.`;
    const draft = `${marker} My own note\n` + (language === 'csharp' ? 'int prefix_checksum = 864;\nint result =;' : 'prefix_checksum = 864\nresult =');
    const state = freshState();
    state.language = language;
    state.codes[8] = oldNotes + oldGuide + '\n\n' + draft;
    memory(state);
    const restored = loadState();
    expect(restored.codes[8]).toBe(codeForStep(step, language, false) + draft);
    saveState(restored);
    expect(loadState()).toEqual(restored);
  });
  it.each([4,5,6,7,8])('preserves the current sequential step %i on reload', current => {
    let state = acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40);
    for (let id = 4; id < current; id++) state = solveStep(state, id, case001);
    state.currentStep = current;
    state.codes[current] = '# My in-progress solution';
    memory(state);
    expect(loadState()).toEqual(state);
  });
  it('returns a saved locked later step to the next unsolved step and preserves its draft', () => {
    const state = solveStep(acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40), 4, case001);
    state.currentStep = 8;
    state.codes[8] = '# Keep my later draft';
    memory(state);
    expect(loadState().currentStep).toBe(5);
    expect(loadState().codes[8]).toBe(state.codes[8]);
  });
  it('drops out-of-order completions and evidence after a gap in the sequence', () => {
    const state = acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40);
    memory({ ...state, solved: [1,2,3,5,6,7,8], currentStep: 8 });
    const restored = loadState();
    expect(restored.solved).toEqual([1,2,3]);
    expect(restored.currentStep).toBe(4);
    expect(restored.evidence).toEqual(state.evidence);
    expect(restored.results).toEqual(state.results);
  });
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
