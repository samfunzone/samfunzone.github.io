import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

/* ── Palettes ── */
const SKINS = [
  '#FFDBB4','#F5C590','#E8A86A','#C88040','#8D5524','#4A2910',
];
const CLOTH_COLORS = [
  '#ff6b6b','#ff9800','#ffd93d','#4caf50','#4fc3f7','#9c27b0',
  '#e91e63','#ffffff','#eceff1','#607d8b','#795548','#212121',
];
const HAIR_COLORS = [
  '#1a0800','#3d1f02','#7c4520','#c8782a','#d4a017','#e8cc80',
  '#ff6b6b','#9c27b0','#4fc3f7','#81c784','#e0e0e0','#ffffff',
];

/* ── SVG Doll Layers ── */

// Head skin only — renders AFTER HairFront so it covers the face center
function HeadSkin({ s }) {
  return (
    <g>
      <ellipse cx="100" cy="68" rx="40" ry="46" fill={s}/>
      <ellipse cx="61"  cy="70" rx="7"  ry="9"  fill={s}/>
      <ellipse cx="139" cy="70" rx="7"  ry="9"  fill={s}/>
    </g>
  );
}

// Face features only — renders LAST so always visible
function FaceFeatures({ s }) {
  return (
    <g>
      <ellipse cx="87"  cy="66" rx="7"   ry="8"   fill="#fff"/>
      <ellipse cx="113" cy="66" rx="7"   ry="8"   fill="#fff"/>
      <circle  cx="88"  cy="67" r="4.5"            fill="#2c1810"/>
      <circle  cx="114" cy="67" r="4.5"            fill="#2c1810"/>
      <circle  cx="89.5" cy="65.5" r="1.5"         fill="#fff"/>
      <circle  cx="115.5" cy="65.5" r="1.5"        fill="#fff"/>
      <path d="M80,56 Q87,52 94,56"  stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106,56 Q113,52 120,56" stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="100" cy="78" rx="5" ry="3.5" fill="rgba(0,0,0,0.07)"/>
      <path d="M88,88 Q100,98 112,88" stroke="#d47070" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M91,88 Q100,93 109,88" fill="#e09090" opacity=".6"/>
      <ellipse cx="74"  cy="82" rx="11" ry="7" fill="#ffb0a0" opacity=".35"/>
      <ellipse cx="126" cy="82" rx="11" ry="7" fill="#ffb0a0" opacity=".35"/>
    </g>
  );
}

function Body({ s }) {
  return (
    <g>
      {/* Neck */}
      <rect x="90" y="111" width="20" height="24" rx="5" fill={s}/>
      {/* Torso */}
      <rect x="58" y="132" width="84" height="96" rx="10" fill={s}/>
      {/* Arms */}
      <rect x="27" y="134" width="31" height="76" rx="14" fill={s}/>
      <rect x="142" y="134" width="31" height="76" rx="14" fill={s}/>
      {/* Hands */}
      <ellipse cx="43" cy="215" rx="15" ry="11" fill={s}/>
      <ellipse cx="157" cy="215" rx="15" ry="11" fill={s}/>
      {/* Legs */}
      <rect x="63" y="225" width="33" height="118" rx="14" fill={s}/>
      <rect x="104" y="225" width="33" height="118" rx="14" fill={s}/>
    </g>
  );
}

/* ── Hair ── */
function HairBack({ style, color }) {
  const c = color || '#3d1f02';
  switch(style) {
    case 'long': return (
      <g>
        <rect x="62" y="85" width="30" height="150" rx="14" fill={c}/>
        <rect x="108" y="85" width="30" height="150" rx="14" fill={c}/>
        <rect x="62" y="85" width="76" height="30" fill={c}/>
      </g>
    );
    case 'braids': return (
      <g>
        {[0,1,2,3,4,5,6].map(i => <rect key={i} x="68" y={90+i*26} width="24" height="20" rx="8" fill={c} opacity={1-i*.08}/>)}
        {[0,1,2,3,4,5,6].map(i => <rect key={i} x="108" y={90+i*26} width="24" height="20" rx="8" fill={c} opacity={1-i*.08}/>)}
      </g>
    );
    case 'ponytail': return (
      <g>
        <rect x="88" y="95" width="24" height="130" rx="10" fill={c}/>
      </g>
    );
    default: return null;
  }
}

