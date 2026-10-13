import { describe, expect, it } from 'vitest';
import { case001, suspects } from '../src/cases/case001';
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
    for(const id of [4,5,6,7,8]) expect(canSelectStep(authenticated,id)).toBe(true);
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
  it('only Emily matches all three and no person is selected initially', () => {
    expect(suspects.filter(s=>s.backpack==='Blue'&&s.card==='B4'&&s.room===204).map(s=>s.id)).toEqual(['emily']);expect(freshState().selectedSuspect).toBe('');
  });
  it('rejects decoy operations that cancel to a hardcoded answer', () => {
    expect(validate('camera_log=257880\nbackup_log=921\nresult=280 + (camera_log / backup_log) * 0\nprint(result)',case001.steps[0]).ok).toBe(false);
    expect(validate('key_code=27\nsector_value=8\ncorrection=12\nresult=204+(key_code*sector_value-correction)*0\nprint(result)',case001.steps[4]).ok).toBe(false);
  });
  it('accepts equivalent grouping, commutative multiplication and intermediary variables', () => {
    expect(validate('key_code=27\nsector_value=8\ncorrection=12\nsector = sector_value * key_code\nresult = (sector) - (correction)\nprint(result)',case001.steps[4]).ok).toBe(true);
  });
});
