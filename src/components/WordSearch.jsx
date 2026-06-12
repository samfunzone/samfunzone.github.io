import { useState, useRef, useEffect, useMemo } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';
import { shuffle } from '../utils/shuffle';

const THEMES = [
  { id: 'animals', label: 'Animals', emoji: '🦁', color: '#f59e0b',
    words: ['CAT','DOG','FOX','LION','BEAR','WOLF','TIGER','ZEBRA','PANDA','KOALA','HIPPO','OTTER','MONKEY','RABBIT','TURTLE','GIRAFFE'] },
  { id: 'food', label: 'Yummy Food', emoji: '🍕', color: '#ef4444',
    words: ['PIE','JAM','CAKE','TACO','CORN','RICE','PIZZA','APPLE','MANGO','BREAD','CANDY','DONUT','HONEY','GRAPE','BURGER','COOKIE','BANANA','WAFFLE'] },
  { id: 'space', label: 'Outer Space', emoji: '🚀', color: '#8b5cf6',
    words: ['SUN','MOON','STAR','MARS','COMET','EARTH','VENUS','ORBIT','ALIEN','ROCKET','PLANET','GALAXY','SATURN','METEOR'] },
  { id: 'ocean', label: 'Under the Sea', emoji: '🐠', color: '#0ea5e9',
    words: ['FISH','CRAB','KELP','WAVE','CORAL','WHALE','SHARK','PEARL','SQUID','OYSTER','TURTLE','DOLPHIN','OCTOPUS','SEAHORSE','STARFISH'] },
];

const LEVELS = [
  { id: 'easy',   label: 'Easy',   emoji: '🌱', size: 8,  count: 5,
    desc: '8×8 · across + down',         dirs: [[0,1],[1,0]] },
  { id: 'medium', label: 'Medium', emoji: '🌟', size: 10, count: 7,
    desc: '10×10 · adds diagonals',      dirs: [[0,1],[1,0],[1,1]] },
  { id: 'hard',   label: 'Hard',   emoji: '🔥', size: 12, count: 9,
    desc: '12×12 · words hide backwards', dirs: [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]] },
];

const FOUND_COLORS = ['#f43f5e','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#ec4899','#06b6d4','#84cc16','#fb923c'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildPuzzle(size, words, dirs) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const placements = [];
    let ok = true;
    for (const word of [...words].sort((a, b) => b.length - a.length)) {
      let placed = false;
      for (let t = 0; t < 250 && !placed; t++) {
        const [dr, dc] = dirs[(Math.random() * dirs.length) | 0];
        const rMin = dr === -1 ? word.length - 1 : 0;
        const rMax = dr === 1 ? size - word.length : size - 1;
        const cMin = dc === -1 ? word.length - 1 : 0;
        const cMax = dc === 1 ? size - word.length : size - 1;
        if (rMax < rMin || cMax < cMin) break;
        const r = rMin + ((Math.random() * (rMax - rMin + 1)) | 0);
        const c = cMin + ((Math.random() * (cMax - cMin + 1)) | 0);
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const cell = grid[r + dr * i][c + dc * i];
          if (cell && cell !== word[i]) { fits = false; break; }
        }
        if (!fits) continue;
        const cells = [];
        for (let i = 0; i < word.length; i++) {
          grid[r + dr * i][c + dc * i] = word[i];
          cells.push((r + dr * i) * size + (c + dc * i));
        }
        placements.push({ word, cells });
        placed = true;
      }
      if (!placed) { ok = false; break; }
    }
    if (!ok) continue;
    const letters = grid.map(row => row.map(ch => ch ?? ALPHA[(Math.random() * 26) | 0]));
    return { letters, placements };
  }
  return null;
}

// Snap the dragged start→end cells to the nearest straight line (H / V / diagonal)
function lineCells(start, end, size) {
  const r0 = (start / size) | 0, c0 = start % size;
  const r1 = (end / size) | 0,   c1 = end % size;
  const dr = r1 - r0, dc = c1 - c0;
  const adr = Math.abs(dr), adc = Math.abs(dc);
  if (adr === 0 && adc === 0) return [start];
  let sr = Math.sign(dr), sc = Math.sign(dc), len;
  if (adr >= adc * 2)      { sc = 0; len = adr; }
  else if (adc >= adr * 2) { sr = 0; len = adc; }
  else                     { len = Math.min(adr, adc); }
  const cells = [];
  for (let i = 0; i <= len; i++) {
    const r = r0 + sr * i, c = c0 + sc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) break;
    cells.push(r * size + c);
  }
  return cells;
}

