import { useRef, useState, useEffect } from 'react';
import { launchConfetti } from '../utils/confetti';

const COLORS = [
  '#ff6b6b','#ff9800','#ffeb3b','#4caf50',
  '#2196f3','#9c27b0','#e91e63','#795548',
  '#000000','#ffffff',
];

export default function DrawingCanvas() {
  const canvasRef   = useRef(null);
  const drawing     = useRef(false);
  const history     = useRef([]);   // saved ImageData snapshots
  const [color, setColor]   = useState('#ff6b6b');
  const [brush, setBrush]   = useState(8);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    history.current.push(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
    setCanUndo(true);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const startDraw = (e) => {
    e.preventDefault();
    saveSnapshot();
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.lineWidth   = brush;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
  };

  const stopDraw = () => {
    drawing.current = false;
    canvasRef.current.getContext('2d').beginPath();
  };

  const undo = () => {
    if (!history.current.length) return;
    const snapshot = history.current.pop();
    canvasRef.current.getContext('2d').putImageData(snapshot, 0, 0);
    setCanUndo(history.current.length > 0);
  };

  const clearCanvas = () => {
    saveSnapshot();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const a = document.createElement('a');
    a.href     = canvasRef.current.toDataURL('image/png');
    a.download = 'my-drawing.png';
    a.click();
    launchConfetti(window.innerWidth / 2, 200, 30);
  };

  return (
    <div className="card card-purple">
      <h2>🎨 Draw Something!</h2>
      <div className="draw-controls">
        {COLORS.map(c => (
          <div
            key={c}
            className={`color-swatch${color === c ? ' active' : ''}`}
            style={{ background: c, border: c === '#ffffff' ? '3px solid #ccc' : '3px solid #fff' }}
            onClick={() => setColor(c)}
          />
        ))}
        <label className="brush-label">
          Brush:&nbsp;
          <input
            type="range" min="2" max="40" value={brush}
            onChange={e => setBrush(+e.target.value)}
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        className="draw-canvas"
        width={700}
        height={400}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="btn-row">
        <button className="btn btn-purple" onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.45 }}>↩ Undo</button>
        <button className="btn btn-red"    onClick={clearCanvas}>🗑 Clear</button>
        <button className="btn btn-green"  onClick={saveCanvas}>💾 Save</button>
      </div>
    </div>
  );
}
