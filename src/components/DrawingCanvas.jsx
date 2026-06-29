import { useRef, useState, useEffect } from 'react';
import { launchConfetti } from '../utils/confetti';
import { lighten, darken } from '../utils/color';
import { track } from '../utils/analytics';

// 12 vibrant colours, all visible on white (white is gone — the Eraser replaces it)
const COLORS = [
  '#ff6b6b', '#ff9800', '#ffeb3b', '#cddc39', '#4caf50', '#00bcd4',
  '#2196f3', '#3f51b5', '#9c27b0', '#e91e63', '#795548', '#000000',
];

// Drawing mediums — each renders a distinct stroke on the <canvas>.
// widthMul scales the brush slider; alpha is the per-stroke opacity.
const MEDIUMS = [
  { id: 'pencil', label: 'Pencil',    emoji: '✏️', widthMul: 0.4, alpha: 0.9 },
  { id: 'crayon', label: 'Crayon',    emoji: '🖍️', widthMul: 1.0, alpha: 0.6 },
  { id: 'brush',  label: 'Brush',     emoji: '🖌️', widthMul: 1.0, alpha: 1.0 },
  { id: 'oil',    label: 'Oil Paint', emoji: '🎨', widthMul: 1.6, alpha: 1.0 },
  { id: 'erase',  label: 'Eraser',    emoji: '🧹', widthMul: 1.8, alpha: 1.0 },
];
const MEDIUM = id => MEDIUMS.find(m => m.id === id) ?? MEDIUMS[2];

// Palette blob layout (2 rows of 6) inside the SVG board
const BLOB_XS = [58, 104, 150, 196, 242, 288];
const BLOB_YS = [72, 124];
const blobPos = i => ({ x: BLOB_XS[i % 6], y: BLOB_YS[Math.floor(i / 6)] });

