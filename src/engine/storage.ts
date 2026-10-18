import { case001, initialCode, suspects } from '../cases/case001';
import { archiveReady, canSelectStep, stepBlockReason } from './caseEngine';
import type { CaseState, Value } from '../types';
import { codeForStep, refreshCaseNotes } from './language';
export const STORAGE_KEY = 'cold-case:001:v1';
export function freshState(): CaseState {
  return { language: 'python', languageChosen: false, tutorialCompleted: false, version: 1, caseRevision: 3, notesRevision: 4, caseId: '001', opened: false, currentStep: 1, visited: [1], solved: [], codes: Object.fromEntries(case001.steps.map(step => [step.id, initialCode(step)])), evidence: ['BRIEF','BOARD'], hiddenNotes: [], hints: {}, deduction: { person: '', account: '' }, closed: false, cameraCodeAccepted: false, timeAccepted: false, archive1220Unlocked: false, selectedSuspect: '', results: {} };
}
const ids = (list: unknown) => Array.isArray(list) ? [...new Set(list.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 8))] : [];
const cleanCodes = (codes: unknown): Record<number,string> => Object.fromEntries(Object.entries(codes && typeof codes === 'object' ? codes : {}).filter(([id, code]) => +id >= 1 && +id <= 8 && typeof code === 'string' && code.length <= 20000));
function previousWork(raw: Partial<CaseState>): CaseState['previousWork'] {
  if (!raw.codes || typeof raw.codes !== 'object') return undefined;
  const solved = ids(raw.solved);
  const oldResults = raw.caseRevision ? [280,27,1540,2440,204,3,3,68] : [3,27,1540,3,204,3,3,68];
  return { codes: cleanCodes(raw.codes), solved, results: Object.fromEntries(solved.map(id => [id, oldResults[id - 1]])), closed: raw.closed === true };
}
export function loadState(): CaseState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Partial<CaseState> | null;
    if (!raw || raw.version !== 1 || raw.caseId !== '001') return freshState();
    const clean = freshState();
    clean.languageChosen = raw.languageChosen === true;
    clean.tutorialCompleted = raw.tutorialCompleted === true;
    clean.language = raw.language === 'csharp' ? 'csharp' : 'python';
    clean.codes = Object.fromEntries(case001.steps.map(step => [step.id, codeForStep(step, clean.language)]));
    if (raw.caseRevision !== 3) {
      // Keep the old investigation intact, separate from the new evidence chain.
      clean.opened = raw.opened === true;
      clean.previousWork = previousWork(raw);
      return clean;
    }
    clean.opened = raw.opened === true; clean.visited = ids(raw.visited); clean.hiddenNotes = ids(raw.hiddenNotes);
    clean.currentStep = typeof raw.currentStep === 'number' && raw.currentStep >= 1 && raw.currentStep <= 8 ? Math.floor(raw.currentStep) : 1;
    clean.selectedSuspect = suspects.some(s => s.id === raw.selectedSuspect) ? raw.selectedSuspect! : '';
    const requested = ids(raw.solved);
    clean.solved = requested.filter(id => id <= 3);
    clean.cameraCodeAccepted = archiveReady(clean) && raw.cameraCodeAccepted === true;
    clean.timeAccepted = clean.cameraCodeAccepted && raw.timeAccepted === true;
    clean.archive1220Unlocked = clean.timeAccepted && raw.archive1220Unlocked === true;
    clean.evidence.push(...case001.steps.filter(s => clean.solved.includes(s.id)).flatMap(s => s.unlockEvidence));
    if (clean.archive1220Unlocked) clean.evidence.push('A1220','CCTV-BW');
    for (const step of case001.steps.filter(s => s.id > 3)) {
      if (requested.includes(step.id) && !stepBlockReason(clean, step.id, case001)) {
        clean.solved.push(step.id); clean.evidence.push(...step.unlockEvidence);
      }
    }
    if (!canSelectStep(clean, clean.currentStep)) clean.currentStep = case001.steps.find(step => canSelectStep(clean, step.id) && !clean.solved.includes(step.id))?.id ?? 3;
    clean.results = Object.fromEntries(case001.steps.filter(s => clean.solved.includes(s.id)).map(s => [s.id,s.expectedResult]));
    clean.codes = { ...clean.codes, ...cleanCodes(raw.codes) };
    case001.steps.forEach(step => {
      clean.codes[step.id] = refreshCaseNotes(clean.codes[step.id], step, clean.language);
      const hint = raw.hints?.[step.id];
      if (typeof hint === 'number') clean.hints[step.id] = Math.max(0, Math.min(3, Math.floor(hint)));
    });
    if (raw.deduction && typeof raw.deduction.person === 'string' && typeof raw.deduction.account === 'string') clean.deduction = raw.deduction;
    clean.closed = raw.closed === true && clean.solved.length === 8 && clean.deduction.person === case001.finalDeduction.person && clean.deduction.account === case001.finalDeduction.account;
    if (raw.previousWork && typeof raw.previousWork === 'object') {
      const old = raw.previousWork;
      clean.previousWork = { codes: cleanCodes(old.codes), solved: ids(old.solved), closed: old.closed === true, results: Object.fromEntries(Object.entries(old.results || {}).filter(([id, value]) => +id >= 1 && +id <= 8 && (typeof value === 'string' || typeof value === 'number'))) as Record<number,Value> };
    }
    return clean;
  } catch { return freshState(); }
}
export function saveState(state: CaseState): boolean { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; } }

