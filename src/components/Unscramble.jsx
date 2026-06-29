import { useState, useRef, useEffect } from 'react';
import { launchConfetti } from '../utils/confetti';
import { shuffle } from '../utils/shuffle';
import { track } from '../utils/analytics';

const CATEGORIES = [
  { id: 'animals', label: 'Animals', emoji: '🦁', color: '#f59e0b', words: [
    { w: 'CAT', e: '🐱' }, { w: 'DOG', e: '🐶' }, { w: 'FOX', e: '🦊' }, { w: 'PIG', e: '🐷' },
    { w: 'BEE', e: '🐝' }, { w: 'OWL', e: '🦉' }, { w: 'COW', e: '🐮' }, { w: 'FROG', e: '🐸' },
    { w: 'BIRD', e: '🐦' }, { w: 'BEAR', e: '🐻' }, { w: 'LION', e: '🦁' }, { w: 'DUCK', e: '🦆' },
    { w: 'FISH', e: '🐟' }, { w: 'TIGER', e: '🐯' }, { w: 'ZEBRA', e: '🦓' }, { w: 'PANDA', e: '🐼' },
    { w: 'KOALA', e: '🐨' }, { w: 'SHARK', e: '🦈' }, { w: 'WHALE', e: '🐳' }, { w: 'SHEEP', e: '🐑' },
    { w: 'MOUSE', e: '🐭' }, { w: 'MONKEY', e: '🐵' }, { w: 'RABBIT', e: '🐰' }, { w: 'TURTLE', e: '🐢' },
    { w: 'DRAGON', e: '🐉' }, { w: 'PENGUIN', e: '🐧' }, { w: 'DOLPHIN', e: '🐬' }, { w: 'GIRAFFE', e: '🦒' },
    { w: 'OCTOPUS', e: '🐙' }, { w: 'ELEPHANT', e: '🐘' }, { w: 'KANGAROO', e: '🦘' }, { w: 'BUTTERFLY', e: '🦋' },
  ]},
  { id: 'food', label: 'Yummy Food', emoji: '🍕', color: '#ef4444', words: [
    { w: 'PIE', e: '🥧' }, { w: 'EGG', e: '🥚' }, { w: 'JAM', e: '🍓' }, { w: 'CAKE', e: '🍰' },
    { w: 'TACO', e: '🌮' }, { w: 'CORN', e: '🌽' }, { w: 'RICE', e: '🍚' }, { w: 'MILK', e: '🥛' },
    { w: 'PEAR', e: '🍐' }, { w: 'PIZZA', e: '🍕' }, { w: 'APPLE', e: '🍎' }, { w: 'MANGO', e: '🥭' },
    { w: 'DONUT', e: '🍩' }, { w: 'HONEY', e: '🍯' }, { w: 'BREAD', e: '🍞' }, { w: 'CANDY', e: '🍬' },
    { w: 'GRAPE', e: '🍇' }, { w: 'LEMON', e: '🍋' }, { w: 'PEACH', e: '🍑' }, { w: 'BURGER', e: '🍔' },
    { w: 'COOKIE', e: '🍪' }, { w: 'BANANA', e: '🍌' }, { w: 'CHEESE', e: '🧀' }, { w: 'WAFFLE', e: '🧇' },
    { w: 'PANCAKE', e: '🥞' }, { w: 'PRETZEL', e: '🥨' }, { w: 'AVOCADO', e: '🥑' }, { w: 'POPCORN', e: '🍿' },
    { w: 'CUPCAKE', e: '🧁' }, { w: 'NOODLES', e: '🍜' }, { w: 'COCONUT', e: '🥥' }, { w: 'SANDWICH', e: '🥪' },
    { w: 'LOLLIPOP', e: '🍭' }, { w: 'BROCCOLI', e: '🥦' },
  ]},
  { id: 'nature', label: 'Nature', emoji: '🌈', color: '#10b981', words: [
    { w: 'SUN', e: '☀️' }, { w: 'SKY', e: '🌤️' }, { w: 'TREE', e: '🌳' }, { w: 'LEAF', e: '🍃' },
    { w: 'ROSE', e: '🌹' }, { w: 'STAR', e: '⭐' }, { w: 'MOON', e: '🌙' }, { w: 'RAIN', e: '🌧️' },
    { w: 'SNOW', e: '❄️' }, { w: 'SEED', e: '🌱' }, { w: 'WIND', e: '💨' }, { w: 'CLOUD', e: '☁️' },
    { w: 'RIVER', e: '🏞️' }, { w: 'BEACH', e: '🏖️' }, { w: 'STORM', e: '⛈️' }, { w: 'FLOWER', e: '🌸' },
    { w: 'FOREST', e: '🌲' }, { w: 'ISLAND', e: '🏝️' }, { w: 'GARDEN', e: '🪴' }, { w: 'SUNSET', e: '🌅' },
    { w: 'METEOR', e: '☄️' }, { w: 'RAINBOW', e: '🌈' }, { w: 'VOLCANO', e: '🌋' }, { w: 'THUNDER', e: '⚡' },
    { w: 'TORNADO', e: '🌪️' }, { w: 'MOUNTAIN', e: '⛰️' }, { w: 'WATERFALL', e: '💦' },
  ]},
  { id: 'magic', label: 'Magic Land', emoji: '🦄', color: '#8b5cf6', words: [
    { w: 'GEM', e: '💎' }, { w: 'HAT', e: '🎩' }, { w: 'KEY', e: '🗝️' }, { w: 'MAP', e: '🗺️' },
    { w: 'ELF', e: '🧝' }, { w: 'WAND', e: '🪄' }, { w: 'RING', e: '💍' }, { w: 'MASK', e: '🎭' },
    { w: 'CROWN', e: '👑' }, { w: 'FAIRY', e: '🧚' }, { w: 'WITCH', e: '🧙‍♀️' }, { w: 'MAGIC', e: '✨' },
    { w: 'GHOST', e: '👻' }, { w: 'GENIE', e: '🧞' }, { w: 'WIZARD', e: '🧙‍♂️' }, { w: 'CASTLE', e: '🏰' },
    { w: 'POTION', e: '🧪' }, { w: 'KNIGHT', e: '🛡️' }, { w: 'PIRATE', e: '🏴‍☠️' }, { w: 'DRAGON', e: '🐉' },
    { w: 'UNICORN', e: '🦄' }, { w: 'MERMAID', e: '🧜‍♀️' }, { w: 'MONSTER', e: '👾' }, { w: 'PRINCESS', e: '👸' },
    { w: 'TREASURE', e: '💰' },
  ]},
];

