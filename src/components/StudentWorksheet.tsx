import type { Worksheet } from '../cases/case001-worksheets';
import { suspects } from '../cases/case001';
import { Portrait } from './Artwork';

export function StudentWorksheet({ sheet, number }: { sheet: Worksheet; number: number }) {
  return <article className="student-worksheet">
    <div className="worksheet-kicker"><span>COLD CASE / CASE 001</span><span>STUDENT SHEET {String(number).padStart(2,'0')}</span></div>
    <h2>{sheet.title}</h2><p className="worksheet-instruction">{sheet.instruction}</p>
    {sheet.photo && <figure className={`worksheet-photo ${sheet.monochrome ? 'cctv-monochrome' : ''}`}><img src={`/cases/case001/evidence/${sheet.photo}.webp`} alt={sheet.photoAlt}/></figure>}
    {sheet.roster && <div className="worksheet-roster">{suspects.map(person => <div key={person.id}><Portrait name={person.name}/><strong>{person.name}</strong></div>)}</div>}
    {sheet.givens && <div className="worksheet-givens"><b>KNOWN INFORMATION</b>{sheet.givens.map(line => <p key={line}>{line}</p>)}</div>}
    {sheet.blankFrame && <div className="worksheet-observation-box"><span>Your observations / sketch</span></div>}
    {sheet.comparison && <table className="worksheet-comparison"><thead><tr>{['Person','Backpack','Card','Room','Matches'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{suspects.map(person => <tr key={person.id}><th scope="row"><Portrait name={person.name}/>{person.name}</th>{[0,1,2,3].map(index => <td key={index}><span className="blank-cell" aria-label={`Blank answer for ${person.name}`}/></td>)}</tr>)}</tbody></table>}
    <div className="worksheet-answers">{sheet.fields.map(label => <div className="worksheet-answer" key={label}><span>{label}</span><div className="answer-line" aria-label={`Blank answer: ${label}`}/></div>)}</div>
    <footer>RECORD THE EVIDENCE. CHECK YOUR CONCLUSION.</footer>
  </article>;
}