function HairFront({ style, color }) {
  const c = color || '#3d1f02';
  switch(style) {
    case 'bob': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="28" width="80" height="40" fill={c}/>
        <rect x="58" y="55" width="20" height="40" rx="8" fill={c}/>
        <rect x="122" y="55" width="20" height="40" rx="8" fill={c}/>
        <ellipse cx="69" cy="95" rx="12" ry="8" fill={c}/>
        <ellipse cx="131" cy="95" rx="12" ry="8" fill={c}/>
      </g>
    );
    case 'long': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="22" fill={c}/>
        <rect x="60" y="25" width="80" height="65" fill={c}/>
        <ellipse cx="64" cy="85" rx="10" ry="10" fill={c}/>
        <ellipse cx="136" cy="85" rx="10" ry="10" fill={c}/>
      </g>
    );
    case 'curly': return (
      <g>
        {/* Big curly mass */}
        <ellipse cx="100" cy="45" rx="50" ry="38" fill={c}/>
        {[[-30,55],[-45,38],[-35,25],[-15,20],[5,18],[25,20],[40,28],[45,45],[38,60]].map(([dx,dy],i) => (
          <circle key={i} cx={100+dx} cy={dy} r="14" fill={c}/>
        ))}
      </g>
    );
    case 'afro': return (
      <g>
        <ellipse cx="100" cy="50" rx="56" ry="52" fill={c}/>
        {[[-40,35],[-50,55],[-42,72],[40,35],[50,55],[42,72],[-10,22],[10,22],[0,18]].map(([dx,dy],i) => (
          <ellipse key={i} cx={100+dx} cy={dy} rx="16" ry="14" fill={c}/>
        ))}
      </g>
    );
    case 'pigtails': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="25" width="80" height="50" fill={c}/>
        <ellipse cx="63" cy="80" rx="22" ry="22" fill={c}/>
        <ellipse cx="137" cy="80" rx="22" ry="22" fill={c}/>
        {/* Ribbons */}
        <ellipse cx="63" cy="62" rx="8" ry="6" fill="#ff6b6b"/>
        <ellipse cx="137" cy="62" rx="8" ry="6" fill="#ff6b6b"/>
      </g>
    );
    case 'ponytail': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="25" width="80" height="60" fill={c}/>
        <ellipse cx="100" cy="84" rx="14" ry="10" fill={c}/>
        {/* Hair tie */}
        <ellipse cx="100" cy="92" rx="9" ry="6" fill="#ff6b6b"/>
      </g>
    );
    case 'braids': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="25" width="80" height="60" fill={c}/>
        {/* Part in middle */}
        <line x1="100" y1="25" x2="100" y2="80" stroke={HAIR_COLORS[0]} strokeWidth="2" opacity=".3"/>
      </g>
    );
    case 'bun': return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="25" width="80" height="55" fill={c}/>
        <circle cx="100" cy="22" r="22" fill={c}/>
        <circle cx="100" cy="22" r="14" fill={c} stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
      </g>
    );
    default: return (
      <g>
        <ellipse cx="100" cy="32" rx="42" ry="20" fill={c}/>
        <rect x="60" y="25" width="80" height="50" fill={c}/>
      </g>
    );
  }
}

