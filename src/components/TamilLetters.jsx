import { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react';
import { launchConfetti } from '../utils/confetti';
import { shuffle } from '../utils/shuffle';
import { speak, playClip } from '../utils/speech';
import { track } from '../utils/analytics';

// 12 உயிர் (vowels): standalone letter + combining sign + roman vowel sound.
const UYIR = [
  { base: 'அ', sign: '',   tr: 'a' },
  { base: 'ஆ', sign: 'ா',  tr: 'aa' },
  { base: 'இ', sign: 'ி',  tr: 'i' },
  { base: 'ஈ', sign: 'ீ',  tr: 'ee' },
  { base: 'உ', sign: 'ு',  tr: 'u' },
  { base: 'ஊ', sign: 'ூ',  tr: 'oo' },
  { base: 'எ', sign: 'ெ',  tr: 'e' },
  { base: 'ஏ', sign: 'ே',  tr: 'ae' },
  { base: 'ஐ', sign: 'ை',  tr: 'ai' },
  { base: 'ஒ', sign: 'ொ',  tr: 'o' },
  { base: 'ஓ', sign: 'ோ',  tr: 'oa' },
  { base: 'ஔ', sign: 'ௌ',  tr: 'au' },
];

// 18 மெய் (consonants): pulli form (with dot) + bare inherent-'a' form + roman.
const MEY = [
  { pulli: 'க்', cons: 'க', tr: 'k' },
  { pulli: 'ங்', cons: 'ங', tr: 'ng' },
  { pulli: 'ச்', cons: 'ச', tr: 'ch' },
  { pulli: 'ஞ்', cons: 'ஞ', tr: 'nj' },
  { pulli: 'ட்', cons: 'ட', tr: 't' },
  { pulli: 'ண்', cons: 'ண', tr: 'N' },
  { pulli: 'த்', cons: 'த', tr: 'th' },
  { pulli: 'ந்', cons: 'ந', tr: 'nh' },
  { pulli: 'ப்', cons: 'ப', tr: 'p' },
  { pulli: 'ம்', cons: 'ம', tr: 'm' },
  { pulli: 'ய்', cons: 'ய', tr: 'y' },
  { pulli: 'ர்', cons: 'ர', tr: 'r' },
  { pulli: 'ல்', cons: 'ல', tr: 'l' },
  { pulli: 'வ்', cons: 'வ', tr: 'v' },
  { pulli: 'ழ்', cons: 'ழ', tr: 'zh' },
  { pulli: 'ள்', cons: 'ள', tr: 'L' },
  { pulli: 'ற்', cons: 'ற', tr: 'R' },
  { pulli: 'ன்', cons: 'ன', tr: 'n' },
];

const ROUNDS = 10;
const compose = (m, u) => m.cons + u.sign;          // க + ா = கா
const roman = (m, u) => m.tr + u.tr;                 // k + aa = kaa
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// ⚠️ SOUND TEMPORARILY DISABLED (see README "TODO"). The bundled clips / browser TTS
// weren't accurate enough — short vs long vowels (குறில்/நெடில்) sounded identical and
// the ங row was wrong. Sound is gated off until we source a better Tamil voice.
// To re-enable: flip SOUND_ENABLED to true (and restore the 🔊 buttons + Listen & Find mode).
const SOUND_ENABLED = false;

// Map every Tamil glyph the game can speak → its bundled audio clip (public/audio/tamil/).
// Clips fall back to browser TTS if one is missing. Kept wired up for the re-enable.
const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/tamil/`;
const SOUND = new Map();
UYIR.forEach((u, vi) => SOUND.set(u.base, `ta_v${vi}.mp3`));         // 12 உயிர்
MEY.forEach((m, ci) => {
  SOUND.set(m.pulli, `ta_m${ci}.mp3`);                              // 18 மெய் (pulli sound)
  UYIR.forEach((u, vi) => SOUND.set(compose(m, u), `ta_c${ci}_v${vi}.mp3`)); // 216 உயிர்மெய்
});
const say = text => {
  if (!SOUND_ENABLED) return;                                       // sound off for now
  const clip = SOUND.get(text);
  if (clip) playClip(AUDIO_BASE + clip, text);
  else speak(text);
};

export default function TamilLetters() {
  const [mode, setMode] = useState(null); // null | learn | mix | extract | listen

  const back = () => setMode(null);
  if (mode === 'learn')   return <LearnMode   onBack={back} />;
  if (mode === 'mix')     return <MixMode     onBack={back} />;
  if (mode === 'extract') return <ExtractMode onBack={back} />;
  if (mode === 'listen')  return <ListenMode  onBack={back} />; // unreachable while Listen & Find is disabled (sound off)
  return <StartScreen onPick={setMode} />;
}

/* ─────────────── Start screen ─────────────── */
const MODES = [
  { id: 'learn',   emoji: '📖', title: 'Learn Grid',   sub: 'See how a consonant + vowel build a letter',    color: '#8b5cf6' },
  { id: 'mix',     emoji: '🧪', title: 'Mix It!',      sub: 'Join a consonant + vowel to make a letter',     color: '#f59e0b' },
  { id: 'extract', emoji: '🔍', title: 'Extract It!',  sub: 'Split a letter into its vowel and consonant',   color: '#3b82f6' },
  // 👂 Listen & Find is disabled while sound is off — it depends entirely on audio. See README "TODO".
  // { id: 'listen', emoji: '👂', title: 'Listen & Find',  sub: 'Hear a letter, then tap the right one',      color: '#10b981' },
];

function StartScreen({ onPick }) {
  return (
    <div className="card card-purple tl-card" style={{ '--tl-accent': '#8b5cf6' }}>
      <div className="tl-hero">
        <div className="tl-hero-glyph">அ</div>
        <h2>Tamil Tango</h2>
        <p className="tl-hero-sub">தமிழ் எழுத்து — dance the letters together!</p>
      </div>
      <div className="tl-mode-grid">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            className="tl-mode-btn"
            style={{ '--tl-accent': m.color, animationDelay: `${i * 90}ms` }}
            onClick={() => onPick(m.id)}
          >
            <span className="tl-mode-emoji">{m.emoji}</span>
            <span className="tl-mode-title">{m.title}</span>
            <span className="tl-mode-sub">{m.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Learn mode (the uyirmey table) ─────────────── */
function LearnMode({ onBack }) {
  const [sel, setSel] = useState(null); // { m, u }

  return (
    <div className="card card-purple tl-card" style={{ '--tl-accent': '#8b5cf6' }}>
      <TopBar title="📖 Learn Grid" onBack={onBack} />

      <div className="tl-breakdown">
        {sel ? (
          <>
            <span className="tl-bd-piece">{sel.m.pulli}</span>
            <span className="tl-bd-op">+</span>
            <span className="tl-bd-piece">{sel.u.base}</span>
            <span className="tl-bd-op">=</span>
            <span key={compose(sel.m, sel.u)} className="tl-bd-answer">{compose(sel.m, sel.u)}</span>
            {/* 🔊 button hidden while sound is disabled — see README "TODO".
            <button className="tl-bd-say" onClick={() => say(compose(sel.m, sel.u))} aria-label="Hear it">🔊</button> */}
            <span className="tl-bd-roman">{roman(sel.m, sel.u)}</span>
          </>
        ) : (
          <span className="tl-bd-hint">👆 Tap any letter to see how it’s built</span>
        )}
      </div>

      <div className="tl-grid-scroll">
        <div className="tl-grid" style={{ gridTemplateColumns: `auto repeat(${UYIR.length}, 1fr)` }}>
          <div className="tl-cell tl-corner">மெய் ／ உயிர்</div>
          {UYIR.map(u => (
            <button key={u.base} className="tl-cell tl-head" onClick={() => say(u.base)}>
              <span className="tl-head-letter">{u.base}</span>
              <span className="tl-head-tr">{u.tr}</span>
            </button>
          ))}
          {MEY.map((m, r) => (
            <Fragment key={m.pulli}>
              <button className="tl-cell tl-head" onClick={() => say(m.pulli)}>
                <span className="tl-head-letter">{m.pulli}</span>
                <span className="tl-head-tr">{m.tr}</span>
              </button>
              {UYIR.map((u, c) => {
                const active = sel && sel.m === m && sel.u === u;
                return (
                  <button
                    key={u.base}
                    className={`tl-cell tl-body${active ? ' tl-active' : ''}`}
                    style={{ animationDelay: `${(r + c) * 12}ms` }}
                    onClick={() => { setSel({ m, u }); say(compose(m, u)); }}
                  >
                    {compose(m, u)}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Mix It! quiz (combine consonant + vowel) ─────────────── */
function makeOptions(m, u) {
  const correct = compose(m, u);
  const opts = new Set([correct]);
  const otherV = shuffle(UYIR.filter(v => v !== u)); // same consonant, other vowels (look-alike)
  const otherC = shuffle(MEY.filter(c => c !== m));  // same vowel, other consonant
  opts.add(compose(m, otherV[0]));
  opts.add(compose(m, otherV[1]));
  opts.add(compose(otherC[0], u));
  let i = 2;
  while (opts.size < 4 && i < otherV.length) opts.add(compose(m, otherV[i++]));
  return shuffle([...opts].slice(0, 4));
}

function makeMixDeck() {
  const deck = [];
  const used = new Set();
  while (deck.length < ROUNDS) {
    const m = rand(MEY), u = rand(UYIR);
    const key = m.pulli + u.base;
    if (used.has(key)) continue;
    used.add(key);
    deck.push({ m, u, options: makeOptions(m, u) });
  }
  return deck;
}

function MixMode({ onBack }) {
  const [deck, setDeck]     = useState(makeMixDeck);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongs, setWrongs] = useState(0);          // wrong taps in the current round
  const [picked, setPicked] = useState(null);
  const [status, setStatus] = useState('asking');   // asking | right | wrong
  const [recap, setRecap]   = useState([]);
  const [gain, setGain]     = useState(null);
  const [done, setDone]     = useState(false);
  const [hint, setHint]     = useState(false);     // reveal romanization for this round
  const timeouts = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  const q = deck[round];

  function choose(opt) {
    if (status !== 'asking') return;
    const correct = compose(q.m, q.u);
    setPicked(opt);
    say(opt); // sound out the letter they guessed, right or wrong
    if (opt === correct) {
      setStatus('right');
      const pts = Math.max(100 - wrongs * 25, 25) + streak * 10;
      setScore(s => s + pts);
      setStreak(k => k + 1);
      setGain({ pts, key: round });
      setRecap(r => [...r, { letter: correct, roman: roman(q.m, q.u), ok: wrongs === 0 }]);
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 26);
      later(advance, 1300);
    } else {
      setStatus('wrong');
      setStreak(0);
      setWrongs(w => w + 1);
      later(() => { setStatus('asking'); setPicked(null); }, 650);
    }
  }

  function advance() {
    if (round + 1 >= ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);
    setWrongs(0);
    setPicked(null);
    setStatus('asking');
    setHint(false);
  }

  function restart() {
    setDeck(makeMixDeck());
    setRound(0); setScore(0); setStreak(0); setWrongs(0);
    setPicked(null); setStatus('asking'); setRecap([]); setGain(null); setDone(false);
    setHint(false);
  }

  if (done) {
    return <WonScreen mode="mix" color="orange" accent="#f59e0b" score={score} recap={recap} onAgain={restart} onModes={onBack} />;
  }

  const correct = compose(q.m, q.u);
  const showRoman = hint || status === 'right';
  return (
    <div className="card card-orange tl-card" style={{ '--tl-accent': '#f59e0b' }}>
      <TopBar title="🧪 Mix It!" onBack={onBack} score={score} streak={streak} />
      <Dots round={round} recap={recap} />

      <div className="tl-mix-stage">
        <button className="tl-mix-piece" onClick={() => say(q.m.pulli)}>
          <span>{q.m.pulli}</span>{showRoman && <small>{q.m.tr}</small>}
        </button>
        <span className="tl-mix-op">➕</span>
        <button className="tl-mix-piece" onClick={() => say(q.u.base)}>
          <span>{q.u.base}</span>{showRoman && <small>{q.u.tr}</small>}
        </button>
        <span className="tl-mix-op">=</span>
        <span className={`tl-mix-answer${status === 'right' ? ' tl-merge' : ''}`}>
          {status === 'right' ? correct : '?'}
        </span>
        {gain && gain.key === round && <span key={gain.key} className="tl-gain">+{gain.pts}</span>}
      </div>

      <div className="tl-options">
        {q.options.map(opt => {
          let cls = 'tl-option';
          if (status !== 'asking' && opt === correct) cls += ' tl-opt-right';
          else if (status === 'wrong' && opt === picked) cls += ' tl-opt-wrong';
          return (
            <button key={opt} className={cls} disabled={status === 'right'} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {!showRoman && (
        <button className="tl-hint-btn" onClick={() => setHint(true)}>
          💡 Hint: show English sounds
        </button>
      )}
    </div>
  );
}

/* ─────────────── Listen & Find quiz (sound → letter) ─────────────── */
function makeListenDeck() {
  const deck = [];
  const used = new Set();
  while (deck.length < ROUNDS) {
    const m = rand(MEY), u = rand(UYIR);
    const key = m.pulli + u.base;
    if (used.has(key)) continue;
    used.add(key);
    const target = compose(m, u);
    const opts = new Set([target]);
    const ov = shuffle(UYIR.filter(v => v !== u));
    const oc = shuffle(MEY.filter(c => c !== m));
    opts.add(compose(m, ov[0]));
    opts.add(compose(m, ov[1]));
    opts.add(compose(oc[0], u));
    opts.add(compose(oc[1], u));
    let i = 0;
    while (opts.size < 6) opts.add(compose(oc[i % oc.length], ov[(i + 2) % ov.length])), i++;
    deck.push({ m, u, target, roman: roman(m, u), options: shuffle([...opts].slice(0, 6)) });
  }
  return deck;
}

function ListenMode({ onBack }) {
  const [deck, setDeck]     = useState(makeListenDeck);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [picked, setPicked] = useState(null);
  const [status, setStatus] = useState('asking');
  const [recap, setRecap]   = useState([]);
  const [done, setDone]     = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  const q = deck[round];

  // Play the target whenever a new round starts.
  useEffect(() => {
    if (!done && q) say(q.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);

  function choose(opt) {
    if (status !== 'asking') return;
    setPicked(opt);
    if (opt === q.target) {
      setStatus('right');
      say(q.target);
      const pts = Math.max(100 - wrongs * 25, 25) + streak * 10;
      setScore(s => s + pts);
      setStreak(k => k + 1);
      setRecap(r => [...r, { letter: q.target, roman: q.roman, ok: wrongs === 0 }]);
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 26);
      later(advance, 1300);
    } else {
      setStatus('wrong');
      setStreak(0);
      setWrongs(w => w + 1);
      later(() => { setStatus('asking'); setPicked(null); }, 650);
    }
  }

  function advance() {
    if (round + 1 >= ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);
    setWrongs(0);
    setPicked(null);
    setStatus('asking');
  }

  function restart() {
    setDeck(makeListenDeck());
    setRound(0); setScore(0); setStreak(0); setWrongs(0);
    setPicked(null); setStatus('asking'); setRecap([]); setDone(false);
  }

  if (done) {
    return <WonScreen mode="listen" color="green" accent="#10b981" score={score} recap={recap} onAgain={restart} onModes={onBack} />;
  }

  return (
    <div className="card card-green tl-card" style={{ '--tl-accent': '#10b981' }}>
      <TopBar title="👂 Listen & Find" onBack={onBack} score={score} streak={streak} />
      <Dots round={round} recap={recap} />

      <div className="tl-listen-stage">
        <button className="tl-listen-play" onClick={() => say(q.target)} aria-label="Play the letter again">
          🔊
        </button>
        <p className="tl-listen-hint">Which letter did you hear?</p>
      </div>

      <div className="tl-options tl-options-six">
        {q.options.map(opt => {
          const reveal = status !== 'asking' && opt === q.target;
          let cls = 'tl-option';
          if (reveal) cls += ' tl-opt-right';
          else if (status === 'wrong' && opt === picked) cls += ' tl-opt-wrong';
          return (
            <button key={opt} className={cls} disabled={status === 'right'} onClick={() => choose(opt)}>
              {opt}
              {reveal && <small className="tl-opt-roman">{q.roman}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── Extract It! (split a uyirmey into its parts) ─────────────── */

// Visually confusable MEY consonant index groups
const MEY_SIM = [[0,1],[2,3],[4,5],[6,7],[8,9],[12,14,15],[16,17]];
// Confusable UYIR vowel pairs (short / long)
const UYIR_SIM = [[0,1],[2,3],[4,5],[6,7],[9,10]];

function simOf(idx, groups) {
  for (const g of groups) if (g.includes(idx)) return g.filter(x => x !== idx);
  return [];
}

function pickDistractors(correctIdx, len, simGroups, diff) {
  const pool      = Array.from({ length: len }, (_, i) => i).filter(i => i !== correctIdx);
  const similar   = simOf(correctIdx, simGroups);
  const dissimilar = pool.filter(i => !similar.includes(i));
  let picked;
  if (diff === 0) {
    picked = shuffle(dissimilar.length >= 3 ? dissimilar : pool).slice(0, 3);
  } else if (diff === 1) {
    const s = shuffle(similar).slice(0, 1);
    const d = shuffle(dissimilar).slice(0, 3 - s.length);
    picked = shuffle([...s, ...d]);
  } else {
    const s = shuffle(similar).slice(0, Math.min(2, similar.length));
    const d = shuffle(pool.filter(i => !s.includes(i))).slice(0, 3 - s.length);
    picked = shuffle([...s, ...d]);
  }
  const fallback = shuffle(pool.filter(i => !picked.includes(i)));
  while (picked.length < 3) picked.push(fallback.shift());
  return picked;
}

const DIFF_LABEL = ['⭐ Easy', '⭐⭐ Medium', '⭐⭐⭐ Hard'];

function makeExtractDeck() {
  const deck = [];
  const used = new Set();
  while (deck.length < ROUNDS) {
    const mi = Math.floor(Math.random() * MEY.length);
    const ui = Math.floor(Math.random() * UYIR.length);
    const key = `${mi}_${ui}`;
    if (used.has(key)) continue;
    used.add(key);
    const diff = deck.length < 4 ? 0 : deck.length < 7 ? 1 : 2;
    deck.push({
      m: MEY[mi], u: UYIR[ui], mi, ui, diff,
      uyirOpts: shuffle([ui, ...pickDistractors(ui, UYIR.length, UYIR_SIM, diff)]),
      meyOpts:  shuffle([mi, ...pickDistractors(mi, MEY.length,  MEY_SIM,  diff)]),
    });
  }
  return deck;
}

function ExtractMode({ onBack }) {
  const [deck, setDeck]           = useState(makeExtractDeck);
  const [round, setRound]         = useState(0);
  const [score, setScore]         = useState(0);
  const [streak, setStreak]       = useState(0);
  const [wrongs, setWrongs]       = useState(0);
  const [selU, setSelU]           = useState(null);
  const [selM, setSelM]           = useState(null);
  const [status, setStatus]       = useState('asking'); // asking | right | wrong
  const [wrongSide, setWrongSide] = useState(null);     // null | 'u' | 'm' | 'both'
  const [recap, setRecap]         = useState([]);
  const [gain, setGain]           = useState(null);
  const [done, setDone]           = useState(false);
  const [revealRoman, setRevealRoman] = useState(false); // reveal romanization for this round
  const [arrows, setArrows]       = useState({ u: null, m: null });

  const arenaRef  = useRef(null);
  const centerRef = useRef(null);
  const uRefs     = useRef([]);
  const mRefs     = useRef([]);
  const timeouts  = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timeouts.current.push(id); };

  const q = deck[round];

  // Measure tile positions after selection changes to draw arrows.
  useLayoutEffect(() => {
    const arena  = arenaRef.current;
    const center = centerRef.current;
    // No setState here: when refs are null the arena isn't rendered, so stale
    // arrows paint nothing, and the effect re-runs on selU/selM/round anyway.
    if (!arena || !center) return;
    const ar = arena.getBoundingClientRect();
    const cr = center.getBoundingClientRect();
    const cx  = cr.left - ar.left + cr.width / 2;
    const cyt = cr.top  - ar.top  + cr.height / 2;
    let uArr = null, mArr = null;
    if (selU !== null && uRefs.current[selU]) {
      const r = uRefs.current[selU].getBoundingClientRect();
      uArr = { x1: cx - cr.width / 2 - 2, y1: cyt, x2: r.right - ar.left + 2, y2: r.top - ar.top + r.height / 2 };
    }
    if (selM !== null && mRefs.current[selM]) {
      const r = mRefs.current[selM].getBoundingClientRect();
      mArr = { x1: cx + cr.width / 2 + 2, y1: cyt, x2: r.left - ar.left - 2,  y2: r.top - ar.top + r.height / 2 };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM measurement, see react.dev/learn/you-might-not-need-an-effect#measuring-layout
    setArrows({ u: uArr, m: mArr });
  }, [selU, selM, round]);

  function tapU(idx) {
    if (status !== 'asking') return;
    setSelU(idx);
    if (selM !== null) doCheck(idx, selM);
  }

  function tapM(idx) {
    if (status !== 'asking') return;
    setSelM(idx);
    if (selU !== null) doCheck(selU, idx);
  }

  function doCheck(uIdx, mIdx) {
    const uc = q.uyirOpts[uIdx] === q.ui;
    const mc = q.meyOpts[mIdx]  === q.mi;
    if (uc && mc) {
      setStatus('right');
      const pts = Math.max(100 - wrongs * 25, 25) + streak * 10;
      setScore(s => s + pts);
      setStreak(k => k + 1);
      setGain({ pts, key: round });
      setRecap(r => [...r, { letter: compose(q.m, q.u), roman: roman(q.m, q.u), ok: wrongs === 0 }]);
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 26);
      later(advance, 1400);
    } else {
      const side = !uc && !mc ? 'both' : !uc ? 'u' : 'm';
      setWrongSide(side);
      setStatus('wrong');
      setStreak(0);
      setWrongs(w => w + 1);
      later(() => {
        setWrongSide(null);
        setStatus('asking');
        if (side !== 'm') setSelU(null);
        if (side !== 'u') setSelM(null);
      }, 700);
    }
  }

  function advance() {
    if (round + 1 >= ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);
    setWrongs(0); setSelU(null); setSelM(null);
    setStatus('asking'); setWrongSide(null); setRevealRoman(false);
  }

  function restart() {
    setDeck(makeExtractDeck());
    setRound(0); setScore(0); setStreak(0); setWrongs(0);
    setSelU(null); setSelM(null); setStatus('asking'); setWrongSide(null);
    setRecap([]); setGain(null); setDone(false); setRevealRoman(false);
  }

  if (done) {
    return <WonScreen mode="extract" color="blue" accent="#3b82f6" score={score} recap={recap} onAgain={restart} onModes={onBack} />;
  }

  function tileState(idx, isU) {
    const sel  = isU ? selU : selM;
    const side = isU ? 'u' : 'm';
    if (sel !== idx) return '';
    if (status === 'right') return ' tl-extract-tile-right';
    if (status === 'wrong' && (wrongSide === side || wrongSide === 'both')) return ' tl-extract-tile-wrong';
    return ' tl-extract-tile-sel';
  }

  function arrowEl(a, isU) {
    if (!a) return null;
    const side  = isU ? 'u' : 'm';
    const st    = status === 'right' ? 'r' : (status === 'wrong' && (wrongSide === side || wrongSide === 'both')) ? 'w' : 'n';
    const color = st === 'r' ? '#51cf66' : st === 'w' ? '#ff6b6b' : '#3b82f6';
    return (
      <line key={isU ? 'u' : 'm'}
        x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
        stroke={color} strokeWidth={2.5} strokeOpacity=".85"
        markerEnd={`url(#tl-arr-${st})`}
        className="tl-extract-arrow"
      />
    );
  }

  const hint =
    status === 'wrong'                    ? 'Not quite — try again!'
    : selU === null && selM === null      ? 'Tap a consonant on the left and a vowel on the right'
    : selM !== null && selU === null      ? 'Now tap the vowel on the right →'
    : selM === null && selU !== null      ? '← Now tap the consonant on the left'
    : '';

  const showRoman = revealRoman || status === 'right';

  return (
    <div className="card card-blue tl-card" style={{ '--tl-accent': '#3b82f6' }}>
      <TopBar title="🔍 Extract It!" onBack={onBack} score={score} streak={streak} />
      <Dots round={round} recap={recap} />

      <div className="tl-extract-arena" ref={arenaRef}>
        {/* Left column: mey (consonant) options */}
        <div className="tl-extract-col">
          <div className="tl-extract-col-hd">மெய் <span>consonant</span></div>
          {q.meyOpts.map((mi, idx) => (
            <button
              key={MEY[mi].pulli}
              ref={el => { mRefs.current[idx] = el; }}
              className={`tl-extract-tile${tileState(idx, false)}`}
              disabled={status === 'right'}
              onClick={() => tapM(idx)}
            >
              <span>{MEY[mi].pulli}</span>
              {showRoman && <small>{MEY[mi].tr}</small>}
            </button>
          ))}
        </div>

        {/* Center: target uyirmey letter */}
        <div className="tl-extract-mid">
          <div className="tl-extract-diff">{DIFF_LABEL[q.diff]}</div>
          <div ref={centerRef} className={`tl-extract-target${status === 'right' ? ' tl-merge' : ''}`}>
            {compose(q.m, q.u)}
          </div>
          {gain && gain.key === round && <span key={gain.key} className="tl-gain">+{gain.pts}</span>}
          <div className="tl-extract-bkdn">
            {status === 'right'
              ? <>{q.m.pulli} + {q.u.base} <span className="tl-extract-bkdn-eq">=</span> {compose(q.m, q.u)}</>
              : <span className="tl-extract-bkdn-hint">? + ? = {compose(q.m, q.u)}</span>}
          </div>
        </div>

        {/* Right column: uyir (vowel) options */}
        <div className="tl-extract-col">
          <div className="tl-extract-col-hd">உயிர் <span>vowel</span></div>
          {q.uyirOpts.map((ui, idx) => (
            <button
              key={UYIR[ui].base}
              ref={el => { uRefs.current[idx] = el; }}
              className={`tl-extract-tile${tileState(idx, true)}`}
              disabled={status === 'right'}
              onClick={() => tapU(idx)}
            >
              <span>{UYIR[ui].base}</span>
              {showRoman && <small>{UYIR[ui].tr}</small>}
            </button>
          ))}
        </div>

        {/* SVG arrow overlay */}
        <svg className="tl-extract-svg" aria-hidden="true">
          <defs>
            {[['n','#3b82f6'],['r','#51cf66'],['w','#ff6b6b']].map(([st, fill]) => (
              <marker key={st} id={`tl-arr-${st}`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill={fill} opacity={st === 'n' ? '.85' : '1'} />
              </marker>
            ))}
          </defs>
          {arrowEl(arrows.u, true)}
          {arrowEl(arrows.m, false)}
        </svg>
      </div>

      <div className={`tl-extract-hint${status === 'wrong' ? ' tl-extract-hint-err' : ''}`}>{hint}</div>

      {!showRoman && (
        <button className="tl-hint-btn" onClick={() => setRevealRoman(true)}>
          💡 Hint: show English sounds
        </button>
      )}
    </div>
  );
}

