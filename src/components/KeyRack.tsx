import { useId } from 'react';
import '../styles/key-rack.css';

export function KeyRack({ thumbnail = false }: { thumbnail?: boolean }) {
  const id = useId().replace(/:/g, '');
  return <figure className={thumbnail ? 'key-rack-thumbnail' : 'evidence-illustration key-rack'}>
    <svg viewBox="0 0 720 590" role="img" aria-label="Maker Lab key rack">
      <desc>Thirty key positions in five rows of six, read from left to right. One hook is empty and its label is worn away. Use the surrounding numbered keys to identify the missing key.</desc>
      <defs>
        <linearGradient id={`${id}-board`} x2="0" y2="1"><stop stopColor="#38463f"/><stop offset="1" stopColor="#192b24"/></linearGradient>
        <linearGradient id={`${id}-brass`} x2="1" y2="1"><stop stopColor="#f5d88d"/><stop offset=".5" stopColor="#b99548"/><stop offset="1" stopColor="#e3c577"/></linearGradient>
      </defs>
      <rect x="4" y="4" width="712" height="582" rx="16" fill="#111e19" stroke="#758174" strokeWidth="4"/>
      <rect x="18" y="18" width="684" height="554" rx="8" fill={`url(#${id}-board)`} stroke="#55675a"/>
      <text x="360" y="52" textAnchor="middle" fill="#ded7b9" fontFamily="monospace" fontSize="19" letterSpacing="3">MAKER LAB / KEY INVENTORY</text>
      <path d="M42 68H678" stroke="#84917a" opacity=".5"/>
      {Array.from({ length: 30 }, (_, index) => {
        const number = index + 1;
        return <g key={number} className="key-position" transform={`translate(${45 + index % 6 * 108} ${84 + Math.floor(index / 6) * 96})`}>
          <rect width="90" height="85" rx="5" fill="#091910" fillOpacity=".25" stroke="#748171" strokeOpacity=".3"/>
          <rect x="29" y="5" width="32" height="18" rx="2" fill="#e1d8b7" fillOpacity={number === 27 ? '.16' : '1'}/>
          {number !== 27 && <text className="key-number" x="45" y="19" textAnchor="middle" fill="#23352b" fontFamily="monospace" fontSize="14" fontWeight="bold">{String(number).padStart(2, '0')}</text>}
          <path d="M45 29v8q0 6 6 3" fill="none" stroke="#acb4a0" strokeWidth="3" strokeLinecap="round"/>
          {number !== 27 && <g className="rack-key" fill={`url(#${id}-brass)`} stroke="#6e592e" strokeWidth="1.5">
            <circle cx="45" cy="44" r="10" fill="none" stroke="#cbb775" strokeWidth="3"/>
            <path d="M41 52h8v23h-5v-5h-5v-5h2z"/>
          </g>}
        </g>;
      })}
      {[32, 688].flatMap(x => [32, 558].map(y => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="5" fill="#8b9480"/><path d={`M${x - 3} ${y}h6`} stroke="#27352b" strokeWidth="2"/></g>))}
    </svg>
    {!thumbnail && <figcaption>MAKER LAB / RETURNED KEYS</figcaption>}
  </figure>;
}
