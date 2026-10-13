import { Printer, ArrowLeft } from 'lucide-react';
import { worksheets } from '../cases/case001-worksheets';
import { StudentWorksheet } from '../components/StudentWorksheet';
export function TeacherPrintPage() {
  return <main className="print-page"><header className="print-toolbar"><a href="/"><ArrowLeft size={17}/> CASE ARCHIVE</a><div><h1>CASE 001 / TEACHER TOOLS</h1><p>Optional A4 student worksheets. The complete case also works without printing.</p></div><button className="primary" onClick={() => window.print()}><Printer size={18}/> PRINT CASE PACK</button></header><p className="print-notice">Student copy: answers are blank. Fill in each record as you recover evidence in the digital case. Inspect the restored footage and final reveal in the game.</p><div className="print-documents">{worksheets.map((sheet,index) => <section className="print-sheet" key={sheet.title}><StudentWorksheet sheet={sheet} number={index + 1}/></section>)}<section className="print-sheet detective-notes"><span className="small-label">COLD CASE / CASE 001</span><h2>DETECTIVE NOTES</h2><p>What do we know? What do we still need to check?</p>{Array.from({ length: 16 },(_,i) => <div key={i}/>)}</section></div></main>;
}