/* ── Tops ── */
function TopLayer({ top, color, s }) {
  if (!top) return null;
  const c = color || '#4fc3f7';
  switch(top) {
    case 'tshirt': return (
      <g>
        <rect x="58" y="132" width="84" height="96" rx="10" fill={c}/>
        <rect x="27" y="134" width="31" height="44" rx="14" fill={c}/>
        <rect x="142" y="134" width="31" height="44" rx="14" fill={c}/>
        <path d="M84,132 Q100,150 116,132" fill={s} opacity=".7"/>
      </g>
    );
    case 'tank': return (
      <g>
        <rect x="68" y="132" width="64" height="96" rx="10" fill={c}/>
        <path d="M80,132 Q100,150 120,132" fill={s} opacity=".7"/>
      </g>
    );
    case 'hoodie': return (
      <g>
        <rect x="58" y="132" width="84" height="96" rx="10" fill={c}/>
        <rect x="27" y="134" width="31" height="76" rx="14" fill={c}/>
        <rect x="142" y="134" width="31" height="76" rx="14" fill={c}/>
        {/* Hood */}
        <path d="M68,132 Q100,108 132,132 Q132,118 100,110 Q68,118 68,132Z" fill={c}/>
        {/* Pocket */}
        <rect x="85" y="185" width="30" height="20" rx="5" fill="rgba(0,0,0,0.1)"/>
        {/* Zipper */}
        <line x1="100" y1="140" x2="100" y2="228" stroke="rgba(0,0,0,0.15)" strokeWidth="3"/>
      </g>
    );
    case 'blouse': return (
      <g>
        <rect x="58" y="132" width="84" height="96" rx="10" fill={c}/>
        <rect x="27" y="134" width="31" height="50" rx="14" fill={c}/>
        <rect x="142" y="134" width="31" height="50" rx="14" fill={c}/>
        {/* Frills */}
        {[0,1,2,3].map(i => (
          <ellipse key={i} cx={70+i*20} cy={228} rx="12" ry="8" fill={c} stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        ))}
        {/* Collar bow */}
        <path d="M88,136 L100,148 L112,136" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
        <circle cx="100" cy="140" r="4" fill="rgba(255,255,255,0.7)"/>
      </g>
    );
    default: return null;
  }
}

/* ── Bottoms ── */
function BottomLayer({ bottom, color }) {
  if (!bottom) return null;
  const c = color || '#4a6fa5';
  switch(bottom) {
    case 'jeans': return (
      <g>
        <rect x="60" y="222" width="80" height="18" rx="4" fill={c}/>
        <rect x="63" y="237" width="32" height="106" rx="14" fill={c}/>
        <rect x="105" y="237" width="32" height="106" rx="14" fill={c}/>
        {/* Seam */}
        <line x1="97" y1="240" x2="97" y2="340" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
        <line x1="103" y1="240" x2="103" y2="340" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
        {/* Pocket lines */}
        <path d="M68,242 Q75,250 82,242" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
        <path d="M118,242 Q125,250 132,242" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
      </g>
    );
    case 'skirt': return (
      <g>
        <path d="M60,222 L140,222 L155,345 L45,345 Z" fill={c} rx="4"/>
        {/* Waistband */}
        <rect x="60" y="218" width="80" height="14" rx="4" fill={c} filter="brightness(0.85)"/>
        {/* Pleats */}
        {[75,92,108,125].map(x => (
          <line key={x} x1={x} y1={230} x2={x-8} y2={345} stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
        ))}
      </g>
    );
    case 'shorts': return (
      <g>
        <rect x="60" y="222" width="80" height="14" rx="4" fill={c}/>
        <rect x="63" y="233" width="32" height="52" rx="14" fill={c}/>
        <rect x="105" y="233" width="32" height="52" rx="14" fill={c}/>
      </g>
    );
    case 'miniskirt': return (
      <g>
        <path d="M62,222 L138,222 L148,282 L52,282 Z" fill={c}/>
        <rect x="60" y="218" width="80" height="14" rx="4" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Sparkles */}
        {[[80,255],[100,248],[120,252]].map(([x,y],i) => (
          <text key={i} x={x} y={y} fontSize="10" fill="rgba(255,255,255,0.6)" textAnchor="middle">✦</text>
        ))}
      </g>
    );
    default: return null;
  }
}

