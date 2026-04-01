import { useState } from 'react';
import { launchConfetti } from '../utils/confetti';

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

let pid = 0;

/* ── Cup SVG ── */
function BobaViz({ size, tea, pearls, ice, sweetness, shaking, done }) {
  const sc = (SIZES.find(s => s.id === size) || SIZES[1]).scale;
  const W = 160, H = 310;
  // Cup path (trapezoid, wider top)
  const cup = `M22,40 L138,40 L120,282 Q120,294 107,294 L53,294 Q40,294 40,282 Z`;
  const clipId = 'boba-clip';

  // Tea fill (% of cup height)
  const teaY = tea ? 80 : H;
  const teaH = H - teaY;

  // Ice blocks
  const iceBlocks = ice === 'none' ? [] : ice === 'normal'
    ? [[30,100],[80,110],[50,160],[100,150]]
    : [[25,95],[65,105],[105,95],[35,155],[80,165],[110,150],[55,215],[95,200]];

  // Pearl grid — 5 per row, centered inside the cup (cup interior x: ~42–118 at bottom)
  const pearlRows = [];
  pearls.forEach((p, i) => {
    const row = Math.floor(i / 5), col = i % 5;
    pearlRows.push({ ...p, cx: 48 + col * 16, cy: 268 - row * 20 });
  });

  return (
    <div className={`boba-cup-wrap${shaking ? ' shaking' : ''}`}
         style={{ transform: `scale(${sc})`, transformOrigin: 'bottom center' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id={clipId}>
            <path d={cup} />
          </clipPath>
        </defs>

        {/* ── Contents (clipped) ── */}
        <g clipPath={`url(#${clipId})`}>

          {/* Tea liquid */}
          {tea && (
            <rect x="0" y={teaY} width={W} height={teaH}
                  fill={tea.color} opacity={0.85}
                  style={{ transition: 'y 0.6s ease, height 0.6s ease' }} />
          )}

          {/* Milk / foam layer */}
          {tea && (
            <rect x="0" y={teaY} width={W} height="22"
                  fill={tea.foam} opacity={0.7}
                  style={{ transition: 'y 0.6s ease' }} />
          )}

          {/* Brown sugar drizzle */}
          {tea?.id === 'brown_sugar' && [0.2,0.5,0.75].map((x,i) => (
            <path key={i}
              d={`M${W*x},40 Q${W*x+12},${teaY*0.4} ${W*x-8},${teaY}`}
              stroke="#5d3825" strokeWidth="4" fill="none" opacity="0.6" />
          ))}

          {/* Ice blocks */}
          {tea && iceBlocks.map(([ix,iy], i) => (
            <rect key={i} x={ix} y={iy} width="28" height="22" rx="5"
                  fill="rgba(220,240,255,0.7)" stroke="rgba(180,220,255,0.9)" strokeWidth="1.5" />
          ))}

          {/* Pearls / toppings */}
          {pearlRows.map(p => p.square
            ? <rect key={p.id} x={p.cx - p.r} y={p.cy - p.r}
                    width={p.r * 2} height={p.r * 2} rx="3"
                    fill={p.color} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
            : <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r}
                      fill={p.color} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          )}
        </g>

        {/* ── Cup outline ── */}
        <path d={cup} fill="rgba(255,255,255,0.18)" stroke="#aaa" strokeWidth="3" />

        {/* Lid */}
        <ellipse cx="80" cy="36" rx="62" ry="13" fill="#e0e0e0" stroke="#bbb" strokeWidth="2" />
        <ellipse cx="80" cy="33" rx="56" ry="8"  fill="#ececec" />
        {/* Lid hole */}
        <ellipse cx="95" cy="33" rx="10" ry="5" fill="#d0d0d0" stroke="#bbb" strokeWidth="1.5" />

        {/* Straw */}
        <rect x="90" y={-30} width="11" height={210} rx="5.5"
              fill={tea ? tea.color : '#bbb'} opacity="0.85"
              stroke={tea ? tea.color : '#aaa'} strokeWidth="1" />
        {/* Straw shine */}
        <rect x="92" y={-30} width="3" height={210} rx="1.5"
              fill="rgba(255,255,255,0.35)" />

        {/* Sweetness label */}
        {done && (
          <text x="80" y="320" textAnchor="middle"
                fontSize="11" fill="#888" fontFamily="inherit">
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
  const [shaking,   setShaking]   = useState(false);

  const done = step === 5;

  const addPearl = () => {
    if (pearls.length >= 35) return;
    setPearls(p => [...p, { id: pid++, ...activeTop }]);
  };

  const shake = () => {
    setShaking(true);
    setTimeout(() => { setShaking(false); setStep(5); launchConfetti(window.innerWidth/2, 200, 60); }, 1800);
  };

  const reset = () => {
    setStep(0); setSize(null); setTea(null);
    setPearls([]); setSweetness(75); setIce('normal'); setShaking(false);
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
            <span className="topping-swatch" style={{ background: t.color, borderRadius: t.square ? 3 : '50%' }} />
            {t.name}
          </button>
        ))}
      </div>
      <button className="btn btn-green drop-btn" onClick={addPearl}>
        ⬇ Drop {activeTop.name.split(' ').slice(1).join(' ')} ({pearls.length})
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
    <div key="enjoy" className="boba-panel" style={{ alignItems:'center', textAlign:'center' }}>
      <h3 style={{ color:'#9c27b0', fontSize:'1.6rem' }}>🎉 Your Boba is Ready!</h3>
      <p className="drink-name">"{drinkName}"</p>
      <p style={{ fontSize:'1.8rem', margin:'12px 0' }}>🥤😋🎊</p>
      <button className="btn btn-purple" onClick={reset} style={{ marginTop:8 }}>Make Another!</button>
    </div>,
  ];

  const stepLabels = ['Cup','Tea','Toppings','Customize','Shake!','Enjoy'];

  return (
    <div className="card card-purple">
      <h2>🧋 Making Boba!</h2>

      {/* Progress bar */}
      <div className="boba-progress">
        {stepLabels.map((l, i) => (
          <div key={i} className={`boba-step-dot${i < step ? ' done' : i === step ? ' active' : ''}`}>
            <div className="dot" />
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
