import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';

const WALL_COLORS = [
  { id: 'pink',   fill: '#fce4ec', stroke: '#f8bbd0' },
  { id: 'blue',   fill: '#e3f2fd', stroke: '#bbdefb' },
  { id: 'purple', fill: '#f3e5f5', stroke: '#e1bee7' },
  { id: 'mint',   fill: '#e8f5e9', stroke: '#c8e6c9' },
  { id: 'peach',  fill: '#fff3e0', stroke: '#ffe0b2' },
  { id: 'cream',  fill: '#fafafa', stroke: '#e0e0e0' },
];

const FLOOR_COLORS = [
  { id: 'oak',   fill: '#d4a56a', plank: '#b8883c' },
  { id: 'dark',  fill: '#8d6239', plank: '#6d4a28' },
  { id: 'white', fill: '#f5f0eb', plank: '#e0d8d0' },
];

// Each item: SVG centered at (0,0), default drop position
const ITEM_META = [
  { id: 'bed',       label: '🛏️ Bed',           cat: 'Furniture', dx: 72,  dy: 200 },
  { id: 'bookshelf', label: '📚 Bookshelf',      cat: 'Furniture', dx: 38,  dy: 133 },
  { id: 'wardrobe',  label: '🗄️ Wardrobe',      cat: 'Furniture', dx: 362, dy: 122 },
  { id: 'desk',      label: '🖥️ Desk',           cat: 'Furniture', dx: 318, dy: 185 },
  { id: 'beanbag',   label: '🪑 Bean Bag',       cat: 'Furniture', dx: 190, dy: 245 },
  { id: 'window',    label: '🪟 Window',         cat: 'Decor',     dx: 200, dy: 48  },
  { id: 'rug',       label: '🌈 Colorful Rug',   cat: 'Decor',     dx: 200, dy: 255 },
  { id: 'plant',     label: '🪴 Plant',          cat: 'Decor',     dx: 358, dy: 215 },
  { id: 'lamp',      label: '💡 Floor Lamp',     cat: 'Decor',     dx: 150, dy: 188 },
  { id: 'lights',    label: '✨ Fairy Lights',   cat: 'Decor',     dx: 200, dy: 12  },
  { id: 'painting',  label: '🖼️ Painting',      cat: 'Decor',     dx: 115, dy: 85  },
  { id: 'gaming',    label: '🎮 Gaming Setup',   cat: 'Fun',       dx: 280, dy: 172 },
  { id: 'bear',      label: '🧸 Stuffed Bear',   cat: 'Fun',       dx: 72,  dy: 190 },
  { id: 'mobile',    label: '🌙 Star Mobile',    cat: 'Fun',       dx: 108, dy: 32  },
  { id: 'rainbow',   label: '🎨 Rainbow Poster', cat: 'Fun',       dx: 285, dy: 87  },
];

