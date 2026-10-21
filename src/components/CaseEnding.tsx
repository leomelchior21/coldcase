import { ArrowRight, Check, KeyRound, Sparkles, UsersRound, Wrench } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { CompatibleImage } from './CompatibleImage';
import { Portrait } from './Artwork';
import '../styles/endings.css';

function useEndingFocus() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return ref;
}

function Confetti() {
  return <div className="ending-confetti" aria-hidden="true">{Array.from({ length: 48 }, (_, index) => <i key={index} style={{
    '--left': `${(index * 37 + 5) % 100}%`, '--drift': `${(index % 7 - 3) * 35}px`, '--turn': `${180 + index * 43}deg`,
    '--delay': `${index % 12 * .12}s`, '--color': ['#f6ce68', '#78d9b0', '#f2917d', '#8ccce1', '#fff1b5'][index % 5],
  } as CSSProperties}/>)}</div>;
}

export function SolvedEnding({ onBack }: { onBack: () => void }) {
  const ref = useEndingFocus();
  return <main ref={ref} tabIndex={-1} className="ending-page joyful-ending" aria-label="Case solved: Brian is safe">
    <Confetti/>
    <div className="ending-paper paper joyful-paper">
      <div className="document-kicker"><span>COLD CASE / THE REAL STORY</span><span>CASE 001 / SOLVED</span></div>
      <header className="celebration-heading">
        <div className="celebration-seal" aria-hidden="true"><svg viewBox="0 0 100 100"><circle className="seal-ring" cx="50" cy="50" r="42"/><path className="seal-check" d="M28 51l15 15 30-33"/></svg><Sparkles className="seal-sparkles"/></div>
        <span className="celebration-eyebrow">GREAT DETECTIVE WORK!</span>
        <h1>YOU FOUND BRIAN!</h1>
        <p className="ending-truth">Brian was never in danger.</p>
        <div className="celebration-badge"><Check size={17}/> CASE CLOSED. MYSTERY SOLVED.</div>
      </header>
      <div className="ending-scene joyful-scene"><CompatibleImage src="/cases/case001/evidence/equipment-log.webp" alt="Brian and Emily safely preparing their Maker demonstration in Room 204"/><span><i/>15:50 / ROOM 204 / BOTH STUDENTS SAFE</span></div>
      <section className="real-story" aria-label="What actually happened"><h2>HERE’S WHAT REALLY HAPPENED.</h2><div className="story-beats">
        <article><span className="story-beat-icon"><KeyRound/></span><small>01 / THE MISSING KEY</small><h3>A room for their project.</h3><p>Brian and Emily took Key 27 and moved their equipment to Room 204.</p></article>
        <article><span className="story-beat-icon"><Wrench/></span><small>02 / THE BIG PLAN</small><h3>A Maker demonstration!</h3><p>They were busy preparing their project. They forgot to update the Maker Lab schedule.</p></article>
        <article><span className="story-beat-icon"><UsersRound/></span><small>03 / SAFE AND SOUND</small><h3>Found together at 15:50.</h3><p>A staff member confirmed that both students were safe. Your evidence led to the truth.</p></article>
      </div></section>
      <details className="ending-evidence"><summary>REPLAY THE EVIDENCE TRAIL <ArrowRight size={17}/></summary><div className="reconstruction-chain" aria-label="Case reconstruction">
        <div><b>01 / CAMERA 280</b><span>Recovered from the damaged security log.</span></div><div><b>02 / LAST SEEN 15:40</b><span>Brian in the Maker Lab hallway.</span></div><div><b>03 / THREE MINUTES</b><span>At 15:43, Card B4 opens Room 204.</span></div><div><b>04 / ARCHIVE 1220</b><span>The right camera. The right time.</span></div><div className="chain-photo"><CompatibleImage src="/cases/case001/evidence/hallway-footage.webp" alt="Restored hallway footage with the blue backpack"/><span className="chain-caption">05 / COLORS RESTORED</span></div><div><b>06 / BLUE BACKPACK</b><span>A visual clue, with a card and a room.</span></div><div><b>07 / THREE SUSPECTS VERIFIED</b><span>Maya, Elena, and Emily: student IDs total 72046.</span></div><div><b>08 / KEYPAD FINGERPRINTS</b><span>Only keys 2, 7, and 4 were marked. Emily’s password 72427 uses only those digits.</span></div>
      </div></details>
      <footer className="ending-footer"><span className="handwritten">You followed the clues. You found the truth.</span><button className="primary" onClick={onBack}>BACK TO THE DESK <ArrowRight size={19}/></button></footer>
    </div>
  </main>;
}

export function UnsolvedEnding({ onRetry }: { onRetry: () => void }) {
  const ref = useEndingFocus();
  return <main ref={ref} tabIndex={-1} className="unsolved-ending dramatic-ending" role="alert" aria-label="Case unresolved: Brian was never found">
    <div className="lost-hallway" aria-hidden="true"><CompatibleImage src="/cases/case001/evidence/hallway-footage.webp" alt=""/></div>
    <div className="lost-vignette" aria-hidden="true"/>
    <div className="lost-poster" aria-hidden="true"><Portrait name="Brian"/><span>MISSING</span></div>
    <div className="lost-message"><span className="small-label">CASE 001 / THE WRONG LEAD</span><div className="lost-signal"><i/> LAST SIGNAL: LOST</div><h1>BRIAN WAS<br/>NEVER FOUND.</h1><div className="lost-rule" aria-hidden="true"/><p>The wrong suspect. A trail left behind.<br/>The records fell silent, and Brian’s whereabouts remained unknown.</p><span className="unresolved-stamp">CASE UNRESOLVED</span><p className="lost-retry-note">Go back to the evidence. There is still a chance to change the ending.</p><button className="primary" onClick={onRetry}>CHECK THE LEVELS AND TRY AGAIN <ArrowRight size={20}/></button></div>
  </main>;
}
