import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, keymap, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { Play, RotateCcw, Lightbulb, Eye, EyeOff, Terminal, Check, ArrowRight } from 'lucide-react';
import type { StepDefinition } from '../types';
import type { Feedback } from '../engine/python/validator';
const highlighting = HighlightStyle.define([
  { tag: tags.comment, color: '#78bc8d' }, { tag: tags.number, color: '#e4b56b' },
  { tag: tags.string, color: '#e0c987' }, { tag: tags.keyword, color: '#c49cdb' },
  { tag: tags.variableName, color: '#e4e5df' }, { tag: tags.function(tags.variableName), color: '#c49cdb' },
]);
function CodeEditor({ value, onChange, onRun }: { value: string; onChange: (value: string) => void; onRun: () => void }) {
  const container = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onRun }); callbacks.current = { onChange, onRun };
  useEffect(() => {
    if (!container.current) return;
    const editor = new EditorView({ parent: container.current, state: EditorState.create({ doc: value, extensions: [
      lineNumbers(), history(), drawSelection(), highlightActiveLine(), python(), syntaxHighlighting(highlighting),
      keymap.of([{ key: 'Mod-Enter', run: () => { callbacks.current.onRun(); return true; } }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': 'Python code editor', 'autocapitalize': 'off', 'autocorrect': 'off', 'spellcheck': 'false', 'data-testid': 'python-editor' }),
      EditorView.updateListener.of(update => { if (update.docChanged) callbacks.current.onChange(update.state.doc.toString()); }),
      EditorView.theme({ '&': { height: '100%', backgroundColor: 'transparent', color: '#e3e6e0' }, '.cm-scroller': { overflow: 'auto', fontFamily: '"IBM Plex Mono", monospace' }, '.cm-content': { padding: '19px 0 45px', caretColor: '#e4bd61' }, '.cm-line': { padding: '0 18px' }, '.cm-gutters': { background: 'transparent', color: '#6e827f', borderRight: '1px solid #2b3839' }, '.cm-gutterElement': { padding: '0 10px 0 8px' }, '.cm-activeLine': { background: '#b8d7c006' }, '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { background: '#3d5957' }, '&.cm-focused': { outline: 'none' }, '.cm-cursor': { borderLeftColor: '#efdeab' } }, { dark: true }),
    ] }) });
    view.current = editor;
    return () => { editor.destroy(); view.current = null; };
  // The editor is created once for each step; values sync below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { const editor = view.current; if (editor && editor.state.doc.toString() !== value) editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } }); }, [value]);
  return <div className="code-editor" ref={container}/>;
}
export function CodeTerminal({ step, code, onChange, onRun, onReset, onHint, hiddenNote, onToggleNote, running, feedback, onNext, onEvidence, solved }: {
  step: StepDefinition; code: string; onChange: (code: string) => void; onRun: () => void; onReset: () => void; onHint: () => void; hiddenNote: boolean; onToggleNote: () => void; running: boolean; feedback?: Feedback; onNext: () => void; onEvidence: () => void; solved: boolean;
}) {
  return <section className="terminal-panel" aria-label="Python terminal">
    <div className="panel-header"><span className="terminal-title"><span className="python-symbol">Py</span> PYTHON TERMINAL</span><span className="terminal-mode">INVESTIGATION MODE <i className="status-dot"/></span></div>
    <div className="editor-toolbar"><span>case_001 / step_{String(step.id).padStart(2,'0')}.py</span><div className="editor-tools"><button onClick={onReset} disabled={running}><RotateCcw size={13}/> RESET</button><button onClick={onToggleNote}>{hiddenNote ? <Eye size={13}/> : <EyeOff size={13}/>} {hiddenNote ? 'SHOW' : 'HIDE'} CASE NOTE</button></div></div>
    <CodeEditor key={step.id} value={code} onChange={onChange} onRun={onRun}/>
    <div className={`console-output ${feedback ? feedback.ok ? 'success' : 'error' : ''}`} aria-live="polite" aria-atomic="true"><div className="console-main"><div className="console-label"><Terminal size={16}/><span>CONSOLE OUTPUT</span><span className="subset-label">PYTHON · CLASSROOM EDITION</span></div>{running ? <div className="console-wait"><span className="blink">▌</span> Checking the records…</div> : feedback ? <><div className="output-line">{feedback.ok ? <div className="result-value interpreted-result"><span>{step.resultLabel}</span><strong>{step.resultDisplay}</strong>{step.id === 3 && <small>raw value: 1540</small>}</div> : feedback.output.length > 0 && <div className="result-value">RESULT: <strong>{feedback.output.map(value => typeof value === 'number' ? String(value) : value).join('\n')}</strong></div>}{feedback.ok && <span className="stamp green"><Check size={21}/>{feedback.title}</span>}</div>{!feedback.ok && <div className="error-message"><b>{feedback.title}</b><p>{feedback.message}</p>{feedback.detail && <details><summary>VIEW PYTHON ERROR</summary><code>{feedback.detail}</code></details>}</div>}{feedback.ok && <div className="console-actions"><button onClick={onEvidence}>OPEN NEW EVIDENCE <ArrowRight size={14}/></button><button onClick={onNext}>{step.id === 8 ? 'RECONSTRUCT THE CASE' : 'NEXT STEP'} <ArrowRight size={14}/></button></div>}</> : <div className="console-idle"><span>›</span>{solved ? 'Evidence verified. You can run your code again.' : 'Write your program. Follow the evidence.'}</div>}</div><div className="console-side"><button className="primary run-button" disabled={running} onClick={onRun}><Play fill="currentColor"/>{running ? 'CHECKING…' : 'RUN CASE'}</button><button className="secondary clue-button" onClick={onHint}><Lightbulb/><span>CLUE</span></button></div></div>
  </section>;
}
