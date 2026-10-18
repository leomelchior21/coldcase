import type { CaseDefinition, CaseState } from '../types';

export const archiveReady = (state: CaseState) => [1,2,3].every(id => state.solved.includes(id));
export const archiveAuthenticated = (state: CaseState) => archiveReady(state) && state.cameraCodeAccepted && state.timeAccepted && state.archive1220Unlocked;
export const canSelectStep = (state: CaseState, id: number) => Number.isInteger(id) && id >= 1 && id <= 8 && (id <= 3 || (archiveAuthenticated(state) && Array.from({ length: id - 4 }, (_, index) => index + 4).every(previous => state.solved.includes(previous))));
export function stepBlockReason(state: CaseState, id: number, definition: CaseDefinition): string | null {
  const step = definition.steps.find(s => s.id === id);
  if (!step) return 'Step not found.';
  if (!canSelectStep(state, id)) {
    if (!archiveReady(state)) return 'Complete Steps 01, 02, and 03. Then answer the Security Terminal to open Step 04.';
    if (!archiveAuthenticated(state)) return 'CCTV ARCHIVE NOT RECOVERED. Enter the camera code and last seen time at the Security Terminal.';
    const previous = Array.from({ length: id - 4 }, (_, index) => index + 4).find(previous => !state.solved.includes(previous));
    return `Solve Step ${String(previous).padStart(2, '0')} to unlock the next step. Complete Steps 04–08 in order.`;
  }
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

