import type { CaseDefinition, CaseState } from '../types';

export const archiveReady = (state: CaseState) => [1,2,3].every(id => state.solved.includes(id));
export const archiveAuthenticated = (state: CaseState) => archiveReady(state) && state.cameraCodeAccepted && state.timeAccepted && state.archive1220Unlocked;
export const canSelectStep = (state: CaseState, id: number) => Number.isInteger(id) && id >= 1 && id <= 8 && (id <= 3 || archiveAuthenticated(state));
export function stepBlockReason(state: CaseState, id: number, definition: CaseDefinition): string | null {
  const step = definition.steps.find(s => s.id === id);
  if (!step) return 'Step not found.';
  if (!canSelectStep(state, id)) return archiveReady(state) ? 'CCTV ARCHIVE NOT RECOVERED. Enter the camera code and last seen time at the Security Terminal.' : 'Complete Steps 01, 02, and 03. Then answer the Security Terminal to open Steps 04–08.';
  if (id === 4 && !state.archive1220Unlocked) return 'CCTV ARCHIVE NOT RECOVERED. CHECK EARLIER EVIDENCE.';
  if (step.requiredEvidence.some(key => !state.evidence.includes(key))) return 'Check earlier evidence. Recover the records for this step first.';
  return null;
}
export function solveStep(state: CaseState, id: number, definition: CaseDefinition): CaseState {
  const step = definition.steps.find(s => s.id === id);
  if (!step || stepBlockReason(state, id, definition)) return state;
  return { ...state, solved: [...new Set([...state.solved, id])], results: { ...state.results, [id]: step.expectedResult }, evidence: [...new Set([...state.evidence, ...step.unlockEvidence])] };
}
export function acceptCameraCode(state: CaseState, code: string): CaseState {
  if (!archiveReady(state) || code.trim() !== '280') return state;
  return { ...state, cameraCodeAccepted: true };
}
export function acceptArchiveTime(state: CaseState, hour: number, minute: number): CaseState {
  if (!archiveReady(state) || !state.cameraCodeAccepted || hour !== 15 || minute !== 40) return state;
  return { ...state, timeAccepted: true, archive1220Unlocked: true, evidence: [...new Set([...state.evidence, 'A1220', 'CCTV-BW'])] };
}

