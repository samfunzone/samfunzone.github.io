import { useState, useRef, useEffect } from 'react';
import { launchConfetti } from '../utils/confetti';
import { shuffle } from '../utils/shuffle';
import { track } from '../utils/analytics';
import { lighten, darken } from '../utils/color';

// All money math is in integer cents — never float dollars.
const fmt = c => `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`;

const CATALOG = [
  { id: 'apple',    emoji: '🍎', label: 'Apple',     price: { junior: 100, cashier: 75 } },
  { id: 'banana',   emoji: '🍌', label: 'Banana',    price: { junior: 100, cashier: 50 } },
  { id: 'cookie',   emoji: '🍪', label: 'Cookie',    price: { junior: 200, cashier: 100 } },
  { id: 'milk',     emoji: '🥛', label: 'Milk',      price: { junior: 200, cashier: 125 } },
  { id: 'juice',    emoji: '🧃', label: 'Juice',     price: { junior: 100, cashier: 75 } },
  { id: 'donut',    emoji: '🍩', label: 'Donut',     price: { junior: 200, cashier: 125 } },
  { id: 'icecream', emoji: '🍦', label: 'Ice Cream', price: { junior: 300, cashier: 150 } },
  { id: 'candy',    emoji: '🍬', label: 'Candy',     price: { junior: 100, cashier: 25 } },
  { id: 'teddy',    emoji: '🧸', label: 'Teddy',     price: { junior: 500, cashier: 150 } },
  { id: 'ball',     emoji: '⚽', label: 'Ball',      price: { junior: 400, cashier: 125 } },
  { id: 'toycar',   emoji: '🏎️', label: 'Toy Car',   price: { junior: 300, cashier: 100 } },
  { id: 'balloon',  emoji: '🎈', label: 'Balloon',   price: { junior: 100, cashier: 50 } },
  { id: 'crayons',  emoji: '🖍️', label: 'Crayons',   price: { junior: 200, cashier: 100 } },
  { id: 'pencil',   emoji: '✏️', label: 'Pencil',    price: { junior: 100, cashier: 25 } },
  { id: 'book',     emoji: '📚', label: 'Book',      price: { junior: 400, cashier: 150 } },
  { id: 'sticker',  emoji: '🌟', label: 'Stickers',  price: { junior: 100, cashier: 50 } },
];

const CUSTOMERS = ['👧', '👦', '👵', '👴', '🧑‍🦱', '👩‍🦰', '🧔', '👩‍🦳', '🧕', '👨‍🦲', '🐻', '🦊'];

// Difficulty ramp (every level makes change): junior = add whole dollars,
// pick the total; cashier = whole dollars but with item QUANTITIES
// (2 × $3 → multiply, then add) and a keypad; manager = same quantities
// on 25¢-step prices, so the change needs coins.
const LEVELS = [
  { id: 'junior',  label: 'Junior Clerk',  emoji: '🍭', color: '#f59e0b',
    priceKey: 'junior',  keypad: false, qty: false,
    desc: 'Whole dollars — add it up, then give change!' },
  { id: 'cashier', label: 'Cashier',       emoji: '🧢', color: '#3b82f6',
    priceKey: 'junior',  keypad: true,  qty: true,
    desc: 'Big orders — 2 and 3 of an item, whole dollars!' },
  { id: 'manager', label: 'Store Manager', emoji: '⭐', color: '#8b5cf6',
    priceKey: 'cashier', keypad: true,  qty: true,
    desc: 'Quarter prices — count out coin change!' },
];

// Drawer denominations for making change. Prices step in 5¢ so pennies
// are never needed — leaving them out keeps every coin tappable-for-a-reason.
const DRAWER = [
  { id: 'n',  v: 5,   kind: 'coin', label: '5¢' },
  { id: 'd',  v: 10,  kind: 'coin', label: '10¢' },
  { id: 'q',  v: 25,  kind: 'coin', label: '25¢' },
  { id: 'b1', v: 100, kind: 'bill', label: '$1' },
  { id: 'b5', v: 500, kind: 'bill', label: '$5' },
];
const DENOM = Object.fromEntries(DRAWER.map(d => [d.id, d]));