/* ── Dresses ── */
function DressLayer({ dress, color }) {
  if (!dress || dress === 'none') return null;
  const c = color || '#e91e63';
  switch(dress) {
    case 'princess': return (
      <g>
        {/* Bodice */}
        <rect x="62" y="132" width="76" height="80" rx="8" fill={c}/>
        <rect x="27" y="134" width="35" height="46" rx="14" fill={c}/>
        <rect x="138" y="134" width="35" height="46" rx="14" fill={c}/>
        {/* Big skirt */}
        <path d="M58,208 L142,208 L175,390 L25,390 Z" fill={c}/>
        {/* Skirt layers */}
        <path d="M55,250 L145,250 L162,310 L38,310 Z" fill="rgba(255,255,255,0.2)"/>
        <path d="M50,310 L150,310 L168,370 L32,370 Z" fill="rgba(255,255,255,0.15)"/>
        {/* Neckline */}
        <path d="M82,132 Q100,155 118,132" fill="rgba(255,255,255,0.2)"/>
        {/* Stars on skirt */}
        {[[75,270],[100,260],[125,268],[65,320],[100,315],[135,322],[80,348],[120,345]].map(([x,y],i)=>(
          <text key={i} x={x} y={y} fontSize="12" fill="rgba(255,255,255,0.55)" textAnchor="middle">★</text>
        ))}
        {/* Waist bow */}
        <path d="M86,206 L100,218 L114,206 L107,212 L100,208 L93,212 Z" fill="rgba(255,255,255,0.5)"/>
      </g>
    );
    case 'casual': return (
      <g>
        <rect x="64" y="132" width="72" height="88" rx="8" fill={c}/>
        <rect x="30" y="134" width="34" height="48" rx="14" fill={c}/>
        <rect x="136" y="134" width="34" height="48" rx="14" fill={c}/>
        {/* A-line skirt */}
        <path d="M60,218 L140,218 L152,345 L48,345 Z" fill={c}/>
        {/* Collar */}
        <path d="M86,132 Q100,148 114,132" fill="rgba(255,255,255,0.25)"/>
        {/* Pocket */}
        <rect x="108" y="240" width="24" height="22" rx="5" fill="rgba(0,0,0,0.1)"/>
        {/* Belt */}
        <rect x="60" y="216" width="80" height="10" rx="3" fill="rgba(0,0,0,0.15)"/>
      </g>
    );
    case 'tutu': return (
      <g>
        {/* Bodice */}
        <rect x="66" y="132" width="68" height="72" rx="8" fill={c}/>
        <rect x="32" y="134" width="34" height="44" rx="14" fill={c}/>
        <rect x="134" y="134" width="34" height="44" rx="14" fill={c}/>
        {/* Spaghetti straps */}
        <rect x="82" y="115" width="6" height="20" rx="3" fill={c}/>
        <rect x="112" y="115" width="6" height="20" rx="3" fill={c}/>
        {/* Fluffy tutu */}
        {[0,1,2,3].map(layer => (
          <g key={layer}>
            {[45,60,75,90,105,120,135,150].map((x,i) => (
              <ellipse key={i} cx={x} cy={205+layer*12}
                rx={14-layer} ry={12-layer*2}
                fill={c} stroke="rgba(255,255,255,0.4)" strokeWidth="1"
                transform={`rotate(${(i*45+layer*22)}  ${x} ${205+layer*12})`}/>
            ))}
          </g>
        ))}
      </g>
    );
    case 'summer': return (
      <g>
        {/* Top */}
        <rect x="68" y="132" width="64" height="80" rx="8" fill={c}/>
        {/* Cap sleeves */}
        <ellipse cx="65" cy="148" rx="16" ry="12" fill={c}/>
        <ellipse cx="135" cy="148" rx="16" ry="12" fill={c}/>
        {/* Flowy skirt */}
        <path d="M62,210 L138,210 L155,345 L45,345 Z" fill={c} opacity=".9"/>
        <path d="M60,230 L140,230 L158,320 L42,320 Z" fill="rgba(255,255,255,0.18)"/>
        {/* Sunflower pattern */}
        {[[75,260],[105,250],[130,265],[85,300],[115,295]].map(([x,y],i)=>(
          <text key={i} x={x} y={y} fontSize="14" textAnchor="middle">🌸</text>
        ))}
        {/* V-neck */}
        <path d="M86,132 L100,155 L114,132" fill="rgba(255,255,255,0.2)"/>
      </g>
    );
    default: return null;
  }
}

