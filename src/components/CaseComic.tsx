import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';

/** Shared opening storybook for the evidence brief and the first guide screen. */
export function CaseComic() {
  return <figure className="case-comic">
    <div className="comic-alert"><span>CASE 001 / THE DISAPPEARANCE</span><strong>WHERE IS BRIAN?</strong></div>
    <div className="comic-strip">
      <img src={evidenceImagePath('BRIEF')} alt={evidenceArtwork.BRIEF.alt} width={1536} height={1024}/>
      <div className="comic-panel-labels" aria-hidden="true"><span>EARLIER...</span><span>NOW.</span><span>THE TRAIL?</span></div>
      <figcaption className="comic-panel-captions"><span>His project.<br/>Unfinished.</span><span>His seat.<br/><b>EMPTY.</b></span><span>The records.<br/><b>BROKEN.</b></span></figcaption>
    </div>
    <div className="comic-call"><b>DON'T LOSE THE TRAIL.</b><span>CODE. INVESTIGATE. SOLVE.</span></div>
  </figure>;
}
