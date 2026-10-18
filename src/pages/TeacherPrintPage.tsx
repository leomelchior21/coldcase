import { Printer, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { studentRegister } from '../cases/student-register';
import { case001 } from '../cases/case001';

export function TeacherPrintPage() {
  const [printTarget, setPrintTarget] = useState<'register' | 'worksheet'>('register');
  function print(target: typeof printTarget) {
    flushSync(() => setPrintTarget(target));
    window.print();
  }
  return <main className="print-page" data-print-target={printTarget}>
    <header className="print-toolbar"><a href="/"><ArrowLeft size={17}/> CASE ARCHIVE</a><div><h1>CASE 001 / TEACHER TOOLS</h1><p>Print a clue worksheet for the investigation and a student register for the final two rounds.</p></div><div className="print-actions"><button className="primary" onClick={() => print('register')}><Printer size={18}/> PRINT STUDENT REGISTER</button><button className="primary" onClick={() => print('worksheet')}><Printer size={18}/> PRINT CLUE WORKSHEET</button></div></header>
    <p className="print-notice">Give each team a blank worksheet to record clues from all eight steps. Use the student register to compare the final password digits. Each button prints its own sheet.</p>
    <div className="print-documents"><section className="print-sheet student-register">
      <div className="register-kicker"><span>COLD CASE / CASE 001</span><span>SCHOOL RECORDS</span></div>
      <h2>STUDENT NUMBER REGISTER</h2>
      <p>Compare the recovered sign-in details with these records.</p>
      <table><thead><tr><th scope="col">STUDENT NO.</th><th scope="col">FULL NAME</th><th scope="col">CARD PASSWORD</th></tr></thead><tbody>{studentRegister.map(student => <tr key={student.number}><td>{student.number}</td><td>{student.name}</td><td>{student.password}</td></tr>)}</tbody></table>
      <footer>30 fictional students. Invented passwords for this classroom mystery only.</footer>
    </section>
    <section className="print-sheet clue-worksheet" aria-label="Eight-step clue worksheet">
      <div className="register-kicker"><span>COLD CASE / CASE 001</span><span>INVESTIGATION NOTES</span></div>
      <h2>FOLLOW THE CLUES</h2>
      <div className="worksheet-details"><span>TEAM: __________________________</span><span>DATE: __________________</span></div>
      <p>Write down the important clues you gather at each step.</p>
      <div className="clue-boxes">{case001.steps.map(step => <section className="clue-box" key={step.id} aria-label={`Step ${step.id}: ${step.shortLabel}`}><h3><span>{String(step.id).padStart(2, '0')}</span> {step.shortLabel}</h3></section>)}</div>
    </section></div>
  </main>;
}
