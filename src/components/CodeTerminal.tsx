import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, keymap, drawSelection, Decoration, ViewPlugin, MatchDecorator } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { Play, RotateCcw, Lightbulb, Eye, EyeOff, Terminal, Check, ArrowRight } from 'lucide-react';
import type { CodeLanguage, StepDefinition } from '../types';
import { languageName } from '../engine/language';
import { glowingAnswers } from './codeBlanks';
import { caseNoteColors } from './caseNoteColors';
import type { Feedback } from '../engine/python/validator';
const highlighting = HighlightStyle.define([
  { tag: tags.comment, color: '#71859f' },
  { tag: [tags.number, tags.keyword, tags.typeName], color: '#ffc342' },
  { tag: tags.string, color: '#a7df83' },
  { tag: [tags.variableName, tags.propertyName], color: '#ff535f' },
  { tag: [tags.function(tags.variableName), tags.standard(tags.variableName), tags.operator], color: '#36ddff' },
  { tag: tags.punctuation, color: '#e7e9f7' },
]);
const csharpLanguage = StreamLanguage.define({
  startState: () => ({ blockComment: false }),
  token(stream, state) {
    if (state.blockComment) {
      if (stream.skipTo('*/')) { stream.match('*/'); state.blockComment = false; }
      else stream.skipToEnd();
      return 'comment';
    }
    if (stream.eatSpace()) return null;
    if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match('/*')) { state.blockComment = true; return 'comment'; }
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/(?:\d+(?:\.\d*)?|\.\d+)/)) return 'number';
    if (stream.match(/(?:int|using)\b/)) return 'keyword';
    if (stream.match(/(?:System|Console|WriteLine)\b/)) return 'builtin';
    if (stream.match(/[A-Za-z_]\w*/)) return 'variable';
    if (stream.match(/[+*/=\-]+/)) return 'operator';
    stream.next(); return 'punctuation';
  },
  languageData: { commentTokens: { line: '//', block: { open: '/*', close: '*/' } } },
});
const placeholderMatcher = new MatchDecorator({ regexp: /\bVARIABLE_\d+\b/g, decoration: Decoration.mark({ class: 'code-placeholder' }) });
const glowingPlaceholders = ViewPlugin.fromClass(class {
  decorations;
  constructor(view: EditorView) { this.decorations = placeholderMatcher.createDeco(view); }
  update(update: import('@codemirror/view').ViewUpdate) { this.decorations = placeholderMatcher.updateDeco(update, this.decorations); }
}, { decorations: plugin => plugin.decorations });
function CodeEditor({ language, value, variableNames, onChange, onRun }: { language: CodeLanguage; value: string; variableNames: string[]; onChange: (value: string) => void; onRun: () => void }) {
  const container = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onRun }); callbacks.current = { onChange, onRun };
  useEffect(() => {
    if (!container.current) return;
    const editor = new EditorView({ parent: container.current, state: EditorState.create({ doc: value, extensions: [
      caseNoteColors(variableNames), glowingAnswers, glowingPlaceholders, lineNumbers(), history(), drawSelection(), highlightActiveLine(), language === 'csharp' ? csharpLanguage : python(), syntaxHighlighting(highlighting),
      keymap.of([{ key: 'Mod-Enter', run: () => { callbacks.current.onRun(); return true; } }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': `${languageName(language)} code editor`, 'autocapitalize': 'off', 'autocorrect': 'off', 'spellcheck': 'false', 'data-testid': `${language}-editor` }),
      EditorView.updateListener.of(update => { if (update.docChanged) callbacks.current.onChange(update.state.doc.toString()); }),
      EditorView.theme({ '&': { height: '100%', backgroundColor: '#080b19', color: '#e7e9f7' }, '.cm-scroller': { overflow: 'auto', fontFamily: '"IBM Plex Mono", monospace' }, '.cm-content': { padding: '19px 0 45px', caretColor: '#e4bd61' }, '.cm-line': { padding: '0 18px' }, '.cm-gutters': { background: 'transparent', color: '#6e827f', borderRight: '1px solid #2b3839' }, '.cm-gutterElement': { padding: '0 10px 0 8px' }, '.cm-activeLine': { background: '#b8d7c006' }, '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { background: '#3d5957' }, '&.cm-focused': { outline: 'none' }, '.cm-cursor': { borderLeftColor: '#efdeab' } }, { dark: true }),
    ] }) });
    view.current = editor;
    // Bring the editable starter into view; the Case Note stays directly above it.
    const starterOffset = value.lastIndexOf('\n\n') + 2;
    const frame = requestAnimationFrame(() => {
      if (/^(?:int )?result =;?$/m.test(value)) editor.dispatch({ effects: EditorView.scrollIntoView(starterOffset, { y: 'center' }) });
    });
    return () => { cancelAnimationFrame(frame); editor.destroy(); view.current = null; };
  // The editor is created once for each step; values sync below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { const editor = view.current; if (editor && editor.state.doc.toString() !== value) editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } }); }, [value]);
  return <div className="code-editor" ref={container}/>;
}
export function CodeTerminal({ language, step, code, onChange, onRun, onReset, onHint, hiddenNote, onToggleNote, running, feedback, onNext, onEvidence, solved }: {
  language: CodeLanguage; step: StepDefinition; code: string; onChange: (code: string) => void; onRun: () => void; onReset: () => void; onHint: () => void; hiddenNote: boolean; onToggleNote: () => void; running: boolean; feedback?: Feedback; onNext: () => void; onEvidence: () => void; solved: boolean;
}) {
  return <section className="terminal-panel" aria-label={`${languageName(language)} terminal`}>
    <div className="panel-header"><span className="terminal-title"><span className="python-symbol">{language === 'csharp' ? 'C#' : 'Py'}</span> {languageName(language).toUpperCase()} TERMINAL</span><span className="terminal-mode">INVESTIGATION MODE <i className="status-dot"/></span></div>
    <div className="editor-toolbar"><span>case_001 / step_{String(step.id).padStart(2,'0')}.{language === 'csharp' ? 'cs' : 'py'}</span><div className="editor-tools"><button onClick={onReset} disabled={running}><RotateCcw size={13}/> RESET</button><button onClick={onToggleNote}>{hiddenNote ? <Eye size={13}/> : <EyeOff size={13}/>} {hiddenNote ? 'SHOW' : 'HIDE'} CASE NOTE</button></div></div>
    <CodeEditor language={language} key={`${step.id}-${language}`} value={code} variableNames={Object.keys(step.requiredVariables)} onChange={onChange} onRun={onRun}/>
    <div className={`console-output ${feedback ? feedback.ok ? 'success' : 'error' : ''}`} aria-live="polite" aria-atomic="true"><div className="console-main"><div className="console-label"><Terminal size={16}/><span>CONSOLE OUTPUT</span><span className="subset-label">{languageName(language).toUpperCase()} &middot; CLASSROOM EDITION</span></div>{running ? <div className="console-wait"><span className="blink">▌</span> Checking the records…</div> : feedback ? <><div className="output-line">{feedback.ok ? <div className="result-value interpreted-result"><span>{step.resultLabel}</span><strong>{step.resultDisplay}</strong>{step.id === 3 && <small>raw value: 1540</small>}</div> : feedback.output.length > 0 && <div className="result-value">RESULT: <strong>{feedback.output.map(value => typeof value === 'number' ? String(value) : value).join('\n')}</strong></div>}{feedback.ok && <span className="stamp green"><Check size={21}/>{feedback.title}</span>}</div>{!feedback.ok && <div className="error-message"><b>{feedback.title}</b><p>{feedback.message}</p>{feedback.detail && <details><summary>VIEW {languageName(language).toUpperCase()} ERROR</summary><code>{feedback.detail}</code></details>}</div>}{feedback.ok && <div className="console-actions"><button onClick={onEvidence}>OPEN NEW EVIDENCE <ArrowRight size={14}/></button><button onClick={onNext}>{step.id === 8 ? 'RECONSTRUCT THE CASE' : 'NEXT STEP'} <ArrowRight size={14}/></button></div>}</> : <div className="console-idle"><span>›</span>{solved ? 'Evidence verified. You can run your code again.' : 'Write your program. Follow the evidence.'}</div>}</div><div className="console-side"><button className="primary run-button" disabled={running} onClick={onRun}><Play fill="currentColor"/>{running ? 'CHECKING…' : 'RUN CASE'}</button><button className="secondary clue-button" onClick={onHint}><Lightbulb/><span>CLUE</span></button></div></div>
  </section>;
}
