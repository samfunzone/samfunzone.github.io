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
const SCENES = [
  { id: 'none',   label: '✦ Plain'   },
  { id: 'beach',  label: '🏖 Beach'  },
  { id: 'park',   label: '🌳 Park'   },
  { id: 'school', label: '🏫 School' },
  { id: 'party',  label: '🎈 Party'  },
  { id: 'meadow', label: '🌈 Meadow' },
];
const EYE_STYLES   = ['normal','wide','happy','sleepy','winking'];
const BROW_STYLES  = ['normal','raised','furrowed','arched'];
const MOUTH_STYLES = ['smile','grin','surprised','pouty'];

/* ── Scene Backgrounds ── */
function SceneBackground({ scene }) {
  switch (scene) {
    case 'beach': return (
      <g>
        <rect x="0" y="0" width="200" height="265" fill="#87ceeb"/>
        <circle cx="170" cy="30" r="22" fill="#ffd93d"/>
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          return <line key={i}
            x1={170 + Math.cos(rad)*26} y1={30 + Math.sin(rad)*26}
            x2={170 + Math.cos(rad)*37} y2={30 + Math.sin(rad)*37}
            stroke="#ffd93d" strokeWidth="3" strokeLinecap="round"/>;
        })}
        <ellipse cx="40" cy="40" rx="28" ry="14" fill="white" opacity=".85"/>
        <ellipse cx="60" cy="34" rx="20" ry="13" fill="white" opacity=".85"/>
        <ellipse cx="22" cy="38" rx="16" ry="10" fill="white" opacity=".85"/>
        <rect x="0" y="265" width="200" height="145" fill="#f5deb3"/>
        <path d="M0,265 Q50,255 100,265 Q150,275 200,265 L200,288 Q150,298 100,288 Q50,278 0,288Z"
              fill="#4fc3f7" opacity=".7"/>
        <ellipse cx="20" cy="298" rx="7" ry="4" fill="#ffb0a0" transform="rotate(-20 20 298)"/>
        <ellipse cx="175" cy="308" rx="6" ry="3.5" fill="#ff9eb5" transform="rotate(15 175 308)"/>
        <rect x="12" y="205" width="8" height="70" rx="3" fill="#8d5524"/>
        <ellipse cx="16" cy="203" rx="28" ry="14" fill="#4caf50" transform="rotate(-10 16 203)"/>
        <ellipse cx="22" cy="195" rx="24" ry="12" fill="#388e3c" transform="rotate(10 22 195)"/>
      </g>
    );
    case 'park': return (
      <g>
        <rect x="0" y="0" width="200" height="285" fill="#b3e5fc"/>
        <ellipse cx="50" cy="45" rx="32" ry="16" fill="white" opacity=".9"/>
        <ellipse cx="72" cy="38" rx="22" ry="14" fill="white" opacity=".9"/>
        <ellipse cx="30" cy="42" rx="18" ry="11" fill="white" opacity=".9"/>
        <ellipse cx="155" cy="55" rx="28" ry="13" fill="white" opacity=".9"/>
        <ellipse cx="175" cy="50" rx="18" ry="11" fill="white" opacity=".9"/>
        <rect x="0" y="285" width="200" height="125" fill="#66bb6a"/>
        <rect x="0" y="285" width="200" height="18" fill="#4caf50"/>
        <rect x="8" y="215" width="10" height="80" rx="4" fill="#6d4c41"/>
        <circle cx="13" cy="205" r="30" fill="#388e3c"/>
        <circle cx="-2" cy="222" r="20" fill="#43a047"/>
        <circle cx="28" cy="220" r="22" fill="#43a047"/>
        <rect x="182" y="218" width="10" height="80" rx="4" fill="#6d4c41"/>
        <circle cx="187" cy="208" r="28" fill="#2e7d32"/>
        <circle cx="172" cy="223" r="19" fill="#388e3c"/>
        {[[25,315],[45,330],[160,318],[180,333],[100,345]].map(([x,y],i)=>(
          <text key={i} x={x} y={y} fontSize="14" textAnchor="middle">🌸</text>
        ))}
      </g>
    );
    case 'school': return (
      <g>
        <rect x="0" y="0" width="200" height="225" fill="#e3f2fd"/>
        <rect x="20" y="130" width="160" height="100" fill="#ffcc80"/>
        <path d="M10,130 L100,70 L190,130Z" fill="#ef9a9a"/>
        <rect x="35" y="150" width="28" height="28" rx="3" fill="#b3e5fc"/>
        <rect x="86" y="150" width="28" height="28" rx="3" fill="#b3e5fc"/>
        <rect x="137" y="150" width="28" height="28" rx="3" fill="#b3e5fc"/>
        <line x1="49" y1="150" x2="49" y2="178" stroke="white" strokeWidth="2"/>
        <line x1="35" y1="164" x2="63" y2="164" stroke="white" strokeWidth="2"/>
        <line x1="100" y1="150" x2="100" y2="178" stroke="white" strokeWidth="2"/>
        <line x1="86" y1="164" x2="114" y2="164" stroke="white" strokeWidth="2"/>
        <line x1="151" y1="150" x2="151" y2="178" stroke="white" strokeWidth="2"/>
        <line x1="137" y1="164" x2="165" y2="164" stroke="white" strokeWidth="2"/>
        <rect x="88" y="195" width="24" height="35" rx="3" fill="#8d6e63"/>
        <rect x="0" y="225" width="200" height="185" fill="#a5d6a7"/>
        <rect x="80" y="225" width="40" height="185" fill="#bcaaa4" opacity=".5"/>
        <line x1="100" y1="70" x2="100" y2="40" stroke="#888" strokeWidth="2"/>
        <path d="M100,40 L128,50 L100,60Z" fill="#ff6b6b"/>
      </g>
    );
    case 'party': return (
      <g>
        <rect x="0" y="0" width="200" height="410" fill="#1a0050"/>
        <circle cx="30" cy="30" r="60" fill="#ff6b6b" opacity=".18"/>
        <circle cx="170" cy="50" r="55" fill="#4fc3f7" opacity=".18"/>
        <circle cx="100" cy="20" r="50" fill="#ffd93d" opacity=".15"/>
        <path d="M0,0 Q30,80 10,160 Q-10,240 20,320" stroke="#ff6b6b" strokeWidth="5" fill="none" opacity=".6"/>
        <path d="M200,0 Q170,80 190,160 Q210,240 180,320" stroke="#ffd93d" strokeWidth="5" fill="none" opacity=".6"/>
        <path d="M60,0 Q80,100 60,200 Q40,300 65,410" stroke="#4fc3f7" strokeWidth="4" fill="none" opacity=".5"/>
        <path d="M140,0 Q120,100 140,200 Q160,300 135,410" stroke="#ce93d8" strokeWidth="4" fill="none" opacity=".5"/>
        <ellipse cx="20" cy="80" rx="16" ry="20" fill="#ff6b6b" opacity=".85"/>
        <line x1="20" y1="100" x2="22" y2="130" stroke="#ff6b6b" strokeWidth="1.5"/>
        <ellipse cx="180" cy="70" rx="16" ry="20" fill="#ffd93d" opacity=".85"/>
        <line x1="180" y1="90" x2="178" y2="120" stroke="#ffd93d" strokeWidth="1.5"/>
        <ellipse cx="160" cy="100" rx="14" ry="18" fill="#4fc3f7" opacity=".85"/>
        <line x1="160" y1="118" x2="158" y2="148" stroke="#4fc3f7" strokeWidth="1.5"/>
        {[[15,200],[30,320],[170,250],[185,380],[50,370],[150,150],[80,180],[120,360]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="4"
            fill={['#ff6b6b','#ffd93d','#4fc3f7','#ce93d8','#81c784'][i%5]} opacity=".7"/>
        ))}
        {[0,1,2,3,4,5,6,7].map(i=>(
          <rect key={i} x={i*25} y="375" width="25" height="35"
            fill={i%2===0 ? '#3a0090' : '#2a0070'} opacity=".8"/>
        ))}
      </g>
    );
    case 'meadow': return (
      <g>
        <rect x="0" y="0" width="200" height="300" fill="#e8f4fd"/>
        {['#ff6b6b','#ff9800','#ffd93d','#4caf50','#4fc3f7','#9c27b0'].map((clr,i)=>(
          <path key={i}
            d={`M${-10+i*3},${215-i*8} Q100,${65-i*10} ${210-i*3},${215-i*8}`}
            fill="none" stroke={clr} strokeWidth="12" opacity=".35"/>
        ))}
        <ellipse cx="30" cy="60" rx="30" ry="15" fill="white" opacity=".9"/>
        <ellipse cx="52" cy="52" rx="22" ry="14" fill="white" opacity=".9"/>
        <ellipse cx="12" cy="57" rx="17" ry="10" fill="white" opacity=".9"/>
        <ellipse cx="160" cy="70" rx="28" ry="13" fill="white" opacity=".9"/>
        <ellipse cx="180" cy="65" rx="18" ry="10" fill="white" opacity=".9"/>
        <rect x="0" y="300" width="200" height="110" fill="#81c784"/>
        <rect x="0" y="300" width="200" height="20" fill="#66bb6a"/>
        {[[15,320],[35,335],[55,318],[80,340],[130,325],[155,338],[180,320],[165,310]].map(([x,y],i)=>(
          <text key={i} x={x} y={y} fontSize="16" textAnchor="middle">
            {['🌸','🌼','🌺','🌻','💐','🌷'][i%6]}
          </text>
        ))}
        <text x="165" y="195" fontSize="22" textAnchor="middle">🦋</text>
      </g>
    );
    default: return <rect x="0" y="0" width="200" height="410" fill="#f9f0ff"/>;
  }
}

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

