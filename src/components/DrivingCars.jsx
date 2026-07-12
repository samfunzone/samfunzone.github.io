import { useState, useEffect, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';
import { track } from '../utils/analytics';

const CAR_EMOJI = '🚗';

const DESTINATIONS = [
  { id: 'beach',  emoji: '🏖️', label: 'Beach',  bg: 'linear-gradient(180deg,#87ceeb,#f5deb3)' },
  { id: 'school', emoji: '🏫', label: 'School', bg: 'linear-gradient(180deg,#bcdff9,#e8d9a0)' },
  { id: 'park',   emoji: '🌳', label: 'Park',   bg: 'linear-gradient(180deg,#b3e5fc,#8bc879)' },
  { id: 'zoo',    emoji: '🦁', label: 'Zoo',    bg: 'linear-gradient(180deg,#cdeccb,#e0c08a)' },
  { id: 'city',   emoji: '🏙️', label: 'City',   bg: 'linear-gradient(180deg,#c9d6e3,#9aa5b1)' },
  { id: 'farm',   emoji: '🐄', label: 'Farm',   bg: 'linear-gradient(180deg,#d6ecff,#c5e0a5)' },
];

// Trip length + how twisty the road gets — a "how long/curvy is this drive"
// picker for a solo FPV cruise you have to steer through.
// `friction` is just gentle rolling drag now — gas builds speed and it's
// kept (coasting) until the brake is pressed, like a real car, rather than
// bleeding off the moment you let go. `brakeDecel` stays strong since that's
// the deliberate stop.
const TRIPS = [
  { id: 'easy',   label: '🐣 Short Hop', desc: 'Quick & gentle curves',  distance: 70,  accel: 26, brakeDecel: 46, friction: 1.6, maxSpeed: 30, curveIntensity: 0.6 },
  { id: 'medium', label: '⚡ Road Trip', desc: 'Balanced twists',        distance: 110, accel: 20, brakeDecel: 50, friction: 2,   maxSpeed: 26, curveIntensity: 1 },
  { id: 'hard',   label: '🔥 Long Haul', desc: 'Longer & twistier',      distance: 160, accel: 15, brakeDecel: 56, friction: 2.6, maxSpeed: 23, curveIntensity: 1.35 },
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
const CAR_STEER_SPEED = 95;     // svg-units/sec of lateral car movement at full lock
const CAR_RANGE = 130;          // clamp on car's lateral svg-unit offset
const CAR_HALF_WIDTH = 14;      // svg-units, for the off-road edge check
const OFFROAD_FRICTION_BONUS = 16;

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
      let nextCarX = carXRef.current + steerInput * CAR_STEER_SPEED * tickSec;
      nextCarX = Math.max(-CAR_RANGE, Math.min(CAR_RANGE, nextCarX));
      carXRef.current = nextCarX;
      setCarX(nextCarX);

      const roadCenterNear = curveAt(distRef.current, t.curveIntensity) * MAX_CURVE_SHIFT;
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
      if (isOffRoad) nextSpeed = Math.max(0, nextSpeed - OFFROAD_FRICTION_BONUS * tickSec);
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
  const markerScale = 0.4 + (progressPct / 100) * 1.3;

  const rows = buildRoadRows(progress, trip.curveIntensity, carX);
  const leftEdge = rows.map(r => `${r.centerX - r.halfWidth},${r.y}`);
  const rightEdge = rows.slice().reverse().map(r => `${r.centerX + r.halfWidth},${r.y}`);
  const roadPolygon = [...leftEdge, ...rightEdge].join(' ');
  const centerLine = rows.map(r => `${r.centerX},${r.y}`).join(' ');

  return (
    <div className="card card-orange">
      <h2>🚗 Driving Cars!</h2>

      {phase === 'destination' && (
        <div className="drive-select">
          <p className="drive-select-tip">Where are you driving to?</p>
          <div className="drive-dest-grid">
            {DESTINATIONS.map(d => (
              <button key={d.id} className="drive-dest-card" style={{ background: d.bg }}
                      onClick={() => pickDestination(d)}>
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
              <div className="drive-destination-marker" style={{ transform: `translateX(-50%) scale(${markerScale})` }}>
                {destination.emoji}
              </div>
            </div>
            <div className={`drive-road-view${offRoad ? ' drive-offroad' : ''}`}
                 onPointerDown={steerDown} onPointerMove={steerMove}
                 onPointerUp={steerUp} onPointerCancel={steerUp}>
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="drive-road-svg">
                <defs>
                  <linearGradient id="drive-asphalt-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#55585c" />
                    <stop offset="100%" stopColor="#2a2c2f" />
                  </linearGradient>
                </defs>
                <polygon points={roadPolygon} fill="url(#drive-asphalt-grad)" />
                <polyline points={centerLine} className="drive-road-center" />
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
                      </defs>
                      <circle cx="50" cy="50" r="46" fill="url(#drive-wheel-rim-grad)" stroke="#0f1113" strokeWidth="3" />
                      <circle cx="50" cy="50" r="33" fill="none" stroke="#141517" strokeWidth="11" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" transform="rotate(120 50 50)" />
                      <rect x="47" y="14" width="6" height="29" rx="3" fill="#141517" transform="rotate(240 50 50)" />
                      <circle cx="50" cy="50" r="16" fill="url(#drive-wheel-hub-grad)" stroke="#0f1113" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="drive-gauge drive-gauge-right">
                  <span className="drive-gauge-label">📍 {destination.label}</span>
                  <div className="drive-gauge-bar">
                    <div className="drive-gauge-fill drive-gauge-fill-progress" style={{ width: `${progressPct}%` }} />
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
