# PLAN: Home screen — replace the 17-button tab wall

**Rank: #4.** The first thing a kid sees is a wall of 17 wrapping tab buttons that grows
with every new game and is worst on phones. Replace it with a picture-menu home grid
(big emoji cards), a `← All Games` back button inside a game, and hash-based navigation so
the browser/Android back button returns home instead of leaving the site.

## Goal

- Landing view = home grid of large tappable game cards (emoji + name), no game auto-opened.
- Tapping a card opens that game full-width with a persistent `← All Games` control.
- URL hash tracks the open game (`#boba`); back button / refresh / shared links work.
- Analytics keeps working unchanged (per-game virtual pageviews).

## Files to touch

- `src/App.jsx` — the whole change lives here (nav state, hash sync, home grid render).
- `src/App.css` — `.home-grid`, `.home-card`, `.back-btn` styles + mobile breakpoint rules.
- `README.md` — one-line note in the intro (optional).
- `CLAUDE.md` — update "Tabs" architecture note + "Adding a new game" step 3.

## Steps (in order)

### 1. Extend `TABS` entries with display fields

Labels currently embed the emoji (`'🧋 Making Boba'`). Add split fields so the card can
render a big emoji above the name; keep `label` for analytics continuity:

```jsx
{ id: 'boba', emoji: '🧋', name: 'Making Boba', label: '🧋 Making Boba', Component: MakingBoba },
```

(The code-split plan already ran: entries hold lazy component types in `Component`.)
**Do not change any `id`** — they are Umami dimensions and become the hash values.

### 2. Navigation state driven by the URL hash

Replace `useState('memory')` with hash-synced state:

```jsx
const gameFromHash = () => {
  const id = window.location.hash.slice(1);
  return TABS.some(t => t.id === id) ? id : null;   // null = home
};
const [activeTab, setActiveTab] = useState(gameFromHash);

useEffect(() => {
  const onHash = () => setActiveTab(gameFromHash());
  window.addEventListener('hashchange', onHash);
  return () => window.removeEventListener('hashchange', onHash);
}, []);

const openGame = id => { window.location.hash = id; };            // pushes history entry
const goHome   = () => { history.pushState('', '', window.location.pathname + window.location.search); setActiveTab(null); };
```

Notes for the implementer:
- Navigation should go THROUGH the hash (set hash → `hashchange` → state), not set state
  directly, so back/forward always stay in sync. `goHome` clears the hash without leaving
  a dangling `#` (plain `location.hash = ''` leaves `#` and scrolls) — the
  `pushState` + explicit `setActiveTab(null)` pair above handles it (pushState fires no
  hashchange event).
- Invalid hash (`#nope`) must resolve to home, not crash — `gameFromHash` handles it.

### 3. Analytics

Keep the existing `useEffect` on `activeTab`, but only fire for real games, and give home
its own view:

```jsx
useEffect(() => {
  if (activeTab) trackGameView(activeTab, current?.label);
  else trackGameView('home', '🏠 Home');
}, [activeTab, current?.label]);
```

(`trackGameView` builds `/game/<id>` paths — `/game/home` is fine and makes time-on-home
visible. Check `src/utils/analytics.js` for the exact signature before assuming.)

### 4. Render

- `activeTab === null` → render `<nav className="home-grid">` of `.home-card` buttons
  (emoji large ~2.5rem, name below, min touch target 88px, `aria-label={t.name}`).
  Reuse the existing card color cycle for variety: assign `card-{color}` classes cycling
  through red/blue/green/purple/orange by index, or a per-tab `color` field.
- `activeTab` set → render a slim top bar (`← All Games` button + current game name) above
  `<div className="container">` with the game, replacing the old `.tabs` nav entirely.
- Delete the old `.tabs`/`.tab-btn` render block from App.jsx. **Keep** the `.tab-btn` CSS
  in App.css only if something else uses it (grep first — CLAUDE.md says it's the nav's
  own style, so after this change it can be removed along with the navy inactive/hover
  rules; update CLAUDE.md's "Styling conventions" navy-theme bullet accordingly).

### 5. CSS (`App.css`, bottom, before the mobile block)

- `.home-grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px;`
- `.home-card`: glassy translucent white on the navy background (match `.tab-btn`'s current
  translucent blue-white look), rounded 16px, hover lift, `:active` scale-down for touch feel.
- `.back-btn`: styled like an active tab (royal blue).
- Mobile (`max-width: 600px` block): grid `minmax(120px, 1fr)`, slightly smaller emoji.
- Entrance: stagger cards with an existing keyframe pattern (`animationDelay: i * 30ms`,
  `animation-fill-mode: backwards`) and cover it in the `prefers-reduced-motion` block.

## Edge cases found while exploring

- `current` can now be `undefined` (home) — every `current?.` usage already optional-chains,
  keep it that way.
- The initial state MUST be `null` (home), not `'memory'` — but a deep link like
  `…/#tamil` on first load must open Tamil directly (lazy `useState(gameFromHash)` covers
  both).
- Switching games unmounts the previous game (state resets) — that's today's behavior too;
  don't try to keep games alive in the background (Three.js + intervals would leak).
- GitHub Pages + hash routing needs **no** 404.html tricks (hash never reaches the server).
- After this change, the README table's "Tab" column and CLAUDE.md's "Tabs" note are stale
  wording — adjust ("tab" → "game card") or leave README table header as "Game".
- Kids double-tap: `openGame` when already on that game is a no-op hash-set — harmless,
  but guard the home-card handler anyway (`if (activeTab !== id)`).

## Acceptance criteria

1. Load `http://localhost:3000` → home grid, no game mounted (React DevTools: no game
   component in tree).
2. Tap a card → game opens, URL shows `#<id>`; browser Back → home grid; Forward → game again.
3. Refresh while on `#boba` → Making Boba opens directly. Manually type `#garbage` → home.
4. `← All Games` returns home and the URL has no `#fragment`.
5. All 17 games reachable; on a 375px-wide viewport (DevTools) the grid is 2–3 columns
   with no horizontal scroll.
6. `trackGameView` fires per game open (and `/game/home` on returning home).
7. `npm run lint` (no new problems) + `npm run build` pass; reduced-motion block covers any
   new animation.