/* ── Shoes ── */
function ShoesLayer({ shoes, color }) {
  if (!shoes) return null;
  const c = color || '#ffffff';
  switch(shoes) {
    case 'sneakers': return (
      <g>
        <rect x="57" y="340" width="40" height="22" rx="8" fill={c} stroke="#ddd" strokeWidth="1.5"/>
        <rect x="103" y="340" width="40" height="22" rx="8" fill={c} stroke="#ddd" strokeWidth="1.5"/>
        {/* Sole */}
        <rect x="55" y="354" width="44" height="10" rx="5" fill="#e0e0e0"/>
        <rect x="101" y="354" width="44" height="10" rx="5" fill="#e0e0e0"/>
        {/* Stripe */}
        <path d="M62,346 Q77,344 92,348" stroke="#ff6b6b" strokeWidth="2.5" fill="none"/>
        <path d="M108,346 Q123,344 138,348" stroke="#ff6b6b" strokeWidth="2.5" fill="none"/>
      </g>
    );
    case 'boots': return (
      <g>
        <rect x="58" y="300" width="38" height="65" rx="10" fill={c}/>
        <rect x="104" y="300" width="38" height="65" rx="10" fill={c}/>
        {/* Toe cap */}
        <ellipse cx="77" cy="364" rx="20" ry="8" fill={c} style={{filter:'brightness(.9)'}}/>
        <ellipse cx="123" cy="364" rx="20" ry="8" fill={c} style={{filter:'brightness(.9)'}}/>
        {/* Boot details */}
        <line x1="62" y1="320" x2="92" y2="320" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
        <line x1="108" y1="320" x2="138" y2="320" stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>
      </g>
    );
    case 'heels': return (
      <g>
        {/* Shoe body */}
        <path d="M58,355 Q68,342 95,342 L96,362 L58,362Z" fill={c}/>
        <path d="M104,355 Q114,342 141,342 L142,362 L104,362Z" fill={c}/>
        {/* Heel */}
        <rect x="88" y="355" width="8" height="22" rx="3" fill={c} style={{filter:'brightness(.85)'}}/>
        <rect x="134" y="355" width="8" height="22" rx="3" fill={c} style={{filter:'brightness(.85)'}}/>
      </g>
    );
    case 'flats': return (
      <g>
        <path d="M57,352 Q77,342 98,350 L98,362 Q77,368 57,362 Z" fill={c}/>
        <path d="M102,352 Q122,342 143,350 L143,362 Q122,368 102,362 Z" fill={c}/>
        {/* Bow */}
        <path d="M73,350 L80,355 L87,350" fill="none" stroke="#ff9eb5" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M113,350 L120,355 L127,350" fill="none" stroke="#ff9eb5" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    );
    default: return null;
  }
}

/* ── Hats ── */
function HatLayer({ hat, color }) {
  if (!hat || hat === 'none') return null;
  const c = color || '#ffd93d';
  switch(hat) {
    case 'crown': return (
      <g>
        <path d="M65,32 L65,10 L80,22 L100,5 L120,22 L135,10 L135,32 Z" fill={c}/>
        <rect x="63" y="28" width="74" height="14" rx="4" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Gems */}
        <circle cx="100" cy="14" r="5" fill="#e91e63"/>
        <circle cx="78" cy="20" r="4" fill="#4fc3f7"/>
        <circle cx="122" cy="20" r="4" fill="#4caf50"/>
      </g>
    );
    case 'cap': return (
      <g>
        <ellipse cx="100" cy="32" rx="45" ry="22" fill={c}/>
        {/* Brim */}
        <path d="M56,36 Q56,50 90,50 L90,38Z" fill={c} style={{filter:'brightness(.8)'}}/>
        {/* Button */}
        <circle cx="100" cy="14" r="5" fill={c} style={{filter:'brightness(.8)'}}/>
        {/* Line */}
        <line x1="57" y1="36" x2="143" y2="36" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
      </g>
    );
    case 'sunhat': return (
      <g>
        {/* Brim */}
        <ellipse cx="100" cy="36" rx="65" ry="14" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Dome */}
        <ellipse cx="100" cy="22" rx="42" ry="22" fill={c}/>
        {/* Band */}
        <ellipse cx="100" cy="36" rx="42" ry="8" fill="#ff6b6b" opacity=".7"/>
        {/* Flowers */}
        <text x="74" y="40" fontSize="14" textAnchor="middle">🌸</text>
        <text x="130" y="40" fontSize="14" textAnchor="middle">🌸</text>
      </g>
    );
    case 'beanie': return (
      <g>
        <ellipse cx="100" cy="35" rx="44" ry="24" fill={c}/>
        <rect x="57" y="30" width="86" height="18" rx="4" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Pompom */}
        <circle cx="100" cy="14" r="12" fill={c} style={{filter:'brightness(1.1)'}}/>
        <circle cx="100" cy="14" r="8" fill={c} style={{filter:'brightness(1.2)'}}/>
        {/* Ribbing lines */}
        {[68,80,92,104,116,128].map(x => (
          <line key={x} x1={x} y1="30" x2={x} y2="48" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
        ))}
      </g>
    );
    case 'bow': return (
      <g>
        {/* Big bow */}
        <ellipse cx="80" cy="20" rx="22" ry="14" fill={c} transform="rotate(-15 80 20)"/>
        <ellipse cx="120" cy="20" rx="22" ry="14" fill={c} transform="rotate(15 120 20)"/>
        <circle cx="100" cy="20" r="10" fill={c} style={{filter:'brightness(.9)'}}/>
        {/* Ribbons */}
        <path d="M90,28 Q80,40 70,55" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M110,28 Q120,40 130,55" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round"/>
      </g>
    );
    default: return null;
  }
}

