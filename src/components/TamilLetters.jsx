import { useState, useRef, useEffect, Fragment } from 'react';
import { launchConfetti } from '../utils/confetti';
import { shuffle } from '../utils/shuffle';
import { speak, hasTamilVoice } from '../utils/speech';

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

export default function TamilLetters() {
  const [mode, setMode] = useState(null); // null | learn | mix | listen
  const [noVoice, setNoVoice] = useState(false);

  useEffect(() => {
    const check = () => setNoVoice(!hasTamilVoice());
    check();
    const synth = window.speechSynthesis;
    synth?.addEventListener?.('voiceschanged', check);
    return () => synth?.removeEventListener?.('voiceschanged', check);
  }, []);

  const back = () => setMode(null);
  if (mode === 'learn')  return <LearnMode  onBack={back} />;
  if (mode === 'mix')    return <MixMode    onBack={back} />;
  if (mode === 'listen') return <ListenMode onBack={back} noVoice={noVoice} />;
  return <StartScreen onPick={setMode} noVoice={noVoice} />;
}

/* ─────────────── Start screen ─────────────── */
const MODES = [
  { id: 'learn',  emoji: '📖', title: 'Learn Grid',     sub: 'Tap any letter to hear it & see how it’s built', color: '#8b5cf6' },
  { id: 'mix',    emoji: '🧪', title: 'Mix It!',        sub: 'Join a consonant + vowel to make a letter',      color: '#f59e0b' },
  { id: 'listen', emoji: '👂', title: 'Listen & Find',  sub: 'Hear a letter, then tap the right one',          color: '#10b981' },
];

function StartScreen({ onPick, noVoice }) {
  return (
    <div className="card card-purple tl-card" style={{ '--tl-accent': '#8b5cf6' }}>
      <div className="tl-hero">
        <div className="tl-hero-glyph">அ</div>
        <h2>Tamil Tango</h2>
        <p className="tl-hero-sub">தமிழ் எழுத்து — dance the letters together!</p>
      </div>
      {noVoice && (
        <div className="tl-voice-tip">
          🔈 This device has no Tamil voice, so sound may be silent — every letter still shows its English spelling (like “kaa”).
        </div>
      )}
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
            <button className="tl-bd-say" onClick={() => speak(compose(sel.m, sel.u))} aria-label="Hear it">🔊</button>
            <span className="tl-bd-roman">{roman(sel.m, sel.u)}</span>
          </>
        ) : (
          <span className="tl-bd-hint">👆 Tap any letter in the table to hear it</span>
        )}
      </div>

      <div className="tl-grid-scroll">
        <div className="tl-grid" style={{ gridTemplateColumns: `auto repeat(${UYIR.length}, 1fr)` }}>
          <div className="tl-cell tl-corner">மெய் ／ உயிர்</div>
          {UYIR.map(u => (
            <button key={u.base} className="tl-cell tl-head" onClick={() => speak(u.base)}>
              <span className="tl-head-letter">{u.base}</span>
              <span className="tl-head-tr">{u.tr}</span>
            </button>
          ))}
          {MEY.map((m, r) => (
            <Fragment key={m.pulli}>
              <button className="tl-cell tl-head" onClick={() => speak(m.pulli)}>
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
                    onClick={() => { setSel({ m, u }); speak(compose(m, u)); }}
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
    speak(opt); // sound out the letter they guessed, right or wrong
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
  }

  function restart() {
    setDeck(makeMixDeck());
    setRound(0); setScore(0); setStreak(0); setWrongs(0);
    setPicked(null); setStatus('asking'); setRecap([]); setGain(null); setDone(false);
  }

  if (done) {
    return <WonScreen color="orange" accent="#f59e0b" score={score} recap={recap} onAgain={restart} onModes={onBack} />;
  }

  const correct = compose(q.m, q.u);
  return (
    <div className="card card-orange tl-card" style={{ '--tl-accent': '#f59e0b' }}>
      <TopBar title="🧪 Mix It!" onBack={onBack} score={score} streak={streak} />
      <Dots round={round} recap={recap} />

      <div className="tl-mix-stage">
        <button className="tl-mix-piece" onClick={() => speak(q.m.pulli)}>
          <span>{q.m.pulli}</span><small>{q.m.tr}</small>
        </button>
        <span className="tl-mix-op">➕</span>
        <button className="tl-mix-piece" onClick={() => speak(q.u.base)}>
          <span>{q.u.base}</span><small>{q.u.tr}</small>
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

function ListenMode({ onBack, noVoice }) {
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

  // Speak the target whenever a new round starts.
  useEffect(() => {
    if (!done && q) speak(q.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);

  function choose(opt) {
    if (status !== 'asking') return;
    setPicked(opt);
    if (opt === q.target) {
      setStatus('right');
      speak(q.target);
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
    return <WonScreen color="green" accent="#10b981" score={score} recap={recap} onAgain={restart} onModes={onBack} />;
  }

  return (
    <div className="card card-green tl-card" style={{ '--tl-accent': '#10b981' }}>
      <TopBar title="👂 Listen & Find" onBack={onBack} score={score} streak={streak} />
      <Dots round={round} recap={recap} />

      {noVoice && (
        <div className="tl-voice-tip">🔈 No Tamil voice on this device — Listen mode needs sound. Try Learn or Mix It!</div>
      )}

      <div className="tl-listen-stage">
        <button className="tl-listen-play" onClick={() => speak(q.target)} aria-label="Play the letter again">
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

function WonScreen({ color, accent, score, recap, onAgain, onModes }) {
  const oks = recap.filter(r => r.ok).length;
  const stars = oks >= ROUNDS ? 3 : oks >= Math.ceil(ROUNDS * 0.6) ? 2 : 1;
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
              <button className="tl-recap-letter" onClick={() => speak(r.letter)}>{r.letter}</button>
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
