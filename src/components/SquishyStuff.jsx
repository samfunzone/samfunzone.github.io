import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const PALETTE = [
  '#ff6b6b','#ff9800','#ffd93d','#4caf50',
  '#2196f3','#9c27b0','#e91e63','#20c997',
];

function darken(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.max(0,(n>>16)-50)},${Math.max(0,((n>>8)&0xff)-50)},${Math.max(0,(n&0xff)-50)})`;
}

function normalizePoints(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const s = 3 / span;
  return pts.map(p => [(p.x - cx) * s, -(p.y - cy) * s]);
}

export default function SquishyStuff() {
  const [phase, setPhase] = useState('draw');
  const [color, setColor] = useState('#ff6b6b');
  const [hint, setHint]   = useState('');
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [sz, setSz] = useState(1);

  // Draw
  const drawRef    = useRef(null);
  const drawingRef = useRef(false);
  const ptsRef     = useRef([]);
  const savedPts   = useRef([]);
  const savedColor = useRef('#ff6b6b');

  // Three.js
  const mountRef   = useRef(null);
  const threeRef   = useRef({});
  const scaleRef   = useRef({ x: 1, y: 1, z: 1 });
  const handleDrag = useRef(null);

  // ── Sync scale state → ref (read by Three.js loop) ──
  useEffect(() => { scaleRef.current = { x: sx, y: sy, z: sz }; }, [sx, sy, sz]);

  // ── Draw phase helpers ──
  const getDrawPos = (e) => {
    const c = drawRef.current;
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (c.width / r.width), y: (s.clientY - r.top) * (c.height / r.height) };
  };

  const onDrawStart = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    ptsRef.current = [];
    const p = getDrawPos(e);
    ptsRef.current.push(p);
    const ctx = drawRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawRef.current.width, drawRef.current.height);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const onDrawMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getDrawPos(e);
    ptsRef.current.push(p);
    const ctx = drawRef.current.getContext('2d');
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const onDrawEnd = () => {
    if (!drawingRef.current || ptsRef.current.length < 6) return;
    drawingRef.current = false;
    const canvas = drawRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(ptsRef.current[0].x, ptsRef.current[0].y);
    ptsRef.current.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = darken(color);
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const doneDrawing = () => {
    if (ptsRef.current.length < 6) { setHint('Draw a bigger shape first!'); return; }
    savedPts.current   = [...ptsRef.current];
    savedColor.current = color;
    setSx(1); setSy(1); setSz(1);
    scaleRef.current = { x: 1, y: 1, z: 1 };
    setHint('');
    setPhase('play');
  };

  // ── Three.js scene ──
  useEffect(() => {
    if (phase !== 'play' || !mountRef.current) return;

    const W = mountRef.current.clientWidth || 700;
    const H = 420;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0e6ff);

    // Subtle grid floor for depth perception
    const grid = new THREE.GridHelper(20, 20, 0xddbbff, 0xddbbff);
    grid.position.y = -3;
    scene.add(grid);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 9);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffeedd, 0.5);
    fill.position.set(-6, -2, 4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xaaddff, 0.4);
    rim.position.set(0, -5, -6);
    scene.add(rim);

    // Floor plane (receives shadow)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // Build extruded shape from drawn points
    const norm = normalizePoints(savedPts.current);
    const shape = new THREE.Shape();
    shape.moveTo(norm[0][0], norm[0][1]);
    norm.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.4,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.14,
      bevelSegments: 8,
    });
    geo.center();

    const mat = new THREE.MeshPhongMaterial({
      color: parseInt(savedColor.current.replace('#', ''), 16),
      shininess: 100,
      specular: new THREE.Color(0.3, 0.3, 0.3),
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    scene.add(mesh);

    // Spring physics
    const spring = { x: 1, y: 1, z: 1 };
    let squishTarget = null;

    // Rotation via drag
    let rotX = 0.15, rotY = 0.3;
    let dragStart = null;

    const onDown = (e) => {
      if (e.target !== renderer.domElement) return;
      dragStart = { mx: e.clientX, my: e.clientY, rx: rotX, ry: rotY };
    };
    const onMove = (e) => {
      if (!dragStart) return;
      rotY = dragStart.ry + (e.clientX - dragStart.mx) * 0.012;
      rotX = dragStart.rx + (e.clientY - dragStart.my) * 0.012;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
    };
    const onUp = () => { dragStart = null; };

    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);

    // Auto-rotate state
    let autoRot = true;
    let lastMoveTime = Date.now();
    const stopAuto = () => { autoRot = false; lastMoveTime = Date.now(); };
    renderer.domElement.addEventListener('mousedown', stopAuto);
    // Resume auto-rotate 3s after last interaction
    const autoTimer = setInterval(() => {
      if (!autoRot && Date.now() - lastMoveTime > 3000) autoRot = true;
    }, 500);

    // Squish exposed to React
    threeRef.current.squish = () => {
      const s = scaleRef.current;
      squishTarget = { x: s.x * 1.9, y: s.y * 0.28, z: s.z * 1.6 };
      setTimeout(() => {
        squishTarget = { x: s.x * 0.75, y: s.y * 1.55, z: s.z * 0.85 };
        setTimeout(() => { squishTarget = null; }, 280);
      }, 220);
    };

    // Render loop
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const tgt = squishTarget ?? scaleRef.current;
      spring.x += (tgt.x - spring.x) * 0.14;
      spring.y += (tgt.y - spring.y) * 0.14;
      spring.z += (tgt.z - spring.z) * 0.14;
      mesh.scale.set(spring.x, spring.y, spring.z);

      if (autoRot) rotY += 0.007;
      mesh.rotation.x = rotX;
      mesh.rotation.y = rotY;

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w = mountRef.current?.clientWidth || W;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    });
    if (mountRef.current) ro.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(autoTimer);
      ro.disconnect();
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      threeRef.current = {};
    };
  }, [phase]);

  // ── Handle drag (scale handles) ──
  useEffect(() => {
    if (phase !== 'play') return;
    const onMove = (e) => {
      if (!handleDrag.current) return;
      const { axis, startPos, startScale } = handleDrag.current;
      const cur = ['x','z'].includes(axis)
        ? (e.touches ? e.touches[0].clientX : e.clientX)
        : (e.touches ? e.touches[0].clientY : e.clientY);
      const sign = axis === 'y' ? -1 : 1;
      const val = Math.max(0.2, Math.min(3.5, startScale + sign * (cur - startPos) / 70));
      if (axis === 'x') setSx(val);
      else if (axis === 'y') setSy(val);
      else setSz(val);
    };
    const onUp = () => { handleDrag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };
  }, [phase]);

  const startHandleDrag = (e, axis) => {
    e.preventDefault(); e.stopPropagation();
    const pos = ['x','z'].includes(axis)
      ? (e.touches ? e.touches[0].clientX : e.clientX)
      : (e.touches ? e.touches[0].clientY : e.clientY);
    handleDrag.current = { axis, startPos: pos, startScale: axis === 'x' ? sx : axis === 'y' ? sy : sz };
  };

  // ── Render ──
  return (
    <div className="card card-purple">
      <h2>🫧 Squishy Stuff!</h2>

      {phase === 'draw' ? (
        <>
          <p className="squishy-instruction">Draw your own shape — it becomes 3D!</p>
          <div className="draw-controls">
            {PALETTE.map(c => (
              <div key={c} className={`color-swatch${color === c ? ' active' : ''}`}
                style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          {hint && <p style={{ textAlign:'center', color:'#e65100', marginBottom:8 }}>{hint}</p>}
          <canvas
            ref={drawRef}
            className="squishy-draw-canvas"
            width={560} height={320}
            onMouseDown={onDrawStart} onMouseMove={onDrawMove}
            onMouseUp={onDrawEnd}     onMouseLeave={onDrawEnd}
            onTouchStart={onDrawStart} onTouchMove={onDrawMove} onTouchEnd={onDrawEnd}
          />
          <div className="btn-row">
            <button className="btn btn-purple" onClick={doneDrawing}>Done! Make it 3D! 🎉</button>
          </div>
        </>
      ) : (
        <>
          <p className="squishy-instruction">
            Drag the shape to <strong>rotate</strong> · Pull handles to <strong>stretch &amp; squeeze</strong>
          </p>

          <div className="squishy-play-area">
            {/* Three.js mounts here */}
            <div ref={mountRef} className="three-mount" />

            {/* ← → width handle */}
            <div className="sq-handle sq-handle-h" title="Stretch sideways"
              onMouseDown={e => startHandleDrag(e,'x')} onTouchStart={e => startHandleDrag(e,'x')}>↔</div>

            {/* ↑ ↓ height handle */}
            <div className="sq-handle sq-handle-v" title="Stretch up/down"
              onMouseDown={e => startHandleDrag(e,'y')} onTouchStart={e => startHandleDrag(e,'y')}>↕</div>

            {/* ⟲ depth handle */}
            <div className="sq-handle sq-handle-d" title="Stretch depth"
              onMouseDown={e => startHandleDrag(e,'z')} onTouchStart={e => startHandleDrag(e,'z')}>⟲</div>
          </div>

          <p style={{ textAlign:'center', fontSize:'.9rem', color:'#999', margin:'6px 0' }}>
            ↔ {sx.toFixed(2)}x &nbsp;|&nbsp; ↕ {sy.toFixed(2)}x &nbsp;|&nbsp; ⟲ {sz.toFixed(2)}x depth
          </p>

          <div className="btn-row">
            <button className="btn btn-red"    onClick={() => threeRef.current.squish?.()}>💥 Squish!</button>
            <button className="btn btn-orange" onClick={() => { setSx(1); setSy(1); setSz(1); }}>↺ Reset</button>
            <button className="btn btn-purple" onClick={() => setPhase('draw')}>✏️ Draw Again</button>
          </div>
        </>
      )}
    </div>
  );
}
