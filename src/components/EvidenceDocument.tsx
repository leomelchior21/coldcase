import { Camera, KeyRound, Clock3, FileText, Map, CreditCard, Users, BatteryCharging, Fingerprint, Archive } from 'lucide-react';
import { useState } from 'react';
import type { EvidenceDocument as Document } from '../types';
import { suspects } from '../cases/case001';
import { Portrait, RedactedPortrait } from './Artwork';
import { redactName } from './anonymous';
import { EvidenceImage } from './EvidenceImage';
import { CaseComic } from './CaseComic';
export function EvidenceIcon({ type, size = 28 }: { type: Document['type']; size?: number }) {
  const Icon = type === 'camera' || type === 'footage' ? Camera : type === 'registry' ? KeyRound : type === 'timeline' ? Clock3 : type === 'directory' ? Map : type === 'card' || type === 'access' ? CreditCard : type === 'suspects' || type === 'profiles' ? Users : type === 'person' ? Fingerprint : type === 'equipment' || type === 'final' ? BatteryCharging : FileText;
  return <Icon size={size} strokeWidth={1.5}/>;
}
export function EvidenceDocument({ document, printable = false, highlightAccess = false, reveal = false, selectedSuspect, onChooseSuspect, suspectsRevealed = true }: { document: Document; printable?: boolean; highlightAccess?: boolean; reveal?: boolean; selectedSuspect?: string; onChooseSuspect?: (id: string) => void; suspectsRevealed?: boolean }) {
  const [selected, setSelected] = useState<string | null>(document.type === 'profiles' ? selectedSuspect || null : null);
  const profile = suspects.find(s => s.id === selected);
  const redacted = !printable && !suspectsRevealed && (document.type === 'suspects' || document.type === 'profiles');
  return <article className={`evidence-document document-${document.type}`}>
    <div className="document-kicker"><span>COLD CASE / SCHOOL RECORDS</span><span>EVIDENCE {document.id}</span></div>
    <header className="document-header"><EvidenceIcon type={document.type} size={36}/><div><h2>{document.title}</h2><p>{document.subtitle}</p></div></header>
    {document.type === 'brief' ? <CaseComic/> : <EvidenceImage id={document.id} reveal={reveal}/>}
    {(document.type === 'person') && <div className="person-evidence"><Portrait name="Emily"/><div><h3>EMILY</h3><span className="stamp red">PERSON OF INTEREST</span><p>A match is a clue.<br/>It is not proof of guilt.</p></div></div>}
    {document.type === 'equipment' && <div className="battery-visual"><BatteryCharging size={65}/><div><b>8% <span>→</span> 76%</b><span>BEFORE / AFTER</span></div></div>}
    {document.rows && <table><thead><tr>{document.headers?.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{document.rows.map((row,i) => <tr key={i} className={(highlightAccess || printable) && document.highlightRow === i ? 'verified-access-row' : undefined}>{row.map((value,j) => <td key={j}>{value}</td>)}</tr>)}</tbody></table>}
    <div className="document-copy">{document.content.map((line,i) => <p key={i}>{line}</p>)}</div>
    {(document.type === 'suspects' || document.type === 'profiles') && <>{redacted && <p className="redacted-notice">FILES LOCKED. RECOVER THE LAST SEEN RECORD TO IDENTIFY THESE STUDENTS.</p>}<div className={`suspect-grid ${document.type === 'profiles' ? 'detailed' : ''}`}>{suspects.map((suspect, index) => <button key={suspect.id} className={`suspect-card ${selected === suspect.id ? 'selected' : ''} ${redacted ? 'redacted' : ''}`} onClick={() => setSelected(suspect.id)} aria-label={redacted ? `Inspect unidentified student ${index + 1}` : `Inspect ${suspect.name}`} aria-pressed={selected === suspect.id}>{redacted ? <RedactedPortrait name={suspect.id}/> : <Portrait name={suspect.name}/>}<b className={redacted ? 'glyph-name' : undefined}>{redacted ? redactName(suspect.name) : suspect.name}</b>{!redacted && (document.type === 'profiles' || printable) && document.type !== 'suspects' && <span>{suspect.backpack} backpack<br/>Card {suspect.card} · Room {suspect.room}</span>}</button>)}</div>{profile && !printable && <div className="profile-detail"><strong className={redacted ? 'glyph-name' : undefined}>{redacted ? redactName(profile.name.toUpperCase()) : profile.name.toUpperCase()}</strong><p>{!redacted && document.type === 'profiles' ? `${profile.backpack} backpack · Access card ${profile.card} · Project room ${profile.room}` : 'At school today. Further records have not been recovered yet.'}</p>{!redacted && document.type === 'profiles' && onChooseSuspect && <button className="primary choose-suspect" onClick={() => onChooseSuspect(profile.id)}>CHECK CLUES FOR {profile.name.toUpperCase()}</button>}</div>}</>}
    <footer className="document-footer"><span><Archive size={13}/> KEEP FOR YOUR INVESTIGATION</span><span className="mini-stamp">ARCHIVE</span></footer>
  </article>;
}
