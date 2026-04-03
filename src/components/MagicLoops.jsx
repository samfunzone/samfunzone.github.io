import { useRef, useEffect, useState, useCallback } from 'react';
import { launchConfetti } from '../utils/confetti';

const PALETTES = {
  rainbow: ['#ff6b6b', '#ff922b', '#ffd93d', '#6bcb77', '#4d96ff', '#cc5de8'],
  sparkle: ['#ffd700', '#ffe066', '#f9c74f', '#c9a96e', '#e2b96e', '#fff3b0'],
  ocean:   ['#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#3a86ff', '#023e8a'],
  fire:    ['#ff4800', '#ff6d00', '#ff9100', '#ffbd00', '#ffee00', '#ff5733'],
};

const PALETTE_ICONS = { rainbow: '🌈', sparkle: '✨', ocean: '🌊', fire: '🔥' };
const METER_MAX = 12;

export default function MagicLoops() {
  const canvasRef   = useRef(null);
  const loopsRef    = useRef([]);
  const animRef     = useRef(null);
  const colorIdxRef = useRef(0);
  const clicksRef   = useRef([]);
  const paletteRef  = useRef('rainbow');

  const [palette, setPalette] = useState('rainbow');
  const [meter,   setMeter]   = useState(0);
  const [magic,   setMagic]   = useState(false);
  const [total,   setTotal]   = useState(0);

  paletteRef.current = palette;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      loopsRef.current = loopsRef.current.filter(loop => {
        const age      = (now - loop.born) / 1000;
        const maxAge   = 2.4;
        if (age > maxAge) return false;

        const progress = age / maxAge;
        const radius   = loop.startR + (loop.maxR - loop.startR) * Math.sqrt(progress);
        const alpha    = (1 - progress) * loop.baseAlpha;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = loop.color;
        ctx.lineWidth   = loop.lw * (1 - progress * 0.55);
        if (loop.dashed) ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.arc(loop.x, loop.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        if (loop.double) {
          ctx.globalAlpha = alpha * 0.45;
          ctx.setLineDash([]);
          ctx.lineWidth = loop.lw * 0.45;
          ctx.beginPath();
          ctx.arc(loop.x, loop.y, radius * 0.58, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const spawnLoop = useCallback((x, y, baseAlpha = 1) => {
    const colors = PALETTES[paletteRef.current];
    const color  = colors[colorIdxRef.current % colors.length];
    colorIdxRef.current++;
    loopsRef.current.push({
      id: Math.random(),
      x, y, color,
      born:      Date.now(),
      startR:    6,
      maxR:      60 + Math.random() * 75,
      lw:        3 + Math.random() * 4,
      baseAlpha,
      dashed:    Math.random() > 0.6,
      double:    Math.random() > 0.5,
    });
  }, []);

  function handlePointer(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    const x = src.clientX - rect.left;
    const y = src.clientY - rect.top;

    spawnLoop(x, y);
    clicksRef.current.push({ x, y });
    if (clicksRef.current.length > 20) clicksRef.current.shift();

    setTotal(t => t + 1);
    setMeter(prev => {
      const next = prev + 1;
      if (next >= METER_MAX) {
        // Burst: extra loops from recent click positions
        const positions = clicksRef.current.slice(-8);
        positions.forEach((pos, i) => {
          setTimeout(() => spawnLoop(pos.x, pos.y, 0.85), i * 55);
        });
        launchConfetti(x, y, 60);
        setMagic(true);
        setTimeout(() => setMagic(false), 2000);
        return 0;
      }
      return next;
    });
  }

  function handleClear() {
    loopsRef.current = [];
    clicksRef.current = [];
    setMeter(0);
  }

  return (
    <div className="card card-purple">
      <h2>✨ Magic Loops!</h2>
      <p className="magic-hint">Tap anywhere to cast loops — fill the meter for a magic burst!</p>

      <div className="magic-palette-row">
        {Object.keys(PALETTES).map(p => (
          <button
            key={p}
            className={`magic-palette-btn${palette === p ? ' active' : ''}`}
            onClick={() => setPalette(p)}
          >
            {PALETTE_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="magic-meter-row">
        <span className="magic-meter-label">Magic:</span>
        <div className="magic-meter-track">
          <div
            className={`magic-meter-fill${meter >= METER_MAX - 2 ? ' near-full' : ''}`}
            style={{ width: `${(meter / METER_MAX) * 100}%` }}
          />
        </div>
        <span className="magic-total">🔮 {total}</span>
      </div>

      {magic && <div className="magic-burst-msg">✨ MAGIC BURST! ✨</div>}

      <canvas
        ref={canvasRef}
        className="magic-canvas"
        onClick={handlePointer}
        onTouchStart={handlePointer}
      />

      <div className="btn-row">
        <button className="btn btn-purple" onClick={handleClear}>🧹 Clear</button>
      </div>
    </div>
  );
}