const ROUNDS = 3;
const SHELF_SIZE = 8;
// Orders grow across the day. Junior: 3 → 4 → 5 single items. Quantity
// levels (cashier/manager): 2 → 3 → 4 distinct items so taps stay sane.
const orderSize = (lv, roundIdx) => (lv.qty ? 2 : 3) + roundIdx;
// Quantity per item on qty levels: up to 2 in round 1, up to 3 after.
const maxQty = roundIdx => (roundIdx === 0 ? 2 : 3);

// Module-level so the react-hooks purity rule treats them as opaque —
// they are only ever called from event handlers / timeouts, never render.
const randFrom = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const coinFlip = () => Math.random() < 0.5;

// Greedy bill/coin breakdown (largest first) for showing a paid amount.
function breakdown(cents) {
  const out = [];
  for (const d of [...DRAWER].reverse()) {
    while (cents >= d.v) { out.push(d.id); cents -= d.v; }
  }
  return out;
}

const COIN_STYLE = {
  n: { size: 44, c: '#cbd5e1' },
  d: { size: 36, c: '#e2e8f0' },
  q: { size: 50, c: '#c0cbd8' },
};
function Coin({ id }) {
  const { size, c } = COIN_STYLE[id];
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id={`shop-coin-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={lighten(c, 0.5)} />
          <stop offset="55%" stopColor={c} />
          <stop offset="100%" stopColor={darken(c, 0.3)} />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill={`url(#shop-coin-${id})`} />
      <circle cx={r} cy={r} r={r - 2.5} fill="none" stroke={darken(c, 0.25)}
        strokeWidth="1.5" strokeDasharray="2 2.5" />
      <circle cx={r} cy={r} r={r - 6} fill="none" stroke={lighten(c, 0.3)} strokeWidth="1" />
      <text x={r} y={r + 4.5} textAnchor="middle" fontSize={r * 0.55} fontWeight="800"
        fill={darken(c, 0.45)}>{DENOM[id].label}</text>
    </svg>
  );
}

const BILL_STYLE = {
  b1: { c: '#7fb586' },
  b5: { c: '#5f9e8f' },
};
function Bill({ id }) {
  const { c } = BILL_STYLE[id];
  const label = id === 'b1' ? '$1' : '$5';
  return (
    <svg width="76" height="36" viewBox="0 0 76 36" aria-hidden="true">
      <defs>
        <linearGradient id={`shop-bill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(c, 0.25)} />
          <stop offset="50%" stopColor={c} />
          <stop offset="100%" stopColor={darken(c, 0.2)} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="74" height="34" rx="4" fill={`url(#shop-bill-${id})`}
        stroke={darken(c, 0.35)} strokeWidth="1.5" />
      <rect x="5" y="5" width="66" height="26" rx="2" fill="none"
        stroke={lighten(c, 0.35)} strokeWidth="1" strokeDasharray="3 2" />
      <ellipse cx="38" cy="18" rx="12" ry="10" fill={lighten(c, 0.2)}
        stroke={darken(c, 0.25)} strokeWidth="1" />
      <text x="38" y="23" textAnchor="middle" fontSize="12" fontWeight="800"
        fill={darken(c, 0.5)}>{label}</text>
      <text x="10" y="12" fontSize="7" fontWeight="700" fill={darken(c, 0.4)}>{label}</text>
      <text x="60" y="30" fontSize="7" fontWeight="700" fill={darken(c, 0.4)}>{label}</text>
    </svg>
  );
}

function Money({ id }) {
  return DENOM[id].kind === 'coin' ? <Coin id={id} /> : <Bill id={id} />;
}

// Junior total options: the real total plus two near-miss distractors.
function makeChoices(total) {
  const opts = new Set([total]);
  const cands = shuffle([total + 100, total - 100, total + 200, total - 200, total + 300]
    .filter(v => v >= 100));
  for (const v of cands) { if (opts.size < 3) opts.add(v); }
  return shuffle([...opts]);
}

export default function LittleShop() {
  const [phase, setPhase]     = useState('select');  // select | playing | won
  const [level, setLevel]     = useState(null);
  const [round, setRound]     = useState(0);
  const [step, setStep]       = useState('scan');    // scan | total | pay | cheer
  const [order, setOrder]     = useState([]);        // [{ id, emoji, label, price }]
  const [shelf, setShelf]     = useState([]);        // same shape, order + distractors
  const [customer, setCustomer] = useState('👧');
  const [scanned, setScanned] = useState([]);        // item ids rung up so far
  const [entry, setEntry]     = useState('');        // keypad digits (cents)
  const [choices, setChoices] = useState([]);        // junior total options
  const [paid, setPaid]       = useState(0);         // cents handed over
  const [pile, setPile]       = useState([]);        // change given: [{ uid, id }]
  const [miss, setMiss]       = useState(0);         // mistakes this round
  const [oops, setOops]       = useState(null);      // { what, msg } transient shake
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [recap, setRecap]     = useState([]);        // [{ customer, total, pts, perfect }]
  const [gain, setGain]       = useState(null);      // { pts, key }
  const uidRef  = useRef(0);
  const timeouts = useRef([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  const total = order.reduce((s, it) => s + it.price * it.qty, 0);
  const given = pile.reduce((s, p) => s + DENOM[p.id].v, 0);
  const countOf = id => scanned.filter(x => x === id).length;

  function setupRound(lv, usedCustomers, roundIdx) {
    const picked = shuffle(CATALOG).slice(0, SHELF_SIZE)
      .map(it => ({ id: it.id, emoji: it.emoji, label: it.label, price: it.price[lv.priceKey] }));
    const wanted = picked.slice(0, orderSize(lv, roundIdx))
      .map(it => ({ ...it, qty: lv.qty ? randInt(1, maxQty(roundIdx)) : 1 }));
    // A qty-level round must feature at least one multiple, or it plays like junior.
    if (lv.qty && wanted.every(it => it.qty === 1)) wanted[0].qty = 2;
    const tot = wanted.reduce((s, it) => s + it.price * it.qty, 0);

    // +1 keeps the payment strictly above the total — change must exist.
    const nextDollar = Math.ceil((tot + 1) / 100) * 100;
    const nextFive = Math.ceil((tot + 1) / 500) * 500;
    // Manager twist: half the time they pay the next dollar up (all-coin change).
    const pay = lv.id === 'manager' && coinFlip() ? nextDollar : nextFive;

    const pool = CUSTOMERS.filter(c => !usedCustomers.includes(c));
    setCustomer(pool.length ? randFrom(pool) : CUSTOMERS[0]);
    setOrder(wanted);
    setShelf(shuffle(picked));
    setScanned([]);
    setEntry('');
    setChoices(lv.keypad ? [] : makeChoices(tot));
    setPaid(pay);
    setPile([]);
    setMiss(0);
    setOops(null);
    setStep('scan');
  }

  function startGame(lv) {
    setLevel(lv);
    setRound(0);
    setScore(0);
    setStreak(0);
    setRecap([]);
    setGain(null);
    setupRound(lv, [], 0);
    setPhase('playing');
  }

  function flagOops(what, msg, penalize) {
    if (penalize) setMiss(m => m + 1);
    setOops({ what, msg });
    later(() => setOops(null), 700);
  }

  function scanItem(item) {
    if (step !== 'scan') return;
    const isWanted = order.some(it => it.id === item.id);
    if (!isWanted) {
      flagOops(item.id, `${customer} didn't ask for ${item.label.toLowerCase()}!`,
        level.id !== 'junior');
      return;
    }
    const wantedIt = order.find(it => it.id === item.id);
    if (countOf(item.id) >= wantedIt.qty) return;
    const next = [...scanned, item.id];
    setScanned(next);
    const totalQty = order.reduce((s, it) => s + it.qty, 0);
    if (next.length === totalQty) later(() => setStep('total'), 550);
  }

  function finishRound() {
    const pts = Math.max(100 - miss * 25, 25) + streak * 10;
    const perfect = miss === 0;
    setScore(s => s + pts);
    setStreak(k => (perfect ? k + 1 : 0));
    setGain({ pts, key: round });
    setStep('cheer');
    launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 26);
    later(() => {
      const rec = { customer, total, pts, perfect };
      setRecap(rs => [...rs, rec]);
      if (round + 1 >= ROUNDS) {
        setPhase('won');
        const max = ROUNDS * 100;
        const finalScore = score + pts;
        track('game_complete', {
          game: 'shop',
          stars: finalScore >= max * 0.75 ? 3 : finalScore >= max * 0.45 ? 2 : 1,
        });
        for (let i = 0; i < 6; i++)
          later(() => launchConfetti(
            window.innerWidth * (0.2 + Math.random() * 0.6),
            window.innerHeight * 0.3, 30
          ), i * 130);
      } else {
        setRound(r => r + 1);
        setupRound(level, recap.map(r => r.customer).concat(customer), round + 1);
      }
    }, 1600);
  }

  function submitTotal(cents) {
    if (step !== 'total') return;
    if (cents === total) {
      setStep('pay');
    } else {
      flagOops('total', 'Not quite — add it up again!', true);
      setEntry('');
    }
  }

  // Whole-dollar levels type dollars ("12" → $12.00); manager types cents
  // register-style ("345" → $3.45).
  const wholeDollar = level ? level.priceKey === 'junior' : false;
  const entryCents = wholeDollar ? parseInt(entry || '0', 10) * 100 : parseInt(entry || '0', 10);

  function keypadTap(k) {
    if (step !== 'total') return;
    if (k === 'back') setEntry(e => e.slice(0, -1));
    else if (k === 'ok') submitTotal(entryCents);
    else setEntry(e => (e.length >= (wholeDollar ? 2 : 4) ? e : e === '' && k === '0' ? e : e + k));
  }

  function giveMoney(id) {
    if (step !== 'pay') return;
    uidRef.current += 1;
    setPile(p => [...p, { uid: uidRef.current, id }]);
  }

  function takeBack(uid) {
    if (step !== 'pay') return;
    setPile(p => p.filter(x => x.uid !== uid));
  }

  function confirmChange() {
    if (step !== 'pay') return;
    const change = paid - total;
    if (given === change) finishRound();
    else if (given > change) flagOops('pile', 'Oops, that’s too much! Take some back.', true);
    else flagOops('pile', 'Not quite enough change yet!', true);
  }

  // ── SELECT ──
  if (phase === 'select') {
    return (
      <div className="card card-orange">
        <div className="shop-select-header">
          <div className="shop-logo">🛒</div>
          <h2>Little Shop</h2>
          <p className="shop-select-sub">
            Your shop is open! Ring up each customer,<br />
            add up the total, and give the right change.
          </p>
        </div>
        <div className="shop-level-grid">
          {LEVELS.map(lv => (
            <button key={lv.id} className="shop-level-card" style={{ '--shop-c': lv.color }}
              onClick={() => startGame(lv)}
            >
              <div className="shop-lc-emoji">{lv.emoji}</div>
              <div className="shop-lc-name">{lv.label}</div>
              <div className="shop-lc-desc">{lv.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── WON ──
  if (phase === 'won') {
    const max = ROUNDS * 100;
    const stars = score >= max * 0.75 ? 3 : score >= max * 0.45 ? 2 : 1;
    const starLabel = stars === 3 ? '🏆 SUPER SHOPKEEPER!' : stars === 2 ? '⭐ GREAT CASHIER!' : '👏 GOOD WORK!';
    const earnings = recap.reduce((s, r) => s + r.total, 0);
    return (
      <div className="card card-orange">
        <div className="shop-won">
          <div className="shop-won-title">🔔 CLOSING TIME!</div>
          <div className="shop-won-score" style={{ borderColor: level.color }}>⭐ {score}</div>
          <div className="shop-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <div className="shop-star-label">{starLabel}</div>
          <div className="shop-earnings">💰 The shop earned <b>{fmt(earnings)}</b> today!</div>
          <div className="shop-recap">
            {recap.map((r, i) => (
              <div key={i} className={`shop-recap-item${r.perfect ? '' : ' shop-recap-miss'}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="shop-recap-face">{r.customer}</span>
                <span className="shop-recap-total">{fmt(r.total)}</span>
                <span className="shop-recap-pts">+{r.pts}</span>
              </div>
            ))}
          </div>
          <div className="shop-btn-row">
            <button className="btn btn-orange" onClick={() => startGame(level)}>🔁 Open Again</button>
            <button className="btn btn-blue" onClick={() => setPhase('select')}>🏠 Change Level</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const change = paid - total;
  const bubbleMsg =
    step === 'scan' ? <>I need {order.map((it, i) => (
      <span key={it.id}>
        <span className="shop-bub-item">
          <b className="shop-bub-qty">{it.qty}</b> {it.emoji}
        </span>
        {i < order.length - 1 && <span className="shop-bub-amp"> &amp; </span>}
      </span>
    ))} please!</>
    : step === 'total' ? 'How much is that all together?'
    : step === 'pay' ? <>Here you go — {(() => {
        const bd = breakdown(paid);
        return bd.length <= 6
          ? bd.map((id, i) => <span key={i} className="shop-bub-item">{DENOM[id].kind === 'bill' ? '💵' : '🪙'}</span>)
          : <span className="shop-bub-item">💵💵💵</span>;
      })()} {fmt(paid)}!</>
    : 'Thank you! See you soon! 💖';

  return (
    <div className="card card-orange" style={{ '--shop-accent': level.color }}>
      <div className="shop-top">
        <span className="shop-level-pill">{level.emoji} {level.label}</span>
        <div className="shop-top-right">
          {streak >= 2 && <span className="shop-streak" key={streak}>🔥 ×{streak}</span>}
          <span className="shop-score" key={score}>⭐ {score}</span>
        </div>
      </div>

      <div className="shop-dots">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span key={i} className={
            'shop-dot'
            + (i < recap.length ? (recap[i].perfect ? ' shop-dot-done' : ' shop-dot-miss') : '')
            + (i === round ? ' shop-dot-active' : '')
          } />
        ))}
      </div>

      <div className="shop-customer-row" key={round}>
        <div className={`shop-customer${step === 'cheer' ? ' shop-customer-happy' : ''}`}>{customer}</div>
        <div className="shop-bubble" key={step}>{bubbleMsg}</div>
        {gain && gain.key === round && step === 'cheer' && (
          <div className="shop-gain" key={gain.key}>+{gain.pts}</div>
        )}
      </div>

      {oops && <div className="shop-oops-msg">⚠️ {oops.msg}</div>}

      {step === 'scan' && (
        <div className="shop-stage shop-stage-in" key={`scan-${round}`}>
          <div className="shop-shelf">
            {shelf.map(it => {
              const want = order.find(o => o.id === it.id);
              const cnt = countOf(it.id);
              const done = !!want && cnt >= want.qty;
              return (
                <button key={it.id}
                  className={`shop-item${done ? ' shop-item-scanned' : ''}${oops?.what === it.id ? ' shop-shake' : ''}`}
                  onClick={() => scanItem(it)} disabled={done}
                >
                  <span className="shop-item-emoji">{it.emoji}</span>
                  <span className="shop-item-tag">{fmt(it.price)}</span>
                  {done && <span className="shop-item-check">✅</span>}
                  {!done && want?.qty > 1 && cnt > 0 && (
                    <span className="shop-item-count" key={cnt}>{cnt}/{want.qty}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="shop-receipt">
            <div className="shop-receipt-title">🧾 RECEIPT</div>
            {order.filter(it => countOf(it.id) > 0).map(it => (
              <div key={it.id} className="shop-receipt-line">
                <span>{it.emoji} {it.label}</span>
                <span>{countOf(it.id) > 1 ? `${countOf(it.id)} × ${fmt(it.price)}` : fmt(it.price)}</span>
              </div>
            ))}
            {scanned.length < order.reduce((s, it) => s + it.qty, 0) && (
              <div className="shop-receipt-hint">Tap the items {customer} asked for!</div>
            )}
          </div>
        </div>
      )}

      {step === 'total' && (
        <div className="shop-stage shop-stage-in" key={`total-${round}`}>
          <div className="shop-receipt shop-receipt-wide">
            <div className="shop-receipt-title">🧾 RECEIPT</div>
            {order.map(it => (
              <div key={it.id} className="shop-receipt-line">
                <span>{it.emoji} {it.label}</span>
                <span>{it.qty > 1 ? `${it.qty} × ${fmt(it.price)}` : fmt(it.price)}</span>
              </div>
            ))}
            <div className="shop-receipt-line shop-receipt-total">
              <span>TOTAL</span><span>?</span>
            </div>
          </div>
          {level.keypad ? (
            <div className={`shop-register${oops?.what === 'total' ? ' shop-shake' : ''}`}>
              <div className="shop-reg-display">{fmt(entryCents)}</div>
              <div className="shop-keypad">
                {['1','2','3','4','5','6','7','8','9','back','0','ok'].map(k => (
                  <button key={k}
                    className={`shop-key${k === 'ok' ? ' shop-key-ok' : ''}${k === 'back' ? ' shop-key-back' : ''}`}
                    onClick={() => keypadTap(k)}
                  >
                    {k === 'back' ? '⌫' : k === 'ok' ? '✔' : k}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`shop-choices${oops?.what === 'total' ? ' shop-shake' : ''}`}>
              <div className="shop-choices-title">Pick the total:</div>
              {choices.map(c => (
                <button key={c} className="shop-choice-btn" onClick={() => submitTotal(c)}>
                  {fmt(c)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'pay' && (
        <div className="shop-stage shop-stage-in shop-stage-pay" key={`pay-${round}`}>
          <div className="shop-pay-info">
            Total <b>{fmt(total)}</b> · Paid <b>{fmt(paid)}</b> — how much change?
          </div>
          <div className={`shop-change-pile${oops?.what === 'pile' ? ' shop-shake' : ''}`}>
            {pile.length === 0
              ? <span className="shop-pile-hint">Tap money from the drawer 👇</span>
              : pile.map(p => (
                <button key={p.uid} className="shop-pile-money" title="Take back"
                  onClick={() => takeBack(p.uid)}
                >
                  <Money id={p.id} />
                </button>
              ))}
          </div>
          <div className="shop-given">Change so far: <b>{fmt(given)}</b></div>
          <div className="shop-drawer">
            {DRAWER.map(d => (
              <button key={d.id} className="shop-drawer-slot" onClick={() => giveMoney(d.id)}>
                <Money id={d.id} />
              </button>
            ))}
          </div>
          <button className="btn btn-orange shop-give-btn" onClick={confirmChange}>
            ✋ Give Change
          </button>
        </div>
      )}

      {step === 'cheer' && (
        <div className="shop-stage shop-stage-in shop-cheer" key={`cheer-${round}`}>
          <div className="shop-cheer-big">🎉</div>
          <div className="shop-cheer-text">
            Perfect change: <b>{fmt(change)}</b>!
          </div>
        </div>
      )}
    </div>
  );
}
