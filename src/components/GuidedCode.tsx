import type { CodeLanguage, StepDefinition } from '../types';
import { languageName } from '../engine/language';
import { calculationTokens, isNumberSlot, isOperator, operators, readGuidedAnswers, writeGuidedCode } from '../engine/guidedCode';
import '../styles/guided-code.css';

const operatorLabels = { '+': '+ Add', '-': '− Subtract', '*': '* Multiply', '/': '/ Divide' };

export function GuidedCode({ language, step, code, onChange, onRun, disabled }: {
  language: CodeLanguage; step: StepDefinition; code: string; onChange: (code: string) => void; onRun: () => void; disabled: boolean;
}) {
  const answers = readGuidedAnswers(code, step);
  const tokens = calculationTokens(step);
  const names = Object.keys(step.requiredVariables);
  const commentLines = code.split('\n').filter(line => /^\s*(?:#|\/\/)/.test(line));
  const end = language === 'csharp' ? ';' : '';
  const numberField = (label: string, value: string, update: (value: string) => void) => <input type="text" inputMode="numeric" pattern="-?[0-9]*" autoComplete="off" spellCheck={false} aria-label={label} placeholder="value" value={value} maxLength={13} onChange={event => {
    if (/^-?\d{0,12}$/.test(event.target.value)) update(event.target.value);
  }}/>;
  const note = (line: string) => line.split(/(\b[A-Za-z_]\w*\b|\b\d+\b)/g).map((word, index) => <span key={index} className={names.includes(word) || word === 'result' ? 'note-variable' : /^\d+$/.test(word) ? 'note-value' : /^(?:Divide|Multiply|Subtract|Add|subtract|print|Console|WriteLine)$/.test(word) ? 'note-operation' : undefined}>{word}</span>);
  let operatorNumber = 0, valueNumber = 0;
  return <div className="code-editor guided-code" role="group" tabIndex={0} aria-label={`${languageName(language)} code template`} onKeyDown={event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); onRun(); }
  }}>
    <fieldset disabled={disabled}>
      <legend className="guided-instruction">Fill the values. Choose the operators.</legend>
      {commentLines.length > 0 && <div className="guided-notes">{commentLines.map((line, index) => <div key={index} className={/^\s*(?:#|\/\/) (?:The |Brian was |Set it to )/.test(line) ? 'note-value' : /^\s*(?:#|\/\/) Enter the value for /.test(line) ? 'note-variable' : undefined}>{note(line)}</div>)}</div>}
      <div className="guided-program">
        {names.map((name, index) => <div className="guided-line" key={name}><span className="guided-line-number" aria-hidden="true">{index + 1}</span><div className="guided-statement">{language === 'csharp' && <span className="syntax-keyword">int </span>}<span className="syntax-variable">{name}</span><span className="syntax-function"> = </span>{numberField(`Value for ${name}`, answers.values[name], value => onChange(writeGuidedCode({ ...answers, values: { ...answers.values, [name]: value } }, step, language, code)))}<span>{end}</span></div></div>)}
        <div className="guided-line"><span className="guided-line-number" aria-hidden="true">{names.length + 1}</span><div className="guided-statement guided-calculation">{language === 'csharp' && <span className="syntax-keyword">int </span>}<span className="syntax-variable">result</span><span className="syntax-function"> = </span>{tokens.map((token, index) => {
          const update = (value: string) => onChange(writeGuidedCode({ ...answers, calculation: answers.calculation.map((previous, i) => i === index ? value : previous) }, step, language, code));
          if (isOperator(token)) return <select key={index} aria-label={`Operator ${++operatorNumber} for result`} value={answers.calculation[index]} onChange={event => update(event.target.value)}><option value="">?</option>{operators.map(operator => <option key={operator} value={operator}>{operatorLabels[operator]}</option>)}</select>;
          if (isNumberSlot(token)) return <span key={index}>{numberField(`Value ${++valueNumber} in calculation`, answers.calculation[index], update)}</span>;
          return <span key={index} className="syntax-variable">{token}</span>;
        })}<span>{end}</span></div></div>
        <div className="guided-line"><span className="guided-line-number" aria-hidden="true">{names.length + 2}</span><div className="guided-statement"><span className="syntax-function">{language === 'csharp' ? 'Console.WriteLine' : 'print'}</span>(<span className="syntax-variable">result</span>){end}</div></div>
      </div>
    </fieldset>
  </div>;
}
