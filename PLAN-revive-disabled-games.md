# PLAN: Revive the three disabled games

**Rank: #5.** Whack-a-Mole, Magic Loops, and Enchanted Garden exist in `src/components/`
but were pulled from `TABS` in commit `b886975` (they predate the app's modernization bar —
see README line 29). Bringing them back is nearly-free content: three more games for the
cost of polish passes. Do LAST — each game should be modernized with the project's
`/modernize-game` skill, and if PLAN-home-screen.md ran, a 20-card home grid is fine.

## Goal

All three games modernized to the current visual bar (reference: `MakingBoba.jsx`),
re-added to `TABS`, wired into analytics, and documented.

## Files to touch

- `src/components/WhackAMole.jsx` — the most work (has real bugs, see below).
- `src/components/MagicLoops.jsx` — small fixes + polish.
- `src/components/EnchantedGarden.jsx` — polish + completion tracking.
- `src/App.jsx` — re-add three `TABS` entries (+ lazy imports if code-splitting landed).
- `src/App.css` — modernized styles per game (prefixes `mole-`, `magic-`, `garden-`),
  keyframes named per-game, `prefers-reduced-motion` coverage.
- `README.md` — add three table rows, delete the "currently disabled" note (line 29).
- `CLAUDE.md` — remove/adjust any "disabled" mentions; add architecture bullets if the
  rework introduces documented-worthy patterns.

## Steps (in order — one game per commit)

### 1. Whack-a-Mole (fix, then modernize)

Bugs to fix regardless of visuals:
- **`alert()` on game over** (`WhackAMole.jsx:59`) — a blocking native dialog inside a
  `setScore` updater (a setState-for-side-effect hack). Replace with a proper done overlay
  (pattern: Bubble Pop's `.bub-overlay` glass panel with score + "Play again"), and fire
  `track('game_complete', { game: 'whack' })` there (import from `../utils/analytics`).
- Timers: `moleInterval`/`countdown`/`moleUpTimers` are cleaned on unmount (ok), but
  `startGame` guards on `active` — fine. Keep the ref-based timer pattern.
- `onClick` only — add pointer handling so fast taps register on touch
  (`onPointerDown` instead of `onClick`; do NOT keep both or desktop double-fires).
Then modernize (invoke `/modernize-game` for the recipe):
- Phases `menu → playing → done` with a menu offering 2–3 speeds (mirror Bubble Pop's
  `SPEEDS` idiom: interval + mole up-time per difficulty).
- Gradient-only SVG mole/hole art or polished emoji staging, bonk animation
  (`moleBonk` keyframe), score pop floaters, all keyframes `mole*` in App.css with
  reduced-motion coverage.
- If PLAN-player-progression.md landed, persist `bestScore` via
  `recordResult('whack', { bestScore })` — same seeding pattern as Bubble Pop.

### 2. Magic Loops (small fixes + polish)

- **Double-spawn on mobile:** the canvas has BOTH `onClick` and `onTouchStart`
  (`MagicLoops.jsx:172–173`). On touch devices, `touchstart` is followed by a synthetic
  `click`, and the `e.preventDefault()` inside the handler cannot reliably stop it (React
  attaches touch listeners passively). Replace both with a single `onPointerDown` and add
  `touch-action: none` on `.magic-canvas` in CSS. Remove the `e.touches` branch from
  `handlePointer` (pointer events always have `clientX/Y`).
- Canvas resize wipes drawings only on next paint — acceptable for an ephemeral toy;
  don't over-engineer.
- Polish: richer loop rendering (glow via layered strokes — NO canvas `shadowBlur` per the
  no-filters mobile-perf rule), a nicer magic-burst overlay, meter shimmer near full.
- No `game_complete` — this is an open-ended toy (README documents that open-ended toys
  rely on time-on-page; keep it that way).

### 3. Enchanted Garden

- It's a sequence game (soil → water → sun → water → sun → bloom) with 6 `FlowerBloom`
  SVGs already built. At the bloom/finish moment add
  `track('game_complete', { game: 'garden' })` and confetti if not present.
- Modernize pass: gradient-only realism on pot/soil/sky, watering-can and sun animations,
  stagger the seed-picker buttons, `garden*` keyframes + reduced-motion.
- Check mobile: seed picker must be a wrapping grid or an `overflow-x: auto` strip
  WITHOUT `max-width` (project convention — see CLAUDE.md styling notes).

### 4. Re-enable + docs

- `App.jsx`: add entries (choose distinct emoji for the mole — README used 🦔/🐹
  inconsistently; the component renders 🐹, pick one and use it everywhere):
  `{ id: 'whack', … } { id: 'magic', … } { id: 'garden', … }` — ids are new analytics
  dimensions; keep them short/stable.
- README: three new table rows; delete the disabled note.
- CLAUDE.md: the Magic Loops / Enchanted Garden bullets already exist under Architecture
  notes — extend them with whatever new invariants the modernization introduces (keyframe
  prefixes, phase names), and add a Whack-a-Mole bullet.

## Edge cases found while exploring

- WhackAMole's game-over `alert()` fires from inside a state updater via `setTimeout` —
  when replacing it, the final score must come from the same functional-update pattern or
  a ref; reading `score` directly in the countdown interval closure gives a stale 0.
  Cleanest: track score in a ref alongside state, or flip a `phase` state to `'done'` and
  render the overlay from current state (the render always has fresh score).
- Mole up-timers (`moleUpTimers.current`) must ALL be cleared when the round ends, not just
  on unmount — otherwise a mole pops up over the done overlay.
- Magic Loops' draw loop runs `requestAnimationFrame` forever even when the tab card is
  idle — fine while mounted (it's the active game), but confirm cleanup on unmount still
  cancels (it does today; don't break it).
- Reduced motion: the mole pop animation is gameplay (like `bubRise`) — keep movement,
  disable only decorations, and note it in the CSS comment (Bubble Pop sets the precedent).
- If code-splitting landed first, add these three as `lazy()` imports like the rest.

## Acceptance criteria

1. All three games appear in the app, playable start→finish on desktop and at 375px width.
2. Whack-a-Mole: no `alert()` anywhere; done overlay shows the correct final score
   (play a round, count hits); `game_complete` fires; no mole appears after time-up.
3. Magic Loops on a touch device (DevTools device emulation): ONE loop per tap, page does
   not scroll while tapping the canvas.
4. Enchanted Garden: completing the sequence blooms the flower + fires `game_complete`.
5. README table lists all games; the "currently disabled" note is gone; CLAUDE.md updated.
6. `npm run lint` (no new problems) + `npm run build` pass; every new keyframe is in the
   `prefers-reduced-motion` block (except gameplay-essential movement, commented as such).
