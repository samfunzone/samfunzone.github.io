# CLAUDE.md — Samritha's Fun Zone

## Project overview
A kids' React + Vite app running at `http://localhost:3000`.
Each game lives in `src/components/` as its own self-contained file.
Global styles are in `src/App.css`. Shared confetti utility is in `src/utils/confetti.js`.

## Dev server
```bash
npm run dev   # starts on port 3000 (set in vite.config.js)
```

## Adding a new game
1. Create `src/components/MyGame.jsx`
2. Add its CSS section to the bottom of `src/App.css`
3. Import and add an entry to the `TABS` array in `src/App.jsx`

## Architecture notes
- **Tabs**: `App.jsx` renders one tab at a time from the `TABS` array — no router needed.
- **Confetti**: import `launchConfetti(x, y, count)` from `src/utils/confetti.js`. The `confettiFall` keyframe is defined in `App.css`.
- **Three.js (Squishy Stuff)**: scene is created in a `useEffect` on phase change, cleaned up on unmount. Scale state is stored in a `ref` (not React state) so the render loop can read it without re-renders.
- **SVG dolls (Dressing Dolls)**: layer order matters — HairBack → Body → Clothing → HairFront → HeadSkin → FaceFeatures → Hat → Accessory. HeadSkin must render after HairFront so it covers the face center.
- **Making Boba pearls**: pearls use 5-per-row grid starting at cx=48 to stay inside the cup clipPath.

## Styling conventions
- Every game card uses `.card` + `.card-{color}` (red/blue/green/purple/orange).
- Shared button styles: `.btn .btn-{color}`.
- Game-specific styles are prefixed with the game name (e.g. `.boba-`, `.doll-`, `.food-`).

## Git
- Remote: `git@github.com:arun4by4/sam-fun-zone.git`
- Branch: `main`
