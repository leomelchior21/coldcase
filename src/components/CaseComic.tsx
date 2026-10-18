import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';

const chapters = {
  opening: {
    kicker: 'CASE 001 / THE DISAPPEARANCE', title: 'WHERE IS BRIAN?',
    image: evidenceImagePath('BRIEF'), alt: evidenceArtwork.BRIEF.alt,
    labels: ['EARLIER...', 'NOW.', 'THE TRAIL?'],
    captions: [['His project.', 'Unfinished.'], ['His seat.', 'EMPTY.'], ['The records.', 'BROKEN.']],
    call: "DON'T LOSE THE TRAIL.", footer: 'CODE. INVESTIGATE. SOLVE.',
  },
  mission: {
    kicker: 'CASE 001 / YOUR MISSION', title: 'RECOVER THE TRAIL.',
    image: '/cases/case001/evidence/mission-comic.webp',
    alt: 'Comic story: a corrupted security recording, an empty hook in the key cabinet, and a damaged timestamp record.',
    labels: ['THE CAMERA', 'THE KEY', 'THE TIME'],
    captions: [['A damaged log.', 'RESTORE IT.'], ['A missing key.', 'TRACE IT.'], ['A lost time.', 'RECOVER IT.']],
    call: 'LET THE EVIDENCE LEAD.', footer: 'CHECK. QUESTION. VERIFY.',
  },
  ready: {
    kicker: 'CASE 001 / YOUR TEAM TAKES OVER', title: 'YOUR MOVE, INVESTIGATORS.',
    image: '/cases/case001/evidence/ready-comic.webp',
    alt: 'Comic story: student investigators type code, compare recovered evidence, and check a physical printed student register together.',
    labels: ['RECOVER', 'COMPARE', 'RECONSTRUCT'],
    captions: [['Code the clues.', 'OPEN THE ARCHIVE.'], ['Check the records.', 'CONNECT THE CLUES.'], ['Use the register.', 'MAKE YOUR CASE.']],
    call: 'THE NEXT LEAD IS YOURS.', footer: 'READ. CODE. CHECK. DISCUSS.',
  },
};

/** Shared comic treatment for the case brief and narrative guide chapters. */
export function CaseComic({ chapter = 'opening' }: { chapter?: keyof typeof chapters }) {
  const story = chapters[chapter];
  return <figure className="case-comic">
    <div className="comic-alert"><span>{story.kicker}</span><strong>{story.title}</strong></div>
    <div className="comic-strip">
      <img src={story.image} alt={story.alt} width={1536} height={1024}/>
      <div className="comic-panel-labels" aria-hidden="true">{story.labels.map(label => <span key={label}>{label}</span>)}</div>
      <div className="comic-panel-captions">{story.captions.map(([lead, action]) => <span key={lead}>{lead}<br/><b>{action}</b></span>)}</div>
    </div>
    <figcaption className="comic-call"><b>{story.call}</b><span>{story.footer}</span></figcaption>
  </figure>;
}
