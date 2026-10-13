import { useId, useState } from 'react';
import { UserRound } from 'lucide-react';
import { anonymousShade } from './anonymous';

const customPortraits = import.meta.glob('/public/cases/case001/*.webp', { eager: true, query: '?url', import: 'default' });

export function RedactedPortrait({ name = '', className = '' }: { name?: string; className?: string }) {
  return <div className={`portrait redacted ${className}`} role="img" aria-label="Unidentified student portrait" style={{ '--shade': anonymousShade(name) } as React.CSSProperties}><UserRound strokeWidth={1.1}/></div>;
}

export function Portrait({ name = 'Brian', className = '' }: { name?: string; className?: string }) {
  const custom = customPortraits[`/public/cases/case001/${name.toLowerCase()}.webp`] as string | undefined;
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const generatedNames = ['Brian','Emily','Tyler','Luke','Anna','Noah','Sophie'];
  const source = custom ?? (generatedNames.includes(name) ? `/cases/case001/portraits/${name.toLowerCase()}.webp` : undefined);
  const id = useId().replace(/:/g, '');
  const index = ['Brian','Emily','Tyler','Luke','Anna','Noah','Sophie'].indexOf(name);
  const long = [1,4,6].includes(index);
  const skin = ['#b9b6a7','#a9a08d','#c0b8a7','#aaa89e','#bcb19c','#8e897b','#c1b8a2'][Math.max(0,index)];
  const art = <svg viewBox="0 0 240 275" role="img" aria-label={`Illustrated school portrait of ${name}`}>
    <defs><linearGradient id={`bg-${id}`} x2="1" y2="1"><stop stopColor="#666c66"/><stop offset="1" stopColor="#2a3635"/></linearGradient><pattern id={`lines-${id}`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 4L4 0" stroke="#090e0e" strokeOpacity=".13"/></pattern></defs>
    <path fill={`url(#bg-${id})`} d="M0 0h240v275H0z"/><path fill="#bdc0ad" opacity=".1" d="M10 0h35v275H10zM65 0h7v275h-7zM180 0h10v275h-10z"/>
    {long && <path d="M61 103Q44 24 115 25Q196 18 186 114L205 240H44Z" fill="#252c2b"/>}
    <path d="M18 275L29 230Q39 207 83 192L159 189Q207 201 219 235L228 275" fill="#373e3b"/>
    <path d="M86 170L85 198L120 227L155 194L152 164" fill={skin}/><path d="M86 170Q118 203 152 169L151 184Q120 211 86 183" fill="#555d53" opacity=".5"/>
    <path d="M70 96Q67 46 120 46Q177 45 173 101L168 151Q148 184 122 187Q90 183 74 151Z" fill={skin}/>
    <path d="M70 110Q49 97 58 132Q60 143 74 141M172 111Q192 96 182 132Q180 143 168 141" fill={skin}/>
    <path d={index === 1 ? 'M131 42Q85 20 63 63L61 139L72 156L80 90Q123 75 144 55L164 90L170 158L184 140L181 61Q172 32 131 42Z' : index === 6 ? 'M60 62Q68 26 120 29Q177 25 181 67L177 154L164 156L160 86L83 88L75 155L61 147Z' : index === 5 ? 'M62 64Q58 30 118 29Q173 22 178 65L171 91L160 69Q128 83 78 72L67 98Z' : index === 3 ? 'M62 67L72 41L89 31L105 37L123 26L137 35L157 31L177 50L179 90L165 79L155 62L82 78L67 109Z' : 'M120 64Q97 102 66 98L62 122Q52 86 62 60Q52 58 56 45L75 47Q80 21 106 34Q124 13 143 34Q173 20 181 50Q200 58 181 91L173 119L162 83Q139 87 120 64Z'} fill="#222c2b"/>
    <path d="M67 60Q91 48 103 43M82 73Q109 58 116 40M130 40Q151 50 161 67M63 83L80 77" fill="none" stroke="#505953" strokeWidth="3"/>
    <path d="M81 111Q94 105 105 111M137 110Q149 104 160 109" fill="none" stroke="#40473f" strokeWidth="4"/>
    <path d="M82 119Q94 113 105 119M137 118Q149 112 159 118" fill="none" stroke="#424941" strokeWidth="2"/>
    <ellipse cx="95" cy="119" rx="3.2" ry="4" fill="#26312d"/><ellipse cx="147" cy="117" rx="3.2" ry="4" fill="#26312d"/>
    {index === 2 && <g fill="none" stroke="#35413a" strokeWidth="3"><rect x="77" y="108" width="34" height="25" rx="8"/><rect x="131" y="106" width="34" height="25" rx="8"/><path d="M111 117Q121 111 131 116M66 112L77 116M165 113L174 108"/></g>}
    {index === 4 && <g fill="#6c7565" opacity=".6"><circle cx="83" cy="136" r="1.8"/><circle cx="91" cy="140" r="1.8"/><circle cx="101" cy="138" r="1.8"/><circle cx="140" cy="138" r="1.8"/><circle cx="149" cy="139" r="1.8"/><circle cx="158" cy="134" r="1.8"/></g>}
    <path d="M119 119L113 141L125 143" fill="none" stroke="#777c6d" strokeWidth="2"/><path d="M102 155Q121 166 141 152Q126 176 102 155" fill="#62685c"/><path d="M108 156Q124 161 135 155" stroke="#e0daca" strokeWidth="3" fill="none"/>
    <path d="M74 193L120 226L94 249L58 207M161 190L120 226L147 249L181 208" fill="#555d54" stroke="#222e2b" strokeWidth="3"/>
    <path d="M95 245L96 275M146 246L149 275M121 227L122 275" stroke="#a1a391" strokeWidth="2" opacity=".55"/>
    <path d="M32 241L49 275M203 239L190 275" stroke="#748072" strokeWidth="2" opacity=".4"/>
    <path fill={`url(#lines-${id})`} d="M0 0h240v275H0z"/>
    <text x="12" y="262" fontFamily="monospace" fontSize="9" fill="#c5c7b6" opacity=".6">SCHOOL RECORD / {String(Math.max(index,0)+1).padStart(3,'0')}</text>
  </svg>;
  return <div className={`portrait ${className}`}>{source && !failedSources.includes(source) ? <img src={source} alt={`Illustrated school portrait of ${name}`} width={560} height={747} decoding="async" onError={() => setFailedSources(previous => [...previous, source])}/> : art}</div>;
}

export function Scene({ kind }: { kind: 'laptop' | 'classroom' | 'usb' | 'footage' }) {
  const id = useId().replace(/:/g, '');
  const custom = kind === 'footage' ? customPortraits['/public/cases/case001/camera03.webp'] as string | undefined : undefined;
  if (custom) return <img className="scene scene-footage" src={custom} alt="Brian in a school hallway. Another person, facing away, carries a blue backpack."/>;
  return <svg className={`scene scene-${kind}`} viewBox="0 0 400 265" role="img" aria-label={kind === 'footage' ? 'Brian in a school hallway. Another person, facing away, carries a blue backpack.' : kind === 'laptop' ? 'An unattended school computer' : kind === 'classroom' ? 'An empty classroom' : 'An unknown USB drive'}>
    <defs><linearGradient id={id} x2=".8" y2="1"><stop stopColor="#59615c"/><stop offset="1" stopColor="#111b1b"/></linearGradient><pattern id={`${id}-scan`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1H4" stroke="#050c0c" strokeOpacity=".18"/></pattern></defs>
    <path fill={`url(#${id})`} d="M0 0h400v265H0z"/>
    {kind === 'laptop' && <g><path d="M0 212L400 170V265H0" fill="#343b34"/><path d="M85 45L325 39L294 196L62 207Z" fill="#171f1e" stroke="#73796a" strokeWidth="3"/><path d="M98 58L310 53L283 182L79 194Z" fill="#26332e"/><path d="M62 208L294 196L350 225L94 246L35 233Z" fill="#646e60"/><path d="M76 214L287 205L310 218L88 235Z" fill="#283731"/><g stroke="#95aa8d" opacity=".6" strokeWidth="3"><path d="M117 83L186 81M114 95L247 91M111 107L263 102M108 119L194 115M105 132L246 125M101 145L163 140"/></g><path d="M172 228L226 223L242 229L184 234Z" fill="#3b463e"/></g>}
    {(kind === 'classroom' || kind === 'footage') && <g><path d="M0 0L157 66H268L400 0" fill="#677268"/><path d="M0 265L157 158H268L400 265" fill="#818478"/><path d="M157 66H268V158H157Z" fill="#313d38"/><g fill="#a0a595" stroke="#3d4a42" strokeWidth="6"><path d="M15 30L124 74V143L15 169Z"/><path d="M19 96L122 106M65 49V156" fill="none"/></g><path d="M290 68L333 45V187L290 164Z" fill="#29352f"/><path d="M358 30L394 13V230L358 203Z" fill="#29352f"/><path d="M210 158V265M157 158L63 265M268 158L339 265M120 190H309M67 226H350" stroke="#525f53" fill="none"/></g>}
    {kind === 'classroom' && <g fill="#3a443b" stroke="#929789" strokeWidth="2">{[0,1,2].map(row => [0,1,2].map(col => <g key={`${row}-${col}`} transform={`translate(${45+col*112-row*10} ${131+row*39})`}><path d="M0 0L50 -7L77 4L24 13Z"/><path d="M8 3V31M66 6V34M25 14V40"/><path d="M29 25V8H54V25M29 28L59 27V49"/></g>))}</g>}
    {kind === 'usb' && <g transform="translate(62 102) rotate(-22 140 30)"><ellipse cx="140" cy="65" rx="142" ry="31" fill="#111b17" opacity=".7"/><path d="M0 10H84V64H0Z" fill="#a1a795" stroke="#414c42" strokeWidth="3"/><path d="M12 23H27V38H12ZM48 23H63V38H48Z" fill="#2f3932"/><path d="M81 0H249Q270 0 270 20V53Q270 73 249 73H81Z" fill="#263c33" stroke="#758071" strokeWidth="3"/><path d="M100 14H247V59H100Z" fill="#203028" stroke="#536b59"/><path d="M135 36H215M200 29L215 36L200 43M160 36V24H181M171 36V48H191" fill="none" stroke="#829380" strokeWidth="3"/></g>}
    {kind === 'footage' && <g><g transform="translate(76 87)"><path d="M2 178L9 94Q17 79 35 76H63Q90 90 92 177" fill="#343e3b"/><path d="M31 58V84L51 99L65 80V56" fill="#92968b"/><ellipse cx="48" cy="42" rx="30" ry="35" fill="#a5a69a"/><path d="M17 44Q5 1 41 4Q80 -9 83 37L64 30L49 18L25 39Z" fill="#28312e"/><path d="M24 88L45 123L72 88M47 122V178" stroke="#7e877c" strokeWidth="3" fill="none"/><path d="M18 98L13 153M78 100L82 154" stroke="#222f28" strokeWidth="9"/></g><g transform="translate(273 79)"><path d="M10 95L4 181H70L66 92" fill="#303d3a"/><ellipse cx="39" cy="35" rx="25" ry="31" fill="#2b322d"/><path d="M17 51L5 83L12 131H73L72 79L59 50" fill="#455750"/><path d="M17 86Q18 63 42 65Q64 65 66 86L68 137Q37 151 14 133Z" fill="#396983" stroke="#1f3d4d" strokeWidth="4"/><path d="M24 76L20 117M59 75L61 117M22 106Q43 98 60 106V132H22Z" fill="none" stroke="#7497a0" strokeWidth="2"/></g><path d="M10 10H187V33H10Z" fill="#0e1815"/><text x="17" y="26" fill="#e3e4d6" fontFamily="monospace" fontSize="14">04/14 15:40:27</text><path d="M10 229H84V253H10Z" fill="#0e1815"/><text x="18" y="246" fill="#e3e4d6" fontFamily="monospace" fontSize="14">CAM 03</text><circle cx="377" cy="20" r="4" fill="#a84338"/></g>}
    <path fill={`url(#${id}-scan)`} d="M0 0h400v265H0z"/>
  </svg>;
}
