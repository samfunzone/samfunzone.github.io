import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

const SEQUENCE = ['soil', 'water', 'sun', 'water', 'sun'];

const TOOLS = {
  soil:  { emoji: '🪣', label: 'Soil' },
  water: { emoji: '💧', label: 'Water' },
  sun:   { emoji: '☀️', label: 'Sunshine' },
};

const SEEDS = [
  { id: 'sunflower', name: 'Sunflower',      emoji: '🌻', budColor: '#fdd835', budTip: '#f9a825', stemColor: '#33691e', leafColor: '#558b2f' },
  { id: 'rose',      name: 'Rose',            emoji: '🌹', budColor: '#e53935', budTip: '#b71c1c', stemColor: '#2e7d32', leafColor: '#388e3c' },
  { id: 'tulip',     name: 'Tulip',           emoji: '🌷', budColor: '#f06292', budTip: '#ad1457', stemColor: '#388e3c', leafColor: '#4caf50' },
  { id: 'daisy',     name: 'Daisy',           emoji: '🌼', budColor: '#fffde7', budTip: '#fdd835', stemColor: '#388e3c', leafColor: '#66bb6a' },
  { id: 'lavender',  name: 'Lavender',        emoji: '💜', budColor: '#ce93d8', budTip: '#7b1fa2', stemColor: '#558b2f', leafColor: '#7cb342' },
  { id: 'cherry',    name: 'Cherry Blossom',  emoji: '🌸', budColor: '#f8bbd0', budTip: '#e91e63', stemColor: '#5d4037', leafColor: '#8bc34a' },
];

const HINTS = [
  'Pour some soil into the pot!',
  'Give the soil a good drink of water!',
  'Let the warm sunshine in!',
  'Your tiny sprout is thirsty — water it!',
  'One last burst of sunshine to bloom!',
];

/* ── Flower blooms (all drawn so petals sit above y≈72 where stem ends) ── */

function SunflowerBloom() {
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * 22.5, rad = a * Math.PI / 180;
        const px = 110 + 30 * Math.cos(rad), py = 52 + 30 * Math.sin(rad);
        return <ellipse key={i} cx={px} cy={py} rx="13" ry="5.5" fill="#fdd835" transform={`rotate(${a} ${px} ${py})`} />;
      })}
      <circle cx="110" cy="52" r="22" fill="#3e2000" />
      <circle cx="110" cy="52" r="16" fill="#4e2800" />
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const r = a * Math.PI / 180;
        return <circle key={i} cx={110 + 8 * Math.cos(r)} cy={52 + 8 * Math.sin(r)} r="2.2" fill="#6d3800" />;
      })}
      {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((a, i) => {
        const r = a * Math.PI / 180;
        return <circle key={i} cx={110 + 13 * Math.cos(r)} cy={52 + 13 * Math.sin(r)} r="1.5" fill="#5a3000" />;
      })}
    </g>
  );
}

function RoseBloom() {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = a * Math.PI / 180;
        const px = 110 + 20 * Math.cos(rad), py = 55 + 20 * Math.sin(rad);
        return (
          <ellipse key={i} cx={px} cy={py} rx="18" ry="11"
            fill="#e53935" stroke="#c62828" strokeWidth="0.5"
            transform={`rotate(${a} ${px} ${py})`} opacity="0.92" />
        );
      })}
      {[36, 108, 180, 252, 324].map((a, i) => {
        const rad = a * Math.PI / 180;
        const px = 110 + 11 * Math.cos(rad), py = 55 + 11 * Math.sin(rad);
        return (
          <ellipse key={i} cx={px} cy={py} rx="14" ry="9"
            fill="#c62828"
            transform={`rotate(${a} ${px} ${py})`} />
        );
      })}
      <circle cx="110" cy="55" r="10" fill="#b71c1c" />
      <ellipse cx="108" cy="53" rx="5" ry="7" fill="#c62828" transform="rotate(-20 108 53)" />
      <ellipse cx="113" cy="51" rx="4" ry="6" fill="#d32f2f" transform="rotate(20 113 51)" />
    </g>
  );
}