function fmtTime(s) {
  return `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`;
}

export default function WordSearch() {
  const [phase, setPhase]         = useState('select'); // select | playing | won
  const [levelSel, setLevelSel]   = useState(LEVELS[0]);
  const [theme, setTheme]         = useState(null);
  const [level, setLevel]         = useState(null);
  const [puzzle, setPuzzle]       = useState(null);     // { letters, placements }
  const [found, setFound]         = useState([]);       // [{ word, cells, color }]
  const [sel, setSel]             = useState(null);     // { start, end }
  const [missCells, setMissCells] = useState([]);
  const [hintCell, setHintCell]   = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed]     = useState(0);
  const [gameId, setGameId]       = useState(0);
  const gridRef  = useRef(null);
  // Live mirror of `sel` — pointermove state updates are batched by React, so a
  // fast drag's last move may not have rendered when pointerup fires.
  const selRef   = useRef(null);
  const timeouts = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase, gameId]);

  const size = level?.size ?? 0;

  const selCells = useMemo(
    () => (sel && size ? lineCells(sel.start, sel.end, size) : []),
    [sel, size]
  );
  const selSet  = useMemo(() => new Set(selCells), [selCells]);
  const missSet = useMemo(() => new Set(missCells), [missCells]);
  const colorOf = useMemo(() => {
    const map = {};
    for (const f of found) for (const i of f.cells) map[i] = f.color;
    return map;
  }, [found]);

  function startGame(th, lv) {
    const words = shuffle(th.words.filter(w => w.length <= lv.size)).slice(0, lv.count);
    const pz = buildPuzzle(lv.size, words, lv.dirs);
    if (!pz) return;
    setTheme(th);
    setLevel(lv);
    setPuzzle(pz);
    setFound([]);
    setSel(null);
    setMissCells([]);
    setHintCell(null);
    setHintsUsed(0);
    setElapsed(0);
    setGameId(g => g + 1);
    setPhase('playing');
  }

  function cellFromEvent(e) {
    const rect = gridRef.current.getBoundingClientRect();
    const c = Math.max(0, Math.min(size - 1, Math.floor((e.clientX - rect.left) / (rect.width / size))));
    const r = Math.max(0, Math.min(size - 1, Math.floor((e.clientY - rect.top) / (rect.height / size))));
    return r * size + c;
  }

  function onDown(e) {
    if (phase !== 'playing') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = cellFromEvent(e);
    selRef.current = { start: cell, end: cell };
    setSel({ start: cell, end: cell });
  }

  function onMove(e) {
    if (!selRef.current) return;
    const cell = cellFromEvent(e);
    selRef.current.end = cell;
    setSel(s => (s && s.end !== cell ? { ...s, end: cell } : s));
  }

  function onUp(e) {
    const s = selRef.current;
    selRef.current = null;
    if (!s) return;
    const cells = lineCells(s.start, cellFromEvent(e), size);
    setSel(null);
    if (cells.length < 2) return;
    const str = cells.map(i => puzzle.letters[(i / size) | 0][i % size]).join('');
    const rev = [...str].reverse().join('');
    const hit = puzzle.placements.find(p =>
      !found.some(f => f.word === p.word) && (p.word === str || p.word === rev));
    if (hit) {
      const color = FOUND_COLORS[found.length % FOUND_COLORS.length];
      const nf = [...found, { word: hit.word, cells, color }];
      setFound(nf);
      setHintCell(null);
      launchConfetti(e.clientX, e.clientY, 24);
      if (nf.length === puzzle.placements.length) {
        later(() => {
          setPhase('won');
          for (let i = 0; i < 6; i++)
            later(() => launchConfetti(
              window.innerWidth * (0.2 + Math.random() * 0.6),
              window.innerHeight * 0.3, 30
            ), i * 130);
        }, 450);
      }
    } else {
      setMissCells(cells);
      later(() => setMissCells([]), 380);
    }
  }

  function giveHint() {
    const remaining = puzzle.placements.filter(p => !found.some(f => f.word === p.word));
    if (!remaining.length) return;
    const p = remaining[(Math.random() * remaining.length) | 0];
    setHintCell(p.cells[0]);
    setHintsUsed(h => h + 1);
    later(() => setHintCell(c => (c === p.cells[0] ? null : c)), 2600);
  }

  // ── SELECT ──
  if (phase === 'select') {
    return (
      <div className="card card-purple">
        <div className="ws-select-header">
          <div className="ws-magnify">🔍</div>
          <h2>Word Search</h2>
          <p className="ws-select-sub">Words are hiding in the letter grid.<br />Drag across them to find them all!</p>
        </div>

        <div className="ws-level-row">
          {LEVELS.map(lv => (
            <button key={lv.id}
              className={`ws-level-btn${levelSel.id === lv.id ? ' ws-level-on' : ''}`}
              onClick={() => setLevelSel(lv)}
            >
              <div className="ws-level-emoji">{lv.emoji}</div>
              <div className="ws-level-name">{lv.label}</div>
              <div className="ws-level-desc">{lv.desc}</div>
            </button>
          ))}
        </div>

        <div className="ws-theme-grid">
          {THEMES.map(th => (
            <button key={th.id} className="ws-theme-card" style={{ '--ws-c': th.color }}
              onClick={() => startGame(th, levelSel)}
            >
              <div className="ws-tc-emoji">{th.emoji}</div>
              <div className="ws-tc-name">{th.label}</div>
              <div className="ws-tc-hint">{levelSel.count} hidden words</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── PLAYING / WON ──
  const won = phase === 'won';
  const chips = [...puzzle.placements.map(p => p.word)].sort();
  const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  return (
    <div className="card card-purple" style={{ '--ws-accent': theme.color }}>
      {won ? (
        <div className="ws-win">
          <div className="ws-win-title">🎉 ALL WORDS FOUND!</div>
          <div className="ws-win-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <div className="ws-win-stats">
            ⏱ {fmtTime(elapsed)} &nbsp;·&nbsp; {puzzle.placements.length} words
            {hintsUsed > 0 && <> &nbsp;·&nbsp; 💡 {hintsUsed} hint{hintsUsed > 1 ? 's' : ''}</>}
          </div>
          <div className="ws-win-emojis">
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} style={{ animationDelay: `${i * 0.25}s` }}>{theme.emoji}</span>
            ))}
          </div>
          <div className="ws-btn-row">
            <button className="btn btn-green" onClick={() => startGame(theme, level)}>🔁 Play Again</button>
            <button className="btn btn-purple" onClick={() => setPhase('select')}>🏠 New Puzzle</button>
          </div>
        </div>
      ) : (
        <div className="ws-hud">
          <span className="ws-hud-pill">{theme.emoji} {theme.label} · {level.emoji} {level.label}</span>
          <div className="ws-hud-right">
            <span className="ws-timer">⏱ {fmtTime(elapsed)}</span>
            <span className="ws-count">{found.length}/{puzzle.placements.length}</span>
            <button className="ws-hint-btn" onClick={giveHint}>💡 Hint</button>
          </div>
        </div>
      )}

      <div className="ws-chips">
        {chips.map(w => {
          const f = found.find(x => x.word === w);
          return (
            <span key={w}
              className={`ws-chip${f ? ' ws-chip-found' : ''}`}
              style={f ? { background: `linear-gradient(160deg, ${lighten(f.color, 0.12)}, ${darken(f.color, 0.08)})` } : {}}
            >
              {w}
            </span>
          );
        })}
      </div>

      <div className="ws-board">
        <div key={gameId} className="ws-grid" ref={gridRef}
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            fontSize: size === 8 ? '1.15rem' : size === 10 ? '0.95rem' : '0.8rem',
          }}
          onPointerDown={won ? undefined : onDown}
          onPointerMove={won ? undefined : onMove}
          onPointerUp={won ? undefined : onUp}
          onPointerCancel={() => { selRef.current = null; setSel(null); }}
        >
          {puzzle.letters.flat().map((ch, i) => {
            const fc = colorOf[i];
            const cls = 'ws-cell'
              + (fc ? ' ws-found' : '')
              + (selSet.has(i) ? ' ws-sel' : '')
              + (missSet.has(i) ? ' ws-miss' : '')
              + (hintCell === i ? ' ws-hint' : '');
            const r = (i / size) | 0, c = i % size;
            return (
              <span key={i} className={cls}
                style={{
                  animationDelay: `${(r + c) * 26}ms`,
                  ...(fc ? { background: `linear-gradient(160deg, ${lighten(fc, 0.15)}, ${darken(fc, 0.12)})` } : {}),
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
