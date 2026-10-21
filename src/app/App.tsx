import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { HomePage } from '../pages/HomePage';
import { InvestigationPage } from '../pages/InvestigationPage';
import { TeacherPrintPage } from '../pages/TeacherPrintPage';
import { loadState, freshState, saveState } from '../engine/storage';
import { LanguageSelection } from '../components/LanguageSelection';
import { TeacherAccess } from '../components/TeacherAccess';
import { codeForStep, refreshCaseNotes } from '../engine/language';
import type { CodeLanguage } from '../types';
import { case001 } from '../cases/case001';
import { useAppViewport } from './useAppViewport';
export default function App() {
  const [state, setState] = useState(loadState), [route, setRoute] = useState(window.location.pathname), [opening, setOpening] = useState(false), [resetOpen, setResetOpen] = useState(false), [saved, setSaved] = useState(true);
  useAppViewport(route === '/case/001');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setState(previous => {
      const codes = Object.fromEntries(case001.steps.map(step => [step.id, refreshCaseNotes(previous.codes[step.id], step, previous.language, previous.hiddenNotes.includes(step.id))]));
      return case001.steps.every(step => codes[step.id] === previous.codes[step.id]) ? previous : { ...previous, codes };
    });
  }, []);
  useEffect(() => { setSaved(saveState(state)); }, [state]);
  useEffect(() => { const pop = () => setRoute(window.location.pathname); window.addEventListener('popstate', pop); return () => { window.removeEventListener('popstate', pop); if (timer.current) clearTimeout(timer.current); }; }, []);
  const navigate = useCallback((path: string) => { window.history.pushState({}, '', path); setRoute(path); }, []);
  const closeReset = useCallback(() => setResetOpen(false), []);
  function openCase() { setOpening(true); setState(previous => ({ ...previous, opened: true })); timer.current = setTimeout(() => { navigate('/case/001'); setOpening(false); }, 750); }
  function resetCase() { setState(freshState()); setResetOpen(false); navigate('/'); }
  const isPrint = route.startsWith('/teacher/'), inCase = route === '/case/001';
  useEffect(() => { if (inCase && !state.opened) setState(previous => ({ ...previous, opened: true })); }, [inCase, state.opened]);
  function chooseLanguage(language: CodeLanguage) {
    setState(previous => ({ ...previous, language, languageChosen: true,
      codes: language === previous.language ? previous.codes : Object.fromEntries(case001.steps.map(step => [step.id, codeForStep(step, language)])),
      previousWork: language !== previous.language && previous.opened && Object.values(previous.codes).some((code, index) => code !== codeForStep(case001.steps[index], previous.language)) ? { codes: previous.codes, solved: previous.solved, results: previous.results, closed: previous.closed } : previous.previousWork,
    }));
  }
  if (isPrint) return <TeacherAccess><TeacherPrintPage/></TeacherAccess>;
  return <div className={`app-shell ${inCase ? 'game-shell' : 'archive-shell'}`}>
    <div className="ambient-light"/>
    <Header onHome={() => navigate('/')} inCase={inCase} saved={saved}/>
    {inCase ? !state.languageChosen ? <LanguageSelection onSelect={chooseLanguage} onBack={() => navigate('/')}/> : <InvestigationPage state={state} setState={setState} onReset={() => setResetOpen(true)}/> : <HomePage state={state} onOpen={openCase} onReset={() => setResetOpen(true)}/>}
    {opening && <div className="opening-overlay"><div className="opening-folder paper"><span>CASE FILE {case001.id}</span><div className="stamp red">OPENED</div></div></div>}
    {resetOpen && <Modal title="Start the case over?" onClose={closeReset} className="confirm-modal paper"><RotateCcw size={32}/><h2>START A NEW INVESTIGATION?</h2><p>This clears all code, evidence, and progress for Case 001 on this device.</p><div><button className="secondary text-button" onClick={closeReset}>KEEP MY CASE</button><button className="danger-button" onClick={resetCase}>START OVER</button></div></Modal>}
    <div className="rotate-message"><RotateCw size={58}/><h2>TURN YOUR DEVICE</h2><p>A little more room for a big mystery.<br/>This experience is designed for landscape investigation.</p><span>CODE. INVESTIGATE. SOLVE.</span></div>
  </div>;
}
