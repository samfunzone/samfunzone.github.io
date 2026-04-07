import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';

const ALL_EMOJIS = ['🐶','🐱','🐸','🦊','🐨','🐧','🦁','🐝','🦋','🐠','🦄','🐻'];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const SHUFFLE_MS  = 700; // two Y-axis flips
const MATCH_MS    = 450; // X-axis flip on match

export default function MemoryMatch() {
  const [size, setSize]             = useState(8);
  const [hardMode, setHardMode]     = useState(false);
  const [cards, setCards]           = useState([]);
  const [flipped, setFlipped]       = useState([]);
  const [matched, setMatched]       = useState(new Set());
  const [moves, setMoves]           = useState(0);
  const [locked, setLocked]         = useState(false);
  const [status, setStatus]         = useState('Choose a grid size to play!');
  const [isShuffling, setIsShuffling]   = useState(false);
  const [celebrating, setCelebrating]   = useState(new Set());
  const pairsSinceShuffle           = useRef(0);

  const celebrate = (indices) => {
    setCelebrating(new Set(indices));
    setTimeout(() => setCelebrating(new Set()), MATCH_MS);
  };

  const init = (pairCount = size) => {
    const emojis = ALL_EMOJIS.slice(0, pairCount);
    const deck = shuffle([...emojis, ...emojis]).map((emoji, i) => ({ id: i, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setIsShuffling(false);
    setCelebrating(new Set());
    setStatus('Find all the matches!');
    pairsSinceShuffle.current = 0;
  };

  const changeSize = (n) => {
    setSize(n);
    init(n);
  };

  const shuffleUnmatched = (currentCards, currentMatched) => {
    const indices = currentCards.map((c, i) => currentMatched.has(c.emoji) ? null : i).filter(i => i !== null);
    const emojis  = shuffle(indices.map(i => currentCards[i].emoji));
    const next    = [...currentCards];
    indices.forEach((idx, j) => { next[idx] = { ...next[idx], emoji: emojis[j] }; });
    return next;
  };

  const triggerShuffle = (newMatched, moveCount) => {
    setIsShuffling(true);
    setTimeout(() => {
      setCards(prev => shuffleUnmatched(prev, newMatched));
      setFlipped([]);
    }, SHUFFLE_MS * 0.75);
    setTimeout(() => {
      setIsShuffling(false);
      setLocked(false);
      setStatus(`🔀 Cards shuffled! Moves: ${moveCount}`);
    }, SHUFFLE_MS);
  };

  const flip = (idx) => {
    if (locked || flipped.includes(idx) || matched.has(cards[idx].emoji)) return;
    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      const [a, b] = next;
      setMoves(m => m + 1);
      setLocked(true);

      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = new Set(matched).add(cards[a].emoji);
        setMatched(newMatched);

        if (newMatched.size === size) {
          // Final solve — celebrate all cards then confetti
          celebrate(cards.map((_, i) => i));
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            launchConfetti(window.innerWidth / 2, 200, 60);
            setStatus(`You won in ${moves + 1} moves!`);
          }, MATCH_MS);
          return;
        }

        // Regular match — celebrate just the two matched cards
        celebrate([a, b]);

        pairsSinceShuffle.current += 1;
        if (hardMode && pairsSinceShuffle.current >= 2) {
          pairsSinceShuffle.current = 0;
          setTimeout(() => triggerShuffle(newMatched, moves + 1), MATCH_MS);
        } else {
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            setStatus(`Moves: ${moves + 1}`);
          }, MATCH_MS);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          setStatus(`Moves: ${moves + 1}`);
        }, 900);
      }
    }
  };

  return (
    <div className="card card-green">
      <h2>🧠 Memory Match!</h2>
      <div className="mem-size-row">
        <span>Grid size:</span>
        {[8, 10, 12].map(n => (
          <button
            key={n}
            className={`btn ${size === n ? 'btn-green' : 'btn-outline'}`}
            onClick={() => changeSize(n)}
          >
            {n} pairs
          </button>
        ))}
      </div>
      <div className="mem-size-row">
        <label className="mem-hard-toggle">
          <input
            type="checkbox"
            checked={hardMode}
            onChange={e => setHardMode(e.target.checked)}
          />
          Hard mode — cards shuffle every 2 matches
        </label>
      </div>
      <div className="mem-status">{status}</div>
      <div className="mem-grid">
        {cards.map((card, idx) => {
          const isFlipped    = flipped.includes(idx);
          const isMatched    = matched.has(card.emoji);
          const doShuffle    = isShuffling && !isMatched;
          const doCelebrate  = celebrating.has(idx);
          return (
            <div
              key={card.id}
              className={`mem-card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}${doShuffle ? ' shuffling' : ''}${doCelebrate ? ' celebrating' : ''}`}
              onClick={() => flip(idx)}
            >
              {isFlipped || isMatched ? card.emoji : '?'}
            </div>
          );
        })}
      </div>
      {cards.length > 0 && (
        <div className="btn-row">
          <button className="btn btn-green" onClick={() => init()}>▶ New Game</button>
        </div>
      )}
    </div>
  );
}