/* ── Accessories ── */
function AccessoryLayer({ accessory, color }) {
  if (!accessory || accessory === 'none') return null;
  const c = color || '#ffd93d';
  switch(accessory) {
    case 'glasses': return (
      <g>
        <circle cx="87" cy="68" r="13" fill="none" stroke={c} strokeWidth="3"/>
        <circle cx="113" cy="68" r="13" fill="none" stroke={c} strokeWidth="3"/>
        <line x1="100" y1="68" x2="100" y2="68" stroke={c} strokeWidth="3"/>
        <path d="M100,67 L100,70" stroke={c} strokeWidth="3" strokeLinecap="round"/>
        <line x1="60" y1="66" x2="74" y2="66" stroke={c} strokeWidth="2.5"/>
        <line x1="126" y1="66" x2="140" y2="66" stroke={c} strokeWidth="2.5"/>
      </g>
    );
    case 'necklace': return (
      <g>
        <path d="M82,118 Q100,135 118,118" stroke={c} strokeWidth="3" fill="none"/>
        <circle cx="100" cy="136" r="6" fill={c}/>
        {[88,94,106,112].map((x,i) => (
          <circle key={i} cx={x} cy={121+[3,5,5,3][i]} r="3" fill={c}/>
        ))}
      </g>
    );
    case 'bag': return (
      <g transform="translate(145,185)">
        <rect x="0" y="0" width="32" height="30" rx="6" fill={c}/>
        <path d="M8,0 Q8,-14 24,-14 Q24,0 24,0" fill="none" stroke={c} strokeWidth="4"/>
        <rect x="6" y="10" width="20" height="4" rx="2" fill="rgba(0,0,0,0.15)"/>
        <rect x="12" y="0" width="8" height="4" rx="2" fill={c} style={{filter:'brightness(.8)'}}/>
      </g>
    );
    case 'star': return (
      <g transform="translate(145,130)">
        {/* Wand stick */}
        <line x1="0" y1="0" x2="-35" y2="60" stroke="#c8a000" strokeWidth="6" strokeLinecap="round"/>
        {/* Star */}
        <text x="-4" y="8" fontSize="28" textAnchor="middle">⭐</text>
        {/* Sparkles */}
        <text x="10" y="25" fontSize="12">✨</text>
        <text x="-18" y="30" fontSize="10">✦</text>
      </g>
    );
    default: return null;
  }
}

