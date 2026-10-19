import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';
import { CompatibleImage } from './CompatibleImage';

const openingStory = {
  kicker: 'CASE 001 / THE DISAPPEARANCE', title: 'WHERE IS BRIAN?',
  image: evidenceImagePath('BRIEF'), alt: evidenceArtwork.BRIEF.alt,
  labels: ['EARLIER...', 'NOW.', 'THE TRAIL?'],
  captions: [['His project.', 'Unfinished.'], ['His seat.', 'EMPTY.'], ['The records.', 'BROKEN.']],
  call: "DON'T LOSE THE TRAIL.", footer: 'CODE. INVESTIGATE. SOLVE.',
};

/** Opening comic in the case brief. */
export function CaseComic() {
  const story = openingStory;
  return <figure className="case-comic">
    <div className="comic-alert"><span>{story.kicker}</span><strong>{story.title}</strong></div>
    <div className="comic-strip">
      <CompatibleImage src={story.image} alt={story.alt} width={1536} height={1024}/>
      <div className="comic-panel-labels" aria-hidden="true">{story.labels.map(label => <span key={label}>{label}</span>)}</div>
      <div className="comic-panel-captions">{story.captions.map(([lead, action]) => <span key={lead}>{lead}<br/><b>{action}</b></span>)}</div>
    </div>
    <figcaption className="comic-call"><b>{story.call}</b><span>{story.footer}</span></figcaption>
  </figure>;
}