/* ── Face expression helpers ── */
function EyeNormal() {
  return (
    <g>
      <ellipse cx="87"  cy="66" rx="7"   ry="8"   fill="#fff"/>
      <ellipse cx="113" cy="66" rx="7"   ry="8"   fill="#fff"/>
      <circle  cx="88"  cy="67" r="4.5"            fill="#2c1810"/>
      <circle  cx="114" cy="67" r="4.5"            fill="#2c1810"/>
      <circle  cx="89.5" cy="65.5" r="1.5"         fill="#fff"/>
      <circle  cx="115.5" cy="65.5" r="1.5"        fill="#fff"/>
    </g>
  );
}
function EyeWide() {
  return (
    <g>
      <ellipse cx="87"  cy="65" rx="8.5" ry="10"  fill="#fff"/>
      <ellipse cx="113" cy="65" rx="8.5" ry="10"  fill="#fff"/>
      <circle  cx="88"  cy="66" r="5.5"            fill="#2c1810"/>
      <circle  cx="114" cy="66" r="5.5"            fill="#2c1810"/>
      <circle  cx="90"  cy="64" r="2"              fill="#fff"/>
      <circle  cx="116" cy="64" r="2"              fill="#fff"/>
    </g>
  );
}
function EyeHappy() {
  return (
    <g>
      <path d="M80,68 Q87,58 94,68" stroke="#2c1810" strokeWidth="3" fill="#2c1810" strokeLinecap="round"/>
      <path d="M106,68 Q113,58 120,68" stroke="#2c1810" strokeWidth="3" fill="#2c1810" strokeLinecap="round"/>
      <circle cx="85"  cy="62" r="1.5" fill="#fff"/>
      <circle cx="118" cy="62" r="1.5" fill="#fff"/>
    </g>
  );
}
function EyeSleepy({ s }) {
  return (
    <g>
      <ellipse cx="87"  cy="68" rx="7" ry="8" fill="#fff"/>
      <ellipse cx="113" cy="68" rx="7" ry="8" fill="#fff"/>
      <circle  cx="88"  cy="69" r="4" fill="#2c1810"/>
      <circle  cx="114" cy="69" r="4" fill="#2c1810"/>
      <rect x="80" y="60" width="14" height="9" rx="2" fill={s}/>
      <rect x="106" y="60" width="14" height="9" rx="2" fill={s}/>
      <path d="M80,65 Q87,61 94,65" stroke="#3a2010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106,65 Q113,61 120,65" stroke="#3a2010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function EyeWinking() {
  return (
    <g>
      <ellipse cx="87"  cy="66" rx="7"   ry="8"  fill="#fff"/>
      <circle  cx="88"  cy="67" r="4.5"           fill="#2c1810"/>
      <circle  cx="89.5" cy="65.5" r="1.5"        fill="#fff"/>
      <path d="M106,67 Q113,59 120,67" stroke="#2c1810" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function BrowNormal() {
  return (
    <g>
      <path d="M80,56 Q87,52 94,56"   stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106,56 Q113,52 120,56" stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function BrowRaised() {
  return (
    <g>
      <path d="M80,51 Q87,47 94,51"   stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106,51 Q113,47 120,51" stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function BrowFurrowed() {
  return (
    <g>
      <path d="M80,55 Q87,58 94,54"   stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106,54 Q113,58 120,55" stroke="#4a2800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function BrowArched() {
  return (
    <g>
      <path d="M80,54 Q87,46 94,54"   stroke="#4a2800" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M106,54 Q113,46 120,54" stroke="#4a2800" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function MouthSmile() {
  return (
    <g>
      <path d="M88,88 Q100,98 112,88" stroke="#d47070" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M91,88 Q100,93 109,88" fill="#e09090" opacity=".6"/>
    </g>
  );
}
function MouthGrin() {
  return (
    <g>
      <path d="M83,88 Q100,102 117,88" stroke="#d47070" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M85,88 Q100,98 115,88 L115,91 Q100,101 85,91Z" fill="#e09090" opacity=".7"/>
      <rect x="90" y="88" width="20" height="6" rx="2" fill="white" opacity=".85"/>
    </g>
  );
}
function MouthSurprised() {
  return (
    <g>
      <ellipse cx="100" cy="93" rx="7" ry="9" fill="#c46060"/>
      <ellipse cx="100" cy="92" rx="5" ry="6" fill="#1a0010" opacity=".6"/>
    </g>
  );
}
function MouthPouty() {
  return (
    <path d="M91,92 Q100,88 109,92" stroke="#d47070" strokeWidth="3" fill="none" strokeLinecap="round"/>
  );
}

// Face features — renders LAST so always visible
function FaceFeatures({ s, eyeStyle = 'normal', browStyle = 'normal', mouthStyle = 'smile' }) {
  return (
    <g>
      <ellipse cx="74"  cy="82" rx="11" ry="7" fill="#ffb0a0" opacity=".35"/>
      <ellipse cx="126" cy="82" rx="11" ry="7" fill="#ffb0a0" opacity=".35"/>
      <ellipse cx="100" cy="78" rx="5" ry="3.5" fill="rgba(0,0,0,0.07)"/>
      {eyeStyle === 'normal'  && <EyeNormal />}
      {eyeStyle === 'wide'    && <EyeWide />}
      {eyeStyle === 'happy'   && <EyeHappy />}
      {eyeStyle === 'sleepy'  && <EyeSleepy s={s} />}
      {eyeStyle === 'winking' && <EyeWinking />}
      {browStyle === 'normal'   && <BrowNormal />}
      {browStyle === 'raised'   && <BrowRaised />}
      {browStyle === 'furrowed' && <BrowFurrowed />}
      {browStyle === 'arched'   && <BrowArched />}
      {mouthStyle === 'smile'     && <MouthSmile />}
      {mouthStyle === 'grin'      && <MouthGrin />}
      {mouthStyle === 'surprised' && <MouthSurprised />}
      {mouthStyle === 'pouty'     && <MouthPouty />}
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
        <rect x="58" y="132" width="84" height="96" rx="10" fill={c}/>
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
        <rect x="60" y="218" width="80" height="22" rx="4" fill={c}/>
        {/* center panel closes the gap between legs */}
        <rect x="92" y="237" width="16" height="106" fill={c}/>
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
        <rect x="60" y="218" width="80" height="18" rx="4" fill={c}/>
        {/* center panel closes the gap between legs */}
        <rect x="90" y="233" width="20" height="30" fill={c}/>
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
        <path d="M65,40 L65,18 L80,30 L100,13 L120,30 L135,18 L135,40 Z" fill={c}/>
        <rect x="63" y="36" width="74" height="14" rx="4" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Gems */}
        <circle cx="100" cy="22" r="5" fill="#e91e63"/>
        <circle cx="78" cy="28" r="4" fill="#4fc3f7"/>
        <circle cx="122" cy="28" r="4" fill="#4caf50"/>
      </g>
    );
    case 'cap': return (
      <g>
        <ellipse cx="100" cy="40" rx="45" ry="22" fill={c}/>
        {/* Brim */}
        <path d="M56,44 Q56,58 90,58 L90,46Z" fill={c} style={{filter:'brightness(.8)'}}/>
        {/* Button */}
        <circle cx="100" cy="22" r="5" fill={c} style={{filter:'brightness(.8)'}}/>
        {/* Line */}
        <line x1="57" y1="44" x2="143" y2="44" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
      </g>
    );
    case 'sunhat': return (
      <g>
        {/* Brim */}
        <ellipse cx="100" cy="44" rx="65" ry="14" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Dome */}
        <ellipse cx="100" cy="30" rx="42" ry="22" fill={c}/>
        {/* Band */}
        <ellipse cx="100" cy="44" rx="42" ry="8" fill="#ff6b6b" opacity=".7"/>
        {/* Flowers */}
        <text x="74" y="48" fontSize="14" textAnchor="middle">🌸</text>
        <text x="130" y="48" fontSize="14" textAnchor="middle">🌸</text>
      </g>
    );
    case 'beanie': return (
      <g>
        <ellipse cx="100" cy="42" rx="46" ry="24" fill={c}/>
        <rect x="54" y="37" width="92" height="18" rx="4" fill={c} style={{filter:'brightness(.85)'}}/>
        {/* Pompom */}
        <circle cx="100" cy="20" r="12" fill={c} style={{filter:'brightness(1.1)'}}/>
        <circle cx="100" cy="20" r="8" fill={c} style={{filter:'brightness(1.2)'}}/>
        {/* Ribbing lines */}
        {[66,78,90,102,114,126,138].map(x => (
          <line key={x} x1={x} y1="37" x2={x} y2="55" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
        ))}
      </g>
    );
    case 'bow': return (
      <g>
        {/* Big bow */}
        <ellipse cx="80" cy="28" rx="22" ry="14" fill={c} transform="rotate(-15 80 28)"/>
        <ellipse cx="120" cy="28" rx="22" ry="14" fill={c} transform="rotate(15 120 28)"/>
        <circle cx="100" cy="28" r="10" fill={c} style={{filter:'brightness(.9)'}}/>
        {/* Ribbons */}
        <path d="M90,36 Q80,48 70,63" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M110,36 Q120,48 130,63" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round"/>
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
function DollSVG({ outfit, scene }) {
  const { skin, hairStyle, hairColor, top, topColor, bottom, bottomColor,
          dress, dressColor, shoes, shoesColor, hat, hatColor, accessory, accColor,
          eyeStyle, browStyle, mouthStyle } = outfit;
  const s = skin || SKINS[1];
  const hasDress = dress && dress !== 'none';

  return (
    <svg viewBox="0 0 200 410" width={200} height={410} style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}>
      {/* 0. Scene background */}
      <SceneBackground scene={scene}/>
      {/* 1. Long hair / braids that hang behind the body */}
      <HairBack style={hairStyle} color={hairColor}/>
      {/* 2. Body skin */}
      <Body s={s}/>
      {/* 3. Shoes — rendered before clothing so skirts/bottoms cover boot tops */}
      <ShoesLayer shoes={shoes} color={shoesColor}/>
      {/* 4. Clothing */}
      {hasDress
        ? <DressLayer dress={dress} color={dressColor}/>
        : <>
            <TopLayer top={top} color={topColor} s={s}/>
            <BottomLayer bottom={bottom} color={bottomColor}/>
          </>
      }
      {/* 5. Hair cap/style — renders before head skin so head skin covers face center */}
      <HairFront style={hairStyle} color={hairColor}/>
      {/* 6. Head skin — covers center of any hair, leaving sides/top visible */}
      <HeadSkin s={s}/>
      {/* 7. Face features — always on top, always visible */}
      <FaceFeatures s={s} eyeStyle={eyeStyle} browStyle={browStyle} mouthStyle={mouthStyle}/>
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
  { id: 'face',      label: '😊 Face',    noColor: true,
    items: [
      { id:'eye_normal',    label:'Normal Eyes'  },
      { id:'eye_wide',      label:'Wide Eyes'    },
      { id:'eye_happy',     label:'Happy Eyes'   },
      { id:'eye_sleepy',    label:'Sleepy Eyes'  },
      { id:'eye_winking',   label:'Winking'      },
      { id:'__sep_brow__',  label:'── Brows ──',  isSep: true },
      { id:'brow_normal',   label:'Normal Brows' },
      { id:'brow_raised',   label:'Raised Brows' },
      { id:'brow_furrowed', label:'Fierce Brows' },
      { id:'brow_arched',   label:'Arched Brows' },
      { id:'__sep_mouth__', label:'── Mouth ──',  isSep: true },
      { id:'mouth_smile',     label:'Smile'      },
      { id:'mouth_grin',      label:'Big Grin'   },
      { id:'mouth_surprised', label:'Surprised!' },
      { id:'mouth_pouty',     label:'Pouty'      },
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
  eyeStyle: 'normal', browStyle: 'normal', mouthStyle: 'smile',
};

const PRESETS = [
  { id: 'princess', label: '👸 Princess', scene: 'none', outfit: {
    hairStyle: 'bun',      hairColor: HAIR_COLORS[5],
    top: 'tshirt',         topColor: '#e91e63',
    bottom: 'skirt',       bottomColor: '#9c27b0',
    dress: 'princess',     dressColor: '#e91e63',
    shoes: 'heels',        shoesColor: '#ffd93d',
    hat: 'crown',          hatColor: '#ffd93d',
    accessory: 'necklace', accColor: '#ffd93d',
    eyeStyle: 'wide', browStyle: 'arched', mouthStyle: 'smile',
  }},
  { id: 'beach', label: '🏖 Beach', scene: 'beach', outfit: {
    hairStyle: 'ponytail', hairColor: HAIR_COLORS[3],
    top: 'tank',           topColor: '#ff9800',
    bottom: 'shorts',      bottomColor: '#4fc3f7',
    dress: 'none',         dressColor: '#e91e63',
    shoes: 'flats',        shoesColor: '#f5deb3',
    hat: 'sunhat',         hatColor: '#ffd93d',
    accessory: 'bag',      accColor: '#ff9800',
    eyeStyle: 'happy', browStyle: 'raised', mouthStyle: 'grin',
  }},
  { id: 'sports', label: '⚽ Sports', scene: 'park', outfit: {
    hairStyle: 'ponytail', hairColor: HAIR_COLORS[1],
    top: 'tshirt',         topColor: '#4caf50',
    bottom: 'shorts',      bottomColor: '#212121',
    dress: 'none',         dressColor: '#e91e63',
    shoes: 'sneakers',     shoesColor: '#ffffff',
    hat: 'cap',            hatColor: '#4caf50',
    accessory: 'none',     accColor: '#ffd93d',
    eyeStyle: 'wide', browStyle: 'furrowed', mouthStyle: 'grin',
  }},
  { id: 'artist', label: '🎨 Artist', scene: 'none', outfit: {
    hairStyle: 'curly',    hairColor: HAIR_COLORS[6],
    top: 'blouse',         topColor: '#ff6b6b',
    bottom: 'miniskirt',   bottomColor: '#ffd93d',
    dress: 'none',         dressColor: '#e91e63',
    shoes: 'boots',        shoesColor: '#795548',
    hat: 'bow',            hatColor: '#9c27b0',
    accessory: 'glasses',  accColor: '#ffd93d',
    eyeStyle: 'happy', browStyle: 'arched', mouthStyle: 'smile',
  }},
  { id: 'party', label: '🎉 Party', scene: 'party', outfit: {
    hairStyle: 'afro',     hairColor: HAIR_COLORS[8],
    top: 'tank',           topColor: '#e91e63',
    bottom: 'skirt',       bottomColor: '#9c27b0',
    dress: 'none',         dressColor: '#e91e63',
    shoes: 'heels',        shoesColor: '#ffd93d',
    hat: 'none',           hatColor: '#ffd93d',
    accessory: 'necklace', accColor: '#e91e63',
    eyeStyle: 'winking', browStyle: 'raised', mouthStyle: 'grin',
  }},
];

export default function DressingDolls() {
  const [outfit,   setOutfit]   = useState(DEFAULT_OUTFIT);
  const [cat,      setCat]      = useState('hair');
  const [scene,    setScene]    = useState('none');
  const [flashing, setFlashing] = useState(false);

  const category = CATEGORIES.find(c => c.id === cat);

  const flash = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 300);
  };

  const pick = (itemId) => {
    flash();
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
        case 'face':
          if (itemId.startsWith('eye_'))   next.eyeStyle   = itemId.replace('eye_', '');
          if (itemId.startsWith('brow_'))  next.browStyle  = itemId.replace('brow_', '');
          if (itemId.startsWith('mouth_')) next.mouthStyle = itemId.replace('mouth_', '');
          break;
        default: break;
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
        default: break;
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

  const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomize = () => {
    flash();
    const useDress = Math.random() < 0.4;
    setOutfit(prev => ({
      ...prev,
      hairStyle:  randomFrom(['bob','long','curly','afro','pigtails','ponytail','braids','bun']),
      hairColor:  randomFrom(HAIR_COLORS),
      top:        useDress ? 'tshirt' : randomFrom(['tshirt','tank','hoodie','blouse']),
      topColor:   randomFrom(CLOTH_COLORS),
      bottom:     useDress ? 'skirt' : randomFrom(['jeans','skirt','shorts','miniskirt']),
      bottomColor:randomFrom(CLOTH_COLORS),
      dress:      useDress ? randomFrom(['princess','casual','tutu','summer']) : 'none',
      dressColor: randomFrom(CLOTH_COLORS),
      shoes:      randomFrom(['sneakers','boots','heels','flats']),
      shoesColor: randomFrom(CLOTH_COLORS),
      hat:        randomFrom(['none','none','crown','cap','sunhat','beanie','bow']),
      hatColor:   randomFrom(CLOTH_COLORS),
      accessory:  randomFrom(['none','none','glasses','necklace','bag','star']),
      accColor:   randomFrom(CLOTH_COLORS),
      eyeStyle:   randomFrom(EYE_STYLES),
      browStyle:  randomFrom(BROW_STYLES),
      mouthStyle: randomFrom(MOUTH_STYLES),
    }));
  };

  const applyPreset = (preset) => {
    flash();
    setOutfit(prev => ({ ...prev, ...preset.outfit }));
    setScene(preset.scene);
  };

  const isFaceActive = (itemId) => {
    if (itemId.startsWith('eye_'))   return outfit.eyeStyle   === itemId.replace('eye_', '');
    if (itemId.startsWith('brow_'))  return outfit.browStyle  === itemId.replace('brow_', '');
    if (itemId.startsWith('mouth_')) return outfit.mouthStyle === itemId.replace('mouth_', '');
    return false;
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
          {/* Scene selector strip */}
          <div className="doll-scene-strip">
            {SCENES.map(sc => (
              <button key={sc.id}
                className={`doll-scene-btn${scene === sc.id ? ' active' : ''}`}
                onClick={() => setScene(sc.id)}>
                {sc.label}
              </button>
            ))}
          </div>

          <div className={flashing ? 'doll-flash' : ''}>
            <DollSVG outfit={outfit} scene={scene}/>
          </div>

          <button className="btn btn-purple" style={{ marginTop:10, width:'100%' }} onClick={celebrate}>
            🎉 Show Off!
          </button>
          <button className="btn btn-green" style={{ marginTop:8, width:'100%' }} onClick={randomize}>
            🎲 Randomize!
          </button>
          <button className="btn btn-orange" style={{ marginTop:8, width:'100%' }}
            onClick={() => { setOutfit(DEFAULT_OUTFIT); setScene('none'); }}>
            ↺ Start Over
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="doll-controls">
          {/* Quick-look preset strip */}
          <div className="doll-preset-strip">
            <span className="doll-preset-label">Quick looks:</span>
            {PRESETS.map(p => (
              <button key={p.id} className="doll-preset-btn" onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>

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
            {cat === 'skin'
              ? category.items.map(it => (
                  <button key={it.id}
                    className={`doll-item-btn skin-btn${currentItem === it.id ? ' active' : ''}`}
                    style={{ background: it.swatch }}
                    onClick={() => pick(it.id)}
                  />
                ))
              : category?.items.map(it =>
                  it.isSep
                    ? <span key={it.id} className="doll-face-sep">{it.label}</span>
                    : <button key={it.id}
                        className={`doll-item-btn${(cat === 'face' ? isFaceActive(it.id) : currentItem === it.id) ? ' active' : ''}`}
                        onClick={() => pick(it.id)}>
                        {it.label}
                      </button>
                )
            }
          </div>

          {/* Color palette */}
          {!category?.noColor && (
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