/* ── Main Doll SVG ── */
function DollSVG({ outfit }) {
  const { skin, hairStyle, hairColor, top, topColor, bottom, bottomColor,
          dress, dressColor, shoes, shoesColor, hat, hatColor, accessory, accColor } = outfit;
  const s = skin || SKINS[1];
  const hasDress = dress && dress !== 'none';

  return (
    <svg viewBox="0 0 200 410" width={200} height={410} style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}>
      {/* 1. Long hair / braids that hang behind the body */}
      <HairBack style={hairStyle} color={hairColor}/>
      {/* 2. Body skin */}
      <Body s={s}/>
      {/* 3. Clothing */}
      {hasDress
        ? <DressLayer dress={dress} color={dressColor}/>
        : <>
            <TopLayer top={top} color={topColor} s={s}/>
            <BottomLayer bottom={bottom} color={bottomColor}/>
          </>
      }
      {/* 4. Shoes */}
      <ShoesLayer shoes={shoes} color={shoesColor}/>
      {/* 5. Hair cap/style — renders before head skin so head skin covers face center */}
      <HairFront style={hairStyle} color={hairColor}/>
      {/* 6. Head skin — covers center of any hair, leaving sides/top visible */}
      <HeadSkin s={s}/>
      {/* 7. Face features — always on top, always visible */}
      <FaceFeatures s={s}/>
      {/* 8. Hat + accessories */}
      <HatLayer hat={hat} color={hatColor}/>
      <AccessoryLayer accessory={accessory} color={accColor}/>
    </svg>
  );
}

/* ── Category definitions ── */
const CATEGORIES = [
  { id: 'skin',      label: '🎨 Skin',       items: SKINS.map((c,i) => ({ id: c, label: `Tone ${i+1}`, swatch: c })), noColor: true },
  { id: 'hair',      label: '💇 Hair',
    items: [
      { id:'bob',      label:'Bob Cut'   },
      { id:'long',     label:'Long'      },
      { id:'curly',    label:'Curly'     },
      { id:'afro',     label:'Afro'      },
      { id:'pigtails', label:'Pigtails'  },
      { id:'ponytail', label:'Ponytail'  },
      { id:'braids',   label:'Braids'    },
      { id:'bun',      label:'Bun'       },
    ], hairColor: true },
  { id: 'tops',      label: '👕 Tops',
    items: [
      { id:'tshirt', label:'T-Shirt'      },
      { id:'tank',   label:'Tank Top'     },
      { id:'hoodie', label:'Hoodie'       },
      { id:'blouse', label:'Frilly Top'   },
    ] },
  { id: 'bottoms',   label: '👖 Bottoms',
    items: [
      { id:'jeans',     label:'Jeans'     },
      { id:'skirt',     label:'Skirt'     },
      { id:'shorts',    label:'Shorts'    },
      { id:'miniskirt', label:'Mini Skirt'},
    ] },
  { id: 'dresses',   label: '👗 Dresses',
    items: [
      { id:'none',     label:'No Dress'    },
      { id:'princess', label:'Princess'    },
      { id:'casual',   label:'Casual'      },
      { id:'tutu',     label:'Tutu'        },
      { id:'summer',   label:'Summer'      },
    ] },
  { id: 'shoes',     label: '👟 Shoes',
    items: [
      { id:'sneakers', label:'Sneakers' },
      { id:'boots',    label:'Boots'    },
      { id:'heels',    label:'Heels'    },
      { id:'flats',    label:'Flats'    },
    ] },
  { id: 'hats',      label: '🎩 Hats',
    items: [
      { id:'none',    label:'No Hat'  },
      { id:'crown',   label:'Crown'   },
      { id:'cap',     label:'Cap'     },
      { id:'sunhat',  label:'Sun Hat' },
      { id:'beanie',  label:'Beanie'  },
      { id:'bow',     label:'Bow'     },
    ] },
  { id: 'extras',    label: '✨ Extras',
    items: [
      { id:'none',     label:'None'      },
      { id:'glasses',  label:'Glasses'   },
      { id:'necklace', label:'Necklace'  },
      { id:'bag',      label:'Handbag'   },
      { id:'star',     label:'Star Wand' },
    ] },
];

const DEFAULT_OUTFIT = {
  skin: SKINS[1],
  hairStyle: 'long', hairColor: HAIR_COLORS[1],
  top: 'tshirt',    topColor: '#4fc3f7',
  bottom: 'skirt',  bottomColor: '#9c27b0',
  dress: 'none',    dressColor: '#e91e63',
  shoes: 'sneakers',shoesColor: '#ffffff',
  hat: 'none',      hatColor: '#ffd93d',
  accessory: 'none',accColor: '#ffd93d',
};

