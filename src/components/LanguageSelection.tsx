import { ArrowLeft, ArrowRight, Code2 } from 'lucide-react';
import type { CodeLanguage } from '../types';
import { languageName } from '../engine/language';

export function LanguageSelection({ onSelect, onBack }: { onSelect: (language: CodeLanguage) => void; onBack: () => void }) {
  return <main className="onboarding-page"><section className="language-file paper"><span className="small-label">CASE 001 / SET UP YOUR INVESTIGATION</span><Code2 size={36}/><h1>CHOOSE YOUR CODE.</h1><p>One mystery. Two ways to investigate.<br/>Choose the language your team is learning.</p><div className="language-options">{(['python', 'csharp'] as const).map(language => <button key={language} onClick={() => onSelect(language)}><b>{language === 'python' ? 'Py' : 'C#'}</b><strong>{languageName(language)}</strong><code>{language === 'python' ? 'print(result)' : 'Console.WriteLine(result);'}</code><span>START WITH {languageName(language).toUpperCase()} <ArrowRight size={16}/></span></button>)}</div><p className="onboarding-caption">Your language and progress stay with this case on this device.</p><button className="subtle-button" onClick={onBack}><ArrowLeft size={16}/> BACK TO CASE FILES</button></section></main>;
}
