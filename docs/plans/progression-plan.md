# Plan: Player Progression (single shared device)

## Context

The app currently has no memory of a player between sessions — every game starts
from its default difficulty each time. The goal is to **track each player's
progress on a device** so games adapt as kids return: puzzles get gradually
harder (e.g. Number Detective), and Tamil Tango gets more elaborate (unlock
modes, more rounds, richer distractors).

Scope is deliberately **single shared device** — progress lives in
`localStorage`, no backend, no accounts. This:
- stays free on GitHub Pages (no migration off Pages needed),
- has **no privacy/COPPA concern** (data never leaves the device),
- can later be upgraded to cross-device (Supabase) by swapping only the storage
  layer, because games never touch storage directly.

This mirrors how `src/utils/analytics.js` abstracts the analytics provider.

## Approach

### 1. Storage-agnostic progress layer — `src/utils/progress.js` (new)

A small util in the same style as `analytics.js` (all access wrapped in
`try/catch` so disabled/private-mode storage can never break the app). One
localStorage key `samfunzone:progress` holding:

```js
{ version: 1, games: { [gameId]: { ...gameState } } }
```

Exports:
- `getGameProgress(gameId)` → that game's slice, or `{}` (safe defaults).
- `recordResult(gameId, patch)` → deep-merges `patch`, bumps `plays` +
  `lastPlayed`, persists, returns the updated slice.
- `resetProgress(gameId?)` → clear one game, or everything.
- `useProgress(gameId)` React hook → `[progress, record, reset]`, re-rendering
  the component when progress changes (so select screens reflect unlocks live).

Generic per-game shape (each game uses the keys it needs — util just merges):
`{ plays, lastPlayed, bestScore, bestStreak, mastery, cleared: { [levelId]: stars } }`

`version` enables future migrations; keep a tolerant reader that ignores unknown
keys.

### 2. Integration pattern (applied per game)

Two touch points, both reusing existing code paths:

- **On finish** — at the spot where `game_complete` already fires (already added
  for analytics), also call `recordResult(gameId, {...})` with score/stars/level/
  accuracy. Same moment, co-located. Also pass the difficulty into the existing
  Umami event (e.g. `track('game_complete', { game:'numdet', level: level.rank })`)
  so aggregate progression is visible in the dashboard too.
- **On the select/start screen** — read `getGameProgress` to auto-select the
  recommended next difficulty, show "best"/cleared badges, and celebrate newly
  unlocked content.

**Gating philosophy (recommended): soft, never hard-lock.** For young kids,
never block a difficulty. Instead pre-select the next recommended tier, show
unlock badges + a little celebration, and keep manual override. Avoids
frustration while still making progression feel real.

### 3. First integrations (proves both requested behaviours)

- **Number Detective** (`src/components/NumberDetective.jsx`) — the "gets
  harder" example. `LEVELS` (Rookie→Chief), `startGame(lv)`, win at `setPhase('won')`.
  On win: `recordResult('numdet', { cleared: { [level.rank]: stars } })`. On the
  `phase==='select'` screen: badge cleared ranks, auto-highlight the next
  uncleared level, add a "🎉 New level unlocked!" cue.
- **Tamil Tango** (`src/components/TamilLetters.jsx`) — the "more elaborate"
  example. On each mode finish (`WonScreen`, where `game_complete` fires), record
  `{ modes: { [mode]: { accuracy, plays } } }`. Use accumulated mastery to:
  (a) **unlock Extract It!** in `MODES`/`StartScreen` after Mix reaches a
  threshold; (b) scale `ROUNDS` and widen distractor difficulty in
  `makeMixDeck`/`makeOptions` as mastery grows.
- **Bubble Pop** (`src/components/BubblePop.jsx`) — quick win: `best` is
  currently kept only in state and lost on unmount. Persist it via
  `recordResult('bubbles', { bestScore })` and seed initial state from
  `getGameProgress`. Optionally unlock 🚀 Frenzy after a score threshold.

### 4. Parent/reset control

Add a small "↺ Reset progress" affordance (per-game select screen, or one global
control) calling `resetProgress`. Single shared device → families need a way to
start fresh.

### 5. Follow-on (same pattern, later)

Word Search (unlock medium/hard, remember last level), Unscramble (scale word
length/rounds with mastery), Memory Match (best moves per size, unlock larger
grids). Each is the identical two-touch-point pattern.

## Critical files

- `src/utils/progress.js` — **new**, the whole layer (model on
  `src/utils/analytics.js`).
- `src/components/NumberDetective.jsx` — record on win + adapt select screen.
- `src/components/TamilLetters.jsx` — record per mode + gate Extract + scale
  rounds/distractors.
- `src/components/BubblePop.jsx` — persist/seed `best`.
- `src/App.css` — small styles for unlock badges / reset control (game-prefixed,
  per existing conventions).

## Verification

- `npm run dev`; play Number Detective to a win → DevTools ▸ Application ▸ Local
  Storage shows `samfunzone:progress` updating. Reload → the next level is
  pre-selected and cleared ranks are badged.
- Play Tamil Mix repeatedly → Extract It! unlocks; rounds/distractors get harder.
- Play Bubble Pop, reload → best score persists.
- Use the reset control → state returns to defaults.
- Incognito / storage-disabled → app still works (try/catch no-op).
- `npm run lint` (note: pre-existing TamilLetters `set-state-in-effect` error is
  unrelated) and `npm run build` both clean.
