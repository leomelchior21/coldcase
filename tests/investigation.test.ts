import { studentRegister } from '../src/cases/student-register';
import { describe, expect, it } from 'vitest';
import { case001, initialCode, suspects } from '../src/cases/case001';
import { redactName } from '../src/components/anonymous';
import { evidenceArtwork } from '../src/cases/case001-artwork';
import { freshState } from '../src/engine/storage';
import { archiveReady, canSelectStep, acceptCameraCode, acceptArchiveTime, solveStep, stepBlockReason } from '../src/engine/caseEngine';
import { validate } from '../src/engine/python/validator';

const ready = () => [3,1,2].reduce((s,id) => solveStep(s,id,case001),freshState());
describe('Recovered evidence chain', () => {
  it.each([[],[1],[2],[3],[1,2],[1,3],[2,3]])('keeps all later steps locked with only %j complete', (...completed) => {
    const state = completed.reduce((s,id) => solveStep(s,id,case001),freshState());
    for(const id of [1,2,3]) expect(canSelectStep(state,id)).toBe(true);
    for(const id of [4,5,6,7,8]) { expect(canSelectStep(state,id)).toBe(false); expect(solveStep(state,id,case001)).toBe(state); }
  });
  it('keeps later tabs locked until both terminal answers are accepted', () => {
    const state = ready();
    for(const id of [4,5,6,7,8]) expect(canSelectStep(state,id)).toBe(false);
    expect(state.archive1220Unlocked).toBe(false);
    expect(stepBlockReason(state,4,case001)).toContain('CCTV ARCHIVE NOT RECOVERED');
    const camera = acceptCameraCode(state,'280');
    for(const id of [4,5,6,7,8]) expect(canSelectStep(camera,id)).toBe(false);
    const wrongTime = acceptArchiveTime(camera,15,41);
    for(const id of [4,5,6,7,8]) expect(canSelectStep(wrongTime,id)).toBe(false);
    const authenticated = acceptArchiveTime(camera,15,40);
    expect(canSelectStep(authenticated,4)).toBe(true);
    for(const id of [5,6,7,8]) expect(canSelectStep(authenticated,id)).toBe(false);
  });
  it('unlocks one later step at a time and keeps earlier steps available', () => {
    let state = acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40);
    for (const current of [4,5,6,7,8]) {
      for (let id = 1; id <= current; id++) expect(canSelectStep(state, id)).toBe(true);
      for (let id = current + 1; id <= 8; id++) {
        expect(canSelectStep(state, id)).toBe(false);
        expect(stepBlockReason(state, id, case001)).toContain(`Solve Step ${String(current).padStart(2, '0')}`);
        expect(solveStep(state, id, case001)).toBe(state);
      }
      state = solveStep(state, current, case001);
      expect(state.solved).toContain(current);
    }
    expect(state.solved).toHaveLength(8);
  });
  it('requires the full earlier sequence even if a later step was previously solved', () => {
    const state = { ...acceptArchiveTime(acceptCameraCode(ready(), '280'), 15, 40), solved: [1,2,3,5] };
    expect(canSelectStep(state, 6)).toBe(false);
    expect(solveStep(state, 6, case001)).toBe(state);
  });
  it('accepts prerequisites in any order but requires all three', () => {
    expect(archiveReady(solveStep(freshState(),3,case001))).toBe(false);
    expect(archiveReady(ready())).toBe(true);
    expect(acceptCameraCode(freshState(),'280').cameraCodeAccepted).toBe(false);
  });
  it('requires camera and time retrieval without prefilled acceptance', () => {
    const state=ready(); expect(acceptCameraCode(state,'3')).toBe(state);
    expect(acceptArchiveTime(state,15,40)).toBe(state);
    const camera=acceptCameraCode(state,'280'); expect(camera.cameraCodeAccepted).toBe(true);
    expect(acceptArchiveTime(camera,15,41)).toBe(camera);
    const archive=acceptArchiveTime(camera,15,40);
    expect(archive.archive1220Unlocked).toBe(true); expect(archive.evidence).toContain('A1220'); expect(archive.evidence).toContain('CCTV-BW');expect(archive.evidence).not.toContain('BP-BLUE');
  });
  it('blocks a correct Step 4 program from unlocking evidence before authentication', () => {
    const state=ready(); expect(solveStep(state,4,case001)).toBe(state); expect(stepBlockReason(state,4,case001)).not.toMatch(/280|1540|15:40|1220/);
  });
  it('keeps early records free of later discoveries', () => {
    const key=case001.documents.find(d=>d.id==='K27')!;expect(JSON.stringify(key)).not.toContain('204');
    const camera=case001.documents.find(d=>d.id==='C280')!;expect(JSON.stringify(camera)).not.toContain('1220');
    const frame=case001.documents.find(d=>d.id==='CCTV-BW')!;expect(JSON.stringify(frame).toLowerCase()).not.toContain('blue');expect(evidenceArtwork['CCTV-BW'].alt.toLowerCase()).not.toContain('blue');expect(evidenceArtwork['CCTV-BW'].monochrome).toBe(true);
    expect(case001.steps[6].caseNote.join(' ')).not.toContain('Emily');
  });
  it('three suspects match all three and no person is selected initially', () => {
    expect(suspects.filter(s=>s.backpack==='Blue'&&s.card==='B4'&&s.room===204).map(s=>s.id)).toEqual(['emily','elena','maya']);expect(freshState().selectedSuspect).toBe('');
  });
  it('rejects decoy operations that cancel to a hardcoded answer', () => {
    expect(validate('camera_log=257880\nbackup_log=921\nresult=280 + (camera_log / backup_log) * 0\nprint(result)',case001.steps[0]).ok).toBe(false);
    expect(validate('key_code=27\nsector_value=8\ncorrection=12\nresult=204+(key_code*sector_value-correction)*0\nprint(result)',case001.steps[4]).ok).toBe(false);
  });
  it('accepts equivalent grouping, commutative multiplication and intermediary variables', () => {
    expect(validate('key_code=27\nsector_value=8\ncorrection=12\nsector = sector_value * key_code\nresult = (sector) - (correction)\nprint(result)',case001.steps[4]).ok).toBe(true);
  });
});

