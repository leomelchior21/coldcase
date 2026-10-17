import { useState, type ReactNode } from 'react';
import { ArrowLeft, LockKeyhole, ArrowRight } from 'lucide-react';

export function TeacherAccess({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false), [password, setPassword] = useState(''), [error, setError] = useState(false);
  if (unlocked) return children;
  return <main className="teacher-access onboarding-page"><section className="teacher-access-file paper"><LockKeyhole size={36}/><span className="small-label">COLD CASE / TEACHER TOOLS</span><h1>TEACHER ACCESS.</h1><p>Enter the classroom password to open the printable student register.</p><form onSubmit={event => { event.preventDefault(); if (password === 'leleomaker') { setUnlocked(true); setPassword(''); } else setError(true); }}><label htmlFor="teacher-password">Password</label><input autoFocus id="teacher-password" type="password" value={password} autoComplete="current-password" aria-invalid={error} aria-describedby={error ? 'password-error' : undefined} onChange={event => { setPassword(event.target.value); setError(false); }}/>{error && <p id="password-error" role="alert">That password doesn’t match. Try again.</p>}<button className="primary" type="submit">UNLOCK TEACHER TOOLS <ArrowRight size={18}/></button></form><a className="subtle-button" href="/"><ArrowLeft size={16}/> BACK TO CASE FILES</a></section></main>;
}