/* ─────────────── Shared bits ─────────────── */
function TopBar({ title, onBack, score, streak }) {
  const showHud = score !== undefined;
  return (
    <div className="tl-bar">
      <button className="tl-back" onClick={onBack}>← Modes</button>
      <span className="tl-bar-title">{title}</span>
      <span className="tl-hud">
        {showHud && streak >= 2 && <span className="tl-streak">🔥 ×{streak}</span>}
        {showHud && <span className="tl-score">⭐ {score}</span>}
      </span>
    </div>
  );
}

function Dots({ round, recap }) {
  return (
    <div className="tl-dots">
      {Array.from({ length: ROUNDS }).map((_, i) => {
        const r = recap[i];
        let cls = 'tl-dot';
        if (i === round) cls += ' tl-dot-now';
        else if (r) cls += r.ok ? ' tl-dot-ok' : ' tl-dot-miss';
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

function WonScreen({ color, accent, score, recap, onAgain, onModes, mode }) {
  const oks = recap.filter(r => r.ok).length;
  const stars = oks >= ROUNDS ? 3 : oks >= Math.ceil(ROUNDS * 0.6) ? 2 : 1;
  // Fire once when a Tamil mode is finished (per-game completion metric).
  useEffect(() => { track('game_complete', { game: 'tamil', mode }); }, [mode]);
  return (
    <div className={`card card-${color} tl-card`} style={{ '--tl-accent': accent }}>
      <div className="tl-won">
        <div className="tl-won-emoji">🎉</div>
        <h2>Well done!</h2>
        <div className="tl-stars">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div className="tl-won-score">Score {score}</div>
        <div className="tl-recap">
          {recap.map((r, i) => (
            <div key={i} className={`tl-recap-item${r.ok ? '' : ' tl-recap-miss'}`}>
              <button className="tl-recap-letter" onClick={() => say(r.letter)}>{r.letter}</button>
              <span className="tl-recap-roman">{r.roman}</span>
            </div>
          ))}
        </div>
        <div className="btn-row">
          <button className="btn btn-orange" onClick={onAgain}>Play Again</button>
          <button className="btn btn-purple" onClick={onModes}>Pick a Mode</button>
        </div>
      </div>
    </div>
  );
}