describe('Starter programs and redacted identities', () => {
  const starter = (id: number) => initialCode(case001.steps[id - 1]).split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
  it('starts Step 1 with fixed variable names and blank values', () => {
    expect(starter(1)).toEqual(['camera_log =', 'backup_log =', 'result =', 'print(result)']);
  });
  it('starts Step 2 with fixed variable names, empty values and result, and output', () => {
    expect(starter(2)).toEqual(['inventory_checksum =', 'returned_checksum =', 'result =', 'print(result)']);
  });
  it('provides named variables for every later step', () => {
    for (const id of [3,4,5,6,7,8]) expect(starter(id)).toEqual([...Object.keys(case001.steps[id - 1].requiredVariables).map(name => `${name} =`), 'result =', 'print(result)']);
  });
  it('accepts the Step 1 and Step 2 starter lines once the student completes them', () => {
    const first = initialCode(case001.steps[0]).replace('camera_log =', 'camera_log = 257880').replace('backup_log =', 'backup_log = 921').replace('result =', 'result = camera_log / backup_log');
    expect(validate(first, case001.steps[0]).ok).toBe(true);
    const second = initialCode(case001.steps[1]).replace('inventory_checksum =', 'inventory_checksum = 864').replace('returned_checksum =', 'returned_checksum = 837').replace('result =', 'result = inventory_checksum - returned_checksum');
    expect(validate(second, case001.steps[1]).ok).toBe(true);
  });
  it('renders suspect names as indecipherable glyphs without leaking letters', () => {
    for (const suspect of suspects) {
      const hidden = redactName(suspect.name);
      expect(hidden).toHaveLength(suspect.name.length);
      expect(hidden).not.toContain(suspect.name);
      expect(hidden).not.toMatch(/[a-z]/i);
    }
  });
});


describe('Fingerprint password deduction', () => {
  it('identifies only Emily among the three candidates using the fingerprint digits', () => {
    expect(studentRegister).toHaveLength(30);
    expect(new Set(studentRegister.map(s => s.number)).size).toBe(30);
    expect(new Set(studentRegister.map(s => s.password)).size).toBe(30);
    const matching = studentRegister.filter(s => ['Maya Chen','Elena Brooks','Emily Carter'].includes(s.name));
    expect(matching.map(s => Number(s.number)).reduce((sum, id) => sum + id, 0)).toBe(72046);
    expect(matching.filter(s => /^[274]+$/.test(s.password)).map(s => s.name)).toEqual(['Emily Carter']);
    expect(suspects.every(person => studentRegister.some(student => student.name === person.name))).toBe(true);
  });
  it('does not identify the student or reveal the story in the final record', () => {
    const record = case001.documents.find(d => d.id === 'FINAL-01')!;
    expect(JSON.stringify(record)).not.toMatch(/Emily|Carter|demonstration|72427/);
    expect(case001.documents.some(d => d.id === 'E01')).toBe(false);
  });
});
