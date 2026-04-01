import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';

const EMOJIS = ['🐶','🐱','🐸','🦊','🐨','🐧','🦁','🐝'];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryMatch() {
  const [cards, setCards]     = useState([]);
  const [flipped, setFlipped] = useState([]);   // indices currently face-up (not yet matched)
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves]     = useState(0);
  const [locked, setLocked]   = useState(false);
  const [status, setStatus]   = useState('Press New Game to play!');

  const init = () => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({ id: i, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setStatus('Find all the matches!');
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
        setFlipped([]);
        setLocked(false);
        if (newMatched.size === EMOJIS.length) {
          launchConfetti(window.innerWidth / 2, 200, 60);
          setStatus(`You won in ${moves + 1} moves!`);
        } else {
          setStatus(`Moves: ${moves + 1}`);
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
      <div className="mem-status">{status}</div>
      <div className="mem-grid">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.has(card.emoji);
          return (
            <div
              key={card.id}
              className={`mem-card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
              onClick={() => flip(idx)}
            >
              {isFlipped || isMatched ? card.emoji : '?'}
            </div>
          );
        })}
      </div>
      <div className="btn-row">
        <button className="btn btn-green" onClick={init}>▶ New Game</button>
      </div>
    </div>
  );
}
