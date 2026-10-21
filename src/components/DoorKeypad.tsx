import { useId } from 'react';
import '../styles/door-keypad.css';

export function DoorKeypad({ thumbnail = false }: { thumbnail?: boolean }) {
  const id = useId().replace(/:/g, '');
  return <figure className={thumbnail ? 'door-keypad-thumbnail' : 'evidence-illustration door-keypad'}>
    <svg viewBox="0 0 760 580" role="img" aria-label="Recovered Room 204 door keypad">
      <desc>A recovered scan of the door lock. Fingerprints are visible only on the number keys 2, 7, and 4. The other number keys are clean. The scan does not show the order or number of presses.</desc>
      <defs>
        <linearGradient id={`${id}-door`} x2="1" y2="1"><stop stopColor="#4b5d55"/><stop offset="1" stopColor="#182a24"/></linearGradient>
        <linearGradient id={`${id}-steel`} x2="1" y2=".3"><stop stopColor="#737e78"/><stop offset=".45" stopColor="#c2c6b8"/><stop offset="1" stopColor="#626f66"/></linearGradient>
        <linearGradient id={`${id}-key`} x2="0" y2="1"><stop stopColor="#434e48"/><stop offset="1" stopColor="#1b2722"/></linearGradient>
      </defs>
      <rect width="760" height="580" rx="8" fill={`url(#${id}-door)`}/>
      <path d="M65 0v580M695 0v580" stroke="#111d18" strokeWidth="10"/>
      <path d="M83 0v580M680 0v580" stroke="#bac1ac" strokeOpacity=".15" strokeWidth="2"/>
      <rect x="107" y="51" width="111" height="49" rx="3" fill="#202f28" stroke="#a0a68c"/>
      <text x="162" y="82" textAnchor="middle" fontFamily="monospace" fontSize="23" fill="#e4dfc0" letterSpacing="4">204</text>
      <rect x="243" y="35" width="316" height="510" rx="25" fill="#101b16" opacity=".5"/>
      <rect x="230" y="25" width="316" height="510" rx="25" fill={`url(#${id}-steel)`} stroke="#1d2b23" strokeWidth="4"/>
      <rect x="247" y="44" width="282" height="361" rx="14" fill="#14231c" stroke="#55685a" strokeWidth="2"/>
      <rect x="266" y="63" width="244" height="47" rx="4" fill="#091811" stroke="#73917b"/>
      <text x="388" y="93" textAnchor="middle" fontFamily="monospace" fontSize="16" fill="#adcba4" letterSpacing="3">DOOR ACCESS</text>
      {['1','2','3','4','5','6','7','8','9','C','0','↵'].map((digit, index) => <g className="lock-key" data-digit={digit} key={digit} transform={`translate(${263 + index % 3 * 84} ${126 + Math.floor(index / 3) * 66})`}>
        <rect width="76" height="58" rx="7" fill={`url(#${id}-key)`} stroke="#859181" strokeWidth="1.5"/>
        <text x="17" y="26" fontFamily="monospace" fontSize="22" fill="#e2e3cc">{digit}</text>
        {['2','7','4'].includes(digit) && <g className="key-fingerprint" transform="translate(47 32) rotate(-22)" fill="none" stroke="#d6e9d3" strokeWidth="1.2" strokeLinecap="round" opacity=".8">
          <path d="M-17 13v-18c0-23 34-23 34 0v12M-14 15v-19c0-19 28-19 28 0v16M-11 17v-20c0-15 22-15 22 0v18M-8 16v-19c0-11 16-11 16 0v21M-5 18v-21c0-7 10-7 10 0v19M-2 19v-22c0-3 4-3 4 0v23"/>
          <path d="M-17-11c5-14 27-14 33-1M-13-17c7-7 20-7 26 0" opacity=".55"/>
        </g>}
      </g>)}
      <circle cx="388" cy="452" r="28" fill="#24382c" stroke="#677668" strokeWidth="4"/>
      <path d="M388 440v24" stroke="#111d17" strokeWidth="7" strokeLinecap="round"/>
      <rect x="383" y="438" width="212" height="25" rx="12" fill={`url(#${id}-steel)`} stroke="#3b4b40" strokeWidth="2"/>
      {[251, 525].flatMap(x => [46, 514].map(y => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="4" fill="#4a594d"/><path d={`M${x - 2} ${y}h4`} stroke="#d4d6c5"/></g>))}
    </svg>
  </figure>;
}
