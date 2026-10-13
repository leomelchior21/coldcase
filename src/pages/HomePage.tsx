import { ArrowRight, LockKeyhole, RotateCcw } from 'lucide-react';
import type { CaseState } from '../types';
import { Portrait, Scene } from '../components/Artwork';
const future = [{ number: '002', title: 'The midnight computer', kind: 'laptop' as const },{ number: '003', title: 'The empty classroom', kind: 'classroom' as const },{ number: '004', title: 'The unknown USB', kind: 'usb' as const }];
export function HomePage({ state, onOpen, onReset }: { state: CaseState; onOpen: () => void; onReset: () => void }) {
  return <main className="home-page">
    <div className="archive-layout">
      <section className="case-folders" aria-label="Case files">
        <article className="folder main-folder"><div className="folder-tab"><span>CASE FILES</span><b>01</b></div><div className="folder-sheet"><div className="case-number">CASE 001 <span className={`case-status ${state.closed ? 'closed' : ''}`}>{state.closed ? 'CASE CLOSED' : state.opened ? 'IN PROGRESS' : 'UNSOLVED'}</span></div><div className="hero-case-top"><div><h1>WHO TOOK<br/>BRIAN?</h1><div className="red-rule"/></div><div className="polaroid brian-photo"><span className="paperclip"/><Portrait/><span className="handwritten">Brian, 13</span></div></div><p className="case-description">Brian disappeared from the Maker Lab.<br/>The records don’t agree.<br/><strong>Find out what happened.</strong></p><button className="primary open-file" onClick={onOpen}>{state.closed ? 'REVIEW CASE' : state.opened ? 'CONTINUE CASE' : 'OPEN FILE'}<ArrowRight/></button>{state.opened && <button className="start-over" onClick={onReset}><RotateCcw size={13}/> START OVER</button>}</div></article>
        {future.map((item,i) => <article className="folder future-folder" key={item.number} aria-label={`Case ${item.number}: ${item.title}. Coming soon.`}><div className="folder-tab"><b>0{i+2}</b></div><div className="folder-sheet"><div className="case-number">CASE {item.number}</div><h2>{item.title}</h2><div className="future-photo"><Scene kind={item.kind}/></div><div className="coming-soon"><LockKeyhole size={29}/><span>COMING SOON</span><p>ANOTHER MYSTERY.<br/>ANOTHER TRUTH TO FIND.</p></div></div></article>)}
      </section>
    </div>
  </main>;
}
