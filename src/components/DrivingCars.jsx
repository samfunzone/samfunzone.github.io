import { useState, useEffect, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';
import { track } from '../utils/analytics';

const CAR_EMOJI = '🚗';

// `bg` paints the sky strip, `ground` paints the terrain the road crosses —
// both plain CSS gradients so the whole scene retints per destination.
const DESTINATIONS = [
  { id: 'beach',  emoji: '🏖️', label: 'Beach',  bg: 'linear-gradient(180deg,#87ceeb,#f5deb3)', ground: 'linear-gradient(180deg,#ead9a4,#d9b97c)' },
  { id: 'school', emoji: '🏫', label: 'School', bg: 'linear-gradient(180deg,#bcdff9,#e8d9a0)', ground: 'linear-gradient(180deg,#b9d8a0,#8fbf8a)' },
  { id: 'park',   emoji: '🌳', label: 'Park',   bg: 'linear-gradient(180deg,#b3e5fc,#8bc879)', ground: 'linear-gradient(180deg,#a5d68a,#6faf62)' },
  { id: 'zoo',    emoji: '🦁', label: 'Zoo',    bg: 'linear-gradient(180deg,#cdeccb,#e0c08a)', ground: 'linear-gradient(180deg,#d3e39c,#a8c26a)' },
  { id: 'city',   emoji: '🏙️', label: 'City',   bg: 'linear-gradient(180deg,#c9d6e3,#9aa5b1)', ground: 'linear-gradient(180deg,#b9c2cc,#8d97a3)' },
  { id: 'shop',   emoji: '🛒', label: 'Shop',   bg: 'linear-gradient(180deg,#d6ecff,#f0dcb4)', ground: 'linear-gradient(180deg,#dfd0a8,#bda87c)' },
];

// Trip length + how twisty the road gets — a "how long/curvy is this drive"
// picker for a solo FPV cruise you have to steer through.
// `friction` is just gentle rolling drag now — gas builds speed and it's
// kept (coasting) until the brake is pressed, like a real car, rather than
// bleeding off the moment you let go. `brakeDecel` stays strong since that's
// the deliberate stop.
// `distance` is tuned to `maxSpeed × target seconds` — ≈10s / 20s / 30s of
// driving at full throttle (a bit more with the accel ramp and any braking).
const TRIPS = [
  { id: 'easy',   label: '🐣 Short Hop', desc: 'Quick & gentle curves',  distance: 300, accel: 26, brakeDecel: 46, friction: 1.6, maxSpeed: 30, curveIntensity: 0.6 },
  { id: 'medium', label: '⚡ Road Trip', desc: 'Balanced twists',        distance: 520, accel: 20, brakeDecel: 50, friction: 2,   maxSpeed: 26, curveIntensity: 1 },
  { id: 'hard',   label: '🔥 Long Haul', desc: 'Longer & twistier',      distance: 690, accel: 15, brakeDecel: 56, friction: 2.6, maxSpeed: 23, curveIntensity: 1.6 },
];

const TICK_MS = 100;
const COUNTDOWN_START = 3;

/* ── FPV road geometry ──
   The road is rendered as an SVG polygon in a fixed 300×200 viewBox, with
   preserveAspectRatio="none" so it stretches to whatever width the card
   renders at (a flat, non-uniform stretch is fine here — it's a simple
   painted plane, not a stroke-dasharray path). Every row from the horizon
   (y=0) to the viewer (y=200) samples curveAt() at the world-distance that
   row represents (further rows look further down the road), so the whole
   shape bends into S-curves as the trip progresses — no randomness, fully
   deterministic and replayable from `progress`. */
const VIEW_W = 300;
const VIEW_H = 200;
const ROAD_ROWS = 20;
const LOOKAHEAD = 40;
const NEAR_HALF_WIDTH = 120;
const FAR_HALF_WIDTH = 5;
const PERSPECTIVE_POW = 1.7;
const MAX_CURVE_SHIFT = 65;

function curveAt(progress, intensity = 1) {
  const raw = 0.55 * Math.sin(progress * 0.045)
            + 0.35 * Math.sin(progress * 0.017 + 2.1)
            + 0.25 * Math.sin(progress * 0.09 + 4.4);
  return Math.max(-1, Math.min(1, (raw / 1.15) * intensity));
}

function buildRoadRows(progress, intensity, carX = 0) {
  const rows = [];
  for (let i = 0; i <= ROAD_ROWS; i++) {
    const t = i / ROAD_ROWS; // 0 at horizon .. 1 at the viewer
    const y = t * VIEW_H;
    const halfWidth = FAR_HALF_WIDTH + (NEAR_HALF_WIDTH - FAR_HALF_WIDTH) * Math.pow(t, PERSPECTIVE_POW);
    const worldP = progress + LOOKAHEAD * (1 - t);
    // The camera is anchored to the car, so the whole view pans opposite the
    // car's own lateral position — turn the wheel right (carX grows) and the
    // road visibly slides left, exactly like actually steering the car.
    const centerX = VIEW_W / 2 + curveAt(worldP, intensity) * MAX_CURVE_SHIFT - carX;
    rows.push({ y, centerX, halfWidth });
  }
  return rows;
}

/* Roadside scenery: trees/bushes/pines planted every SIDE_SPACING world
   units, alternating sides. Each one is projected with the exact same
   perspective math as the road rows (same t → y / halfWidth / centerX),
   so they hug the verge and sweep past the camera as you drive —
   fully deterministic from `progress`, no randomness. */
const SIDE_SPACING = 9;
function buildRoadside(progress, intensity, carX) {
  const items = [];
  const first = Math.floor(progress / SIDE_SPACING) * SIDE_SPACING;
  for (let d = first; d <= progress + LOOKAHEAD; d += SIDE_SPACING) {
    const t = 1 - (d - progress) / LOOKAHEAD; // matches road-row t (1 = at the viewer)
    if (t <= 0.1 || t > 1.25) continue;       // >1 lets a tree slide off the bottom edge
    const y = t * VIEW_H;
    const halfWidth = FAR_HALF_WIDTH + (NEAR_HALF_WIDTH - FAR_HALF_WIDTH) * Math.pow(t, PERSPECTIVE_POW);
    const centerX = VIEW_W / 2 + curveAt(d, intensity) * MAX_CURVE_SHIFT - carX;
    const idx = Math.round(d / SIDE_SPACING);
    const side = idx % 2 === 0 ? -1 : 1;
    const s = Math.pow(t, PERSPECTIVE_POW);
    items.push({ key: idx, x: centerX + side * (halfWidth + 12 + 30 * s), y, s, kind: idx % 3 });
  }
  return items.sort((a, b) => a.y - b.y); // far first, so near trees paint on top
}

// Steering: the wheel is dragged (mouse or touch, via Pointer Events) like a
// real wheel — horizontal drag distance maps to rotation, which self-centers
// when released. Rotation drives the car's lateral position in the same
// SVG-unit space as the road, so "off-road" is a simple distance check
// against the road's near-row half-width. The car itself isn't drawn (true
// first-person — you don't see your own car), only the effect it has on
// which part of the road is under you.
const MAX_WHEEL_ROT = 62;       // degrees of lock either way
const STEER_SENSITIVITY = 0.5;  // deg of wheel rotation per px dragged
const RECENTER_RATE = 240;      // deg/sec the wheel springs back when released
const CAR_STEER_SPEED = 130;    // svg-units/sec of lateral car movement at full lock — must beat worst-case drift (CURVE_DRIFT × maxSpeed + road-center swing)
const CAR_RANGE = 130;          // clamp on car's lateral svg-unit offset
const CAR_HALF_WIDTH = 40;      // svg-units — the car is about a lane wide, so the off-road threshold is |offset| > 80, not "point car touches the very edge"
// Curves push the car toward the outside of the bend (scaled by speed), so
// just holding GAS is not enough — the player must steer into every curve or
// drift off the road. Off-road hard-caps speed to a crawl until they steer
// back on, which is the "course correction" penalty (no fail state — kid-safe).
// Note the drift is ∝ curve, so it self-unwinds when the bend reverses — the
// numbers below are sim-tuned so gas-only grazes off-road on easy, and runs
// ~60% / ~100% over target time on medium / hard.
const CURVE_DRIFT = 3.6;        // outward push per unit of speed at full curve
const OFFROAD_MAX_FRAC = 0.25;  // off-road speed cap as a fraction of maxSpeed
const OFFROAD_DECEL = 40;       // svg-units/sec² shed while above the off-road cap

export default function DrivingCars() {
  const [phase, setPhase] = useState('destination'); // destination | ready | countdown | driving | arrived
  const [destination, setDestination] = useState(null);
  const [trip, setTrip] = useState(TRIPS[1]);
  const [count, setCount] = useState(COUNTDOWN_START);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [carX, setCarX] = useState(0);
  const [wheelRot, setWheelRot] = useState(0);
  const [offRoad, setOffRoad] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [tally, setTally] = useState({ trips: 0, bestTime: null });
  const [isNewBest, setIsNewBest] = useState(false);
  const [hasSteered, setHasSteered] = useState(false);

  const gasRef = useRef(false);
  const brakeRef = useRef(false);
  const speedRef = useRef(0);
  const distRef = useRef(0);
  const carXRef = useRef(0);
  const wheelRotRef = useRef(0);
  const dragRef = useRef({ dragging: false, startClientX: 0, startRot: 0 });
  const tripRef = useRef(trip);
  const arrivedRef = useRef(false);
  const startTimeRef = useRef(0);
  const tallyRef = useRef({ trips: 0, bestTime: null });

  /* Drive tick loop */
  useEffect(() => {
    if (phase !== 'driving') return;
    const iv = setInterval(() => {
      const tickSec = TICK_MS / 1000;
      const t = tripRef.current;

      // Wheel self-centers when the player isn't actively dragging it.
      if (!dragRef.current.dragging) {
        const rot = wheelRotRef.current;
        const step = RECENTER_RATE * tickSec;
        const nextRot = Math.abs(rot) <= step ? 0 : rot - Math.sign(rot) * step;
        wheelRotRef.current = nextRot;
        setWheelRot(nextRot);
      }

      const steerInput = wheelRotRef.current / MAX_WHEEL_ROT; // -1..1
      // Centrifugal drift: a right-hand curve (curveAt > 0) shoves the car
      // left (outward) — the faster you go, the harder the shove.
      const curveHere = curveAt(distRef.current, t.curveIntensity);
      let nextCarX = carXRef.current
        + steerInput * CAR_STEER_SPEED * tickSec
        - curveHere * CURVE_DRIFT * speedRef.current * tickSec;
      nextCarX = Math.max(-CAR_RANGE, Math.min(CAR_RANGE, nextCarX));
      carXRef.current = nextCarX;
      setCarX(nextCarX);

      const roadCenterNear = curveHere * MAX_CURVE_SHIFT;
      const isOffRoad = Math.abs(nextCarX - roadCenterNear) > (NEAR_HALF_WIDTH - CAR_HALF_WIDTH);
      setOffRoad(isOffRoad);

      let nextSpeed = speedRef.current;
      if (brakeRef.current) {
        nextSpeed = Math.max(0, nextSpeed - t.brakeDecel * tickSec);
      } else if (gasRef.current) {
        nextSpeed = Math.min(t.maxSpeed, nextSpeed + t.accel * tickSec);
      } else {
        nextSpeed = Math.max(0, nextSpeed - t.friction * tickSec);
      }
      if (isOffRoad) {
        const cap = t.maxSpeed * OFFROAD_MAX_FRAC;
        if (nextSpeed > cap) nextSpeed = Math.max(cap, nextSpeed - OFFROAD_DECEL * tickSec);
      }
      speedRef.current = nextSpeed;
      setSpeed(nextSpeed);

      let nextDist = distRef.current + nextSpeed * tickSec;
      if (nextDist >= t.distance) nextDist = t.distance;
      distRef.current = nextDist;
      setProgress(nextDist);

      if (nextDist >= t.distance && !arrivedRef.current) {
        arrivedRef.current = true;
        setElapsed((Date.now() - startTimeRef.current) / 1000);
        setPhase('arrived');
      }
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [phase]);

  /* Countdown 3-2-1-GO */
  useEffect(() => {
    if (phase !== 'countdown') return;
    const t = setTimeout(() => {
      if (count <= 0) {
        startTimeRef.current = Date.now();
        setPhase('driving');
      } else setCount(c => c - 1);
    }, 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  /* Arrival: tally + confetti + analytics, once per arrival */
  useEffect(() => {
    if (phase !== 'arrived') return;
    const prev = tallyRef.current;
    const newBest = prev.bestTime === null || elapsed < prev.bestTime;
    const next = { trips: prev.trips + 1, bestTime: prev.bestTime === null ? elapsed : Math.min(prev.bestTime, elapsed) };
    tallyRef.current = next;
    setTally(next);
    setIsNewBest(newBest);
    track('game_complete', { game: 'drivecars' });
    launchConfetti(window.innerWidth / 2, window.innerHeight * 0.3, 60);
  }, [phase, elapsed]);

  const pickDestination = (d) => {
    setDestination(d);
    setPhase('ready');
  };

  const changeDestination = () => setPhase('destination');

  const startTrip = () => {
    // If the pedal was still held when the trip ended, its pointerup never
    // fired (the button unmounted) — clear held inputs so the new trip
    // doesn't start at full throttle.
    gasRef.current = false;
    brakeRef.current = false;
    speedRef.current = 0;
    distRef.current = 0;
    carXRef.current = 0;
    wheelRotRef.current = 0;
    dragRef.current = { dragging: false, startClientX: 0, startRot: 0 };
    tripRef.current = trip;
    arrivedRef.current = false;
    setSpeed(0);
    setProgress(0);
    setCarX(0);
    setWheelRot(0);
    setOffRoad(false);
    setIsNewBest(false);
    setHasSteered(false);
    setCount(COUNTDOWN_START);
    setPhase('countdown');
  };

  const pressGas = () => { gasRef.current = true; };
  const releaseGas = () => { gasRef.current = false; };
  const pressBrake = () => { brakeRef.current = true; };
  const releaseBrake = () => { brakeRef.current = false; };

  // Steering responds to a drag/swipe on EITHER the wheel graphic or
  // anywhere on the FPV road viewport — whichever a player reaches for
  // first — both feed the same wheel rotation + car lateral position.
  const steerDown = (e) => {
    if (phase !== 'driving') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { dragging: true, startClientX: e.clientX, startRot: wheelRotRef.current };
    setHasSteered(true);
  };
  const steerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startClientX;
    const rot = Math.max(-MAX_WHEEL_ROT, Math.min(MAX_WHEEL_ROT, dragRef.current.startRot + dx * STEER_SENSITIVITY));
    wheelRotRef.current = rot;
    setWheelRot(rot);
  };
  const steerUp = () => { dragRef.current.dragging = false; };

  const progressPct = Math.min(100, (progress / trip.distance) * 100);
  const speedPct = Math.min(100, (speed / trip.maxSpeed) * 100);
  // Eases toward ~3× at the finish line — the power curve keeps it small for
  // most of the trip, then it swells fast on the final approach.
  const markerScale = 0.35 + Math.pow(progressPct / 100, 1.7) * 2.65;

  // Finish line at world distance = trip.distance, projected like a road row;
  // it crosses the bottom edge (t = 1) at the exact moment the trip completes.
  const finishT = 1 - (trip.distance - progress) / LOOKAHEAD;
  const finish = finishT > 0.04 && finishT <= 1.05 ? (() => {
    const y = finishT * VIEW_H;
    const halfWidth = FAR_HALF_WIDTH + (NEAR_HALF_WIDTH - FAR_HALF_WIDTH) * Math.pow(finishT, PERSPECTIVE_POW);
    const centerX = VIEW_W / 2 + curveAt(trip.distance, trip.curveIntensity) * MAX_CURVE_SHIFT - carX;
    return { y, halfWidth, centerX, bandH: Math.max(2, 8 * finishT) };
  })() : null;

  const rows = buildRoadRows(progress, trip.curveIntensity, carX);
  const leftEdge = rows.map(r => `${r.centerX - r.halfWidth},${r.y}`);
  const rightEdge = rows.slice().reverse().map(r => `${r.centerX + r.halfWidth},${r.y}`);
  const roadPolygon = [...leftEdge, ...rightEdge].join(' ');
  const centerLine = rows.map(r => `${r.centerX},${r.y}`).join(' ');
  // Painted edge lines as tapered polygons (a stroked polyline would stay a
  // constant width and swallow the road near the horizon).
  const edgeLine = (sign) => [
    ...rows.map(r => `${r.centerX + sign * r.halfWidth * 0.99},${r.y}`),
    ...rows.slice().reverse().map(r => `${r.centerX + sign * r.halfWidth * 0.9},${r.y}`),
  ].join(' ');
  const roadside = buildRoadside(progress, trip.curveIntensity, carX);

  return (
    <div className="card card-orange">
      <h2>🚗 Driving Cars!</h2>

      {phase === 'destination' && (
        <div className="drive-select">
          <p className="drive-select-tip">Where are you driving to?</p>
          <div className="drive-dest-grid">
            {DESTINATIONS.map((d, i) => (
              <button key={d.id} className="drive-dest-card" onClick={() => pickDestination(d)}
                      style={{ background: d.bg, animationDelay: `${i * 60}ms` }}>
                <span className="drive-dest-emoji">{d.emoji}</span>
                <span className="drive-dest-label">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase !== 'destination' && destination && (
        <div className="drive-arena">
          <div className="drive-dash-scene">
            <div className="drive-sky" style={{ background: destination.bg }}>
              <svg viewBox="0 0 300 110" preserveAspectRatio="none" className="drive-sky-svg" aria-hidden="true">
                <defs>
                  <radialGradient id="drive-sun-grad" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#fffdf0" />
                    <stop offset="55%" stopColor="#ffe066" />
                    <stop offset="100%" stopColor="#ffc93b" />
                  </radialGradient>
                  <radialGradient id="drive-sun-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffe98a" stopOpacity=".85" />
                    <stop offset="100%" stopColor="#ffe98a" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="252" cy="30" r="30" fill="url(#drive-sun-halo)" />
                <circle cx="252" cy="30" r="13" fill="url(#drive-sun-grad)" />
                <g className="drive-cloud">
                  <ellipse cx="0" cy="32" rx="20" ry="9" fill="#fff" opacity=".9" />
                  <ellipse cx="15" cy="27" rx="14" ry="8" fill="#fff" opacity=".85" />
                  <ellipse cx="-14" cy="29" rx="12" ry="7" fill="#fff" opacity=".8" />
                </g>
                <g className="drive-cloud drive-cloud-b">
                  <ellipse cx="0" cy="62" rx="16" ry="7" fill="#fff" opacity=".8" />
                  <ellipse cx="12" cy="57" rx="11" ry="6" fill="#fff" opacity=".7" />
                </g>
              </svg>
              <div className="drive-destination-marker" style={{ transform: `translateX(-50%) scale(${markerScale})` }}>
                {destination.emoji}
              </div>
            </div>
            <div className={`drive-road-view${offRoad ? ' drive-offroad' : ''}`}
                 style={{ background: destination.ground }}
                 onPointerDown={steerDown} onPointerMove={steerMove}
                 onPointerUp={steerUp} onPointerCancel={steerUp}>
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="drive-road-svg">
                <defs>
                  <linearGradient id="drive-asphalt-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7b8087" />
                    <stop offset="35%" stopColor="#4a4d52" />
                    <stop offset="100%" stopColor="#292b2e" />
                  </linearGradient>
                  <linearGradient id="drive-haze-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity=".7" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="drive-trunk-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9a6a3c" />
                    <stop offset="100%" stopColor="#5d3c1f" />
                  </linearGradient>
                  <radialGradient id="drive-leaf-grad" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#8fd96a" />
                    <stop offset="60%" stopColor="#4a9e3a" />
                    <stop offset="100%" stopColor="#2e7326" />
                  </radialGradient>
                  <radialGradient id="drive-bush-grad" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#a4e08a" />
                    <stop offset="60%" stopColor="#5bab48" />
                    <stop offset="100%" stopColor="#3a7d2e" />
                  </radialGradient>
                  <linearGradient id="drive-pine-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5fae57" />
                    <stop offset="100%" stopColor="#28632d" />
                  </linearGradient>
                  <radialGradient id="drive-tree-shadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000" stopOpacity=".3" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <polygon points={roadPolygon} fill="url(#drive-asphalt-grad)" />
                <polygon points={edgeLine(-1)} fill="#f5f6f8" opacity=".85" />
                <polygon points={edgeLine(1)} fill="#f5f6f8" opacity=".85" />
                {/* dashoffset tied to distance travelled so the dashes stream
                    toward the viewer even on dead-straight road */}
                <polyline points={centerLine} className="drive-road-center"
                          style={{ strokeDashoffset: -(progress * 6) }} />
                {finish && (
                  <g>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const w = (2 * finish.halfWidth) / 10;
                      const x = finish.centerX - finish.halfWidth + i * w;
                      return (
                        <g key={i}>
                          <rect x={x} y={finish.y - finish.bandH} width={w} height={finish.bandH / 2}
                                fill={i % 2 === 0 ? '#f5f6f8' : '#1a1c1e'} />
                          <rect x={x} y={finish.y - finish.bandH / 2} width={w} height={finish.bandH / 2}
                                fill={i % 2 === 0 ? '#1a1c1e' : '#f5f6f8'} />
                        </g>
                      );
                    })}
                    <text x={finish.centerX - finish.halfWidth - 4} y={finish.y - finish.bandH}
                          fontSize={18 * finishT} textAnchor="end">🏁</text>
                    <text x={finish.centerX + finish.halfWidth + 4} y={finish.y - finish.bandH}
                          fontSize={18 * finishT} textAnchor="start">🏁</text>
                  </g>
                )}
                {roadside.map(o => (
                  <g key={o.key} transform={`translate(${o.x} ${o.y}) scale(${o.s})`}>
                    <ellipse cx="0" cy="0" rx="15" ry="4" fill="url(#drive-tree-shadow)" />
                    {o.kind === 0 && <>
                      <rect x="-2.5" y="-18" width="5" height="18" rx="1.5" fill="url(#drive-trunk-grad)" />
                      <circle cx="0" cy="-28" r="13" fill="url(#drive-leaf-grad)" />
                      <circle cx="-9" cy="-22" r="8" fill="url(#drive-leaf-grad)" />
                      <circle cx="9" cy="-23" r="8.5" fill="url(#drive-leaf-grad)" />
                      <ellipse cx="-4" cy="-32" rx="5" ry="3.5" fill="#c8f0a8" opacity=".55" />
                    </>}
                    {o.kind === 1 && <>
                      <ellipse cx="0" cy="-7" rx="13" ry="8" fill="url(#drive-bush-grad)" />
                      <ellipse cx="-8" cy="-5" rx="7" ry="5" fill="url(#drive-bush-grad)" />
                      <ellipse cx="8" cy="-6" rx="7" ry="5.5" fill="url(#drive-bush-grad)" />
                      <ellipse cx="-3" cy="-11" rx="4" ry="2.5" fill="#d2f3b4" opacity=".5" />
                    </>}
                    {o.kind === 2 && <>
                      <rect x="-2" y="-12" width="4" height="12" fill="url(#drive-trunk-grad)" />
                      <polygon points="0,-44 -12,-11 12,-11" fill="url(#drive-pine-grad)" />
                      <polygon points="0,-50 -9,-25 9,-25" fill="url(#drive-pine-grad)" />
                    </>}
                  </g>
                ))}
                <rect x="-40" y="0" width={VIEW_W + 80} height="46" fill="url(#drive-haze-grad)" />
              </svg>
              {phase === 'driving' && !hasSteered && <div className="drive-steer-hint">↔ drag to steer</div>}
            </div>

            {/* Windscreen HUD: overlaps the bottom of the road view like a
                real car's dashboard, with the wheel rising up over its top
                edge as if seen from the driver's seat. */}
            <div className="drive-hud-overlay">
              <div className="drive-dashboard">
                <div className="drive-gauge drive-gauge-left">
                  <span className="drive-gauge-label">🏎️ Speed</span>
                  <div className="drive-gauge-bar">
                    <div className="drive-gauge-fill drive-gauge-fill-speed" style={{ width: `${speedPct}%` }} />
                  </div>
                </div>
                <div className="drive-wheel-wrap">
                  <div className="drive-wheel"
                       style={{ transform: `rotate(${wheelRot}deg)` }}
                       onPointerDown={steerDown} onPointerMove={steerMove}
                       onPointerUp={steerUp} onPointerCancel={steerUp}>
                    <svg viewBox="0 0 100 100" className="drive-wheel-svg">
                      <defs>
                        <radialGradient id="drive-wheel-rim-grad" cx="35%" cy="30%" r="75%">
                          <stop offset="0%" stopColor="#4a4e55" />
                          <stop offset="60%" stopColor="#26282c" />
                          <stop offset="100%" stopColor="#141517" />
                        </radialGradient>
                        <radialGradient id="drive-wheel-hub-grad" cx="35%" cy="30%" r="75%">
                          <stop offset="0%" stopColor="#868b93" />
                          <stop offset="100%" stopColor="#2c2f33" />
                        </radialGradient>
                        <linearGradient id="drive-wheel-shine" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
                          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </linearGradient>
                        <radialGradient id="drive-wheel-horn" cx="35%" cy="30%" r="75%">
                          <stop offset="0%" stopColor="#ffd97a" />
                          <stop offset="60%" stopColor="#e6a93c" />
                          <stop offset="100%" stopColor="#9a6a1c" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="46" fill="url(#drive-wheel-rim-grad)" stroke="#0f1113" strokeWidth="3" />
                      <circle cx="50" cy="50" r="33" fill="none" stroke="#141517" strokeWidth="11" />
                      <circle cx="50" cy="50" r="33" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2 5" opacity=".08" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" transform="rotate(120 50 50)" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" transform="rotate(240 50 50)" />
                      <circle cx="50" cy="50" r="16" fill="url(#drive-wheel-hub-grad)" stroke="#0f1113" strokeWidth="2" />
                      <path d="M 12 40 A 40 40 0 0 1 42 10" fill="none" stroke="url(#drive-wheel-shine)"
                            strokeWidth="4.5" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="7.5" fill="url(#drive-wheel-horn)" stroke="#7a5215" strokeWidth="1" />
                      <ellipse cx="47.5" cy="47" rx="2.6" ry="1.8" fill="#fff" opacity=".7" />
                    </svg>
                  </div>
                </div>
                <div className="drive-gauge drive-gauge-right">
                  <span className="drive-gauge-label">📍 {destination.label}</span>
                  <div className="drive-gauge-track">
                    <div className="drive-gauge-bar">
                      <div className="drive-gauge-fill drive-gauge-fill-progress" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="drive-gauge-car" style={{ left: `${progressPct}%` }}>🚗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {phase === 'ready' && (
            <div className="drive-overlay">
              <div className="drive-panel">
                <div className="drive-panel-emoji">{CAR_EMOJI}</div>
                <h3>Ready to drive to {destination.label}!</h3>
                <p className="drive-tip">Drag the wheel to steer through the curves, hold GAS to speed up, BRAKE to slow down!</p>
                <div className="drive-diff-row">
                  {TRIPS.map(t => (
                    <button key={t.id}
                            className={`drive-diff-btn${trip.id === t.id ? ' selected' : ''}`}
                            onClick={() => setTrip(t)}>
                      <span>{t.label}</span>
                      <small>{t.desc}</small>
                    </button>
                  ))}
                </div>
                <div className="drive-btn-row">
                  <button className="btn btn-green" onClick={startTrip}>🏁 Start Driving!</button>
                  <button className="btn btn-blue" onClick={changeDestination}>📍 Change Destination</button>
                </div>
              </div>
            </div>
          )}

          {phase === 'countdown' && (
            <div className="drive-overlay">
              <div key={count} className="drive-countdown">{count > 0 ? count : 'GO!'}</div>
            </div>
          )}

          {phase === 'driving' && (
            <div className="drive-pedals-row">
              <button className="drive-pedal drive-pedal-brake"
                      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); pressBrake(); }}
                      onPointerUp={releaseBrake} onPointerCancel={releaseBrake}>
                🛑<br />BRAKE
              </button>
              <button className="drive-pedal drive-pedal-gas"
                      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); pressGas(); }}
                      onPointerUp={releaseGas} onPointerCancel={releaseGas}>
                ⛽<br />GAS
              </button>
            </div>
          )}

          {phase === 'arrived' && (
            <div className="drive-overlay">
              <div className="drive-panel drive-panel-win">
                <div className="drive-float-layer" aria-hidden="true">
                  {['🚗', '⭐', '🎉', '🏁', '💨', '⭐'].map((em, i) => (
                    <span key={i} className="drive-float"
                          style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.55}s`, animationDuration: `${3 + (i % 3) * 0.8}s` }}>
                      {em}
                    </span>
                  ))}
                </div>
                <div className="drive-trophy">🏆</div>
                <h3>{CAR_EMOJI} You made it to the {destination.label}!</h3>
                <p className="drive-win-line">Arrived in {elapsed.toFixed(1)}s{isNewBest ? ' — new best time! ⭐' : ''}</p>
                <p className="drive-tally">🚗 {tally.trips} trip{tally.trips === 1 ? '' : 's'} completed{tally.bestTime !== null ? ` · Best: ${tally.bestTime.toFixed(1)}s` : ''}</p>
                <div className="drive-btn-row">
                  <button className="btn btn-green" onClick={startTrip}>🔁 Drive Again!</button>
                  <button className="btn btn-blue" onClick={changeDestination}>📍 New Destination</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