export default function DressingDolls() {
  const [outfit,  setOutfit]  = useState(DEFAULT_OUTFIT);
  const [cat,     setCat]     = useState('hair');
  const [flashing,setFlashing]= useState(false);

  const category = CATEGORIES.find(c => c.id === cat);

  const pick = (itemId) => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 300);

    setOutfit(prev => {
      const next = { ...prev };
      switch(cat) {
        case 'skin':    next.skin = itemId; break;
        case 'hair':    next.hairStyle = itemId; break;
        case 'tops':    next.top = itemId; next.dress = 'none'; break;
        case 'bottoms': next.bottom = itemId; next.dress = 'none'; break;
        case 'dresses': next.dress = itemId; break;
        case 'shoes':   next.shoes = itemId; break;
        case 'hats':    next.hat = itemId; break;
        case 'extras':  next.accessory = itemId; break;
      }
      return next;
    });
  };

  const pickColor = (color) => {
    setOutfit(prev => {
      const next = { ...prev };
      switch(cat) {
        case 'hair':    next.hairColor   = color; break;
        case 'tops':    next.topColor    = color; break;
        case 'bottoms': next.bottomColor = color; break;
        case 'dresses': next.dressColor  = color; break;
        case 'shoes':   next.shoesColor  = color; break;
        case 'hats':    next.hatColor    = color; break;
        case 'extras':  next.accColor    = color; break;
      }
      return next;
    });
  };

  const celebrate = () => {
    launchConfetti(window.innerWidth * 0.2, 0, 30);
    launchConfetti(window.innerWidth * 0.5, 0, 40);
    launchConfetti(window.innerWidth * 0.8, 0, 30);
    setTimeout(() => launchConfetti(window.innerWidth * 0.35, 0, 25), 300);
    setTimeout(() => launchConfetti(window.innerWidth * 0.65, 0, 25), 300);
  };

  const currentColor = {
    hair: outfit.hairColor, tops: outfit.topColor, bottoms: outfit.bottomColor,
    dresses: outfit.dressColor, shoes: outfit.shoesColor, hats: outfit.hatColor,
    extras: outfit.accColor,
  }[cat];

  const currentItem = {
    skin: outfit.skin, hair: outfit.hairStyle, tops: outfit.top,
    bottoms: outfit.bottom, dresses: outfit.dress, shoes: outfit.shoes,
    hats: outfit.hat, extras: outfit.accessory,
  }[cat];

  return (
    <div className="card card-purple">
      <h2>🪆 Dressing Dolls!</h2>

      <div className="doll-layout">
        {/* ── Doll display ── */}
        <div className="doll-display">
          <div className={flashing ? 'doll-flash' : ''}>
            <DollSVG outfit={outfit}/>
          </div>
          <button className="btn btn-purple" style={{ marginTop:10, width:'100%' }} onClick={celebrate}>
            🎉 Show Off!
          </button>
          <button className="btn btn-orange" style={{ marginTop:8, width:'100%' }}
            onClick={() => setOutfit(DEFAULT_OUTFIT)}>
            ↺ Start Over
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="doll-controls">
          {/* Category tabs */}
          <div className="doll-tabs">
            {CATEGORIES.map(c => (
              <button key={c.id}
                className={`doll-tab${cat === c.id ? ' active' : ''}`}
                onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Item grid */}
          <div className="doll-items">
            {category?.noColor
              ? category.items.map(it => (
                  <button key={it.id}
                    className={`doll-item-btn skin-btn${currentItem === it.id ? ' active' : ''}`}
                    style={{ background: it.swatch }}
                    onClick={() => pick(it.id)}
                  />
                ))
              : category?.items.map(it => (
                  <button key={it.id}
                    className={`doll-item-btn${currentItem === it.id ? ' active' : ''}`}
                    onClick={() => pick(it.id)}>
                    {it.label}
                  </button>
                ))
            }
          </div>

          {/* Color palette */}
          {!category?.noColor && cat !== 'skin' && (
            <div className="doll-color-section">
              <p className="doll-color-label">Pick a color:</p>
              <div className="doll-color-grid">
                {(cat === 'hair' ? HAIR_COLORS : CLOTH_COLORS).map(c => (
                  <div key={c}
                    className={`doll-color-swatch${currentColor === c ? ' active' : ''}`}
                    style={{ background: c, border: c === '#ffffff' ? '2px solid #ccc' : '2px solid transparent' }}
                    onClick={() => pickColor(c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
