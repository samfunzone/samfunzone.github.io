import { useState, useRef, useEffect, useCallback } from 'react';
import { launchConfetti } from '../utils/confetti';

const HOLES = 9;

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState(false);
  const [moles, setMoles] = useState(Array(HOLES).fill(false)); // true = up
  const [hit, setHit] = useState(Array(HOLES).fill(false));

  const moleInterval = useRef(null);
  const countdown    = useRef(null);
  const moleUpTimers = useRef({});

  const hideMole = useCallback((idx) => {
    setMoles(prev => { const n = [...prev]; n[idx] = false; return n; });
  }, []);

  const popMole = useCallback(() => {
    setMoles(prev => {
      const n = [...prev];
      // hide a random active mole
      const up = n.map((v,i) => v ? i : -1).filter(i => i >= 0);
      if (up.length && Math.random() < 0.4) {
        const i = up[Math.floor(Math.random() * up.length)];
        n[i] = false;
        clearTimeout(moleUpTimers.current[i]);
      }
      // pop a new mole
      const down = n.map((v,i) => !v ? i : -1).filter(i => i >= 0);
      if (down.length) {
        const i = down[Math.floor(Math.random() * down.length)];
        n[i] = true;
        clearTimeout(moleUpTimers.current[i]);
        moleUpTimers.current[i] = setTimeout(() => hideMole(i), 900 + Math.random()*500);
      }
      return n;
    });
  }, [hideMole]);

  const startGame = () => {
    if (active) return;
    setScore(0); setTimeLeft(30); setActive(true);
    setMoles(Array(HOLES).fill(false));
    setHit(Array(HOLES).fill(false));

    moleInterval.current = setInterval(popMole, 700);
    countdown.current    = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(moleInterval.current);
          clearInterval(countdown.current);
          setActive(false);
          setMoles(Array(HOLES).fill(false));
          launchConfetti(window.innerWidth / 2, 200, 40);
          setTimeout(() => {
            setScore(s => { alert(`Game Over! You scored ${s} points!`); return s; });
          }, 100);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => {
    clearInterval(moleInterval.current);
    clearInterval(countdown.current);
    Object.values(moleUpTimers.current).forEach(clearTimeout);
  }, []);

  const whack = (e, idx) => {
    if (!active || !moles[idx]) return;
    hideMole(idx);
    clearTimeout(moleUpTimers.current[idx]);
    setHit(prev => { const n = [...prev]; n[idx] = true; return n; });
    setScore(s => s + 1);
    launchConfetti(e.clientX, e.clientY, 12);
    setTimeout(() => setHit(prev => { const n = [...prev]; n[idx] = false; return n; }), 300);
  };

  return (
    <div className="card card-red">
      <h2>🦔 Whack-a-Mole!</h2>
      <div className="mole-scoreboard">
        Score: <span>{score}</span> &nbsp;|&nbsp; Time: <span>{timeLeft}s</span>
      </div>
      <div className="mole-grid">
        {Array.from({ length: HOLES }, (_, i) => (
          <div key={i} className="hole" onClick={e => whack(e, i)}>
            <div className={`mole-emoji${moles[i] ? ' up' : ''}${hit[i] ? ' hit' : ''}`}>🐹</div>
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-red" onClick={startGame}>▶ Start Game</button>
      </div>
    </div>
  );
}