// All items are drawn centered at (0, 0)
function ItemShape({ id }) {
  switch (id) {
    case 'bed': return (
      <g>
        {/* Headboard */}
        <rect x="-66" y="-40" width="132" height="28" rx="8" fill="#6d4c41"/>
        <rect x="-60" y="-37" width="34" height="20" rx="5" fill="#795548"/>
        <rect x="-17" y="-37" width="34" height="20" rx="5" fill="#795548"/>
        <rect x="26" y="-37" width="34" height="20" rx="5" fill="#795548"/>
        {/* Frame */}
        <rect x="-66" y="-14" width="132" height="40" rx="4" fill="#8d6e63"/>
        {/* Mattress */}
        <rect x="-64" y="-22" width="128" height="48" rx="4" fill="#f8bbd0"/>
        {/* Pillows */}
        <rect x="-58" y="-18" width="38" height="20" rx="7" fill="white" stroke="#f48fb1" strokeWidth="1.5"/>
        <rect x="-16" y="-18" width="38" height="20" rx="7" fill="white" stroke="#f48fb1" strokeWidth="1.5"/>
        {/* Blanket */}
        <rect x="-62" y="-6" width="124" height="28" rx="4" fill="#81d4fa" opacity=".9"/>
        {[-44,-22,0,22,44].map(x => (
          <circle key={x} cx={x} cy="8" r="5" fill="white" opacity=".5"/>
        ))}
      </g>
    );

    case 'bookshelf': return (
      <g>
        <rect x="-33" y="-83" width="66" height="166" rx="3" fill="#a1887f"/>
        <rect x="-33" y="-83" width="66" height="10" rx="3" fill="#8d6e63"/>
        {[-35, 7, 49].map(sy => (
          <rect key={sy} x="-33" y={sy} width="66" height="5" fill="#795548"/>
        ))}
        {[[-29,-73,12,36,'#ef5350'],[-15,-71,10,33,'#42a5f5'],[-3,-74,14,38,'#66bb6a'],[13,-72,12,35,'#ffa726']].map(([x,y,w,h,c]) => (
          <rect key={x} x={x} y={y} width={w} height={h} rx="1.5" fill={c}/>
        ))}
        {[[-30,-30,11,33,'#ab47bc'],[-17,-28,10,30,'#26c6da'],[-5,-31,14,34,'#ec407a'],[11,-29,14,30,'#8d6e63']].map(([x,y,w,h,c]) => (
          <rect key={x} x={x} y={y} width={w} height={h} rx="1.5" fill={c}/>
        ))}
        {[[-31,12,13,31,'#29b6f6'],[-16,14,10,29,'#ff7043'],[-4,11,15,33,'#9ccc65'],[13,13,12,28,'#ffca28']].map(([x,y,w,h,c]) => (
          <rect key={x} x={x} y={y} width={w} height={h} rx="1.5" fill={c}/>
        ))}
        <rect x="-27" y="57" width="54" height="26" rx="2" fill="#8d6e63"/>
        <circle cx="0" cy="70" r="4" fill="#a1887f"/>
      </g>
    );

    case 'wardrobe': return (
      <g>
        <rect x="-36" y="-94" width="72" height="188" rx="4" fill="#ce93d8"/>
        <rect x="-36" y="-94" width="72" height="14" rx="4" fill="#ba68c8"/>
        <line x1="0" y1="-80" x2="0" y2="94" stroke="#9c27b0" strokeWidth="2"/>
        <circle cx="-6" cy="3" r="4.5" fill="#f3e5f5" stroke="#9c27b0" strokeWidth="1"/>
        <circle cx="6" cy="3" r="4.5" fill="#f3e5f5" stroke="#9c27b0" strokeWidth="1"/>
        <rect x="-31" y="-72" width="26" height="72" rx="3" fill="#e1f5fe" opacity=".75" stroke="#ba68c8" strokeWidth="1"/>
        <text x="18" y="-30" textAnchor="middle" fontSize="15">🌸</text>
        <text x="18" y="-6" textAnchor="middle" fontSize="13">⭐</text>
        <text x="18" y="16" textAnchor="middle" fontSize="11">🌸</text>
      </g>
    );

    case 'window': return (
      <g>
        {/* Curtains */}
        <rect x="-56" y="-39" width="20" height="84" rx="8" fill="#f06292"/>
        <rect x="36" y="-39" width="20" height="84" rx="8" fill="#f06292"/>
        <ellipse cx="-46" cy="-31" rx="9" ry="8" fill="#e91e63" opacity=".6"/>
        <ellipse cx="46" cy="-31" rx="9" ry="8" fill="#e91e63" opacity=".6"/>
        {/* Glass */}
        <rect x="-44" y="-35" width="88" height="74" rx="3" fill="#b3e5fc"/>
        <ellipse cx="-26" cy="-17" rx="15" ry="9" fill="white" opacity=".9"/>
        <ellipse cx="-13" cy="-21" rx="11" ry="7" fill="white" opacity=".9"/>
        <ellipse cx="15" cy="-14" rx="9" ry="6" fill="white" opacity=".8"/>
        <circle cx="30" cy="-23" r="8" fill="#fff176"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a}
            x1={30+10*Math.cos(a*Math.PI/180)} y1={-23+10*Math.sin(a*Math.PI/180)}
            x2={30+14*Math.cos(a*Math.PI/180)} y2={-23+14*Math.sin(a*Math.PI/180)}
            stroke="#f9a825" strokeWidth="2"/>
        ))}
        {/* Frame */}
        <rect x="-46" y="-37" width="92" height="78" rx="5" fill="none" stroke="#8d6e63" strokeWidth="4"/>
        <line x1="0" y1="-37" x2="0" y2="41" stroke="#8d6e63" strokeWidth="2.5"/>
        <line x1="-46" y1="2" x2="46" y2="2" stroke="#8d6e63" strokeWidth="2.5"/>
      </g>
    );

    case 'painting': return (
      <g>
        <rect x="-34" y="-29" width="68" height="58" rx="3" fill="#a1887f"/>
        <rect x="-31" y="-26" width="62" height="52" rx="2" fill="#fff"/>
        <rect x="-31" y="-26" width="62" height="28" fill="#81d4fa"/>
        <rect x="-31" y="2" width="62" height="24" fill="#a5d6a7"/>
        <ellipse cx="-10" cy="26" rx="22" ry="14" fill="#81c784"/>
        <circle cx="18" cy="-12" r="8" fill="#fff176"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a}
            x1={18+10*Math.cos(a*Math.PI/180)} y1={-12+10*Math.sin(a*Math.PI/180)}
            x2={18+13*Math.cos(a*Math.PI/180)} y2={-12+13*Math.sin(a*Math.PI/180)}
            stroke="#f9a825" strokeWidth="1.5"/>
        ))}
        <circle cx="-20" cy="10" r="2.5" fill="#ffee58"/>
        {['#ef5350','#42a5f5','#ff9800','#66bb6a','#ce93d8'].map((c,i) => (
          <ellipse key={i}
            cx={-20+5*Math.cos(i*72*Math.PI/180)} cy={10+5*Math.sin(i*72*Math.PI/180)}
            rx="3" ry="2" fill={c}/>
        ))}
      </g>
    );

    case 'rainbow': return (
      <g>
        <rect x="-37" y="-33" width="74" height="66" rx="4" fill="#ffcc80"/>
        <rect x="-34" y="-30" width="68" height="62" rx="3" fill="#f3f3ff"/>
        <ellipse cx="-24" cy="25" rx="11" ry="7" fill="white"/>
        <ellipse cx="24" cy="25" rx="11" ry="7" fill="white"/>
        {[['#ef5350',32],['#ff9800',26],['#ffee58',21],['#66bb6a',16],['#42a5f5',12],['#9c27b0',8]].map(([c,r]) => (
          <path key={r} d={`M ${-r*1.6} 31 A ${r*1.6} ${r} 0 0 1 ${r*1.6} 31`}
            stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        ))}
      </g>
    );

    case 'rug': return (
      <g>
        <ellipse cx="0" cy="0" rx="80" ry="22" fill="#ff8a65"/>
        <ellipse cx="0" cy="0" rx="70" ry="17" fill="#ffb74d"/>
        <ellipse cx="0" cy="0" rx="56" ry="12" fill="#ffd54f"/>
        {[-32,-16,0,16,32].map(dx => (
          <circle key={dx} cx={dx} cy="0" r="3.5" fill="#ff7043"/>
        ))}
        <ellipse cx="0" cy="0" rx="16" ry="5" fill="#fff9c4" opacity=".5"/>
      </g>
    );

    case 'lamp': return (
      <g>
        <ellipse cx="0" cy="35" rx="12" ry="4.5" fill="#9e9e9e"/>
        <rect x="-3" y="-15" width="6" height="52" rx="3" fill="#bdbdbd"/>
        <path d="M-18,-15 L-12,-35 L12,-35 L18,-15 Z" fill="#fff176"/>
        <path d="M-18,-15 L-12,-35 L12,-35 L18,-15 Z"
          fill="none" stroke="#f9a825" strokeWidth="1.5"/>
        <ellipse cx="0" cy="-13" rx="18" ry="7" fill="#fffde7" opacity=".65"/>
      </g>
    );

    case 'beanbag': return (
      <g>
        <ellipse cx="0" cy="12" rx="26" ry="15" fill="#ce93d8"/>
        <ellipse cx="0" cy="2" rx="21" ry="20" fill="#ba68c8"/>
        <ellipse cx="-4" cy="-4" rx="14" ry="13" fill="#ce93d8" opacity=".55"/>
      </g>
    );

    case 'desk': return (
      <g>
        {/* Surface */}
        <rect x="-60" y="-4" width="120" height="13" rx="3" fill="#a1887f"/>
        <rect x="-58" y="-2" width="116" height="9" rx="2" fill="#bcaaa4"/>
        {/* Legs */}
        <rect x="-56" y="8" width="8" height="36" rx="2" fill="#8d6e63"/>
        <rect x="48" y="8" width="8" height="36" rx="2" fill="#8d6e63"/>
        {/* Monitor */}
        <rect x="-27" y="-43" width="54" height="34" rx="4" fill="#424242"/>
        <rect x="-24" y="-40" width="48" height="26" rx="2" fill="#e3f2fd"/>
        <rect x="-21" y="-37" width="16" height="11" rx="1" fill="#42a5f5" opacity=".7"/>
        <rect x="-1" y="-37" width="18" height="5" rx="1" fill="#a5d6a7" opacity=".7"/>
        <rect x="-1" y="-29" width="14" height="4" rx="1" fill="#ffcc80" opacity=".7"/>
        <rect x="-5" y="-10" width="10" height="5" rx="1" fill="#616161"/>
        <rect x="-10" y="-6" width="20" height="3" rx="1" fill="#616161"/>
        {/* Keyboard */}
        <rect x="-49" y="0" width="34" height="9" rx="2" fill="#757575"/>
        {[-44,-36,-28,-20].map(x => (
          <rect key={x} x={x} y="2" width="5" height="3" rx="1" fill="#9e9e9e"/>
        ))}
        {/* Mouse */}
        <ellipse cx="-57" cy="4" rx="5" ry="7" fill="#757575"/>
      </g>
    );

    case 'gaming': return (
      <g>
        <rect x="-18" y="-12" width="36" height="22" rx="7" fill="#212121"/>
        <circle cx="-7" cy="-2" r="4" fill="#424242"/>
        <circle cx="8" cy="-5" r="3.5" fill="#ef5350"/>
        <circle cx="13" cy="0" r="3.5" fill="#42a5f5"/>
        <circle cx="8" cy="5" r="3.5" fill="#66bb6a"/>
        <circle cx="3" cy="0" r="3.5" fill="#ffee58"/>
        <path d="M18,-1 Q30,-4 32,2" stroke="#616161" strokeWidth="1.5" fill="none"/>
        <path d="M-18,-1 Q-30,-4 -32,2" stroke="#616161" strokeWidth="1.5" fill="none"/>
      </g>
    );

    case 'plant': return (
      <g>
        <path d="M-14,42 L-10,22 L10,22 L14,42 Z" fill="#ef6c00"/>
        <rect x="-13" y="19" width="26" height="6" rx="2" fill="#e65100"/>
        <ellipse cx="0" cy="22" rx="10" ry="3" fill="#5d4037"/>
        <rect x="-2" y="-18" width="4" height="42" rx="2" fill="#558b2f"/>
        <ellipse cx="-14" cy="-11" rx="14" ry="7" fill="#66bb6a" transform="rotate(-18 -14 -11)"/>
        <ellipse cx="14" cy="-14" rx="12" ry="7" fill="#4caf50" transform="rotate(22 14 -14)"/>
        <ellipse cx="-9" cy="-23" rx="10" ry="6" fill="#81c784" transform="rotate(-38 -9 -23)"/>
        <ellipse cx="10" cy="-25" rx="10" ry="6" fill="#66bb6a" transform="rotate(32 10 -25)"/>
        <ellipse cx="0" cy="-30" rx="7" ry="11" fill="#a5d6a7"/>
      </g>
    );

    case 'bear': return (
      <g>
        <ellipse cx="0" cy="14" rx="11" ry="13" fill="#c8a06a"/>
        <circle cx="0" cy="-1" r="10" fill="#c8a06a"/>
        <circle cx="-8" cy="-10" r="5" fill="#c8a06a"/>
        <circle cx="8" cy="-10" r="5" fill="#c8a06a"/>
        <circle cx="-8" cy="-10" r="3" fill="#e6c88a"/>
        <circle cx="8" cy="-10" r="3" fill="#e6c88a"/>
        <circle cx="-4" cy="-3" r="2" fill="#4a2810"/>
        <circle cx="4" cy="-3" r="2" fill="#4a2810"/>
        <ellipse cx="0" cy="2" rx="4" ry="3" fill="#b8906a"/>
        <path d="M-2,3 Q0,6 2,3" stroke="#7a4a2a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M-7,20 Q0,24 7,20" stroke="#f48fb1" strokeWidth="2.5" fill="none"/>
      </g>
    );

    case 'lights': return (
      <g>
        <path d="M-80,-4 Q-40,6 0,-4 Q40,6 80,-4"
          stroke="#bdbdbd" strokeWidth="1.5" fill="none"/>
        {[-76,-46,-16,14,44,74].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="-4" x2={x+2} y2="4" stroke="#9e9e9e" strokeWidth="1"/>
            <ellipse cx={x+2} cy={7} rx="4" ry="5.5"
              fill={['#ffee58','#ff8a65','#ce93d8','#81d4fa','#a5d6a7','#f48fb1'][i]}/>
            <ellipse cx={x+2} cy={5} rx="1.8" ry="1.8" fill="white" opacity=".7"/>
          </g>
        ))}
      </g>
    );

    case 'mobile': return (
      <g>
        <line x1="0" y1="-22" x2="0" y2="-6" stroke="#9e9e9e" strokeWidth="1.5"/>
        <line x1="-26" y1="-6" x2="26" y2="-6" stroke="#9e9e9e" strokeWidth="1.5"/>
        {[[-26,0],[-13,8],[0,0],[13,8],[26,0]].map(([x,dy], i) => (
          <g key={x}>
            <line x1={x} y1="-6" x2={x} y2={2+dy} stroke="#bdbdbd" strokeWidth="1"/>
            <text x={x} y={11+dy} textAnchor="middle" fontSize="11">
              {['⭐','🌙','✨','🌟','💫'][i]}
            </text>
          </g>
        ))}
      </g>
    );

    default: return null;
  }
}

