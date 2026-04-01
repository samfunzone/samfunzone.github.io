import { useState, useRef, useCallback } from 'react';
import { launchConfetti } from '../utils/confetti';

const BALLOON_EMOJIS = ['🎈','🎀','🎊','🎁','🌈','🍭','🦄','⭐','🌸','🍬'];
let nextId = 0;

export default function BalloonPopper() {
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const intervalRef = useRef(null);

  const spawnBalloon = useCallback(() => {
    const id  = nextId++;
    const dur = 3 + Math.random() * 3;
    const balloon = {
      id,
      emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
      left:  5 + Math.random() * 85,
      dur,
      popped: false,
    };
    setBalloons(prev => [...prev, balloon]);
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }, dur * 1000 + 100);
  }, []);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(spawnBalloon, 900);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setBalloons([]);
  };

  const pop = (e, id) => {
    e.stopPropagation();
    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    launchConfetti(e.clientX, e.clientY, 15);
  };

  return (
    <div className="card card-blue">
      <h2>🎈 Pop the Balloons!</h2>
      <div className="balloon-score">Balloons Popped: <span>{score}</span></div>
      <div className="balloon-area">
        {balloons.map(b => (
          <div
            key={b.id}
            className="balloon"
            style={{ left: `${b.left}%`, animationDuration: `${b.dur}s` }}
            onClick={e => pop(e, b.id)}
          >
            {b.emoji}
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-blue"   onClick={start}>▶ Launch</button>
        <button className="btn btn-orange" onClick={stop}>⏹ Stop</button>
      </div>
    </div>
  );
}