function TulipBloom() {
  // Base of cup at y=73, tip at y=20
  return (
    <g>
      <path d="M110,73 Q80,56 84,30 Q98,16 110,36 Z" fill="#e91e63" />
      <path d="M110,73 Q140,56 136,30 Q122,16 110,36 Z" fill="#e91e63" />
      <path d="M110,73 Q93,46 110,22 Q127,46 110,73 Z" fill="#f06292" />
      <path d="M110,70 Q92,52 94,34 Q103,24 110,38 Z" fill="#f48fb1" opacity="0.65" />
      <path d="M110,70 Q128,52 126,34 Q117,24 110,38 Z" fill="#f48fb1" opacity="0.65" />
      <path d="M106,65 Q103,47 108,30" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

function DaisyBloom() {
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const a = i * (360 / 14), rad = a * Math.PI / 180;
        const px = 110 + 27 * Math.cos(rad), py = 52 + 27 * Math.sin(rad);
        return (
          <ellipse key={i} cx={px} cy={py} rx="12" ry="5"
            fill="#fffde7" stroke="#f0ead8" strokeWidth="0.5"
            transform={`rotate(${a} ${px} ${py})`} />
        );
      })}
      <circle cx="110" cy="52" r="17" fill="#fdd835" />
      <circle cx="110" cy="52" r="11" fill="#f9a825" />
      {[0, 60, 120, 180, 240, 300].map((a, i) => {
        const r = a * Math.PI / 180;
        return <circle key={i} cx={110 + 6 * Math.cos(r)} cy={52 + 6 * Math.sin(r)} r="2.2" fill="#f57f17" opacity="0.8" />;
      })}
    </g>
  );
}

function LavenderBloom() {
  // Spike of florets arranged from y=72 up to y=28
  const florets = [
    { x: 110, y: 68, rx: 7,   ry: 4.5 },
    { x: 96,  y: 60, rx: 6.5, ry: 4   },
    { x: 124, y: 58, rx: 6.5, ry: 4   },
    { x: 103, y: 50, rx: 6,   ry: 3.8 },
    { x: 117, y: 48, rx: 6,   ry: 3.8 },
    { x: 107, y: 40, rx: 5.5, ry: 3.5 },
    { x: 113, y: 38, rx: 5.5, ry: 3.5 },
    { x: 110, y: 30, rx: 5,   ry: 3   },
  ];
  return (
    <g>
      {florets.map((f, i) => (
        <g key={i}>
          <ellipse cx={f.x} cy={f.y} rx={f.rx} ry={f.ry}
            fill="#9c27b0" opacity={0.9 - i * 0.05} />
          <ellipse cx={f.x} cy={f.y - 0.5} rx={f.rx * 0.6} ry={f.ry * 0.55}
            fill="#e1bee7" opacity={0.8 - i * 0.04} />
        </g>
      ))}
    </g>
  );
}

function CherryBloom() {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = a * Math.PI / 180;
        const px = 110 + 22 * Math.cos(rad), py = 52 + 22 * Math.sin(rad);
        return (
          <ellipse key={i} cx={px} cy={py} rx="17" ry="10"
            fill="#fce4ec" stroke="#f8bbd0" strokeWidth="1"
            transform={`rotate(${a} ${px} ${py})`} />
        );
      })}
      <circle cx="110" cy="52" r="10" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="1" />
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a, i) => {
        const r = a * Math.PI / 180;
        const x1 = 110 + 5 * Math.cos(r),  y1 = 52 + 5 * Math.sin(r);
        const x2 = 110 + 14 * Math.cos(r), y2 = 52 + 14 * Math.sin(r);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f06292" strokeWidth="1" />
            <circle cx={x2} cy={y2} r="2" fill="#e91e63" />
          </g>
        );
      })}
    </g>
  );
}

function FlowerBloom({ seedId }) {
  switch (seedId) {
    case 'sunflower': return <SunflowerBloom />;
    case 'rose':      return <RoseBloom />;
    case 'tulip':     return <TulipBloom />;
    case 'daisy':     return <DaisyBloom />;
    case 'lavender':  return <LavenderBloom />;
    case 'cherry':    return <CherryBloom />;
    default:          return null;
  }
}

