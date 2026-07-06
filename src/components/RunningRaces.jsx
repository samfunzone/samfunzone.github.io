import { useState, useEffect, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';
import { track } from '../utils/analytics';
import { shuffle } from '../utils/shuffle';

const CHARACTERS = [
  { id: 'cheetah',  emoji: '🐆',   label: 'Cheetah',      color: '#ffb020' },
  { id: 'bunny',    emoji: '🐰',   label: 'Bunny',        color: '#ff8fa3' },
  { id: 'unicorn',  emoji: '🦄',   label: 'Unicorn',      color: '#c084fc' },
  { id: 'robot',    emoji: '🤖',   label: 'Robo-Runner',  color: '#4fc3f7' },
  { id: 'dino',     emoji: '🦖',   label: 'Dino',         color: '#81c784' },
  { id: 'astro',    emoji: '🧑‍🚀', label: 'Astro-Kid',    color: '#ff6b6b' },
  { id: 'turtle',   emoji: '🐢',   label: 'Turtle',       color: '#20c997' },
  { id: 'fox',      emoji: '🦊',   label: 'Fox',          color: '#fd7e14' },
  { id: 'frog',     emoji: '🐸',   label: 'Frog',         color: '#2f9e44' },
  { id: 'penguin',  emoji: '🐧',   label: 'Penguin',      color: '#364fc7' },
  { id: 'kangaroo', emoji: '🦘',   label: 'Kangaroo',     color: '#a9743c' },
  { id: 'owl',      emoji: '🦉',   label: 'Owl',          color: '#495057' },
];

const DIFFICULTIES = [
  { id: 'easy',   label: '🐣 Easy',   desc: 'Chill pace',        aiMin: 6,  aiMax: 13, rubberGap: 14, catchMax: 0.20, easeOff: 0.60 },
  { id: 'medium', label: '⚡ Medium', desc: 'Needs steady taps', aiMin: 9,  aiMax: 17, rubberGap: 12, catchMax: 0.30, easeOff: 0.75 },
  { id: 'hard',   label: '🔥 Hard',   desc: 'Mash mash mash!',   aiMin: 12, aiMax: 22, rubberGap: 9,  catchMax: 0.45, easeOff: 0.88 },
];

const TICK_MS = 100;
const BASE_PLAYER_SPEED = 10;  // %/sec, idle crawl
const BOOST_PER_TAP = 4;
const MAX_BOOST = 34;
const BOOST_DECAY = 0.93;      // per tick — slower decay so real mashing sustains a lead
const WOBBLE_AMPLITUDE = 3;
const COUNTDOWN_START = 3;

const LANES = ['player', 'ai1', 'ai2'];

function rollAI(diff) {
  return {
    base: diff.aiMin + Math.random() * (diff.aiMax - diff.aiMin),
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

/* ── Zigzag lane path (shared shape, plain point math — no DOM measuring needed) ──
   viewBox is 300×40 (a flat, wide aspect close to the rendered lane box) so the
   SVG scales ~uniformly with no preserveAspectRatio stretch — a non-uniform
   stretch combined with stroke-dasharray corrupts the progress-fill rendering. */
const ZIGZAG_PTS = [
  { x: 6,   y: 20 },
  { x: 48,  y: 4 },
  { x: 90,  y: 36 },
  { x: 132, y: 4 },
  { x: 174, y: 36 },
  { x: 216, y: 4 },
  { x: 258, y: 36 },
  { x: 294, y: 20 },
];
const ZIGZAG_D = ZIGZAG_PTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
const ZIGZAG_SEG_LEN = ZIGZAG_PTS.slice(1).map((p, i) => Math.hypot(p.x - ZIGZAG_PTS[i].x, p.y - ZIGZAG_PTS[i].y));
const ZIGZAG_CUM = (() => { let c = 0; return ZIGZAG_SEG_LEN.map(l => (c += l)); })();
const ZIGZAG_TOTAL_LEN = ZIGZAG_CUM[ZIGZAG_CUM.length - 1];

function pointAtProgress(pct) {
  const target = (pct / 100) * ZIGZAG_TOTAL_LEN;
  let segIdx = 0;
  while (segIdx < ZIGZAG_CUM.length - 1 && ZIGZAG_CUM[segIdx] < target) segIdx++;
  const segStart = segIdx === 0 ? 0 : ZIGZAG_CUM[segIdx - 1];
  const segLen = ZIGZAG_SEG_LEN[segIdx] || 1;
  const t = Math.min(1, Math.max(0, (target - segStart) / segLen));
  const a = ZIGZAG_PTS[segIdx];
  const b = ZIGZAG_PTS[segIdx + 1];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/* ── One lane: zigzag track + progress fill + running character ── */
function RaceLane({ pos, char, label, isPlayer, running }) {
  const accent = char.color;
  const pt = pointAtProgress(pos);
  const fillLen = (pos / 100) * ZIGZAG_TOTAL_LEN;
  return (
    <div className={`rr-lane${isPlayer ? ' rr-lane-player' : ''}`}>
      <div className="rr-lane-label">{isPlayer ? `⭐ ${label}` : label}</div>
      <svg viewBox="0 0 300 40" className="rr-lane-svg"
           style={{ '--rr-accent': accent, '--rr-accent-lt': lighten(accent, .6) }}>
        <path d={ZIGZAG_D} className="rr-zig-track" />
        <path d={ZIGZAG_D} className="rr-zig-fill"
              style={{ strokeDasharray: `${fillLen} ${ZIGZAG_TOTAL_LEN}` }} />
        <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central"
              className={`rr-zig-runner${running ? ' rr-bounce' : ''}`}>{char.emoji}</text>
      </svg>
    </div>
  );
}

export default function RunningRaces() {
  const [phase, setPhase] = useState('name'); // name | select | ready | countdown | racing | finish | results
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [runner, setRunner] = useState(null);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [aiChars, setAiChars] = useState([]);
  const [positions, setPositions] = useState({ player: 0, ai1: 0, ai2: 0 });
  const [count, setCount] = useState(COUNTDOWN_START);
  const [winner, setWinner] = useState(null);
  const [tally, setTally] = useState({ wins: 0, races: 0 });

  const posRef = useRef({ player: 0, ai1: 0, ai2: 0 });
  const aiRef = useRef([]);
  const diffRef = useRef(difficulty);
  const mashRef = useRef({ boost: 0 });
  const winnerRef = useRef(null);

  /* Race tick loop */
  useEffect(() => {
    if (phase !== 'racing') return;
    const iv = setInterval(() => {
      const tickSec = TICK_MS / 1000;
      const p = posRef.current;
      const diff = diffRef.current;

      mashRef.current.boost *= BOOST_DECAY;
      const playerSpeed = BASE_PLAYER_SPEED + mashRef.current.boost;

      // Rubberband relative to the PLAYER only — an AI drifting far ahead of
      // the human eases off, and one that's fallen far behind the human (not
      // behind other AIs) gets a mild nudge, so races stay close either way
      // without punishing a player who's mashing well and pulling ahead.
      // Difficulty tunes how much slack an AI gets: Hard barely eases off
      // and catches up hardest, so only sustained fast mashing keeps you ahead.
      const aiSpeeds = aiRef.current.map((ai, i) => {
        const laneKey = i === 0 ? 'ai1' : 'ai2';
        let speed = ai.base + Math.sin(Date.now() / 400 + ai.wobblePhase) * WOBBLE_AMPLITUDE;
        const gapToPlayer = p[laneKey] - p.player; // positive: AI ahead of player
        if (gapToPlayer > diff.rubberGap) {
          speed *= diff.easeOff;
        } else if (gapToPlayer < -diff.rubberGap) {
          const behind = -gapToPlayer - diff.rubberGap;
          speed *= 1 + Math.min(diff.catchMax, behind / 100);
        }
        return speed;
      });

      const next = {
        player: Math.min(100, p.player + playerSpeed * tickSec),
        ai1: Math.min(100, p.ai1 + aiSpeeds[0] * tickSec),
        ai2: Math.min(100, p.ai2 + aiSpeeds[1] * tickSec),
      };
      posRef.current = next;
      setPositions(next);

      if (!winnerRef.current) {
        const win = LANES.find(l => next[l] >= 100);
        if (win) {
          winnerRef.current = win;
          setWinner(win);
          setPhase('finish');
        }
      }
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [phase]);

  /* Countdown 3-2-1-GO */
  useEffect(() => {
    if (phase !== 'countdown') return;
    const t = setTimeout(() => {
      if (count <= 0) setPhase('racing');
      else setCount(c => c - 1);
    }, 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  const submitName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    setPhase('select');
  };

  const pickCharacter = (char) => {
    setRunner(char);
    setPhase('ready');
  };

  const startRace = () => {
    posRef.current = { player: 0, ai1: 0, ai2: 0 };
    setPositions({ player: 0, ai1: 0, ai2: 0 });
    setAiChars(shuffle(CHARACTERS.filter(c => c.id !== runner.id)).slice(0, 2));
    diffRef.current = difficulty;
    aiRef.current = [rollAI(difficulty), rollAI(difficulty)];
    mashRef.current = { boost: 0 };
    winnerRef.current = null;
    setWinner(null);
    setCount(COUNTDOWN_START);
    setPhase('countdown');
  };

  const mash = () => {
    if (phase !== 'racing') return;
    mashRef.current.boost = Math.min(MAX_BOOST, mashRef.current.boost + BOOST_PER_TAP);
  };

  const lockResult = (e) => {
    const won = winner === 'player';
    setTally(t => ({ wins: t.wins + (won ? 1 : 0), races: t.races + 1 }));
    track('game_complete', { game: 'runrace', won });
    if (won) {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight * 0.3;
      launchConfetti(x, y, 60);
    }
    setPhase('results');
  };

  const winnerChar = winner === 'player' ? runner
    : winner === 'ai1' ? aiChars[0]
    : winner === 'ai2' ? aiChars[1]
    : null;

  return (
    <div className="card card-blue">
      <h2>🏃 Running Races!</h2>

      {phase === 'name' && (
        <div className="rr-name-screen">
          <p className="rr-select-tip">What's your name, racer?</p>
          <form className="rr-name-form" onSubmit={e => { e.preventDefault(); submitName(); }}>
            <input type="text" className="rr-name-input" value={nameInput}
                   onChange={e => setNameInput(e.target.value)}
                   placeholder="Type your name" maxLength={16} autoFocus />
            <button type="submit" className="btn btn-green" disabled={!nameInput.trim()}>Let's Race! 🏁</button>
          </form>
        </div>
      )}

      {phase === 'select' && (
        <div className="rr-select">
          <p className="rr-select-tip">Pick your runner!</p>
          <div className="rr-char-grid">
            {CHARACTERS.map(c => (
              <button key={c.id} className="rr-char-card"
                      style={{ '--rr-accent': c.color, '--rr-accent-lt': lighten(c.color, .7), '--rr-accent-dk': darken(c.color, .25) }}
                      onClick={() => pickCharacter(c)}>
                <span className="rr-char-emoji">{c.emoji}</span>
                <span className="rr-char-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase !== 'select' && runner && (
        <div className="rr-arena">
          <div className="rr-track">
            <div className="rr-goalpost rr-goalpost-start">🚩</div>
            <div className="rr-lanes">
              <RaceLane pos={positions.player} char={runner} label={playerName} isPlayer running={phase === 'racing'} />
              {aiChars[0] && <RaceLane pos={positions.ai1} char={aiChars[0]} label={aiChars[0].label} running={phase === 'racing'} />}
              {aiChars[1] && <RaceLane pos={positions.ai2} char={aiChars[1]} label={aiChars[1].label} running={phase === 'racing'} />}
            </div>
            <div className="rr-goalpost rr-goalpost-finish">🏁</div>
          </div>

          {phase === 'ready' && (
            <div className="rr-overlay">
              <div className="rr-panel">
                <div className="rr-panel-emoji">{runner.emoji}</div>
                <h3>{runner.label} is ready!</h3>
                <p className="rr-tip">Tap RUN as fast as you can to win the race!</p>
                <div className="rr-diff-row">
                  {DIFFICULTIES.map(d => (
                    <button key={d.id}
                            className={`rr-diff-btn${difficulty.id === d.id ? ' selected' : ''}`}
                            onClick={() => setDifficulty(d)}>
                      <span>{d.label}</span>
                      <small>{d.desc}</small>
                    </button>
                  ))}
                </div>
                <div className="rr-btn-row">
                  <button className="btn btn-green" onClick={startRace}>🏁 Start Race!</button>
                  <button className="btn btn-orange" onClick={() => setPhase('select')}>🔄 Change Runner</button>
                </div>
              </div>
            </div>
          )}

          {phase === 'countdown' && (
            <div className="rr-overlay">
              <div key={count} className="rr-countdown">{count > 0 ? count : 'GO!'}</div>
            </div>
          )}

          {phase === 'racing' && (
            <button className="rr-mash-btn" onPointerDown={mash}>
              🏃<br />RUN!
            </button>
          )}

          {phase === 'finish' && (
            <div className="rr-overlay">
              <div className="rr-panel">
                <div className="rr-panel-emoji">{winnerChar?.emoji}</div>
                <h3>{winner === 'player' ? 'You crossed the line first!' : `${winnerChar?.label} crossed the line first!`}</h3>
                <button className="btn btn-red" onClick={lockResult}>🛑 Stop &amp; See Results!</button>
              </div>
            </div>
          )}

          {phase === 'results' && (
            <div className="rr-overlay">
              <div className={`rr-panel${winner === 'player' ? ' rr-panel-win' : ' rr-panel-lose'}`}>
                {winner === 'player' ? (
                  <>
                    <div className="rr-trophy">🏆</div>
                    <h3>{runner.emoji} {runner.label} wins!!</h3>
                    <p className="rr-win-line">You crossed the finish line first!</p>
                  </>
                ) : (
                  <>
                    <div className="rr-trophy rr-trophy-dim">🏅</div>
                    <h3>{winnerChar?.emoji} {winnerChar?.label} got there first!</h3>
                    <p className="rr-lose-line">So close — try again, you'll catch them! 💪</p>
                  </>
                )}
                <p className="rr-tally">🏆 Won {tally.wins} of {tally.races} race{tally.races === 1 ? '' : 's'}</p>
                <div className="rr-btn-row">
                  <button className="btn btn-green" onClick={startRace}>🔁 Race Again!</button>
                  <button className="btn btn-blue" onClick={() => setPhase('select')}>🔄 Change Runner</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
