import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';
import { track } from '../utils/analytics';

const LEVELS = [
  { max: 100,    label: '1 – 100',     rank: 'Rookie',    emoji: '🔎', color: 'green',  optimal: 7  },
  { max: 1000,   label: '1 – 1,000',   rank: 'Detective', emoji: '🕵️', color: 'blue',   optimal: 10 },
  { max: 10000,  label: '1 – 10,000',  rank: 'Inspector', emoji: '🏅', color: 'purple', optimal: 14 },
  { max: 100000, label: '1 – 100,000', rank: 'Chief',     emoji: '⭐', color: 'red',    optimal: 17 },
];

const PALETTE = {
  green:  { bg: '#e8f5e9', border: '#4caf50', accent: '#2e7d32', badge: '#4caf50' },
  blue:   { bg: '#e3f2fd', border: '#2196f3', accent: '#1565c0', badge: '#2196f3' },
  purple: { bg: '#f3e5f5', border: '#9c27b0', accent: '#6a1b9a', badge: '#9c27b0' },
  red:    { bg: '#fbe9e7', border: '#f44336', accent: '#c62828', badge: '#f44336' },
};

function fmt(n) { return n.toLocaleString(); }

function proximity(guess, secret, max) {
  const pct = Math.abs(guess - secret) / max;
  if (pct < 0.02) return { label: 'BURNING!', emoji: '🔥', color: '#ff1744' };
  if (pct < 0.08) return { label: 'HOT!',     emoji: '🔥', color: '#ff5722' };
  if (pct < 0.20) return { label: 'WARM',     emoji: '☀️', color: '#ffa726' };
  if (pct < 0.40) return { label: 'COOL',     emoji: '🌊', color: '#29b6f6' };
  if (pct < 0.60) return { label: 'COLD',     emoji: '❄️', color: '#42a5f5' };
  return               { label: 'FREEZING',  emoji: '🧊', color: '#80deea' };
}

function randomSecret(max) {
  return Math.floor(Math.random() * max) + 1;
}

function getStars(guesses, optimal) {
  if (guesses <= optimal)                  return 3;
  if (guesses <= Math.ceil(optimal * 1.5)) return 2;
  return 1;
}