/* ── Plant SVG ── */
function PlantSVG({ stage, animating, seed }) {
  const soilFill   = stage >= 2 ? '#4e342e' : '#795548';
  const stemColor  = seed?.stemColor  ?? '#388e3c';
  const leafColor  = seed?.leafColor  ?? '#66bb6a';
  const leafColor2 = seed?.leafColor  ?? '#4caf50';
  const budColor   = seed?.budColor   ?? '#81c784';
  const budTip     = seed?.budTip     ?? '#ff8a65';

  const stemY = stage >= 5 ? 72 : stage >= 4 ? 108 : 148;

  return (
    <svg viewBox="0 0 220 300" width="100%" style={{ maxWidth: 220 }}>
      <defs>
        <radialGradient id="grd-pot" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e64a19" />
          <stop offset="100%" stopColor="#bf360c" />
        </radialGradient>
        <radialGradient id="grd-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="100%" stopColor="#ffd54f" />
        </radialGradient>
      </defs>

      {/* Sky */}
      {stage >= 3 && (
        <rect x="0" y="0" width="220" height="162" rx="14" fill="#e3f2fd" opacity="0.7" />
      )}

      {/* Animating sun */}
      {animating === 'sun' && (
        <g className="garden-sun-anim">
          <circle cx="36" cy="36" r="22" fill="url(#grd-sun)" opacity="0.95" />
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = a * Math.PI / 180;
            return (
              <line key={a}
                x1={36 + 26 * Math.cos(rad)} y1={36 + 26 * Math.sin(rad)}
                x2={36 + 38 * Math.cos(rad)} y2={36 + 38 * Math.sin(rad)}
                stroke="#ffd54f" strokeWidth="4" strokeLinecap="round" />
            );
          })}
        </g>
      )}

      {/* Water drops */}
      {animating === 'water' && [-22, 0, 22].map((dx, i) => (
        <ellipse key={i}
          cx={110 + dx} cy={155} rx="5" ry="8"
          fill="#4fc3f7" opacity="0.85"
          className={`garden-drop garden-drop-${i}`} />
      ))}

      {/* Soil */}
      {stage >= 1 && (
        <ellipse cx="110" cy="173" rx="52" ry="13" fill={soilFill} />
      )}

      {/* Tiny seed sitting on soil at stage 1 */}
      {stage === 1 && seed && (
        <text x="110" y="168" textAnchor="middle" fontSize="16" style={{ userSelect: 'none' }}>
          {seed.emoji}
        </text>
      )}

      {/* Stem */}
      {stage >= 3 && (
        <line x1="110" y1="172" x2="110" y2={stemY}
          stroke={stemColor} strokeWidth="7" strokeLinecap="round" />
      )}

      {/* Small leaves (stage 3) */}
      {stage === 3 && (
        <g>
          <ellipse cx="94"  cy="155" rx="14" ry="7" fill={leafColor}  transform="rotate(-35 94 155)" />
          <ellipse cx="126" cy="152" rx="14" ry="7" fill={leafColor}  transform="rotate(35 126 152)" />
        </g>
      )}

      {/* Big leaves (stage 4+) */}
      {stage >= 4 && (
        <g>
          <ellipse cx="88"  cy="125" rx="20" ry="9" fill={leafColor2} transform="rotate(-40 88 125)" />
          <ellipse cx="132" cy="120" rx="20" ry="9" fill={leafColor2} transform="rotate(40 132 120)" />
          <ellipse cx="93"  cy="152" rx="15" ry="7" fill={leafColor}  transform="rotate(-35 93 152)" />
          <ellipse cx="127" cy="150" rx="15" ry="7" fill={leafColor}  transform="rotate(35 127 150)" />
        </g>
      )}

      {/* Bud (stage 4 only) */}
      {stage === 4 && (
        <g>
          <ellipse cx="110" cy="102" rx="12" ry="16" fill={budColor} />
          <ellipse cx="110" cy="98"  rx="8"  ry="10" fill={budTip} opacity="0.8" />
        </g>
      )}

      {/* Full flower (stage 5) */}
      {stage >= 5 && (
        <g className="garden-flower-bloom">
          <FlowerBloom seedId={seed?.id} />
        </g>
      )}

      {/* Pot rim */}
      <rect x="50" y="161" width="120" height="16" rx="5" fill="#6d2f0e" />
      {/* Pot body */}
      <path d="M58,177 L74,268 Q74,278 83,278 L137,278 Q146,278 146,268 L162,177 Z"
        fill="url(#grd-pot)" />
      {/* Pot highlight */}
      <path d="M68,182 L80,264" stroke="rgba(255,255,255,0.2)" strokeWidth="7" strokeLinecap="round" />
      {/* Saucer */}
      <ellipse cx="110" cy="278" rx="46" ry="10" fill="#6d2f0e" />
      <ellipse cx="110" cy="276" rx="40" ry="7"  fill="#a0522d" />
    </svg>
  );
}

