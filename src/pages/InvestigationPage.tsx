import { useState, useCallback, useEffect, useRef } from 'react';
import { Files, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import type { CaseState } from '../types';
import { case001, initialCode, stepWithSuspect } from '../cases/case001';
import { CaseFilePanel } from '../components/CaseFilePanel';
import { CodeTerminal } from '../components/CodeTerminal';
import { EvidenceDesk, EvidenceModal } from '../components/EvidenceDesk';
import { StepDock } from '../components/StepDock';
import { Modal } from '../components/Modal';
import { FinalDeduction } from '../components/FinalDeduction';
import { validate, type Feedback } from '../engine/python/validator';
import { solveStep, archiveReady, canSelectStep, stepBlockReason } from '../engine/caseEngine';
import { CctvTerminal } from '../components/CctvTerminal';
export function InvestigationPage({ state, setState, onReset }: { state: CaseState; setState: React.Dispatch<React.SetStateAction<CaseState>>; onReset: () => void }) {
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [running, setRunning] = useState(false), [activeDocument, setActiveDocument] = useState<string | null>(null), [hintOpen, setHintOpen] = useState(false), [newest, setNewest] = useState<string[]>([]), [drawer, setDrawer] = useState(false), [resetEditor, setResetEditor] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(state.closed);
  const [terminalOpen, setTerminalOpen] = useState(false), [reveal, setReveal] = useState(false), [previousOpen, setPreviousOpen] = useState(false);
  const gateShown = useRef(false);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const step = stepWithSuspect(case001.steps[state.currentStep - 1], state.selectedSuspect);
  const ready = archiveReady(state);
  useEffect(() => {
    if (ready && !state.archive1220Unlocked && !gateShown.current) {
      gateShown.current = true; setActiveDocument(null); setTerminalOpen(true);
    }
  }, [ready, state.archive1220Unlocked]);
  const missingEvidence = step.requiredEvidence.some(id => !state.evidence.includes(id));
  const openDocument = useCallback((id: string) => { setActiveDocument(id); setNewest(previous => previous.filter(item => item !== id)); }, []);
  const closeDocument = useCallback(() => { setActiveDocument(null); setReveal(false); }, []);
  const closeHint = useCallback(() => setHintOpen(false), []);
  function selectStep(id: number) {
    if (!canSelectStep(state, id)) return;
    if (timer.current) clearTimeout(timer.current);
    setRunning(false); setHintOpen(false);
    setState(previous => ({ ...previous, currentStep: id, visited: [...new Set([...previous.visited, id])] }));
  }
  function nextStep() {
    if (step.id === 8) { setDeductionOpen(true); return; }
    if (ready && !state.archive1220Unlocked) { setTerminalOpen(true); return; }
    selectStep(!ready && step.id === 3 ? [1,2,3].find(id => !state.solved.includes(id)) ?? 1 : step.id + 1);
  }
  function run() {
    if (running) return;
    setRunning(true);
    const code = state.codes[step.id];
    timer.current = setTimeout(() => {
      const blocked = stepBlockReason(state, step.id, case001);
      const result: Feedback = blocked ? { ok: false, title: step.id === 4 ? 'CCTV ARCHIVE NOT RECOVERED' : 'Check your evidence', message: blocked, output: [] } : validate(code, step);
      setFeedback(previous => ({ ...previous, [step.id]: result })); setRunning(false);
      if (result.ok) {
        setState(previous => solveStep(previous, step.id, case001));
        setNewest(step.unlockEvidence);
        if (step.id === 4) { setReveal(true); openDocument('BP-BLUE'); }
        if (step.id === 6) openDocument('ACCESS204');
      }
    }, 360);
  }
  function toggleNote() {
    const hidden = state.hiddenNotes.includes(step.id), prefix = initialCode(step);
    setState(previous => ({ ...previous, codes: { ...previous.codes, [step.id]: hidden ? prefix + previous.codes[step.id] : previous.codes[step.id].startsWith(prefix) ? previous.codes[step.id].slice(prefix.length) : previous.codes[step.id].split('\n').filter(line => !line.trimStart().startsWith('#')).join('\n') }, hiddenNotes: hidden ? previous.hiddenNotes.filter(id => id !== step.id) : [...previous.hiddenNotes, step.id] }));
  }
  function resetCode() {
    setState(previous => ({ ...previous, codes: { ...previous.codes, [step.id]: previous.hiddenNotes.includes(step.id) ? '' : initialCode(step) } }));
    setFeedback(previous => { const next = { ...previous }; delete next[step.id]; return next; }); setResetEditor(false);
  }
  function chooseSuspect(id: string) {
    setState(previous => {
      const base = case001.steps[6];
      const oldPrefix = initialCode(stepWithSuspect(base, previous.selectedSuspect));
      const newPrefix = initialCode(stepWithSuspect(base, id));
      const code = previous.codes[7];
      return { ...previous, selectedSuspect: id, codes: { ...previous.codes, 7: code.startsWith(oldPrefix) ? newPrefix + code.slice(oldPrefix.length) : code } };
    });
    setActiveDocument(null); selectStep(7);
  }
  const currentFeedback = feedback[step.id] ?? (state.solved.includes(step.id) ? { ok: true, title: step.stamp, message: 'Recovered evidence is saved on your desk.', output: [step.expectedResult] } : undefined);
  const hintLevel = state.hints[step.id] || 1;
  return <>
    {deductionOpen && state.solved.includes(8) ? <FinalDeduction state={state} onChange={deduction => setState(previous => ({ ...previous, deduction }))} onCloseCase={() => setState(previous => ({ ...previous, closed: true }))} onBack={() => setDeductionOpen(false)} onEvidence={() => openDocument('FINAL-01')}/> : <main className="investigation-page"><div className="investigation-grid"><CaseFilePanel step={step} missingEvidence={missingEvidence}/><CodeTerminal step={step} code={state.codes[step.id]} onChange={code => setState(previous => ({ ...previous, codes: { ...previous.codes, [step.id]: code } }))} onRun={run} onReset={() => setResetEditor(true)} onHint={() => setHintOpen(true)} hiddenNote={state.hiddenNotes.includes(step.id)} onToggleNote={toggleNote} running={running} feedback={currentFeedback} solved={state.solved.includes(step.id)} onNext={nextStep} onEvidence={() => openDocument(step.unlockEvidence[0])}/><EvidenceDesk evidence={state.evidence} onOpen={openDocument} newest={newest} drawer={drawer} onClose={() => setDrawer(false)} onTerminal={ready ? () => setTerminalOpen(true) : undefined} suspectsRevealed={state.solved.includes(3)}/></div><div className="desk-toolbar"><span>{ready ? state.archive1220Unlocked ? 'FOLLOW THE EVIDENCE. ALL STEPS ARE OPEN.' : 'ANSWER THE SECURITY TERMINAL TO OPEN STEPS 04-08.' : 'COMPLETE STEPS 01-03. THEN OPEN THE SECURITY TERMINAL.'}</span><div>{ready && <button className="terminal-shortcut" onClick={() => setTerminalOpen(true)}>SECURITY TERMINAL <ArrowRight size={14}/></button>}{state.previousWork && <button onClick={() => setPreviousOpen(true)}>PREVIOUS NOTES</button>}<button className="mobile-evidence-button" onClick={() => setDrawer(true)}><Files size={16}/> EVIDENCE ({state.evidence.length})</button>{state.solved.includes(8) && <button onClick={() => setDeductionOpen(true)}>{state.closed ? 'CASE CLOSED' : 'FINAL DEDUCTION'} <ArrowRight size={14}/></button>}<button onClick={onReset}><RotateCcw size={13}/> RESET CASE</button></div></div><StepDock state={state} onSelect={selectStep}/></main>}
    {activeDocument && <EvidenceModal activeId={activeDocument} evidence={state.evidence} onOpen={openDocument} onClose={closeDocument} highlightAccess={state.solved.includes(6)} reveal={reveal && activeDocument === 'BP-BLUE'} selectedSuspect={state.selectedSuspect} onChooseSuspect={!state.solved.includes(7) ? chooseSuspect : undefined} suspectsRevealed={state.solved.includes(3)}/>}
    {terminalOpen && <CctvTerminal state={state} setState={setState} onClose={closeTerminal} onContinue={() => { setTerminalOpen(false); selectStep(4); }}/>}
    {previousOpen && state.previousWork && <Modal title="Previous investigation notes" onClose={() => setPreviousOpen(false)} className="previous-notes paper"><h2>YOUR PREVIOUS INVESTIGATION</h2><p>The case has new records. Your earlier programs and results are saved here.</p>{Object.entries(state.previousWork.codes).map(([id, code]) => <section key={id}><h3>STEP {id} {state.previousWork!.solved.includes(+id) ? ' / VERIFIED' : ''}</h3>{state.previousWork!.results[+id] !== undefined && <p>Saved result: {state.previousWork!.results[+id]}</p>}<pre>{code}</pre></section>)}</Modal>}
    {hintOpen && <Modal title="Investigator’s clue" onClose={closeHint} className="hint-modal paper"><span className="small-label">STEP {String(step.id).padStart(2,'0')} / A LITTLE HELP</span><Lightbulb size={38}/><h2>ANOTHER WAY TO LOOK AT IT.</h2><span className="hint-counter">CLUE {hintLevel} OF 3</span><p>{step.hints[hintLevel - 1]}</p><div className="hint-dots">{[1,2,3].map(level => <button aria-label={`Read clue ${level}`} aria-pressed={level === hintLevel} disabled={level > hintLevel} key={level} onClick={() => setState(previous => ({ ...previous, hints: { ...previous.hints, [step.id]: level } }))}>{level}</button>)}</div><button className="primary" onClick={() => hintLevel < 3 ? setState(previous => ({ ...previous, hints: { ...previous.hints, [step.id]: hintLevel + 1 } })) : setHintOpen(false)}>{hintLevel < 3 ? 'ONE MORE CLUE' : 'BACK TO THE CASE'}<ArrowRight size={18}/></button><p className="hint-footnote">Talk it through. You still write the program.</p></Modal>}
    {resetEditor && <Modal title="Reset this step’s code?" onClose={() => setResetEditor(false)} className="confirm-modal paper"><RotateCcw size={30}/><h2>RESET THIS PROGRAM?</h2><p>Your code for this step will be cleared. Your evidence and solved steps will stay.</p><div><button className="secondary text-button" onClick={() => setResetEditor(false)}>KEEP MY CODE</button><button className="danger-button" onClick={resetCode}>RESET PROGRAM</button></div></Modal>}
  </>;
}
