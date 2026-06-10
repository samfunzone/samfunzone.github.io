import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';
import { mix, lighten, darken } from '../utils/color';

const TEAS = [
  { id: 'milk',        name: 'Milk Tea',     color: '#c8956c', foam: '#fff3e0' },
  { id: 'taro',        name: 'Taro',         color: '#b57bee', foam: '#ede7f6' },
  { id: 'matcha',      name: 'Matcha',       color: '#66bb6a', foam: '#e8f5e9' },
  { id: 'strawberry',  name: 'Strawberry',   color: '#ef5350', foam: '#fce4ec' },
  { id: 'mango',       name: 'Mango',        color: '#ffa726', foam: '#fff8e1' },
  { id: 'brown_sugar', name: 'Brown Sugar',  color: '#8d6e63', foam: '#efebe9' },
  { id: 'lychee',      name: 'Lychee',       color: '#f48fb1', foam: '#fce4ec' },
  { id: 'passion',     name: 'Passion Fruit',color: '#ff7043', foam: '#fbe9e7' },
];

const TOPPINGS = [
  { id: 'classic', name: '⚫ Classic Pearls',  color: '#1a0800', r: 9  },
  { id: 'golden',  name: '🟡 Golden Pearls',   color: '#c8a000', r: 9  },
  { id: 'popping', name: '🔴 Popping Boba',    color: '#e53935', r: 8  },
  { id: 'crystal', name: '🔵 Crystal Boba',    color: '#4fc3f7', r: 8  },
  { id: 'jelly',   name: '💚 Coconut Jelly',   color: '#a5d6a7', r: 7, square: true },
  { id: 'pudding', name: '🟨 Egg Pudding',     color: '#ffe082', r: 11, square: true },
];

const SIZES = [
  { id: 'small',  label: 'Small 🥤',  scale: 0.78 },
  { id: 'medium', label: 'Medium 🧋', scale: 0.91 },
  { id: 'large',  label: 'Large 🫙',  scale: 1.0  },
];

const STEPS = ['size', 'tea', 'toppings', 'customize', 'shake', 'enjoy'];

// Glossy gradient stops per topping: [offset%, color, opacity].
// Crystal boba is translucent; popping boba slightly juicy/see-through.
const pearlStops = t => t.id === 'crystal'
  ? [[0, lighten(t.color, .6), .5], [55, t.color, .65], [100, darken(t.color, .2), .85]]
  : t.id === 'popping'
  ? [[0, lighten(t.color, .6), .9], [50, t.color, .95], [100, darken(t.color, .3), 1]]
  : [[0, lighten(t.color, .55), 1], [55, t.color, 1], [100, darken(t.color, .35), 1]];

// [cx, cy, r, duration s, delay s] — rising bubbles inside the liquid
const BUBBLES = [
  [55, 250, 2.5, 3.2, 0], [75, 258, 2, 3.8, 0.9], [95, 252, 3, 3.4, 1.7],
  [110, 246, 2.2, 4.2, 0.4], [65, 240, 1.8, 3.6, 2.3], [88, 244, 2.6, 3.0, 1.2],
];

// [x, y, r, dripDelay s | null] — condensation droplets on the lower cup wall
const DROPS = [
  [38, 195, 2.4, null], [121, 182, 2, 0.6], [45, 235, 2.1, null],
  [116, 228, 2.7, 2.2], [59, 256, 1.7, null], [101, 258, 2.2, null], [34, 168, 1.5, null],
];

// [x, y, scale, delay s] — celebratory sparkles around the finished cup
const SPARKLES = [
  [14, 70, 1, 0], [148, 100, 0.8, 0.35], [10, 150, 0.7, 0.7],
  [150, 190, 1, 1.05], [24, 230, 0.8, 1.4],
];

let pid = 0;

