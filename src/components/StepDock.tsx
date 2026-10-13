import { Check, Circle, ArrowUpRight, LockKeyhole } from 'lucide-react';
import { case001 } from '../cases/case001';
import type { CaseState } from '../types';
import { archiveReady, canSelectStep } from '../engine/caseEngine';
export function StepDock({ state, onSelect }: { state: CaseState; onSelect: (id: number) => void }) {
  return <nav className="step-dock" aria-label="Investigation steps">{case001.steps.map(step => {
    const solved = state.solved.includes(step.id), current = state.currentStep === step.id, visited = state.visited.includes(step.id);
    const locked = !canSelectStep(state, step.id);
    return <button key={step.id} className={`step-tab ${current ? 'current' : ''} ${solved ? 'solved' : ''} ${locked ? 'locked' : ''}`} disabled={locked} title={locked ? archiveReady(state) ? 'Answer the Security Terminal to unlock.' : 'Complete Steps 01-03, then answer the Security Terminal.' : undefined} aria-current={current ? 'step' : undefined} onClick={() => onSelect(step.id)}><div><b>{String(step.id).padStart(2,'0')}</b>{locked ? <LockKeyhole size={17}/> : solved ? <Check className="solved-icon" size={19}/> : current ? <ArrowUpRight size={17}/> : <Circle size={10}/>}</div><strong>{step.shortLabel}</strong><span>{locked ? 'LOCKED' : solved ? 'VERIFIED' : current ? 'INVESTIGATING' : visited ? 'VISITED' : 'UNEXPLORED'}</span></button>;
  })}</nav>;
}