export default function NumberDetective() {
  const [phase, setPhase]         = useState('select');
  const [level, setLevel]         = useState(null);
  const [secret, setSecret]       = useState(0);
  const [input, setInput]         = useState('');
  const [history, setHistory]     = useState([]);
  const [lo, setLo]               = useState(1);
  const [hi, setHi]               = useState(100);
  const [shakeKey, setShakeKey]   = useState(0);
  const [gaveUp, setGaveUp]       = useState(false);
  const [hardMode, setHardMode]   = useState(false);
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef(null);

  function startGame(lv) {
    setLevel(lv);
    setSecret(randomSecret(lv.max));
    setInput('');
    setHistory([]);
    setLo(1);
    setHi(lv.max);
    setShakeKey(0);
    setGaveUp(false);
    setShowHints(false);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  function submitGuess() {
    const g = parseInt(input, 10);
    if (!g || isNaN(g) || g < 1 || g > level.max) return;
    const prox = proximity(g, secret, level.max);

    if (g === secret) {
      setHistory(h => [...h, { value: g, hint: 'correct', prox }]);
      setShowHints(true);
      setPhase('won');
      track('game_complete', { game: 'numdet' });
      for (let i = 0; i < 8; i++)
        setTimeout(() => launchConfetti(
          window.innerWidth * (0.15 + Math.random() * 0.7),
          window.innerHeight * 0.3, 35
        ), i * 120);
    } else if (g < secret) {
      setHistory(h => [...h, { value: g, hint: 'higher', prox }]);
      setLo(prev => Math.max(prev, g + 1));
      setShakeKey(k => k + 1);
      if (hardMode) setShowHints(false);
    } else {
      setHistory(h => [...h, { value: g, hint: 'lower', prox }]);
      setHi(prev => Math.min(prev, g - 1));
      setShakeKey(k => k + 1);
      if (hardMode) setShowHints(false);
    }
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function revealAnswer() {
    setGaveUp(true);
    setShowHints(true);
    setPhase('won');
  }

  const segLeft  = level ? ((lo - 1) / (level.max - 1)) * 100 : 0;
  const segWidth = level ? ((hi - lo) / (level.max - 1)) * 100 : 100;

  // ── LEVEL SELECT ──
  if (phase === 'select') {
    return (
      <div className="card card-blue">
        <div className="nd-select-header">
          <div className="nd-magnify">🔍</div>
          <h2>Number Detective</h2>
          <p className="nd-select-sub">A secret number is hiding.<br />Pick your rank and crack the case!</p>
        </div>

        {/* Hard Mode toggle */}
        <div className="nd-mode-row">
          <button
            className={`nd-mode-toggle${hardMode ? ' nd-mode-on' : ''}`}
            onClick={() => setHardMode(h => !h)}
          >
            <span className="nd-mode-icon">{hardMode ? '🕶️' : '😊'}</span>
            <span className="nd-mode-text">
              {hardMode ? 'HARD MODE' : 'Normal Mode'}
            </span>
            <span className="nd-mode-switch">
              <span className="nd-mode-knob" />
            </span>
          </button>
          {hardMode && (
            <p className="nd-mode-desc">Clues are hidden — tap 💡 Hint to peek!</p>
          )}
        </div>

        <div className="nd-level-grid">
          {LEVELS.map(lv => {
            const c = PALETTE[lv.color];
            return (
              <button key={lv.max} className="nd-level-card"
                style={{ '--nd-bg': c.bg, '--nd-border': c.border, '--nd-accent': c.accent }}
                onClick={() => startGame(lv)}
              >
                <div className="nd-lc-emoji">{lv.emoji}</div>
                <div className="nd-lc-rank">{lv.rank}</div>
                <div className="nd-lc-range">{lv.label}</div>
                <div className="nd-lc-hint">Best: {lv.optimal} guesses</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── WON ──
  if (phase === 'won') {
    const stars     = gaveUp ? 0 : getStars(history.length, level.optimal);
    const starLabel = gaveUp
      ? '🏳️ Better luck next time!'
      : stars === 3 ? '🏆 MASTER DETECTIVE!'
      : stars === 2 ? '⭐ GREAT DETECTIVE!'
      : '👏 GOOD JOB, DETECTIVE!';
    const c = PALETTE[level.color];

    return (
      <div className="card card-blue">
        <div className="nd-won">
          <div className="nd-won-title">{gaveUp ? '🔓 CASE REVEALED!' : '🎉 CASE SOLVED!'}</div>
          <div className="nd-won-label">The secret number was</div>
          <div className="nd-won-number" style={{ borderColor: c.border, color: c.accent }}>
            {fmt(secret)}
          </div>
          {!gaveUp && (
            <div className="nd-stars">
              {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </div>
          )}
          <div className="nd-star-label">{starLabel}</div>
          {hardMode && !gaveUp && <div className="nd-hard-badge">🕶️ Hard Mode cleared!</div>}
          {!gaveUp && (
            <div className="nd-won-stats">
              <span>Your guesses: <strong>{history.length}</strong></span>
              <span>Optimal: <strong>{level.optimal}</strong></span>
              {history.length <= level.optimal && <span className="nd-beat">Beat the optimal! 🏆</span>}
            </div>
          )}
          <div className="nd-btn-row">
            <button className="btn btn-green" onClick={() => startGame(level)}>🔁 Play Again</button>
            <button className="btn btn-blue" onClick={() => setPhase('select')}>🏠 Change Level</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const c = PALETTE[level.color];

  return (
    <div className="card card-blue">
      {/* Top bar */}
      <div className="nd-game-top">
        <div className="nd-game-top-left">
          <span className="nd-rank-pill" style={{ background: c.badge }}>
            {level.emoji} {level.rank}
          </span>
          {hardMode && <span className="nd-hard-pill">🕶️ HARD</span>}
        </div>
        <span className="nd-guess-count">
          Guesses: <strong>{history.length}</strong>
          <span className="nd-opt-hint"> / opt {level.optimal}</span>
        </span>
      </div>

      {/* Mystery number */}
      <div key={shakeKey} className={`nd-mystery${shakeKey > 0 ? ' nd-shake' : ''}`}
        style={{ borderColor: c.border }}>
        <div className="nd-mystery-label">SECRET NUMBER</div>
        <div className="nd-mystery-glyphs">
          {'■'.repeat(secret.toString().length)}
        </div>
        <div className="nd-mystery-range">1 – {fmt(level.max)}</div>
      </div>

      {/* Range bar — number line segment */}
      <div className="nd-bar-section">
        <div className="nd-bar-track">
          <div className="nd-bar-fill" style={{ left: `${segLeft}%`, width: `${segWidth}%`, background: c.accent }} />
        </div>
        <div className="nd-bar-ticks">
          <span>1</span>
          <span>{fmt(level.max)}</span>
        </div>
        {history.length > 0 && !hardMode && (
          <div className="nd-bar-markers">
            <span className="nd-bar-lo" style={{ left: `${segLeft}%` }}>{fmt(lo)}</span>
            <span className="nd-bar-hi" style={{ right: `${100 - segLeft - segWidth}%` }}>{fmt(hi)}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="nd-input-row">
        <input
          ref={inputRef}
          className="nd-input"
          type="number"
          min={hardMode ? 1 : lo}
          max={hardMode ? level.max : hi}
          value={input}
          placeholder={hardMode ? `1 to ${fmt(level.max)}` : `${lo} to ${fmt(hi)}`}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitGuess()}
          style={{ borderColor: c.border, '--nd-focus': c.border }}
        />
        <button className="btn nd-guess-btn" style={{ background: c.accent, borderColor: c.accent }}
          onClick={submitGuess}>
          🔍 Guess!
        </button>
      </div>

      {/* Clue log */}
      {history.length > 0 && (() => {
        const reversed = [...history].reverse();
        // In hard mode: always show last clue; show all only when peeking
        const visible  = hardMode && !showHints ? [reversed[0]] : reversed;
        const hidden   = hardMode && !showHints ? history.length - 1 : 0;
        return (
          <>
            <div className={`nd-log${hardMode && showHints ? ' nd-log-peek' : ''}`}>
              <div className="nd-log-title">📋 Clue Log</div>
              <div className="nd-log-list">
                {visible.map((h, i) => (
                  <div key={i}
                    className={`nd-clue nd-clue-${h.hint}`}
                    style={i === 0 ? { animation: 'ndSlideIn .25s ease' } : {}}>
                    <span className="nd-clue-arrow">
                      {h.hint === 'higher' ? '↑' : h.hint === 'lower' ? '↓' : '✓'}
                    </span>
                    <span className="nd-clue-val">{fmt(h.value)}</span>
                    <span className="nd-clue-msg">
                      {h.hint === 'higher' ? 'Go HIGHER!' : h.hint === 'lower' ? 'Go LOWER!' : 'CORRECT!'}
                    </span>
                    {h.hint !== 'correct' && (
                      <span className="nd-clue-temp" style={{ color: h.prox.color }}>
                        {h.prox.emoji} {h.prox.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Peek button + hidden count for hard mode */}
            {hardMode && hidden > 0 && (
              <div className="nd-hint-row">
                <button
                  className={`nd-hint-btn${showHints ? ' nd-hint-open' : ''}`}
                  onClick={() => setShowHints(s => !s)}
                >
                  {showHints ? '🙈 Hide Previous' : `💡 See ${hidden} previous clue${hidden > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </>
        );
      })()}

      <div className="nd-reveal-row">
        <button className="nd-reveal-btn" onClick={revealAnswer}>🏳️ Reveal Answer</button>
      </div>
    </div>
  );
}
