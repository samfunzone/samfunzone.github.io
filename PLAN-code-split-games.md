# PLAN: Code-split the games (lazy-load per tab)

**Rank: #1 — do this first.** Smallest effort, benefits every visitor on every visit.

## Goal

`npm run build` currently emits a **single 1,022 kB JS bundle (277 kB gzip)**. Three.js
(used only by Squishy Stuff) ships to every visitor, on a kids' app that is mostly opened
on phones/tablets. Convert every game to `React.lazy` so the initial bundle contains only
the app shell, and each game (especially Three.js) downloads on first open.

## Files to touch

- `src/App.jsx` — the only file with game imports (all 17 static imports + the `TABS` array).
- `src/main.jsx` — add a chunk-load-failure recovery listener.
- `src/App.css` — one small loader style (optional, ~10 lines).

## Steps (in order)

### 1. Convert imports in `src/App.jsx`

Replace the 17 static component imports (lines 4–20) with lazy ones:

```jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { trackGameView } from './utils/analytics';

const MemoryMatch     = lazy(() => import('./components/MemoryMatch'));
const JokeMachine     = lazy(() => import('./components/JokeMachine'));
// ...same pattern for all 17 components currently imported...
```

### 2. Change `TABS` to hold component types, not elements

The array currently stores **rendered elements** (`component: <MemoryMatch />`). A lazy
component must be rendered inside `<Suspense>`, and storing the element is fine too — but
store the **type** so the render site is explicit:

```jsx
const TABS = [
  { id: 'memory', label: '🧠 Memory Match', Component: MemoryMatch },
  // ...all 17, ids and labels EXACTLY as they are today (analytics keys off id)...
];
```

### 3. Render with Suspense

In the JSX, replace `{current?.component}` with:

```jsx
<div className="container">
  <Suspense fallback={<div className="game-loading">🎲 Loading…</div>}>
    {current && <current.Component />}
  </Suspense>
</div>
```

Add a `.game-loading` style in `App.css` (big centered emoji + text, white, padded —
match existing card typography). Keep it dead simple; chunks are small so it flashes briefly.

### 4. Handle stale chunks after a redeploy — `src/main.jsx`

GitHub Pages redeploys change the hashed chunk filenames. A kid with the site open from
yesterday who taps a not-yet-loaded game will hit a 404 on the old chunk URL. Vite fires a
`vite:preloadError` event for this; reload to pick up the new build:

```js
window.addEventListener('vite:preloadError', () => window.location.reload());
```

Put it in `src/main.jsx` before `createRoot`. **A weaker model will skip this and the app
will appear randomly broken for returning visitors after each deploy.**

### 5. Verify

- `npm run build` — output must now show many small chunks. The entry chunk should drop
  to roughly ~250 kB raw (React + shell); Three.js (~600 kB raw) must land in the
  SquishyStuff chunk. There should be **no** 500 kB chunk-size warning, or only for the
  Squishy chunk.
- `npm run preview`, open DevTools ▸ Network:
  - Initial load must NOT fetch a chunk containing three.js.
  - Clicking 🫧 Squishy Stuff fetches its chunk; the 3D scene works.
  - Click through **all 17 tabs** — each renders with no console errors.
- `npm run lint` — no NEW problems (one pre-existing error in `TamilLetters.jsx:520` is
  known; see PLAN-tamil-sound-and-lint.md).

## Edge cases found while exploring

- **This project uses rolldown-vite (vite v8)** — do NOT add `build.rollupOptions.manualChunks`
  to `vite.config.js`; the option namespace differs (`rolldownOptions`) and manual chunking
  is unnecessary: `React.lazy` dynamic imports split automatically, and three.js ends up in
  Squishy's chunk because it's the only importer.
- **`TABS` is module-scope**, so lazy components must also be created at module scope
  (never call `lazy()` inside the `App` component — it would re-create components each render
  and remount the game every keystroke).
- The `useEffect` at `src/App.jsx:50` reads `current?.label` for `trackGameView` — keep it
  untouched; it doesn't depend on how the component renders.
- All components use `export default` (verified) — `lazy(() => import(...))` works without
  `.then(m => ({default: ...}))` shims.
- Tab ids (`memory`, `boba`, `tamil`, …) are analytics dimensions in Umami — **do not rename**.

## Acceptance criteria

1. `npm run build` succeeds; entry JS chunk ≤ 350 kB raw; three.js is not in the entry chunk
   (verify: `Select-String -Path dist/assets/index-*.js -Pattern 'THREE.WebGLRenderer' -Quiet`
   returns False).
2. All 17 games open and play in `npm run preview` with zero console errors.
3. Umami virtual pageviews still fire on tab switch (check the Network tab for the Umami
   `/api/send` request when switching games — it no-ops without the script, so verify on the
   deployed site or just confirm `trackGameView` is still called).
4. `vite:preloadError` listener present in `src/main.jsx`.
5. `npm run lint` shows no new problems.