/* ── Cup SVG ── */
function BobaViz({ size, tea, pearls, ice, sweetness, shaking, done, pearlPositions, icePositions }) {
  const sc = (SIZES.find(s => s.id === size) || SIZES[1]).scale;
  const W = 160, H = 310;
  // Cup path (trapezoid, wider top)
  const cup = `M22,40 L138,40 L120,282 Q120,294 107,294 L53,294 Q40,294 40,282 Z`;
  const clipId = 'boba-clip';

  const teaColor  = tea?.color ?? '#c8956c';
  const foamColor = tea?.foam  ?? '#fff3e0';

  // Tea fill (% of cup height)
  const teaY = tea ? 80 : H;
  const teaH = H - teaY;

  // Ice blocks — use shuffled positions after shaking, fixed grid before
  const defaultIce = ice === 'none' ? [] : ice === 'normal'
    ? [[30,100],[80,110],[50,160],[100,150]]
    : [[25,95],[65,105],[105,95],[35,155],[80,165],[110,150],[55,215],[95,200]];
  const iceBlocks = icePositions ?? defaultIce;

  // Pearl grid — use shuffled positions after shaking, fixed grid before
  const pearlRows = pearls.map((p, i) => {
    if (pearlPositions) {
      const pos = pearlPositions[i];
      if (!pos) return null; // safety: fewer slots than pearls
      return { ...p, cx: pos.cx, cy: pos.cy };
    }
    const row = Math.floor(i / 5), col = i % 5;
    return { ...p, cx: 48 + col * 16, cy: 268 - row * 20 };
  });

  // Wavy foam band (top of liquid, fixed at y=80; whole surface group slides up)
  const foamPath =
    'M0,80 H160 V94 ' +
    'q-10,7 -20,0 q-10,-7 -20,0 q-10,7 -20,0 q-10,-7 -20,0 ' +
    'q-10,7 -20,0 q-10,-7 -20,0 q-10,7 -20,0 q-10,-7 -20,0 Z';

  return (
    <div className={`boba-cup-wrap${shaking ? ' shaking' : ''}${done ? ' floating' : ''}`}
         style={{ '--sc': sc }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}>
        <defs>
          <clipPath id={clipId}>
            <path d={cup} />
          </clipPath>

          {/* Plastic cup wall sheen */}
          <linearGradient id="boba-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fff" stopOpacity=".4" />
            <stop offset="18%"  stopColor="#fff" stopOpacity=".05" />
            <stop offset="45%"  stopColor="#fff" stopOpacity=".14" />
            <stop offset="75%"  stopColor="#fff" stopOpacity=".03" />
            <stop offset="100%" stopColor="#fff" stopOpacity=".3" />
          </linearGradient>
          <linearGradient id="boba-streak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fff" stopOpacity=".8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="boba-lid-dome" cx="35%" cy="25%" r="90%">
            <stop offset="0%"   stopColor="#fff"    stopOpacity=".95" />
            <stop offset="55%"  stopColor="#eaf3fa" stopOpacity=".55" />
            <stop offset="100%" stopColor="#cfe0ee" stopOpacity=".35" />
          </radialGradient>
          <linearGradient id="boba-ice" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#f2fbff" stopOpacity=".95" />
            <stop offset="50%"  stopColor="#b8e2ff" stopOpacity=".55" />
            <stop offset="100%" stopColor="#d8f0ff" stopOpacity=".85" />
          </linearGradient>
          <radialGradient id="boba-shadow">
            <stop offset="0%"   stopColor="#000" stopOpacity=".25" />
            <stop offset="70%"  stopColor="#000" stopOpacity=".1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="boba-drop" cx="35%" cy="30%" r="80%">
            <stop offset="0%"   stopColor="#fff"    stopOpacity=".95" />
            <stop offset="60%"  stopColor="#dff1ff" stopOpacity=".5" />
            <stop offset="100%" stopColor="#bcdcf5" stopOpacity=".15" />
          </radialGradient>

          {/* Glossy tapioca gradients, one per topping */}
          {TOPPINGS.map(t => (
            <radialGradient key={t.id} id={`boba-pearl-${t.id}`} cx="35%" cy="30%" r="75%">
              {pearlStops(t).map(([off, col, op]) => (
                <stop key={off} offset={`${off}%`} stopColor={col} stopOpacity={op} />
              ))}
            </radialGradient>
          ))}

          {/* Tea-tinted gradients (stops recomputed when tea changes) */}
          <linearGradient id="boba-tea-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lighten(teaColor, .18)} />
            <stop offset="45%"  stopColor={teaColor} />
            <stop offset="100%" stopColor={darken(teaColor, .22)} />
          </linearGradient>
          <linearGradient id="boba-foam-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={foamColor} />
            <stop offset="100%" stopColor={mix(foamColor, teaColor, .45)} />
          </linearGradient>
          <linearGradient id="boba-straw-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={darken(teaColor, .2)} />
            <stop offset="35%"  stopColor={lighten(teaColor, .35)} />
            <stop offset="60%"  stopColor={teaColor} />
            <stop offset="100%" stopColor={darken(teaColor, .3)} />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="80" cy="299" rx="56" ry="8" fill="url(#boba-shadow)" />

        {/* ── Contents (clipped) ── */}
        <g clipPath={`url(#${clipId})`}>

          {/* Tea liquid (rises when poured) */}
          <rect x="0" y={teaY} width={W} height={teaH}
                fill={tea ? 'url(#boba-tea-grad)' : 'none'} opacity={0.92}
                style={{ transition: 'y 0.6s ease, height 0.6s ease' }} />

          {/* Syrup tint — live sweetness feedback */}
          <rect x="0" y={teaY} width={W} height={teaH}
                fill={darken(teaColor, .3)}
                opacity={tea ? (sweetness / 100) * 0.3 : 0}
                style={{ transition: 'y 0.6s ease, height 0.6s ease, opacity 0.4s ease' }} />

          {/* Brown sugar tiger stripes down the cup walls */}
          {tea?.id === 'brown_sugar' && (
            <g opacity=".6">
              <path d="M36,95 Q30,170 44,265"   stroke={darken('#8d6e63', .45)} strokeWidth="6"   fill="none" strokeLinecap="round" />
              <path d="M52,90 Q48,180 58,268"   stroke={darken('#8d6e63', .4)}  strokeWidth="4"   fill="none" strokeLinecap="round" />
              <path d="M108,92 Q112,170 102,266" stroke={darken('#8d6e63', .45)} strokeWidth="5"   fill="none" strokeLinecap="round" />
              <path d="M124,95 Q128,180 114,262" stroke={darken('#8d6e63', .4)}  strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Foam band + surface (slides up with the pour, sloshes on shake) */}
          <g className={`boba-surface${shaking ? ' sloshing' : ''}`}
             style={{ transform: `translateY(${tea ? 0 : 230}px)`, transition: 'transform 0.6s ease', opacity: tea ? 1 : 0 }}>
            <path d={foamPath} fill={tea ? 'url(#boba-foam-grad)' : 'none'} opacity=".9" />
            <ellipse cx="80" cy="80" rx="58" ry="7"
                     fill={lighten(foamColor, .3)} opacity=".8"
                     stroke={mix(foamColor, teaColor, .5)} strokeWidth="1" />
          </g>

          {/* Rising bubbles */}
          {tea && !shaking && BUBBLES.map(([bx, by, br, dur, del], i) => (
            <circle key={i} className="boba-bubble" cx={bx} cy={by} r={br}
                    fill="rgba(255,255,255,.45)"
                    style={{ animationDuration: `${dur}s`, animationDelay: `${del}s` }} />
          ))}

          {/* Ice cubes — translucent, faceted, slightly rotated */}
          {tea && iceBlocks.map(([ix, iy], i) => (
            <g key={`${ice}-${i}`} className="boba-ice-cube" style={{ animationDelay: `${i * 90}ms` }}>
              <g transform={`rotate(${((i * 47) % 21) - 10} ${ix + 14} ${iy + 11})`}>
                <rect x={ix} y={iy} width="28" height="22" rx="5"
                      fill="url(#boba-ice)" stroke="rgba(255,255,255,.8)" strokeWidth="1.5" />
                <polyline points={`${ix + 5},${iy + 16} ${ix + 10},${iy + 5} ${ix + 17},${iy + 12}`}
                          fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.2" />
                <line x1={ix + 19} y1={iy + 17} x2={ix + 23} y2={iy + 8}
                      stroke="rgba(255,255,255,.6)" strokeWidth="1" />
              </g>
            </g>
          ))}

          {/* Pearls / toppings — glossy, drop-in on add, tumble on shake */}
          <g className={`boba-pearls${shaking ? ' tumbling' : ''}`}>
            {pearlRows.filter(Boolean).map((p, i) => (
              <g key={p.id} className="boba-pearl" style={{ animationDelay: `${(i % 5) * 70}ms` }}>
                {p.square
                  ? <rect x={p.cx - p.r} y={p.cy - p.r}
                          width={p.r * 2} height={p.r * 2} rx="3"
                          fill={`url(#boba-pearl-${p.top})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1"
                          style={{ transition: 'x 0.5s ease, y 0.5s ease' }} />
                  : <circle cx={p.cx} cy={p.cy} r={p.r}
                            fill={`url(#boba-pearl-${p.top})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1"
                            style={{ transition: 'cx 0.5s ease, cy 0.5s ease' }} />}
                <ellipse cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.35}
                         rx={p.r * 0.32} ry={p.r * 0.2}
                         fill="rgba(255,255,255,.65)"
                         style={{ transition: 'cx 0.5s ease, cy 0.5s ease' }} />
              </g>
            ))}
          </g>
        </g>

        {/* Pour stream + splash — keyed remount replays it on each tea pick */}
        {tea && (
          <g key={`pour-${tea.id}`} className="boba-pour">
            <rect x="74" y="10" width="8" height="70" rx="4" fill={lighten(teaColor, .15)} opacity=".9" />
            <ellipse cx="78" cy="80" rx="16" ry="5" fill={lighten(teaColor, .3)} opacity=".8" />
          </g>
        )}

        {/* ── Cup shell (glass sheen over contents) ── */}
        <path d={cup} fill="url(#boba-glass)" stroke="rgba(140,160,180,.85)" strokeWidth="2.5" />
        <path d="M36,60 Q40,160 46,250"  stroke="url(#boba-streak)" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".7" />
        <path d="M118,60 Q116,150 112,220" stroke="url(#boba-streak)" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".5" />
        <path d="M24,42 L136,42" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" />

        {/* Condensation droplets (when iced) */}
        {tea && ice !== 'none' && DROPS.map(([dx, dy, dr, drip], i) => (
          <ellipse key={i} cx={dx} cy={dy} rx={dr} ry={dr * 1.35}
                   fill="url(#boba-drop)" opacity=".75"
                   className={drip != null ? 'boba-drip' : undefined}
                   style={drip != null ? { animationDelay: `${drip}s` } : undefined} />
        ))}

        {/* ── Sealed dome lid + straw (only when done) ── */}
        {done && (
          <g className="boba-lid-group">
            <path d="M18,40 Q80,-6 142,40 Z" fill="url(#boba-lid-dome)" stroke="rgba(160,175,190,.9)" strokeWidth="2" />
            <rect x="16" y="36" width="128" height="7" rx="3.5"
                  fill="rgba(255,255,255,.75)" stroke="rgba(170,185,200,.8)" strokeWidth="1" />
            <path d="M38,26 Q60,8 96,12" stroke="rgba(255,255,255,.85)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        )}
        {done && (
          <g className="boba-straw-group">
            <g transform="rotate(8 95 40)">
              <rect x="89" y="-28" width="13" height="128" rx="2"
                    fill="url(#boba-straw-grad)" stroke={darken(teaColor, .25)} strokeWidth="1" opacity=".95" />
              <ellipse cx="95.5" cy="-28" rx="6.5" ry="2.6" fill={darken(teaColor, .3)} />
              <rect x="91.5" y="-26" width="2.5" height="122" rx="1.25" fill="rgba(255,255,255,.5)" />
            </g>
          </g>
        )}

        {/* Sparkles around the finished cup */}
        {done && SPARKLES.map(([sx, sy, s, del], i) => (
          <g key={i} transform={`translate(${sx},${sy}) scale(${s})`}>
            <path className="boba-sparkle" style={{ animationDelay: `${del}s` }}
                  d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z"
                  fill="#ffd93d" />
          </g>
        ))}

        {/* Sweetness label */}
        {done && (
          <text x="80" y="320" textAnchor="middle"
                fontSize="11" fill="#9c27b0" fontWeight="bold" fontFamily="inherit">
            {sweetness}% sweet
          </text>
        )}
      </svg>
    </div>
  );
}

/* ── Main Component ── */
export default function MakingBoba() {
  const [step,      setStep]      = useState(0);
  const [size,      setSize]      = useState(null);
  const [tea,       setTea]       = useState(null);
  const [pearls,    setPearls]    = useState([]);
  const [activeTop, setActiveTop] = useState(TOPPINGS[0]);
  const [sweetness, setSweetness] = useState(75);
  const [ice,       setIce]       = useState('normal');
  const [shaking,       setShaking]       = useState(false);
  const [pearlPositions, setPearlPositions] = useState(null);
  const [icePositions,   setIcePositions]   = useState(null);

  const done = step === 5;

  const addPearl = () => {
    if (pearls.length >= 35) return;
    const toAdd = Math.min(5, 35 - pearls.length);
    setPearls(p => [...p, ...Array.from({ length: toAdd }, () => ({ ...activeTop, top: activeTop.id, id: pid++ }))]);
  };

  const shake = () => {
    setShaking(true);

    // Generate every valid pearl-sized slot in a dense grid across the whole
    // cup, then pick n at random — guarantees no empty holes.
    // STEP=16 ensures we always have ≥35 slots (the pearl cap).
    const STEP = 16;
    const Y_TOP = 94, Y_BOT = 265;
    const allSlots = [];
    for (let cy = Y_TOP + STEP / 2; cy <= Y_BOT; cy += STEP) {
      const t  = Math.max(0, Math.min(1, (cy - 40) / 242));
      const lx = 22 + 18 * t + 12;
      const rx = 138 - 18 * t - 12;
      for (let cx = lx + STEP / 2; cx <= rx - STEP / 2; cx += STEP) {
        allSlots.push({ cx, cy });
      }
    }
    for (let i = allSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
    }
    // clamp in case cup geometry yields fewer slots than pearls
    setPearlPositions(allSlots.slice(0, Math.min(pearls.length, allSlots.length)));

    // Ice: same approach with a larger step sized for the 28×22 ice block
    const iceCount = ice === 'none' ? 0 : ice === 'normal' ? 4 : 8;
    const ICE_STEP = 32;
    const iceSlots = [];
    for (let iy = Y_TOP + ICE_STEP / 2; iy <= Y_BOT; iy += ICE_STEP) {
      const t  = Math.max(0, Math.min(1, (iy - 40) / 242));
      const lx = 22 + 18 * t + 14;
      const rx = 138 - 18 * t - 42; // 28px block width + margin
      for (let ix = lx; ix <= rx; ix += ICE_STEP) {
        iceSlots.push([ix, iy]);
      }
    }
    for (let i = iceSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [iceSlots[i], iceSlots[j]] = [iceSlots[j], iceSlots[i]];
    }
    setIcePositions(iceSlots.slice(0, Math.min(iceCount, iceSlots.length)));

    setTimeout(() => { setShaking(false); setStep(5); launchConfetti(window.innerWidth/2, 200, 60); }, 1800);
  };

  const reset = () => {
    setStep(0); setSize(null); setTea(null);
    setPearls([]); setSweetness(75); setIce('normal');
    setShaking(false); setPearlPositions(null); setIcePositions(null);
  };

  const drinkName = tea
    ? `${sweetness < 50 ? 'Light' : sweetness < 85 ? 'Classic' : 'Extra Sweet'} ${(SIZES.find(s=>s.id===size)||SIZES[1]).label.split(' ')[0]} ${tea.name} Boba`
    : 'Boba Tea';

  /* ── Step panels ── */
  const panels = [
    /* 0: size */
    <div key="size" className="boba-panel">
      <h3>Pick your cup size!</h3>
      <div className="boba-choices">
        {SIZES.map(s => (
          <button key={s.id}
            className={`boba-choice-btn${size === s.id ? ' selected' : ''}`}
            onClick={() => setSize(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="boba-nav">
        <button className="btn btn-purple" disabled={!size} onClick={() => setStep(1)}>Next ➜</button>
      </div>
    </div>,

    /* 1: tea */
    <div key="tea" className="boba-panel">
      <h3>Choose your tea!</h3>
      <div className="boba-choices boba-tea-grid">
        {TEAS.map(t => (
          <button key={t.id}
            className={`boba-tea-btn${tea?.id === t.id ? ' selected' : ''}`}
            style={{ '--c': t.color }}
            onClick={() => setTea(t)}>
            <span className="boba-tea-drop" />
            {t.name}
          </button>
        ))}
      </div>
      <div className="boba-nav">
        <button className="btn btn-orange" onClick={() => setStep(0)}>◀ Back</button>
        <button className="btn btn-purple" disabled={!tea} onClick={() => setStep(2)}>Next ➜</button>
      </div>
    </div>,

    /* 2: toppings */
    <div key="toppings" className="boba-panel">
      <h3>Add your toppings!</h3>
      <div className="boba-choices" style={{ flexDirection:'column', gap:8, alignItems:'flex-start' }}>
        {TOPPINGS.map(t => (
          <button key={t.id}
            className={`boba-topping-btn${activeTop.id === t.id ? ' selected' : ''}`}
            onClick={() => setActiveTop(t)}>
            <span className="topping-swatch"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${lighten(t.color, .55)}, ${t.color} 60%, ${darken(t.color, .3)})`,
                borderRadius: t.square ? 3 : '50%',
              }} />
            {t.name}
          </button>
        ))}
      </div>
      <button className="btn btn-green drop-btn" onClick={addPearl} disabled={pearls.length >= 35}>
        ⬇ Drop 5 {activeTop.name.split(' ').slice(1).join(' ')} ({pearls.length}/35)
      </button>
      <div className="boba-nav">
        <button className="btn btn-orange" onClick={() => setStep(1)}>◀ Back</button>
        <button className="btn btn-purple" onClick={() => setStep(3)}>Next ➜</button>
      </div>
    </div>,

    /* 3: customize */
    <div key="customize" className="boba-panel">
      <h3>Customize it!</h3>
      <label className="boba-label">
        🍬 Sweetness: <strong>{sweetness}%</strong>
        <input type="range" min={0} max={100} step={25} value={sweetness}
               onChange={e => setSweetness(+e.target.value)} className="boba-slider" />
        <div className="boba-marks"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
      </label>
      <label className="boba-label" style={{ marginTop:20 }}>
        🧊 Ice level:
        <div className="boba-choices" style={{ marginTop:8 }}>
          {['none','normal','extra'].map(lvl => (
            <button key={lvl}
              className={`boba-choice-btn${ice === lvl ? ' selected' : ''}`}
              onClick={() => setIce(lvl)}>
              {lvl === 'none' ? '🚫 No Ice' : lvl === 'normal' ? '🧊 Normal' : '❄️ Extra Ice'}
            </button>
          ))}
        </div>
      </label>
      <div className="boba-nav">
        <button className="btn btn-orange" onClick={() => setStep(2)}>◀ Back</button>
        <button className="btn btn-purple" onClick={() => setStep(4)}>Next ➜</button>
      </div>
    </div>,

    /* 4: shake */
    <div key="shake" className="boba-panel" style={{ alignItems:'center', textAlign:'center' }}>
      <h3>Almost ready!</h3>
      <p style={{ color:'#888', marginBottom:20 }}>Shake it to mix everything together!</p>
      <button className="btn btn-red shake-big-btn" onClick={shake} disabled={shaking}>
        {shaking ? '🫙 Shaking...' : '🫙 SHAKE IT!'}
      </button>
      <div className="boba-nav" style={{ marginTop:24 }}>
        <button className="btn btn-orange" onClick={() => setStep(3)}>◀ Back</button>
      </div>
    </div>,

    /* 5: enjoy */
    <div key="enjoy" className="boba-panel boba-enjoy" style={{ alignItems:'center', textAlign:'center' }}>
      <h3 style={{ color:'#9c27b0', fontSize:'1.6rem' }}>🎉 Your Boba is Ready!</h3>
      <div className="boba-drink-card">
        <p className="drink-name">"{drinkName}"</p>
        <p style={{ fontSize:'1.8rem', margin:'8px 0 0' }}>🥤😋🎊</p>
      </div>
      <span className="boba-heart" style={{ left:'15%', animationDelay:'0s'   }}>💜</span>
      <span className="boba-heart" style={{ left:'50%', animationDelay:'0.8s' }}>💖</span>
      <span className="boba-heart" style={{ left:'80%', animationDelay:'1.6s' }}>💜</span>
      <button className="btn btn-purple" onClick={reset} style={{ marginTop:12 }}>Make Another!</button>
    </div>,
  ];

  const stepLabels = ['Cup','Tea','Toppings','Customize','Shake!','Enjoy'];

  return (
    <div className="card card-purple">
      <h2>🧋 Making Boba!</h2>

      {/* Progress bar */}
      <div className="boba-progress">
        <div className="boba-progress-fill" style={{ width: `calc((100% - 20px) * ${step / 5})` }} />
        {stepLabels.map((l, i) => (
          <div key={i} className={`boba-step-dot${i < step ? ' done' : i === step ? ' active' : ''}`}>
            <div className="dot">{i < step ? '✓' : ''}</div>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <div className="boba-layout">
        {/* Cup preview */}
        <div className="boba-cup-area">
          <BobaViz
            size={size}
            tea={tea}
            pearls={pearls}
            ice={ice}
            sweetness={sweetness}
            shaking={shaking}
            done={done}
            pearlPositions={pearlPositions}
            icePositions={icePositions}
          />
        </div>

        {/* Step controls */}
        <div className="boba-controls">
          {panels[step]}
        </div>
      </div>
    </div>
  );
}
