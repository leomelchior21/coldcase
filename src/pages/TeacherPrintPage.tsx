import { Printer, ArrowLeft } from 'lucide-react';
import { studentRegister } from '../cases/student-register';

export function TeacherPrintPage() {
  return <main className="print-page">
    <header className="print-toolbar"><a href="/"><ArrowLeft size={17}/> CASE ARCHIVE</a><div><h1>CASE 001 / TEACHER TOOLS</h1><p>Print one student register per team for the final two rounds.</p></div><button className="primary" onClick={() => window.print()}><Printer size={18}/> PRINT STUDENT REGISTER</button></header>
    <p className="print-notice">This is the only printed handout. Students compare their recovered password digits with this list. All other records stay in the game.</p>
    <div className="print-documents"><section className="print-sheet student-register">
      <div className="register-kicker"><span>COLD CASE / CASE 001</span><span>SCHOOL RECORDS</span></div>
      <h2>STUDENT NUMBER REGISTER</h2>
      <p>Compare the recovered sign-in details with these records.</p>
      <table><thead><tr><th scope="col">STUDENT NO.</th><th scope="col">FULL NAME</th><th scope="col">CARD PASSWORD</th></tr></thead><tbody>{studentRegister.map(student => <tr key={student.number}><td>{student.number}</td><td>{student.name}</td><td>{student.password}</td></tr>)}</tbody></table>
      <footer>30 fictional students. Invented passwords for this classroom mystery only.</footer>
    </section></div>
  </main>;
}
