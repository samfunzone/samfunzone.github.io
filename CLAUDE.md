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
- **SVG dolls (Dressing Dolls)**: layer order matters — SceneBackground → HairBack → Body → Shoes → Clothing → HairFront → HeadSkin → FaceFeatures → Hat → Accessory. Key rules:
  - HeadSkin renders after HairFront so it covers the face center.
  - Shoes render **before** Clothing so skirts/bottoms cover boot tops naturally.
  - Hats are shifted ~8px lower than head-top (band sits at y≈37–55) so they look seated on the hair.
  - Tops/bottoms must fully cover the body rect (torso x=58–142). Jeans and shorts use a center panel rect to close the gap between the two leg rects.
  - Face customization: `eyeStyle` (normal/wide/happy/sleepy/winking), `browStyle` (normal/raised/furrowed/arched), `mouthStyle` (smile/grin/surprised/pouty) are stored in `outfit` state alongside clothing fields.
  - Scene backgrounds (`SceneBackground` component): 6 options (none/beach/park/school/party/meadow) stored in separate `scene` state.
  - Presets (`PRESETS` array): each entry has `id`, `label`, `scene`, and a partial `outfit` object merged over current state (skin tone preserved). Beach and Party presets auto-switch scene.
  - Randomize: `randomFrom(arr)` helper; hat/accessory weighted 2× toward `'none'` to avoid clutter.
- **Making Boba pearls**: pearls drop 5 at a time (max 35). Before shake they use a 5-per-row grid (cx=48, step=16). On shake, positions come from a dense slot pool — all valid 16px-spaced slots inside the tapered cup are pre-generated, shuffled, and the first N taken. Cup taper: top x=22–138 at y=40, bottom x=40–120 at y=282 (`t=(y-40)/242`, `lx=22+18t`, `rx=138-18t`). Always clamp slice with `Math.min(pearls.length, allSlots.length)` and null-guard each position.
- **Joke Machine**: jokes are served from a shuffled deck (`useRef`). When the deck empties it reshuffles, avoiding the last-shown joke at position 0.
- **Family Feud**: survey-style guessing game. `QUESTIONS` array (~75 entries) each has a `question` string and `answers` array of `{ text, points, aliases[] }`. `norm()` lowercases and strips punctuation before comparing guesses to aliases. Game picks `TOTAL_ROUNDS` (5) questions at random per game via a shuffled index array in a `useRef`. Phases: `'playing'` → `'round-end'` → `'game-end'`. Three strikes end the round early; "Reveal Answers" button also ends the round. Revealed slots show rank badge (`#1`, `#2`, …) + answer text + points pill. Board shakes on a wrong answer (`feudShake` keyframe). All questions are family-friendly — questions with alcohol, adult relationships, workplace, or other adult-only content are excluded.
- **Enchanted Garden**: seed picker shows 6 flower types (Sunflower, Rose, Tulip, Daisy, Lavender, Cherry Blossom). Each has its own `FlowerBloom` SVG component. `PlantSVG` uses per-seed `stemColor`/`leafColor`/`budColor`/`budTip`.
- **Magic Loops**: canvas-based loop drawing with 4 color palettes (Rainbow, Sparkle, Ocean, Fire) and a magic meter; filling the meter triggers confetti.
- **My Room**: drag-and-drop SVG room decorator — choose wall color, floor style, then drag furniture and decor items onto the canvas.
- **Yummy Food SVGs**: all 5 foods (Pizza, Burger, IceCream, Cake, Taco) use ingredient toggle via `added` Set passed as prop.
  - **IceCream**: dynamic `viewBox` grows upward as scoops stack (`minY = Math.min(topY - R - 35, 0)`, `vh = 290 - minY`). Waffle cone lines wrapped in `<g clipPath="url(#iceConeClip)">` so lines never extend outside the cone triangle.
  - **Burger**: layers stacked with imperative `curY` counter (`let curY = 234; const nextY = h => { curY -= h; return curY; }`). Each ingredient height subtracted in render order; top bun uses final `curY`.
  - **Cake**: 3 tiers computed via `lty = i => 258 - (i+1) * LAYER_H` (LAYER_H=44). Each layer: rect + highlight stripe + frosting ellipse cap + drip paths.
  - **Taco**: arch shell `M22,164 Q110,40 198,164 Z` with 3 depth layers for thickness. All fillings in `<g clipPath="url(#tacoClip)">`. Cheese and sour cream are wavy closed-ribbon SVG paths using alternating `q` bezier curves for top and bottom edges.

## Styling conventions
- Every game card uses `.card` + `.card-{color}` (red/blue/green/purple/orange).
- Shared button styles: `.btn .btn-{color}`.
- Game-specific styles are prefixed with the game name (e.g. `.boba-`, `.doll-`, `.food-`).
- Mobile breakpoint at `max-width: 600px` at the bottom of `App.css` — reduces card/tab padding, stacks `.room-palette` full-width, narrows grids. SVGs in food/boba/doll components carry `style={{ maxWidth: '100%', height: 'auto' }}` so they scale on small screens.
- Horizontal scrolling strips (e.g. `.doll-scene-strip`) must NOT have a `max-width` — use `overflow-x: auto` alone so buttons are never clipped on narrow screens.

## Deployment
- GitHub Pages via `.github/workflows/deploy.yml` — triggers on push to `main`
- Live URL: `https://samfunzone.github.io`
- No `base` in `vite.config.js` needed (repo is `*.github.io`, served from root)

## Git
- Remote: `git@github.com:samfunzone/samfunzone.github.io.git`
- Branch: `main`
