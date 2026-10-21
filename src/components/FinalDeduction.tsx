import { Check, ArrowLeft, ArrowRight, FolderCheck, Search } from 'lucide-react';
import { suspects } from '../cases/case001';
import { Portrait } from './Artwork';
import { CompatibleImage } from './CompatibleImage';
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
  if (failed) return <main className="unsolved-ending" role="alert"><span className="small-label">CASE 001 / UNRESOLVED</span><h1>THE TRAIL GOES COLD.</h1><p>With the wrong person chosen, the mystery will never be solved.</p><p>There is still time to follow the evidence.</p><button className="primary" onClick={() => { setFailed(false); onChange({ person: '', account: '' }); onBack(); }}>CHECK THE LEVELS AND TRY AGAIN <ArrowRight size={20}/></button></main>;
  if (state.closed) return <main className="ending-page"><div className="ending-paper paper"><div className="document-kicker"><span>COLD CASE / FINAL RECONSTRUCTION</span><span>CASE 001</span></div><FolderCheck size={40}/><div className="stamp green closed-stamp">CASE CLOSED</div><h1>THE CLUES WERE CORRECT.<br/><span>THE FIRST ASSUMPTION WAS NOT.</span></h1><div className="ending-scene"><CompatibleImage src="/cases/case001/evidence/equipment-log.webp" alt="Brian and Emily safely preparing their Maker demonstration in Room 204"/><span>15:50 / ROOM 204 / BOTH STUDENTS SAFE</span></div><div className="reconstruction-chain" aria-label="Case reconstruction"><div><b>01 / CAMERA 280</b><span>Recovered from the damaged security log.</span></div><div><b>02 / LAST SEEN 15:40</b><span>Brian in the Maker Lab hallway.</span></div><div><b>03 / THREE MINUTES</b><span>At 15:43, Card B4 opens Room 204.</span></div><div><b>04 / ARCHIVE 1220</b><span>The right camera. The right time.</span></div><div className="chain-photo"><CompatibleImage src="/cases/case001/evidence/hallway-footage.webp" alt="Restored hallway footage with the blue backpack"/><span className="chain-caption">05 / COLORS RESTORED</span></div><div><b>06 / BLUE BACKPACK</b><span>A visual clue, with a card and a room.</span></div><div><b>07 / THREE SUSPECTS VERIFIED</b><span>Maya, Elena, and Emily: student IDs total 72046.</span></div><div><b>08 / KEYPAD FINGERPRINTS</b><span>Only keys 2, 7, and 4 were marked. Emily's password 72427 uses only those digits.</span></div></div><p className="ending-truth">Brian was never in danger.</p><p>He and Emily moved to Room 204 to prepare equipment for a Maker demonstration.<br/>A staff check confirmed them safe at 15:50. Key 27 was signed out for the project.<br/>They forgot to update the Maker Lab schedule.</p><div className="ending-footer"><span className="handwritten">Good detectives ask better questions.</span><button className="primary" onClick={onBack}>BACK TO THE DESK <ArrowRight size={19}/></button></div></div></main>;
  return <main className="deduction-page"><div className="deduction-heading"><div><span className="small-label">CASE 001 / THE FINAL DEDUCTION</span><h1>LET’S PUT IT TOGETHER.</h1><p>Compare your final three printed passwords with the keypad fingerprints.</p></div><button className="secondary text-button" onClick={onEvidence}><Search size={18}/> CHECK THE SIGN-IN RECORD</button></div><div className="deduction-columns"><section className="paper deduction-people"><div className="section-number">01 / WHO WAS WITH BRIAN?</div><div className="deduction-suspects">{shuffledSuspects.map(person => <button className={state.deduction.person === person.id ? 'selected' : ''} key={person.id} aria-label={person.name} onClick={() => { onChange({ person: person.id, account: 'prep' }); setFeedback(''); }} aria-pressed={state.deduction.person === person.id}><Portrait name={person.name}/><span>{person.name}{state.deduction.person === person.id && <Check size={17}/>}</span></button>)}</div></section></div><div className="deduction-controls"><button className="subtle-button" onClick={onBack}><ArrowLeft size={16}/> RETURN TO EVIDENCE</button><p role="status">{feedback}</p><button className="primary" onClick={submit}>CLOSE THE CASE <Check size={21}/></button></div></main>;
}
