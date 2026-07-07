# PLAN: Player progression (localStorage) — executable version

**Rank: #2.** Biggest change to how the app feels for a returning kid: games remember you
and adapt. The design groundwork already exists in `docs/progression-plan.md` (keep that
doc; this file is the concrete build order). Do after PLAN-code-split-games.md (both touch
game files; splitting first avoids rebasing this work).

## Goal

A storage-agnostic progress layer in `localStorage` (single shared device, no backend,
no COPPA concern), integrated into three games first:
- **Bubble Pop** — persist the best score (today it lives only in component state, lost on unmount).
- **Number Detective** — remember cleared levels, pre-select the next one, badge clears.
- **Tamil Tango** — record per-mode accuracy/plays (used later to scale difficulty).

Soft gating only — **never hard-lock a difficulty**; pre-select and badge, keep manual choice.

## Files to touch

- `src/utils/progress.js` — **new** (model on `src/utils/analytics.js`: every storage access
  in `try/catch` so private-mode/blocked storage can never break the app).
- `src/components/BubblePop.jsx`
- `src/components/NumberDetective.jsx`
- `src/components/TamilLetters.jsx`
- `src/App.css` — badge + reset-control styles (game-prefixed classes per conventions).

## Steps (in order)

### 1. `src/utils/progress.js`

Single localStorage key `samfunzone:progress`, shape
`{ version: 1, games: { [gameId]: {...} } }`. Exports:

```js
export function getGameProgress(gameId)        // → slice or {} — NEVER throws
export function recordResult(gameId, patch)    // merge patch, bump plays/lastPlayed, persist, return slice
export function resetProgress(gameId)          // omit gameId → clear all
export function useProgress(gameId)            // React hook → [progress, record, reset]
```

Implementation notes:
- `recordResult` merge rule: shallow-merge `patch` into the slice, EXCEPT plain-object
  values (like `cleared`) which merge one level deep. Numbers are caller-computed — the
  util does no `Math.max`; callers decide (keeps the util dumb and predictable).
- Always set `plays: (slice.plays || 0) + 1` and `lastPlayed: Date.now()` inside `recordResult`.
- Tolerant reader: `JSON.parse` in try/catch; if the stored `version` is unknown or parse
  fails, start from `{ version: 1, games: {} }` — never crash, never wipe eagerly (only
  overwrite on next write).
- `useProgress`: `useState(() => getGameProgress(gameId))` + wrapped `record`/`reset` that
  call the util then `setState` with the returned slice. Do NOT use a `storage` event
  listener (same-tab writes don't fire it; cross-tab sync is out of scope).

### 2. Bubble Pop (quick win, proves persistence)

`src/components/BubblePop.jsx`:
- Line ~134: `const [best, setBest] = useState(0);` → seed lazily:
  `useState(() => getGameProgress('bubbles').bestScore || 0)`.
- In the game-over effect (lines ~155–167, where `track('game_complete', ...)` fires and
  `setBest` is updated): also call
  `recordResult('bubbles', { bestScore: Math.max(best, score) })`.
  **Edge case:** that effect's dep array includes `best` — add the record call at the same
  spot where `newBest`/`setBest` are computed (it runs once when `phase` flips to done),
  and do NOT add new deps that would re-fire it.

### 3. Number Detective

`src/components/NumberDetective.jsx`:
- **Record on real win only.** There are TWO `setPhase('won')` paths: the real solve at
  line ~77 (inside `submitGuess`, where `track('game_complete')` fires) and `revealAnswer()`
  at line ~99–103 which sets `gaveUp` — a weaker model will record both. Only record the
  first: `recordResult('numdet', { cleared: { [level.rank]: true }, ...(hardMode && !gaveUp ? { hardCleared: { [level.rank]: true } } : {}) })`.
  Also enrich the existing event: `track('game_complete', { game: 'numdet', level: level.rank, hard: hardMode })`.
- **Select screen** (`phase === 'select'`, line ~109): use `useProgress('numdet')`. For each
  `LEVELS` entry show a ✅ badge if `progress.cleared?.[lv.rank]` (and 🕶️ if `hardCleared`).
  Visually highlight (e.g. a "▶ next" pill / pulsing border) the first level whose rank is
  NOT in `cleared` — do not disable any button.
- Add a small "↺ Reset progress" text button on the select screen calling `reset()`
  (this is the parent/reset control for the whole feature; one game is enough for v1).

### 4. Tamil Tango (record only, adapt later)

`src/components/TamilLetters.jsx`: Mix It! and Extract It! both end in a shared
`WonScreen` flow where `track('game_complete', { game: 'tamil', mode })` fires — find that
call (grep `game_complete`) and next to it record:
`recordResult('tamil', { modes: { [mode]: { plays: (prev+1), bestScore: max } } })` —
read the previous slice via `getGameProgress('tamil')` at that moment (these are class-free
function components; don't thread the hook through if the call site is awkward — the plain
util functions are legal anywhere).
Scaling `ROUNDS`/distractors by mastery is a **follow-on, not this plan** — don't attempt it.

### 5. Styles

`App.css`: `.nd-clear-badge`, `.nd-next-pill`, `.nd-reset-link` (small, muted, bottom of the
select card). Follow the navy theme; put mobile tweaks in the existing
`max-width: 600px` block if needed.

## Edge cases found while exploring

- Safari private mode **throws on `localStorage.setItem`** — every read AND write must be
  inside try/catch (the analytics util shows the house style).
- Bubble Pop's end-of-game logic is in a `useEffect` watching `timeLeft`/`phase` — putting
  `recordResult` anywhere that adds deps will double-record. Co-locate with the existing
  `statsRef` finalization.
- Number Detective's `revealAnswer` ("give up") path also reaches the `won` phase — must
  not count as a clear (the analytics code already got this right by only tracking in
  `submitGuess`; mirror that placement exactly).
- `level.rank` is a display string (e.g. "Rookie") — fine as an object key, but never
  index by array position (LEVELS order could change).
- Don't write to storage on every render/guess — only at the single win/finish moment.

## Acceptance criteria

1. Play Bubble Pop, get a score, switch tabs and back (unmount!), then reload the page —
   the menu shows `🏆 Best score: N` both times.
2. Win Number Detective on Rookie → DevTools ▸ Application ▸ Local Storage ▸
   `samfunzone:progress` shows `numdet.cleared.Rookie: true`; reload → Rookie is badged ✅
   and the next level is highlighted. "Reveal Answer" instead of winning → NO clear recorded.
3. Finish a Tamil Mix It! round set → `tamil.modes.mix.plays` increments.
4. "↺ Reset progress" returns Number Detective's select screen to its default look.
5. With DevTools ▸ Application ▸ Storage set to block (or in a private window), every game
   still plays with zero console errors.
6. `npm run lint` (no new problems) and `npm run build` pass.
