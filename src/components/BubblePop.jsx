import { useState, useEffect, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';
import { track } from '../utils/analytics';

const COLORS = [
  { id: 'pink',   c: '#ff6fa5' },
  { id: 'purple', c: '#b07cff' },
  { id: 'blue',   c: '#54aeff' },
  { id: 'aqua',   c: '#2dd4bf' },
  { id: 'green',  c: '#69db7c' },
  { id: 'gold',   c: '#ffb830' },
];
const COLOR_MAP = Object.fromEntries(COLORS.map(({ id, c }) => [id, c]));

const SPEEDS = [
  { id: 'chill',  label: '🐢 Chill',  desc: 'Slow & dreamy',  spawnMs: 1000, durMin: 8,   durMax: 11 },
  { id: 'speedy', label: '🐰 Speedy', desc: 'Quick fingers!', spawnMs: 720,  durMin: 6,   durMax: 8.5 },
  { id: 'frenzy', label: '🚀 Frenzy', desc: 'Bubble storm!',  spawnMs: 480,  durMin: 4.6, durMax: 6.6 },
];

const GAME_SECONDS = 45;
const MAX_BUBBLES = 22;
const COMBO_WINDOW_MS = 1500;

// [left%, size px, duration s, delay s] — decorative background fizz
const AMBIENT = [
  [6, 10, 9, 0], [16, 7, 12, 3], [27, 12, 10, 6], [38, 8, 13, 1.5],
  [49, 11, 9.5, 4.5], [60, 7, 12.5, 8], [71, 13, 10.5, 2.5], [82, 8, 11, 5.5],
  [91, 10, 9.8, 7], [33, 6, 14, 9.5],
];

let bid = 0;

// Weighted bubble factory: mostly colorful normals, occasional specials.
// Smaller normal bubbles are worth more (they're harder to hit).
function makeBubble(speed) {
  const r = Math.random();
  const type = r < 0.08 ? 'star' : r < 0.12 ? 'rainbow' : r < 0.23 ? 'grumpy' : 'normal';
  const size = type === 'normal' ? 44 + Math.random() * 38 : 62 + Math.random() * 16;
  return {
    id: bid++,
    type,
    color: COLORS[Math.floor(Math.random() * COLORS.length)].id,
    x: 8 + Math.random() * 84, // % of arena width; bubble is centered on this point
    size,
    dur: speed.durMin + Math.random() * (speed.durMax - speed.durMin),
    sway: 6 + Math.random() * 12,
    swayDur: 2.2 + Math.random() * 1.6,
  };
}

/* ── Shared SVG gradients (ids are page-global, rendered once) ── */
function BubbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {COLORS.map(({ id, c }) => (
          <radialGradient key={id} id={`bub-body-${id}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%"   stopColor={lighten(c, .75)} stopOpacity=".18" />
            <stop offset="55%"  stopColor={c}               stopOpacity=".12" />
            <stop offset="82%"  stopColor={c}               stopOpacity=".3" />
            <stop offset="96%"  stopColor={darken(c, .15)}  stopOpacity=".55" />
            <stop offset="100%" stopColor={darken(c, .3)}   stopOpacity=".6" />
          </radialGradient>
        ))}
        <linearGradient id="bub-irid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ff9ff3" stopOpacity="0" />
          <stop offset="45%"  stopColor="#ff9ff3" stopOpacity=".7" />
          <stop offset="100%" stopColor="#48dbfb" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="bub-rainbow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ff6b6b" stopOpacity=".5" />
          <stop offset="25%"  stopColor="#ffd93d" stopOpacity=".5" />
          <stop offset="50%"  stopColor="#6bcb77" stopOpacity=".5" />
          <stop offset="75%"  stopColor="#4d96ff" stopOpacity=".5" />
          <stop offset="100%" stopColor="#cc5de8" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id="bub-star" cx="38%" cy="32%" r="75%">
          <stop offset="0%"   stopColor="#fff3bf" stopOpacity=".55" />
          <stop offset="80%"  stopColor="#ffd43b" stopOpacity=".55" />
          <stop offset="100%" stopColor="#f59f00" stopOpacity=".8" />
        </radialGradient>
        <radialGradient id="bub-grumpy" cx="38%" cy="32%" r="75%">
          <stop offset="0%"   stopColor="#d3e29f" stopOpacity=".35" />
          <stop offset="80%"  stopColor="#8aa84f" stopOpacity=".5" />
          <stop offset="100%" stopColor="#5d7a2e" stopOpacity=".75" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── One soap bubble: tinted rim, iridescent arc, specular highlights ── */
function BubbleSVG({ type, color }) {
  const fill = type === 'star'    ? 'url(#bub-star)'
             : type === 'rainbow' ? 'url(#bub-rainbow)'
             : type === 'grumpy'  ? 'url(#bub-grumpy)'
             : `url(#bub-body-${color})`;
  const rim = type === 'grumpy' ? 'rgba(93,122,46,.75)' : 'rgba(255,255,255,.75)';
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <circle cx="50" cy="50" r="46" fill={fill} stroke={rim} strokeWidth="1.6" />
      <path d="M91.5,61 A43,43 0 0 1 38.9,91.5" fill="none" stroke="url(#bub-irid)"
            strokeWidth="4" strokeLinecap="round" opacity=".6" />
      <ellipse cx="35" cy="28" rx="13" ry="8" fill="#fff" opacity=".85" transform="rotate(-25 35 28)" />
      <circle cx="26" cy="41" r="3" fill="#fff" opacity=".6" />
      {type === 'star'    && <text x="50" y="62" textAnchor="middle" fontSize="34">⭐</text>}
      {type === 'rainbow' && <text x="50" y="62" textAnchor="middle" fontSize="34">🌈</text>}
      {type === 'grumpy' && (
        <g stroke="#3f5520" strokeWidth="3" strokeLinecap="round" fill="none">
          <line x1="35" y1="37" x2="45" y2="43" />
          <line x1="65" y1="37" x2="55" y2="43" />
          <circle cx="42" cy="50" r="2.5" fill="#3f5520" stroke="none" />
          <circle cx="58" cy="50" r="2.5" fill="#3f5520" stroke="none" />
          <path d="M38,68 Q50,58 62,68" />
        </g>
      )}
    </svg>
  );
}

/* ── Main component ── */
export default function BubblePop() {
  const [phase,    setPhase]    = useState('menu'); // menu | playing | done
  const [speed,    setSpeed]    = useState(SPEEDS[0]);
  const [bubbles,  setBubbles]  = useState([]);
  const [bursts,   setBursts]   = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [combo,    setCombo]    = useState(0);
  const [shaking,  setShaking]  = useState(false);
  const [best,     setBest]     = useState(0);

  const arenaRef = useRef(null);
  const comboRef = useRef({ n: 0, t: 0 });
  const statsRef = useRef({ popped: 0, stars: 0, escaped: 0, bestCombo: 0, newBest: false });

  /* Spawn loop */
  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = setInterval(() => {
      setBubbles(bs => (bs.length >= MAX_BUBBLES ? bs : [...bs, makeBubble(speed)]));
    }, speed.spawnMs);
    return () => clearInterval(iv);
  }, [phase, speed]);

  /* Countdown */
  useEffect(() => {
    if (phase !== 'playing') return;
    const iv = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  /* Time's up */
  useEffect(() => {
    if (phase !== 'playing' || timeLeft > 0) return;
    const st = statsRef.current;
    st.newBest = score > 0 && score > best;
    setBest(b => Math.max(b, score));
    setPhase('done');
    track('game_complete', { game: 'bubbles' });
    setBubbles([]);
    setCombo(0);
    launchConfetti(window.innerWidth / 2, 180, st.newBest ? 80 : 40);
  }, [timeLeft, phase, score, best]);

  /* Combo badge fades if you stop popping */
  useEffect(() => {
    if (combo === 0) return;
    const t = setTimeout(() => { comboRef.current = { n: 0, t: 0 }; setCombo(0); }, 1600);
    return () => clearTimeout(t);
  }, [combo]);

  const start = () => {
    statsRef.current = { popped: 0, stars: 0, escaped: 0, bestCombo: 0, newBest: false };
    comboRef.current = { n: 0, t: 0 };
    setScore(0); setCombo(0); setTimeLeft(GAME_SECONDS);
    setBubbles([]); setBursts([]); setFloaters([]);
    setPhase('playing');
  };

  /* Position of an element's center in arena coordinates */
  const arenaPos = el => {
    const a = arenaRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
  };

  const addBurst = (x, y, color, big) => {
    const id = bid++;
    setBursts(b => [...b, { id, x, y, color, big }]);
    setTimeout(() => setBursts(b => b.filter(q => q.id !== id)), 700);
  };
  const addFloater = (x, y, text, bad) => {
    const id = bid++;
    setFloaters(f => [...f, { id, x, y, text, bad }]);
    setTimeout(() => setFloaters(f => f.filter(q => q.id !== id)), 950);
  };

  const pop = (b, e) => {
    if (phase !== 'playing') return;
    const { x, y } = arenaPos(e.currentTarget);
    setBubbles(bs => bs.filter(q => q.id !== b.id));
    const st = statsRef.current;

    if (b.type === 'grumpy') {
      comboRef.current = { n: 0, t: 0 };
      setCombo(0);
      setScore(s => Math.max(0, s - 15));
      addBurst(x, y, '#7a9e4f', false);
      addFloater(x, y, '-15', true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    const now = Date.now();
    const c = comboRef.current;
    c.n = now - c.t < COMBO_WINDOW_MS ? c.n + 1 : 1;
    c.t = now;
    setCombo(c.n);
    st.bestCombo = Math.max(st.bestCombo, c.n);
    const mult = c.n >= 8 ? 3 : c.n >= 4 ? 2 : 1;

    if (b.type === 'rainbow') {
      // Burst every other bubble on screen, staggered outward from the rainbow
      const others = [...arenaRef.current.querySelectorAll('.bub-float')]
        .filter(el => +el.dataset.id !== b.id);
      others.forEach((el, i) => {
        const p = arenaPos(el);
        setTimeout(() => addBurst(p.x, p.y, '#b07cff', false), i * 60);
      });
      const gain = (20 + others.length * 5) * mult;
      st.popped += 1 + others.length;
      setScore(s => s + gain);
      setBubbles([]);
      addBurst(x, y, '#b07cff', true);
      addFloater(x, y, `+${gain}`, false);
      launchConfetti(e.clientX, e.clientY, 25);
      return;
    }

    const base = b.type === 'star' ? 40 : b.size < 58 ? 15 : 10;
    const gain = base * mult;
    st.popped += 1;
    if (b.type === 'star') {
      st.stars += 1;
      launchConfetti(e.clientX, e.clientY, 18);
    }
    setScore(s => s + gain);
    addBurst(x, y, b.type === 'star' ? '#ffd43b' : COLOR_MAP[b.color], b.type === 'star');
    addFloater(x, y, `+${gain}`, false);
  };

  const escape = (id, e) => {
    if (e.animationName !== 'bubRise') return;
    setBubbles(bs => bs.filter(q => q.id !== id));
    statsRef.current.escaped += 1;
  };

  const mult = combo >= 8 ? 3 : combo >= 4 ? 2 : 1;
  const st = statsRef.current;

  return (
    <div className="card card-blue">
      <h2>🫧 Bubble Pop!</h2>

      {phase !== 'menu' && (
        <div className="bub-hud">
          <div className="bub-score">⭐ {score}</div>
          <div className="bub-timebar">
            <div className={`bub-timefill${timeLeft <= 10 && phase === 'playing' ? ' low' : ''}`}
                 style={{ width: `${(timeLeft / GAME_SECONDS) * 100}%` }} />
          </div>
          <div className="bub-time">{timeLeft}s</div>
        </div>
      )}

      <div ref={arenaRef} className={`bub-arena${shaking ? ' bub-shake' : ''}`}>
        <BubbleDefs />

        {/* Light rays + ambient fizz */}
        <div className="bub-ray r1" />
        <div className="bub-ray r2" />
        {AMBIENT.map(([left, size, dur, del], i) => (
          <span key={i} className="bub-amb"
                style={{ left: `${left}%`, width: size, height: size,
                         animationDuration: `${dur}s`, animationDelay: `${del}s` }} />
        ))}

        {/* Gameplay bubbles */}
        {bubbles.map(b => (
          <div key={b.id} data-id={b.id} className="bub-float"
               style={{ left: `${b.x}%`, width: b.size, height: b.size,
                        marginLeft: -b.size / 2, // center on x (transform is owned by bubRise)
                        animationDuration: `${b.dur}s`, '--sw': `${b.sway}px` }}
               onAnimationEnd={e => escape(b.id, e)}
               onPointerDown={e => pop(b, e)}>
            <div className="bub-sway" style={{ animationDuration: `${b.swayDur}s` }}>
              <BubbleSVG type={b.type} color={b.color} />
            </div>
          </div>
        ))}

        {/* Pop bursts: expanding ring + flying droplets */}
        {bursts.map(bu => (
          <div key={bu.id} className={`bub-burst${bu.big ? ' big' : ''}`}
               style={{ left: bu.x, top: bu.y, '--bc': bu.color }}>
            <span className="bub-ring" />
            {Array.from({ length: 8 }, (_, i) => {
              const ang = (i / 8) * Math.PI * 2;
              const d = bu.big ? 46 : 32;
              return <span key={i} className="bub-droplet"
                           style={{ '--dx': `${Math.cos(ang) * d}px`, '--dy': `${Math.sin(ang) * d}px` }} />;
            })}
          </div>
        ))}

        {/* Score floaters */}
        {floaters.map(f => (
          <span key={f.id} className={`bub-floater${f.bad ? ' bad' : ''}`}
                style={{ left: f.x, top: f.y }}>{f.text}</span>
        ))}

        {/* Combo badge (re-pops on every chain pop) */}
        {phase === 'playing' && combo >= 2 && (
          <div key={combo} className="bub-combo">
            🔥 {mult > 1 ? `×${mult} combo!` : `${combo} in a row!`}
          </div>
        )}

        {/* Menu overlay */}
        {phase === 'menu' && (
          <div className="bub-overlay">
            <div className="bub-panel">
              <h3>Pop bubbles for {GAME_SECONDS} seconds!</h3>
              <div className="bub-legend">
                <div className="bub-legend-item">
                  <span className="bub-mini"><BubbleSVG type="normal" color="pink" /></span>
                  +10 pts (+15 for tiny ones!)
                </div>
                <div className="bub-legend-item">
                  <span className="bub-mini"><BubbleSVG type="star" /></span>
                  Star bubble: +40 pts!
                </div>
                <div className="bub-legend-item">
                  <span className="bub-mini"><BubbleSVG type="rainbow" /></span>
                  Rainbow: pops EVERY bubble!
                </div>
                <div className="bub-legend-item">
                  <span className="bub-mini"><BubbleSVG type="grumpy" /></span>
                  Grumpy bubble: −15… don't touch!
                </div>
              </div>
              <p className="bub-tip">Pop fast to build a 🔥 combo — ×2 then ×3 points!</p>
              <div className="bub-speed-row">
                {SPEEDS.map(s => (
                  <button key={s.id}
                          className={`bub-speed-btn${speed.id === s.id ? ' selected' : ''}`}
                          onClick={() => setSpeed(s)}>
                    <span>{s.label}</span>
                    <small>{s.desc}</small>
                  </button>
                ))}
              </div>
              <button className="btn btn-blue bub-start-btn" onClick={start}>▶ Start Popping!</button>
              {best > 0 && <p className="bub-best-line">🏆 Best score: {best}</p>}
            </div>
          </div>
        )}

        {/* Done overlay */}
        {phase === 'done' && (
          <div className="bub-overlay">
            <div className="bub-panel">
              <h3>⏰ Time's up!</h3>
              <div className="bub-final-score">{score}</div>
              {st.newBest && <div className="bub-newbest">🏆 New best score!</div>}
              <div className="bub-stats">
                <div className="bub-stat"><b>{st.popped}</b>🫧 popped</div>
                <div className="bub-stat"><b>{st.stars}</b>⭐ stars caught</div>
                <div className="bub-stat"><b>{st.bestCombo}</b>🔥 best combo</div>
                <div className="bub-stat"><b>{st.escaped}</b>💨 floated away</div>
              </div>
              <div className="bub-done-btns">
                <button className="btn btn-blue" onClick={start}>🫧 Play Again!</button>
                <button className="btn btn-orange" onClick={() => setPhase('menu')}>⚙️ Change Speed</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
