import { Check, ArrowLeft, Search } from 'lucide-react';
import { suspects } from '../cases/case001';
import { Portrait } from './Artwork';
import { SolvedEnding, UnsolvedEnding } from './CaseEnding';
import type { CaseState } from '../types';
import { useState } from 'react';
import '../styles/deduction.css';
export function FinalDeduction({ state, onChange, onCloseCase, onBack, onEvidence }: { state: CaseState; onChange: (deduction: CaseState['deduction']) => void; onCloseCase: () => void; onBack: () => void; onEvidence: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [shuffledSuspects] = useState(() => {
    const shuffled = [...suspects];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const next = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[next]] = [shuffled[next], shuffled[i]];
    }
    return shuffled;
  });
  const [failed, setFailed] = useState(false);
  function submit() {
    if (!state.deduction.person) { setFeedback('Choose the student whose printed password matches the keypad fingerprints.'); return; }
    if (state.deduction.person !== 'emily') { setFailed(true); return; }
    onCloseCase();
  }
  if (failed) return <UnsolvedEnding onRetry={() => { setFailed(false); onChange({ person: '', account: '' }); onBack(); }}/>;
  if (state.closed) return <SolvedEnding onBack={onBack}/>;
  return <main className="deduction-page"><div className="deduction-heading"><div><span className="small-label">CASE 001 / THE FINAL DEDUCTION</span><h1>LET’S PUT IT TOGETHER.</h1><p>Compare your final three printed passwords with the keypad fingerprints.</p></div><button className="secondary text-button" onClick={onEvidence}><Search size={18}/> CHECK THE SIGN-IN RECORD</button></div><div className="deduction-columns"><section className="paper deduction-people"><div className="section-number">01 / WHO WAS WITH BRIAN?</div><div className="deduction-suspects">{shuffledSuspects.map(person => <button className={state.deduction.person === person.id ? 'selected' : ''} key={person.id} aria-label={person.name} onClick={() => { onChange({ person: person.id, account: 'prep' }); setFeedback(''); }} aria-pressed={state.deduction.person === person.id}><Portrait name={person.name}/><span>{person.name}{state.deduction.person === person.id && <Check size={17}/>}</span></button>)}</div></section></div><div className="deduction-controls"><button className="subtle-button" onClick={onBack}><ArrowLeft size={16}/> RETURN TO EVIDENCE</button><p role="status">{feedback}</p><button className="primary" onClick={submit}>CLOSE THE CASE <Check size={21}/></button></div></main>;
}
