# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Samritha's Fun Zone

## Project overview
A kids' React + Vite app running at `http://localhost:3000`.
Each game lives in `src/components/` as its own self-contained file.
Global styles are in `src/App.css`. Shared confetti utility is in `src/utils/confetti.js`.

## Commands
```bash
npm run dev      # dev server on port 3000 (set in vite.config.js)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint (flat config, eslint.config.js)
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
- **Making Boba pearls**: pearls drop 5 at a time (max 35). Before shake they use a 5-per-row grid (cx=48, step=16). On shake, positions come from a dense slot pool — all valid 16px-spaced slots inside the tapered cup are pre-generated, shuffled, and the first N taken. Cup taper: top x=22–138 at y=40, bottom x=40–120 at y=282 (`t=(y-40)/242`, `lx=22+18t`, `rx=138-18t`). Always clamp slice with `Math.min(pearls.length, allSlots.length)` and null-guard each position.
- **Joke Machine**: jokes are served from a shuffled deck (`useRef`). When the deck empties it reshuffles, avoiding the last-shown joke at position 0.
- **Enchanted Garden**: seed picker shows 6 flower types (Sunflower, Rose, Tulip, Daisy, Lavender, Cherry Blossom). Each has its own `FlowerBloom` SVG component. `PlantSVG` uses per-seed `stemColor`/`leafColor`/`budColor`/`budTip`.
- **Magic Loops**: canvas-based loop drawing with 4 color palettes (Rainbow, Sparkle, Ocean, Fire) and a magic meter; filling the meter triggers confetti.
- **My Room**: drag-and-drop SVG room decorator — choose wall color, floor style, then drag furniture and decor items onto the canvas.

## Styling conventions
- Every game card uses `.card` + `.card-{color}` (red/blue/green/purple/orange).
- Shared button styles: `.btn .btn-{color}`.
- Game-specific styles are prefixed with the game name (e.g. `.boba-`, `.doll-`, `.food-`).

## Git
- Remote: `git@github.com:arun4by4/sam-fun-zone.git`
- Branch: `main`
