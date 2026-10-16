import { ArrowLeft, FolderOpen, Printer, CircleHelp } from 'lucide-react';
export function Header({ onHome, inCase = false, saved = true, onHowToPlay }: { onHome: () => void; inCase?: boolean; saved?: boolean; onHowToPlay?: () => void }) {
  return <header className={`site-header ${inCase ? 'compact' : ''}`}>
    <button className="brand" onClick={onHome} aria-label="Cold Case home">COLD CASE<span className="brand-rule"/></button>
    <div className="tagline">CODE.<br/>INVESTIGATE.<br/>SOLVE.</div>
    <div className="header-right">{inCase ? <>{onHowToPlay && <button className="how-to-play" onClick={onHowToPlay}><CircleHelp size={17}/> HOW TO PLAY</button>}{!saved && <span className="save-indicator" role="status"><span className="status-dot warning"/>SAVING UNAVAILABLE</span>}<button className="archive-link" onClick={onHome}><ArrowLeft size={16}/> CASE FILES</button></> : <a className="teacher-link" href="/teacher/case/001/print"><Printer size={17}/> TEACHER TOOLS<span>Print the case pack ↗</span></a>}</div>
    {inCase && <FolderOpen className="header-folder" size={20}/>}
  </header>;
}
