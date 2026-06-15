import { useRef, useEffect, useState, useCallback } from 'react';
import { launchConfetti } from '../utils/confetti';

const COLORS = ['#2b2b2b', '#ff6b6b', '#ff922b', '#ffd93d', '#51cf66', '#4d96ff', '#cc5de8', '#ff8fab'];
const SIZES = [
  { id: 'thin', label: 'Thin', width: 3 },
  { id: 'medium', label: 'Medium', width: 6 },
  { id: 'thick', label: 'Thick', width: 12 },
];
const DANCE_STYLES = [
  { id: 'wiggle', label: '🕺 Wiggle' },
  { id: 'bounce', label: '🎉 Bounce' },
  { id: 'spin', label: '🌪️ Spin' },
];

function circlePoints(cx, cy, r, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

function stickmanStrokes(w, h) {
  const cx = w / 2;
  const headR = h * 0.085;
  const headCy = h * 0.2;
  const shoulderY = headCy + headR * 1.2;
  const hipY = h * 0.6;
  const footY = h * 0.86;
  const armSpan = w * 0.16;
  const legSpan = w * 0.12;
  const color = '#2b2b2b';
  const width = 6;

  return [
    { points: circlePoints(cx, headCy, headR), color, width },
    { points: [{ x: cx, y: shoulderY }, { x: cx, y: hipY }], color, width },
    { points: [{ x: cx - armSpan, y: shoulderY + headR }, { x: cx, y: shoulderY + headR * 0.3 }, { x: cx + armSpan, y: shoulderY + headR }], color, width },
    { points: [{ x: cx, y: hipY }, { x: cx - legSpan, y: footY }], color, width },
    { points: [{ x: cx, y: hipY }, { x: cx + legSpan, y: footY }], color, width },
  ];
}

export default function DoodleDance() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const strokesRef = useRef([]);
  const currentRef = useRef(null);
  const drawingRef = useRef(false);
  const phaseRef = useRef('draw');
  const danceStyleRef = useRef('wiggle');
  const startTimeRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(SIZES[1]);
  const [strokeCount, setStrokeCount] = useState(0);
  const [phase, setPhase] = useState('draw');
  const [danceStyle, setDanceStyle] = useState('wiggle');

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { danceStyleRef.current = danceStyle; }, [danceStyle]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function drawStroke(stroke, t, idx, dancing) {
      const { points, color: c, width: w } = stroke;
      if (points.length < 2) return;
      const motion = reducedMotionRef.current ? 0.15 : 1;
      const style = danceStyleRef.current;
      const amp = (style === 'bounce' ? 3 : 6) * motion;
      const speed = style === 'wiggle' ? 7 : 4;

      ctx.beginPath();
      points.forEach((p, i) => {
        let x = p.x;
        let y = p.y;
        if (dancing) {
          x += Math.sin(t * speed + idx * 1.7 + i * 0.6) * amp;
          y += Math.cos(t * speed * 1.3 + idx * 1.7 + i * 0.6) * amp;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = c;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    function drawFrame() {
      if (startTimeRef.current === null) startTimeRef.current = Date.now();
      const t = (Date.now() - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dancing = phaseRef.current === 'dance';
      ctx.save();

      if (dancing) {
        const motion = reducedMotionRef.current ? 0.15 : 1;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const style = danceStyleRef.current;
        ctx.translate(cx, cy);
        if (style === 'bounce') {
          const bounce = Math.abs(Math.sin(t * 4)) * 14 * motion;
          ctx.translate(0, -bounce);
          ctx.rotate(Math.sin(t * 4) * 0.06 * motion);
        } else if (style === 'spin') {
          ctx.rotate(Math.sin(t * 2) * 0.35 * motion);
        } else {
          ctx.rotate(Math.sin(t * 3) * 0.04 * motion);
          ctx.translate(0, Math.sin(t * 5) * 4 * motion);
        }
        ctx.translate(-cx, -cy);
      }

      strokesRef.current.forEach((s, i) => drawStroke(s, t, i, dancing));
      if (currentRef.current) drawStroke(currentRef.current, t, -1, false);

      ctx.restore();
      animRef.current = requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  function handlePointerDown(e) {
    if (phaseRef.current !== 'draw') return;
    e.preventDefault();
    drawingRef.current = true;
    currentRef.current = { points: [getPos(e)], color, width: brush.width };
  }

  function handlePointerMove(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    currentRef.current.points.push(getPos(e));
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current && currentRef.current.points.length > 1) {
      strokesRef.current.push(currentRef.current);
      setStrokeCount(c => c + 1);
    }
    currentRef.current = null;
  }

  function handleUndo() {
    strokesRef.current.pop();
    setStrokeCount(c => Math.max(0, c - 1));
  }

  function handleClear() {
    strokesRef.current = [];
    setStrokeCount(0);
  }

  function handleAddStickman() {
    const canvas = canvasRef.current;
    strokesRef.current.push(...stickmanStrokes(canvas.width, canvas.height));
    setStrokeCount(c => c + 5);
  }

  function handleFinish(e) {
    if (strokeCount === 0) return;
    launchConfetti(e.clientX, e.clientY, 40);
    startTimeRef.current = Date.now();
    setPhase('dance');
  }

  function handleDrawAgain() {
    strokesRef.current = [];
    setStrokeCount(0);
    setPhase('draw');
  }

  return (
    <div className="card card-red">
      <h2>🕺 Doodle Dance</h2>
      <p className="doodle-hint">
        {phase === 'draw'
          ? 'Draw something — a stickman, a pet, anything! Then make it dance.'
          : 'Look at it go! Pick a dance move, or draw something new.'}
      </p>

      {phase === 'draw' && (
        <div className="doodle-toolbar">
          <div className="doodle-swatch-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`doodle-swatch${color === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <div className="doodle-size-row">
            {SIZES.map(s => (
              <button
                key={s.id}
                className={`doodle-size-btn${brush.id === s.id ? ' active' : ''}`}
                onClick={() => setBrush(s)}
              >
                <span className="doodle-size-dot" style={{ width: s.width, height: s.width }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`doodle-canvas${phase === 'dance' ? ' doodle-canvas-dance' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {phase === 'draw' ? (
        <div className="btn-row">
          <button className="btn btn-outline" onClick={handleAddStickman}>🧍 Add Stickman</button>
          <button className="btn btn-outline" onClick={handleUndo} disabled={strokeCount === 0}>↩️ Undo</button>
          <button className="btn btn-outline" onClick={handleClear} disabled={strokeCount === 0}>🧹 Clear</button>
          <button className="btn btn-red" onClick={handleFinish} disabled={strokeCount === 0}>🕺 Make it Dance!</button>
        </div>
      ) : (
        <>
          <div className="doodle-style-row">
            {DANCE_STYLES.map(d => (
              <button
                key={d.id}
                className={`doodle-style-btn${danceStyle === d.id ? ' active' : ''}`}
                onClick={() => setDanceStyle(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn btn-red" onClick={handleDrawAgain}>✏️ Draw Again</button>
          </div>
        </>
      )}
    </div>
  );
}
