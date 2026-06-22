import { useRef, useEffect, useState, useCallback } from 'react';
import { launchConfetti } from '../utils/confetti';

const COLORS = ['#2b2b2b', '#8B4513', '#ff6b6b', '#ff922b', '#ffd93d', '#51cf66', '#4d96ff', '#cc5de8', '#ff8fab'];
const SIZES = [
  { id: 'thin', label: 'Thin', width: 3 },
  { id: 'medium', label: 'Medium', width: 6 },
  { id: 'thick', label: 'Thick', width: 12 },
];
const TOOLS = [
  { id: 'draw', label: '✏️ Draw' },
  { id: 'erase', label: '🧹 Erase' },
  { id: 'fill', label: '🪣 Fill' },
];
const DANCE_STYLES = [
  { id: 'wiggle', label: '🕺 Wiggle' },
  { id: 'bounce', label: '🎉 Bounce' },
  { id: 'spin', label: '🌪️ Spin' },
];

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16), 255];
}

function floodFill(imageData, startX, startY, fillRgb) {
  const data = new Uint8ClampedArray(imageData.data);
  const { width, height } = imageData;
  const si = (startY * width + startX) * 4;
  const [tr, tg, tb, ta] = [data[si], data[si+1], data[si+2], data[si+3]];
  const [fr, fg, fb] = fillRgb;
  const tol = 30;
  const match = i =>
    Math.abs(data[i]-tr) <= tol && Math.abs(data[i+1]-tg) <= tol &&
    Math.abs(data[i+2]-tb) <= tol && Math.abs(data[i+3]-ta) <= tol;
  if (match(si) && data[si]===fr && data[si+1]===fg && data[si+2]===fb) return imageData;
  const visited = new Uint8Array(width * height);
  const stack = [startX + startY * width];
  while (stack.length) {
    const pos = stack.pop();
    if (visited[pos]) continue;
    visited[pos] = 1;
    const i = pos * 4;
    if (!match(i)) continue;
    data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = 255;
    const x = pos % width, y = (pos / width) | 0;
    if (x > 0) stack.push(pos - 1);
    if (x < width - 1) stack.push(pos + 1);
    if (y > 0) stack.push(pos - width);
    if (y < height - 1) stack.push(pos + width);
  }
  return new ImageData(data, width, height);
}

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
  const [tool, setTool] = useState('draw');
  const [strokeCount, setStrokeCount] = useState(0);
  const [phase, setPhase] = useState('draw');
  const [danceStyle, setDanceStyle] = useState('wiggle');

  const colorRef = useRef(color);
  const brushRef = useRef(brush);
  const toolRef = useRef('draw');
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { brushRef.current = brush; }, [brush]);
  useEffect(() => { toolRef.current = tool; }, [tool]);

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
      const { points, color: c, width: w, erase } = stroke;
      if (points.length < 2) return;
      const motion = reducedMotionRef.current ? 0.15 : 1;
      const style = danceStyleRef.current;
      const amp = (style === 'bounce' ? 3 : 6) * motion;
      const speed = style === 'wiggle' ? 7 : 4;

      if (erase) ctx.globalCompositeOperation = 'destination-out';
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
      ctx.strokeStyle = erase ? 'rgba(0,0,0,1)' : c;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      if (erase) ctx.globalCompositeOperation = 'source-over';
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

      strokesRef.current.forEach((s, i) => {
        if (s.type === 'fill') ctx.drawImage(s.offscreen, 0, 0);
        else drawStroke(s, t, i, dancing);
      });
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

  function handleFill(e) {
    const canvas = canvasRef.current;
    const pos = getPos(e);
    const ctx = canvas.getContext('2d');
    const x = Math.max(0, Math.min(Math.floor(pos.x), canvas.width - 1));
    const y = Math.max(0, Math.min(Math.floor(pos.y), canvas.height - 1));
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const filled = floodFill(imageData, x, y, hexToRgb(colorRef.current));
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    offscreen.getContext('2d').putImageData(filled, 0, 0);
    strokesRef.current.push({ type: 'fill', offscreen });
    setStrokeCount(c => c + 1);
  }

  function handlePointerDown(e) {
    if (phaseRef.current !== 'draw') return;
    e.preventDefault();
    if (toolRef.current === 'fill') { handleFill(e); return; }
    drawingRef.current = true;
    const isErase = toolRef.current === 'erase';
    currentRef.current = {
      points: [getPos(e)],
      color: colorRef.current,
      width: isErase ? brushRef.current.width * 3 : brushRef.current.width,
      erase: isErase,
    };
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
    setTool('draw');
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
          <div className="doodle-tool-row">
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`doodle-tool-btn${tool === t.id ? ' active' : ''}`}
                onClick={() => setTool(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
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
          {tool !== 'fill' && (
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
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`doodle-canvas${phase === 'dance' ? ' doodle-canvas-dance' : ` doodle-canvas-${tool}`}`}
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