export default function DrawingCanvas() {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);
  const history   = useRef([]);   // saved ImageData snapshots
  const [color, setColor]     = useState('#ff6b6b');
  const [brush, setBrush]     = useState(8);
  const [tool,  setTool]      = useState('brush');
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    // First getContext call wins the options — set willReadFrequently so the
    // undo snapshots (getImageData) don't trip the browser perf warning.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

  const seg = (ctx, a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };

  // Paint one segment a→b in the active medium's style.
  const drawSegment = (ctx, a, b) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    if (tool === 'erase') {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brush * 1.8;
      seg(ctx, a, b);
      ctx.globalAlpha = 1;
      return;
    }

    const m = MEDIUM(tool);
    const w = Math.max(1, brush * m.widthMul);
    ctx.strokeStyle = color;

    // segment geometry — perpendicular unit vector for edge texture
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const nx = -dy / dist, ny = dx / dist;

    if (tool === 'crayon') {
      // waxy crayon: stamp many small translucent grains across the width so
      // the fill is speckled and the edges are rough (the "tooth" of paper)
      ctx.fillStyle = color;
      const steps = Math.max(1, Math.round(dist / 1.6));
      const dabs = Math.max(3, Math.round(w / 2.4));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = a.x + dx * t, py = a.y + dy * t;
        for (let k = 0; k < dabs; k++) {
          const off = (Math.random() - 0.5) * w * (1 - Math.random() * 0.25);
          const r = 0.6 + Math.random() * Math.max(1, w * 0.13);
          ctx.globalAlpha = 0.1 + Math.random() * 0.22;
          ctx.beginPath();
          ctx.arc(px + nx * off, py + ny * off, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (tool === 'pencil') {
      // fine graphite line + a faint offset grain pass
      ctx.globalAlpha = m.alpha;
      ctx.lineWidth = w;
      seg(ctx, a, b);
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = Math.max(1, w * 0.7);
      const ox = (Math.random() - 0.5) * 1.6, oy = (Math.random() - 0.5) * 1.6;
      seg(ctx, { x: a.x + ox, y: a.y + oy }, { x: b.x + ox, y: b.y + oy });
    } else if (tool === 'oil') {
      // thick buttery body + a CONTINUOUS glossy ridge on one side and a soft
      // shadow on the other (offsets are perpendicular to the stroke, so the
      // ridge never breaks up on vertical strokes)
      ctx.globalAlpha = 1;
      ctx.lineWidth = w;
      seg(ctx, a, b);
      const off = (k) => seg(ctx,
        { x: a.x + nx * w * k, y: a.y + ny * w * k },
        { x: b.x + nx * w * k, y: b.y + ny * w * k });
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = w * 0.3;
      ctx.strokeStyle = lighten(color, 0.42);
      off(0.24);
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = w * 0.28;
      ctx.strokeStyle = darken(color, 0.3);
      off(-0.27);
      // faint inner brush streak for impasto
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = w * 0.12;
      ctx.strokeStyle = lighten(color, 0.2);
      off(0.05);
    } else {
      // brush — smooth, full-opacity stroke
      ctx.globalAlpha = 1;
      ctx.lineWidth = w;
      seg(ctx, a, b);
    }
    ctx.globalAlpha = 1;
  };

  const startDraw = (e) => {
    e.preventDefault();
    saveSnapshot();
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const p = getPos(e);
    lastPos.current = p;
    drawSegment(ctx, p, p); // a tap leaves a dot
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = getPos(e);
    drawSegment(ctx, lastPos.current, p);
    lastPos.current = p;
  };

  const stopDraw = () => {
    drawing.current = false;
    lastPos.current = null;
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
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const a = document.createElement('a');
    a.href     = canvasRef.current.toDataURL('image/png');
    a.download = 'my-drawing.png';
    a.click();
    launchConfetti(window.innerWidth / 2, 200, 30);
    track('game_complete', { game: 'draw' });
  };

  const pickColor = (c) => { setColor(c); if (tool === 'erase') setTool('brush'); };

  return (
    <div className="card card-purple">
      <h2>🎨 Draw Something!</h2>

      <div className="draw-toolbar">
        {/* Artist's palette — colour picker */}
        <div className="draw-palette-panel">
          <PaletteSVG color={color} tool={tool} onPick={pickColor} />
        </div>

        {/* Brush preview + size + medium picker */}
        <div className="draw-brush-panel">
          <BrushPreview color={color} brush={brush} tool={tool} />
          <label className="brush-label">
            Brush size
            <input
              type="range" min="2" max="40" value={brush}
              onChange={e => setBrush(+e.target.value)}
            />
          </label>
          <div className="draw-medium-row">
            {MEDIUMS.filter(m => m.id !== 'erase').map(m => (
              <button
                key={m.id}
                className={`draw-medium-btn${tool === m.id ? ' selected' : ''}`}
                onClick={() => setTool(m.id)}
                title={m.label}
              >
                <ToolGlyph id={m.id} color={color} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <div className="draw-eraser-row">
            <button
              className={`draw-medium-btn draw-eraser-btn${tool === 'erase' ? ' selected' : ''}`}
              onClick={() => setTool('erase')}
              title="Eraser"
            >
              <ToolGlyph id="erase" color={color} />
              <span>Eraser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Framed paper canvas */}
      <div className="draw-paper-wrap">
        <div className="draw-stage">
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
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-purple" onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.45 }}>↩ Undo</button>
        <button className="btn btn-red"    onClick={clearCanvas}>🗑 Clear</button>
        <button className="btn btn-green"  onClick={saveCanvas}>💾 Save</button>
      </div>
    </div>
  );
}

/* ── A single palette item drawn as the active tool, centred at the origin
      and filled with its swatch colour (the palette "becomes" the tool) ── */
function PaletteShape({ medium, color }) {
  const dk = darken(color, 0.3), lt = lighten(color, 0.42);
  if (medium === 'pencil') return (
    <g transform="rotate(-35)">
      <rect x="-5" y="-17" width="10" height="25" fill={color} stroke={dk} strokeWidth=".8" />
      <rect x="-5" y="-17" width="10" height="4" fill="#e7c977" stroke={dk} strokeWidth=".5" />
      <rect x="-3.6" y="-14" width="2.6" height="20" fill={lt} opacity=".5" />
      <polygon points="-5,8 5,8 0,18" fill="#f0dcb0" stroke={dk} strokeWidth=".5" />
      <polygon points="-2,13 2,13 0,18" fill={dk} />
    </g>
  );
  if (medium === 'crayon') return (
    <g transform="rotate(-32)">
      <rect x="-6" y="-14" width="12" height="28" rx="2" fill={color} stroke={dk} strokeWidth=".8" />
      <polygon points="-6,-14 6,-14 0,-22" fill={color} stroke={dk} strokeWidth=".8" />
      <rect x="-6" y="-3" width="12" height="8" fill="#fff" opacity=".5" />
      <rect x="-3.6" y="-12" width="2.6" height="22" fill={lt} opacity=".45" />
    </g>
  );
  if (medium === 'brush') return (
    <g transform="rotate(-35)">
      <rect x="-4" y="-20" width="8" height="20" rx="3" fill="#b9854f" stroke="#8a5e30" strokeWidth=".6" />
      <rect x="-5" y="-1" width="10" height="7" rx="1" fill="#cfd3d6" stroke="#9aa0a4" strokeWidth=".6" />
      <path d="M-5,6 L5,6 L3.5,15 Q0,21 -3.5,15 Z" fill={color} stroke={dk} strokeWidth=".7" />
      <path d="M0,7 L0,17" stroke={lt} strokeWidth="1" opacity=".5" />
    </g>
  );
  if (medium === 'oil') return (
    <g>
      <rect x="-9" y="-5" width="18" height="17" rx="3" fill={color} stroke={dk} strokeWidth=".8" />
      <rect x="-9" y="-8" width="18" height="4" fill={dk} />
      <rect x="-3" y="-15" width="6" height="8" rx="1" fill="#d2d2d2" stroke="#9a9a9a" strokeWidth=".5" />
      <rect x="-6" y="0" width="12" height="4" rx="2" fill={lt} opacity=".55" />
    </g>
  );
  return null;
}

/* ── Artist's palette — the 12 swatches render as glossy blobs (Eraser) or
      as the active drawing tool (pencil/crayon/brush/oil), one per colour ── */
function PaletteSVG({ color, tool, onPick }) {
  const wood = '#c68a4e';
  const asBlobs = tool === 'erase';
  return (
    <svg className="draw-palette-svg" viewBox="0 0 340 200" style={{ maxWidth: '100%', height: 'auto' }}>
      <defs>
        <radialGradient id="draw-shadow">
          <stop offset="0%" stopColor="#000" stopOpacity=".22" />
          <stop offset="70%" stopColor="#000" stopOpacity=".07" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="draw-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten(wood, 0.18)} />
          <stop offset="45%"  stopColor={wood} />
          <stop offset="100%" stopColor={darken(wood, 0.24)} />
        </linearGradient>
        {COLORS.map((c, i) => (
          <radialGradient key={i} id={`draw-blob-${i}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%"   stopColor={lighten(c, 0.5)} />
            <stop offset="55%"  stopColor={c} />
            <stop offset="100%" stopColor={darken(c, 0.35)} />
          </radialGradient>
        ))}
      </defs>

      {/* ground shadow + wooden board */}
      <ellipse cx="170" cy="188" rx="150" ry="11" fill="url(#draw-shadow)" />
      <ellipse cx="170" cy="98" rx="162" ry="90" fill="url(#draw-wood)"
        stroke={darken(wood, 0.3)} strokeWidth="2" />
      <ellipse cx="170" cy="98" rx="156" ry="84" fill="none"
        stroke={lighten(wood, 0.25)} strokeWidth="1.5" opacity=".5" />
      {/* board gloss */}
      <ellipse cx="118" cy="52" rx="74" ry="24" fill="#fff" opacity=".12"
        transform="rotate(-16 118 52)" />
      {/* thumb hole */}
      <ellipse cx="80" cy="152" rx="20" ry="13" fill={darken(wood, 0.34)} />
      <ellipse cx="80" cy="150" rx="20" ry="13" fill="none" stroke={lighten(wood, 0.2)} strokeWidth="1.4" opacity=".6" />

      {/* wet "current paint" dab — reflects the selected colour, pops on change */}
      <g key={color} className="draw-paint-dab">
        <ellipse cx="207" cy="163" rx="22" ry="13" fill="#000" opacity=".14" />
        <path d="M185,158 Q187,145 206,144 Q226,144 228,159 Q226,172 206,173 Q186,172 185,158 Z"
          fill={color} stroke={darken(color, 0.3)} strokeWidth="1" />
        <ellipse cx="231" cy="166" rx="6.5" ry="3.4" fill={color} opacity=".85" />
        <ellipse cx="198" cy="153" rx="8" ry="3.8" fill={lighten(color, 0.45)} opacity=".8"
          transform="rotate(-16 198 153)" />
        <ellipse cx="193" cy="151" rx="2.6" ry="1.4" fill="#fff" opacity=".85" />
      </g>

      {/* swatches — rendered as the active tool (or glossy blobs for Eraser) */}
      {COLORS.map((c, i) => {
        const { x, y } = blobPos(i);
        const active = color === c;
        return (
          <g key={c} className="draw-blob" onClick={() => onPick(c)}
            role="button" aria-label={`colour ${c}`} style={{ cursor: 'pointer' }}>
            {active && (
              <circle className="draw-blob-pop" cx={x} cy={y} r="21"
                fill="none" stroke="#9c27b0" strokeWidth="3" />
            )}
            {/* generous invisible hit area so the whole cell is tappable */}
            <circle cx={x} cy={y} r="20" fill="transparent" />
            <g className="draw-blob-inner" key={tool}>
              {asBlobs ? (
                <>
                  <ellipse cx={x} cy={y + 14} rx="15" ry="4" fill="#000" opacity=".14" />
                  <circle cx={x} cy={y} r="17" fill={`url(#draw-blob-${i})`} />
                  <ellipse cx={x - 5} cy={y - 6} rx="5.5" ry="3.5" fill="#fff" opacity=".55"
                    transform={`rotate(-20 ${x - 5} ${y - 6})`} />
                </>
              ) : (
                <>
                  <ellipse cx={x} cy={y + 16} rx="11" ry="3.5" fill="#000" opacity=".13" />
                  <g transform={`translate(${x} ${y})`}>
                    <PaletteShape medium={tool} color={c} />
                  </g>
                </>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Small tool icon, tinted to the active colour so each button shows
      what you'll be drawing with ── */
function ToolGlyph({ id, color }) {
  const dk = darken(color, 0.28);
  const lt = lighten(color, 0.4);
  return (
    <svg className="draw-tool-glyph" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {id === 'pencil' && (
        <g transform="rotate(45 12 12)">
          <rect x="10" y="3" width="4" height="11" fill={color} stroke={dk} strokeWidth=".6" />
          <rect x="10" y="3" width="4" height="2.5" fill="#e7c977" stroke={dk} strokeWidth=".4" />
          <polygon points="10,14 14,14 12,20" fill="#f0dcb0" stroke={dk} strokeWidth=".4" />
          <polygon points="11.2,17.5 12.8,17.5 12,20" fill={dk} />
        </g>
      )}
      {id === 'crayon' && (
        <g transform="rotate(38 12 12)">
          <rect x="9.5" y="5" width="5" height="14" rx="1.6" fill={color} stroke={dk} strokeWidth=".6" />
          <polygon points="9.5,5 14.5,5 12,1.5" fill={color} stroke={dk} strokeWidth=".6" />
          <rect x="9.5" y="9" width="5" height="3" fill="#fff" opacity=".55" />
        </g>
      )}
      {id === 'brush' && (
        <g transform="rotate(45 12 12)">
          <rect x="10.5" y="2" width="3" height="9" rx="1.5" fill="#b9854f" stroke="#8a5e30" strokeWidth=".4" />
          <rect x="9.8" y="10.5" width="4.4" height="3" rx="1" fill="#cfd3d6" stroke="#9aa0a4" strokeWidth=".4" />
          <path d="M10,13.5 L14,13.5 L13,20 Q12,21.5 11,20 Z" fill={color} stroke={dk} strokeWidth=".5" />
        </g>
      )}
      {id === 'oil' && (
        <g transform="rotate(-18 12 12)">
          <rect x="4" y="9" width="16" height="7" rx="3.5" fill={color} stroke={dk} strokeWidth=".6" />
          <rect x="6" y="10.4" width="8" height="2" rx="1" fill={lt} opacity=".75" />
        </g>
      )}
      {id === 'erase' && (
        <g transform="rotate(-28 12 12)">
          <rect x="4" y="9.5" width="16" height="7.5" rx="2" fill="#ff9bb3" stroke="#e0628a" strokeWidth=".6" />
          <rect x="4" y="9.5" width="16" height="3" rx="2" fill="#ffd1dd" />
        </g>
      )}
    </svg>
  );
}

/* ── Live brush-stroke preview (reflects colour, size & medium) ── */
function BrushPreview({ color, brush, tool }) {
  const m = MEDIUM(tool);
  const isErase = tool === 'erase';
  const w = Math.min(30, Math.max(3, brush * m.widthMul));
  const c = isErase ? '#ffffff' : color;
  const d = 'M26,34 Q68,16 110,34 T194,34';
  return (
    <svg className="draw-brush-svg" viewBox="0 0 210 64" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect x="6" y="8" width="198" height="48" rx="12" fill="#ffffff" stroke="#e6dcf2" strokeWidth="1.5" />

      {/* oil impasto edges */}
      {tool === 'oil' && <>
        <path d={d} fill="none" stroke={lighten(color, 0.4)} strokeWidth={w * 0.45}
          strokeLinecap="round" opacity=".7" transform="translate(0,-4)" />
        <path d={d} fill="none" stroke={darken(color, 0.28)} strokeWidth={w * 0.45}
          strokeLinecap="round" opacity=".6" transform="translate(0,5)" />
      </>}

      {/* main stroke sample */}
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round"
        opacity={isErase ? 1 : m.alpha} />

      {/* medium-specific grain / outline overlays (deterministic) */}
      {tool === 'crayon' && (
        <path d={d} fill="none" stroke={darken(color, 0.2)} strokeWidth={w * 0.5}
          strokeLinecap="round" strokeDasharray="2 5" opacity=".5" />
      )}
      {tool === 'pencil' && (
        <path d={d} fill="none" stroke={darken(color, 0.25)} strokeWidth={Math.max(1, w * 0.6)}
          strokeLinecap="round" strokeDasharray="1 3" opacity=".5" />
      )}
      {isErase && (
        <path d={d} fill="none" stroke="#b9a9cf" strokeWidth={w}
          strokeLinecap="round" strokeDasharray="5 5" opacity=".8" />
      )}

      {/* floating tool emoji */}
      <text x="186" y="22" fontSize="15" textAnchor="middle" className="draw-brush-emoji">{m.emoji}</text>
    </svg>
  );
}
