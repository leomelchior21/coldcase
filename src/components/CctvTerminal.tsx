import { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Power, FolderOpen, ArrowLeft, Check } from 'lucide-react';
import type { CaseState } from '../types';
import { case001 } from '../cases/case001';
import { Modal } from './Modal';
import { EvidenceDocument } from './EvidenceDocument';
import { EvidenceImage } from './EvidenceImage';
import { acceptCameraCode, acceptArchiveTime } from '../engine/caseEngine';
import { useTerminalClick } from './useTerminalClick';

function TimeWheel({ label, value, limit, onChange, onTick }: { label: string; value: number; limit: number; onChange: (n: number) => void; onTick: () => void }) {
  const start = useRef<number | null>(null);
  const change = (by: number) => { onTick(); onChange(((value + by) % limit + limit) % limit); };
  const padded = (n: number) => String((n + limit) % limit).padStart(2, '0');
  return <div className="time-wheel">
    <span className="wheel-label">{label.toUpperCase()}</span>
    <button aria-label={`Increase ${label}`} onClick={() => change(1)}><ChevronUp/></button>
    <div className="wheel-drum" role="spinbutton" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={limit - 1} aria-valuenow={value} aria-valuetext={padded(value)}
      onKeyDown={event => { const by = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : event.key === 'PageUp' ? 5 : event.key === 'PageDown' ? -5 : 0; if (by) { event.preventDefault(); change(by); } }}
      onPointerDown={event => { start.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerUp={event => { if (start.current !== null) { const steps = Math.round((start.current - event.clientY) / 24); if (steps) change(steps); start.current = null; } }} onPointerCancel={() => { start.current = null; }}>
      <span aria-hidden="true">{padded(value - 1)}</span><strong>{padded(value)}</strong><span aria-hidden="true">{padded(value + 1)}</span>
    </div>
    <button aria-label={`Decrease ${label}`} onClick={() => change(-1)}><ChevronDown/></button>
    {label === 'minute' && <div className="wheel-fast"><button aria-label="Back 5 minutes" onClick={() => change(-5)}>−5</button><button aria-label="Advance 5 minutes" onClick={() => change(5)}>+5</button></div>}
  </div>;
}

export function CctvTerminal({ state, setState, onClose, onContinue }: { state: CaseState; setState: React.Dispatch<React.SetStateAction<CaseState>>; onClose: () => void; onContinue: () => void }) {
  const [camera, setCamera] = useState(''), [hour, setHour] = useState(0), [minute, setMinute] = useState(0), [error, setError] = useState('');
  const [record, setRecord] = useState<string | null>(null);
  const tick = useTerminalClick();
  const close = useCallback(onClose, [onClose]);
  const document = case001.documents.find(d => d.id === record);
  function submitCamera(event: React.FormEvent) {
    event.preventDefault();
    if (camera.trim() !== '280') { setError('CAMERA NOT FOUND'); return; }
    setState(previous => acceptCameraCode(previous, camera)); setError('');
  }
  function submitTime() {
    if (hour !== 15 || minute !== 40) { setError('NO ARCHIVE AT THIS TIME. CHECK YOUR STEP 03 RESULT.'); return; }
    setState(previous => acceptArchiveTime(previous, hour, minute)); setError('');
  }
  return <Modal title="CCTV archive terminal" onClose={close} className="cctv-modal">
    <div className="crt-bezel"><header className="crt-brand"><span><Power size={16}/> SCHOOL SECURITY / ARCHIVE TERMINAL</span><span className="crt-light"/></header>
      <div className="crt-screen">
        {document ? <div className="terminal-record"><button className="crt-button" onClick={() => setRecord(null)}><ArrowLeft size={16}/> RETURN TO TERMINAL</button><EvidenceDocument document={document}/></div> : <>
          <div className="crt-heading"><span>SECURITY ARCHIVE</span><h2>{state.archive1220Unlocked ? 'ARCHIVE FOUND' : 'IDENTIFICATION REQUIRED'}</h2></div>
          {!state.cameraCodeAccepted ? <form className="camera-prompt" onSubmit={submitCamera}><label htmlFor="camera-code">ENTER CAMERA CODE</label><div className="crt-input-line"><span aria-hidden="true">&gt;</span><input id="camera-code" autoComplete="off" inputMode="numeric" maxLength={8} value={camera} onChange={e => { setCamera(e.target.value.replace(/\D/g, '')); setError(''); }}/></div><div className="camera-keypad" role="group" aria-label="Camera code keypad">{['1','2','3','4','5','6','7','8','9','CLEAR','0','BACKSPACE'].map(key => <button type="button" key={key} aria-label={key === 'CLEAR' ? 'Clear camera code' : key === 'BACKSPACE' ? 'Delete last digit' : key} onClick={() => { tick(); setCamera(previous => key === 'CLEAR' ? '' : key === 'BACKSPACE' ? previous.slice(0, -1) : (previous + key).slice(0, 8)); setError(''); }}>{key === 'BACKSPACE' ? '⌫' : key}</button>)}</div><button className="crt-button" type="submit">VERIFY CAMERA <span>↵</span></button></form> : !state.archive1220Unlocked ? <div className="clock-prompt"><p className="camera-accepted"><Check size={16}/> CAMERA 280 ACCEPTED</p><h3>SELECT LAST SEEN TIME</h3><p className="wheel-help">Swipe a wheel or tap its arrows.</p><div className="time-selector"><TimeWheel label="hour" value={hour} limit={24} onTick={tick} onChange={value => { setHour(value); setError(''); }}/><span className="clock-colon">:</span><TimeWheel label="minute" value={minute} limit={60} onTick={tick} onChange={value => { setMinute(value); setError(''); }}/></div><button className="crt-button" onClick={submitTime}>SEARCH ARCHIVE <span>↵</span></button></div> : <div className="archive-found"><div className="archive-file-code"><span>CCTV ARCHIVE FILE</span><strong>1220</strong><small>CAMERA 280 · LAST SEEN 15:40</small></div><EvidenceImage id="CCTV-BW"/><p>COLOR CHANNEL: CORRUPTED</p><button className="crt-button" onClick={onContinue}>CONTINUE TO THE FOOTAGE <span>→</span></button></div>}
          <p className="crt-error" role="status">{error}</p>
          <details className="terminal-evidence"><summary><FolderOpen size={16}/> CHECK YOUR EVIDENCE</summary><div>{case001.documents.filter(d => state.evidence.includes(d.id)).map(d => <button key={d.id} onClick={() => setRecord(d.id)}>{d.title}</button>)}</div></details>
        </>}
      </div><footer className="crt-footer"><span>LOCAL SECURITY NETWORK</span><span>{state.archive1220Unlocked ? 'AUTHENTICATED' : 'AWAITING IDENTIFICATION'}</span></footer>
    </div>
  </Modal>;
}