/* ── Main Component ── */
export default function EnchantedGarden() {
  const [seed,      setSeed]      = useState(null);
  const [stage,     setStage]     = useState(0);
  const [animating, setAnimating] = useState(null);
  const [wrong,     setWrong]     = useState(null);

  const done     = stage >= 5;
  const nextTool = done ? null : SEQUENCE[stage];

  const chooseSeed = (s) => { setSeed(s); setStage(0); };

  const applyTool = (toolId) => {
    if (done || animating) return;
    if (toolId !== nextTool) {
      setWrong(toolId);
      setTimeout(() => setWrong(null), 600);
      return;
    }
    setAnimating(toolId);
    setTimeout(() => {
      setAnimating(null);
      setStage(s => {
        const next = s + 1;
        if (next >= 5) {
          setTimeout(() => launchConfetti(window.innerWidth / 2, 180, 90), 300);
        }
        return next;
      });
    }, toolId === 'soil' ? 400 : 1000);
  };

  const reset = () => {
    setSeed(null);
    setStage(0);
    setAnimating(null);
    setWrong(null);
  };

  /* ── Seed picker screen ── */
  if (!seed) {
    return (
      <div className="card card-green">
        <h2>🌸 The Enchanted Garden</h2>
        <p className="garden-hint">Pick a seed to plant!</p>
        <div className="garden-seed-grid">
          {SEEDS.map(s => (
            <button key={s.id} className="garden-seed-btn" onClick={() => chooseSeed(s)}>
              <span className="garden-seed-emoji">{s.emoji}</span>
              <span className="garden-seed-name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Game screen ── */
  return (
    <div className="card card-green">
      <h2>🌸 The Enchanted Garden</h2>

      <p className="garden-hint">
        {done
          ? `Your ${seed.name} is blooming beautifully! ${seed.emoji}`
          : HINTS[stage]}
      </p>

      <div className="garden-viz">
        <PlantSVG stage={stage} animating={animating} seed={seed} />
      </div>

      <div className="garden-progress">
        {SEQUENCE.map((_, i) => (
          <div key={i}
            className={`garden-dot${i < stage ? ' done' : i === stage && !done ? ' active' : ''}`} />
        ))}
      </div>

      {!done && (
        <div className="garden-tools">
          {Object.entries(TOOLS).map(([id, info]) => (
            <button key={id}
              className={[
                'garden-tool-btn',
                id === nextTool ? 'needed' : '',
                id === wrong    ? 'wrong'  : '',
              ].join(' ').trim()}
              onClick={() => applyTool(id)}>
              <span className="garden-tool-emoji">{info.emoji}</span>
              <span className="garden-tool-label">{info.label}</span>
            </button>
          ))}
        </div>
      )}

      {done && (
        <div className="garden-done">
          <p>Your plant grew all by itself with a little help from you!</p>
          <button className="btn btn-green" onClick={reset}>Grow Another Plant!</button>
        </div>
      )}
    </div>
  );
}