function getSVGCoords(e, svgEl) {
  const rect = svgEl.getBoundingClientRect();
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  return {
    x: (clientX - rect.left) * (400 / rect.width),
    y: (clientY - rect.top)  * (300 / rect.height),
  };
}

export default function MakingYourRoom() {
  const [placed, setPlaced] = useState([]); // [{id, x, y}]
  const [wallIdx, setWallIdx]   = useState(0);
  const [floorIdx, setFloorIdx] = useState(0);
  const [done, setDone]         = useState(false);
  const [activeId, setActiveId] = useState(null); // for cursor styling

  const svgRef    = useRef(null);
  const dragRef   = useRef(null); // { id, ox, oy }

  const wall  = WALL_COLORS[wallIdx];
  const floor = FLOOR_COLORS[floorIdx];
  const placedIds = new Set(placed.map(p => p.id));

  function toggleItem(meta) {
    if (placedIds.has(meta.id)) {
      setPlaced(prev => prev.filter(p => p.id !== meta.id));
    } else {
      setPlaced(prev => [...prev, { id: meta.id, x: meta.dx, y: meta.dy }]);
    }
    setDone(false);
  }

  function onItemPointerDown(e, id) {
    e.stopPropagation();
    // Capture on the SVG so pointer events always fire there
    svgRef.current.setPointerCapture(e.pointerId);
    const { x, y } = getSVGCoords(e, svgRef.current);
    const item = placed.find(p => p.id === id);
    dragRef.current = { id, ox: x - item.x, oy: y - item.y };
    setActiveId(id);
    // Bring to front
    setPlaced(prev => {
      const rest = prev.filter(p => p.id !== id);
      const me   = prev.find(p => p.id === id);
      return [...rest, me];
    });
  }

  function onSVGPointerMove(e) {
    if (!dragRef.current) return;
    const { id, ox, oy } = dragRef.current;
    const { x, y } = getSVGCoords(e, svgRef.current);
    setPlaced(prev =>
      prev.map(p => p.id === id ? { ...p, x: x - ox, y: y - oy } : p)
    );
  }

  function onSVGPointerUp() {
    dragRef.current = null;
    setActiveId(null);
  }

  function finish(e) {
    launchConfetti(e.clientX, e.clientY, 60);
    setDone(true);
  }

  return (
    <div className="card card-purple">
      <h2>🏠 Make Your Own Room!</h2>
      <p className="room-hint">Add things then drag them wherever you want!</p>

      <div className="room-layout">

        {/* ── Palette box ── */}
        <div className="room-palette">

          <div className="room-section-label">🎨 Wall Color</div>
          <div className="room-color-row">
            {WALL_COLORS.map((w, i) => (
              <button key={w.id}
                className={`room-swatch${wallIdx === i ? ' active' : ''}`}
                style={{ background: w.fill, borderColor: wallIdx === i ? '#9c27b0' : w.stroke }}
                onClick={() => setWallIdx(i)}
              />
            ))}
          </div>

          <div className="room-section-label">🪵 Floor</div>
          <div className="room-color-row">
            {FLOOR_COLORS.map((f, i) => (
              <button key={f.id}
                className={`room-swatch${floorIdx === i ? ' active' : ''}`}
                style={{ background: f.fill, borderColor: floorIdx === i ? '#9c27b0' : f.plank }}
                onClick={() => setFloorIdx(i)}
              />
            ))}
          </div>

          {['Furniture', 'Decor', 'Fun'].map(cat => (
            <div key={cat}>
              <div className="room-section-label">{cat}</div>
              <div className="room-items-grid">
                {ITEM_META.filter(it => it.cat === cat).map(it => (
                  <button key={it.id}
                    className={`room-item-btn${placedIds.has(it.id) ? ' active' : ''}`}
                    onClick={() => toggleItem(it)}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="btn btn-purple room-done-btn" onClick={finish}>
            🏠 I&apos;m Done!
          </button>
          {done && <div className="room-done-msg">✨ Your room looks amazing! ✨</div>}
        </div>

        {/* ── Room box ── */}
        <div className="room-display">
          <svg
            ref={svgRef}
            viewBox="0 0 400 300"
            width="100%"
            style={{
              display: 'block',
              borderRadius: 14,
              border: '3px solid #ce93d8',
              cursor: activeId ? 'grabbing' : 'default',
              touchAction: 'none',
              userSelect: 'none',
            }}
            onPointerMove={onSVGPointerMove}
            onPointerUp={onSVGPointerUp}
            onPointerLeave={onSVGPointerUp}
          >
            {/* Back wall */}
            <rect x="0" y="0" width="400" height="215" fill={wall.fill}/>
            <rect x="0" y="0" width="400" height="6" fill={wall.stroke}/>
            <rect x="0" y="209" width="400" height="8" fill={wall.stroke}/>

            {/* Floor */}
            <rect x="0" y="215" width="400" height="85" fill={floor.fill}/>
            {[48,96,144,192,240,288,336,384].map(x => (
              <line key={x} x1={x} y1="215" x2={x} y2="300"
                stroke={floor.plank} strokeWidth="1.5" opacity=".45"/>
            ))}
            {[240,268].map(y => (
              <line key={y} x1="0" y1={y} x2="400" y2={y}
                stroke={floor.plank} strokeWidth=".7" opacity=".3"/>
            ))}
            <line x1="0" y1="215" x2="400" y2="215" stroke={wall.stroke} strokeWidth="2.5"/>

            {/* Empty-state hint */}
            {placed.length === 0 && (
              <text x="200" y="158" textAnchor="middle" fontSize="15" fill="#c9a8d8">
                Pick something from the list! 🎉
              </text>
            )}

            {/* Placed items — last in array renders on top */}
            {placed.map(({ id, x, y }) => (
              <g
                key={id}
                transform={`translate(${Math.round(x)}, ${Math.round(y)})`}
                style={{ cursor: activeId === id ? 'grabbing' : 'grab' }}
                onPointerDown={e => onItemPointerDown(e, id)}
              >
                <ItemShape id={id}/>
              </g>
            ))}
          </svg>
          <p className="room-drag-hint">Drag items to move them around ✨</p>
        </div>

      </div>
    </div>
  );
}