const ROUNDS = 8;

function scrambledOrder(tiles, word) {
  let order = shuffle(tiles.map(t => t.id));
  for (let t = 0; t < 20; t++) {
    const spelled = order.map(id => tiles.find(x => x.id === id).ch).join('');
    if (spelled !== word) break;
    order = shuffle(order);
  }
  return order;
}

export default function Unscramble() {
  const [phase, setPhase]         = useState('select'); // select | playing | won
  const [cat, setCat]             = useState(null);
  const [deck, setDeck]           = useState([]);
  const [round, setRound]         = useState(0);
  const [tiles, setTiles]         = useState([]);       // [{ id, ch }]
  const [rack, setRack]           = useState([]);       // tile ids waiting below
  const [slots, setSlots]         = useState([]);       // tile id | null per letter
  const [hintLevel, setHintLevel] = useState(0);        // 0 none · 1 emoji · 2 first letter
  const [status, setStatus]       = useState('building'); // building | correct | wrong | skipped
  const [score, setScore]         = useState(0);
  const [streak, setStreak]       = useState(0);
  const [recap, setRecap]         = useState([]);       // [{ w, e, pts, ok }]
  const [gain, setGain]           = useState(null);     // { pts, key }
  const timeouts = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  const entry = deck[round];
  const chOf = id => tiles.find(t => t.id === id)?.ch ?? '';

  function setupRound(wordEntry, roundIdx) {
    const tls = wordEntry.w.split('').map((ch, i) => ({ id: `${roundIdx}-${i}`, ch }));
    setTiles(tls);
    setRack(scrambledOrder(tls, wordEntry.w));
    setSlots(Array(wordEntry.w.length).fill(null));
    setHintLevel(0);
    setStatus('building');
  }

  function startGame(category) {
    const picked = shuffle(category.words).slice(0, ROUNDS)
      .sort((a, b) => a.w.length - b.w.length);
    setCat(category);
    setDeck(picked);
    setRound(0);
    setScore(0);
    setStreak(0);
    setRecap([]);
    setGain(null);
    setupRound(picked[0], 0);
    setPhase('playing');
  }

  function advance(result) {
    setRecap(rs => [...rs, { w: deck[round].w, e: deck[round].e, ...result }]);
    if (round + 1 >= deck.length) {
      setPhase('won');
      track('game_complete', { game: 'unscramble' });
      for (let i = 0; i < 6; i++)
        later(() => launchConfetti(
          window.innerWidth * (0.2 + Math.random() * 0.6),
          window.innerHeight * 0.3, 30
        ), i * 130);
    } else {
      const r = round + 1;
      setRound(r);
      setupRound(deck[r], r);
    }
  }

  function check(newSlots) {
    const guess = newSlots.map(id => chOf(id)).join('');
    if (guess === entry.w) {
      const pts = Math.max(100 - hintLevel * 25, 25) + streak * 10;
      setStatus('correct');
      setScore(s => s + pts);
      setStreak(k => k + 1);
      setGain({ pts, key: round });
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 26);
      later(() => advance({ pts, ok: true }), 1250);
    } else {
      setStatus('wrong');
      later(() => setStatus('building'), 600);
    }
  }

  function placeTile(id) {
    if (status !== 'building') return;
    const idx = slots.indexOf(null);
    if (idx === -1) return;
    const newSlots = [...slots];
    newSlots[idx] = id;
    setSlots(newSlots);
    setRack(r => r.filter(x => x !== id));
    if (!newSlots.includes(null)) check(newSlots);
  }

  function returnTile(slotIdx) {
    if (status !== 'building') return;
    const id = slots[slotIdx];
    if (!id) return;
    setSlots(s => s.map((x, i) => (i === slotIdx ? null : x)));
    setRack(r => [...r, id]);
  }

  function mixRack() {
    if (status !== 'building') return;
    setRack(r => shuffle(r));
  }

  function giveHint() {
    if (status !== 'building' || hintLevel >= 2) return;
    setHintLevel(h => h + 1);
  }

  function skip() {
    if (status !== 'building') return;
    const pool = [...tiles];
    const ordered = entry.w.split('').map(ch => {
      const i = pool.findIndex(t => t.ch === ch);
      return pool.splice(i, 1)[0].id;
    });
    setSlots(ordered);
    setRack([]);
    setStatus('skipped');
    setStreak(0);
    later(() => advance({ pts: 0, ok: false }), 1300);
  }

  // ── SELECT ──
  if (phase === 'select') {
    return (
      <div className="card card-green">
        <div className="un-select-header">
          <div className="un-logo">🔤</div>
          <h2>Unscramble Words</h2>
          <p className="un-select-sub">The letters got all mixed up!<br />Tap them in the right order to fix each word.</p>
        </div>
        <div className="un-cat-grid">
          {CATEGORIES.map(c => (
            <button key={c.id} className="un-cat-card" style={{ '--un-c': c.color }}
              onClick={() => startGame(c)}
            >
              <div className="un-cc-emoji">{c.emoji}</div>
              <div className="un-cc-name">{c.label}</div>
              <div className="un-cc-hint">{ROUNDS} words</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── WON ──
  if (phase === 'won') {
    const max = deck.length * 100;
    const stars = score >= max * 0.75 ? 3 : score >= max * 0.45 ? 2 : 1;
    const starLabel = stars === 3 ? '🏆 WORD WIZARD!' : stars === 2 ? '⭐ WORD STAR!' : '👏 NICE TRY!';
    return (
      <div className="card card-green">
        <div className="un-won">
          <div className="un-won-title">🎉 ALL DONE!</div>
          <div className="un-won-score" style={{ borderColor: cat.color }}>⭐ {score}</div>
          <div className="un-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <div className="un-star-label">{starLabel}</div>
          <div className="un-recap">
            {recap.map((r, i) => (
              <div key={i} className={`un-recap-item${r.ok ? '' : ' un-recap-skip'}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="un-recap-emoji">{r.e}</span>
                <span className="un-recap-word">{r.w}</span>
                <span className="un-recap-pts">{r.ok ? `+${r.pts}` : 'skip'}</span>
              </div>
            ))}
          </div>
          <div className="un-btn-row">
            <button className="btn btn-green" onClick={() => startGame(cat)}>🔁 Play Again</button>
            <button className="btn btn-blue" onClick={() => setPhase('select')}>🏠 Change Topic</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const rowCls = status === 'correct' ? ' un-row-correct'
    : status === 'wrong' ? ' un-row-wrong'
    : status === 'skipped' ? ' un-row-skip' : '';

  return (
    <div className="card card-green" style={{ '--un-accent': cat.color }}>
      <div className="un-top">
        <span className="un-cat-pill">{cat.emoji} {cat.label}</span>
        <div className="un-top-right">
          {streak >= 2 && <span className="un-streak" key={streak}>🔥 ×{streak}</span>}
          <span className="un-score" key={score}>⭐ {score}</span>
        </div>
      </div>

      <div className="un-dots">
        {deck.map((d, i) => (
          <span key={i} className={
            'un-dot'
            + (i < recap.length ? (recap[i].ok ? ' un-dot-done' : ' un-dot-skip') : '')
            + (i === round ? ' un-dot-active' : '')
          } />
        ))}
      </div>

      <div className="un-word-area" key={round}>
        <div className="un-bubble">
          {hintLevel >= 1
            ? <span className="un-bubble-emoji">{entry.e}</span>
            : <span className="un-bubble-q">?</span>}
        </div>
        <div className="un-word-meta">
          Word {round + 1} of {deck.length} · {entry.w.length} letters
        </div>
        {gain && gain.key === round && status === 'correct' && (
          <div className="un-gain" key={gain.key}>+{gain.pts}</div>
        )}
      </div>

      <div className={`un-slots${rowCls}`}>
        {slots.map((id, i) => id ? (
          <button key={id} className="un-tile un-tile-slot"
            style={{ animationDelay: status === 'correct' ? `${i * 70}ms` : '0ms' }}
            onClick={() => returnTile(i)}
          >
            {chOf(id)}
          </button>
        ) : (
          <div key={`empty-${i}`} className="un-slot">
            {i === 0 && hintLevel >= 2 && <span className="un-ghost">{entry.w[0]}</span>}
          </div>
        ))}
      </div>

      <div className="un-rack">
        {rack.map(id => (
          <button key={id} className="un-tile" onClick={() => placeTile(id)}>
            {chOf(id)}
          </button>
        ))}
        {rack.length === 0 && <span className="un-rack-empty">✨</span>}
      </div>

      <div className="un-actions">
        <button className="un-action-btn" onClick={giveHint} disabled={hintLevel >= 2}>
          {hintLevel === 0 ? '💡 Hint (−25)' : hintLevel === 1 ? '💡 First letter (−25)' : '💡 No more hints'}
        </button>
        <button className="un-action-btn" onClick={mixRack}>🔀 Mix</button>
        <button className="un-action-btn un-action-skip" onClick={skip}>⏭ Skip</button>
      </div>
    </div>
  );
}
