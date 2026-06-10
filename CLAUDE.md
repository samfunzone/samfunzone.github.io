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

## Modernizing a game's visuals
Use the project skill `.claude/skills/modernize-game/SKILL.md` (invoke with `/modernize-game`).
It covers the gradient-based photorealism recipe, CSS animation patterns, pitfalls
(stable keys, `transform-box`, reduced motion), and the Playwright verification flow.
Reference implementation: `src/components/MakingBoba.jsx`.

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
- **Making Boba visuals**: realistic look built from SVG gradients only — no SVG filters (mobile perf). All defs ids prefixed `boba-`; tea-tinted gradients (`boba-tea-grad`/`boba-foam-grad`/`boba-straw-grad`) recompute stops from `tea.color` via the `mix`/`lighten`/`darken` helpers in `src/utils/color.js` (shared with Yummy Food). Pearls carry a `top` field (topping id) that selects their `boba-pearl-{id}` gradient — never spread `activeTop` after `id` (duplicate-key bug). The dome lid + straw render **only when `done`**; cup is open while building. Cup size uses the `--sc` CSS var on `.boba-cup-wrap` (shake/float keyframes reference `var(--sc,1)`) — don't set inline `transform`. Animations are `boba*` CSS keyframes in App.css: mount-once entrances (pearl/ice drop, lid pop, straw insert) rely on stable keys + `animation-fill-mode: backwards`; the pour stream replays via `key={tea.id}` remount; animated SVG children need `transform-box: fill-box`. A `prefers-reduced-motion` block disables them all.
- **Number Detective**: guess-the-number game. `LEVELS` array has 4 entries (max: 100/1000/10000/100000) each with a `rank`, `emoji`, `color`, and `optimal` (binary-search ceiling). `PALETTE` maps color names to `{bg, border, accent, badge}`. `proximity(guess, secret, max)` returns a hot/cold label+emoji+color based on distance as a fraction of max (thresholds: 2%/8%/20%/40%/60%). Range bar shows a **positioned segment** (`left: segLeft%`, `width: segWidth%`) representing the remaining `lo`–`hi` window on the full number line — not a fill from the left. **Hard Mode**: toggle on level-select screen; during play hides the `lo`/`hi` number labels on the bar, always shows the latest clue row, and hides all previous clues behind a `💡 See N previous clues` peek button that auto-collapses on the next guess. Win screen shows a `🕶️ Hard Mode cleared!` badge when solved without giving up.
- **Bubble Pop**: timed arcade popper (45s, `GAME_SECONDS`). Bubbles spawn on a `setInterval` (rate from the chosen `SPEEDS` entry, capped at `MAX_BUBBLES`) and rise via the `bubRise` CSS keyframe — travel distance is the `--riseH` var on `.bub-arena` (640px desktop / 560px mobile; must exceed arena height + bubble size + spawn offset). The **outer** `.bub-float` div owns the rise transform and the **inner** `.bub-sway` div owns the side sway — never merge them (one running animation overrides the other transform). Bubbles are centered on their `x`% via negative `marginLeft`, not `translateX` (the rise animation owns `transform`). `onAnimationEnd` checks `e.animationName === 'bubRise'` before counting an escape. Pop position is read with `getBoundingClientRect()` at pointerdown (live mid-animation position); bursts/floaters render as absolutely-positioned arena children removed by timeout. Bubble types from `makeBubble` weights: normal (+10, or +15 when `size < 58`), star (+40 + confetti), rainbow (clears every on-screen bubble via `querySelectorAll('.bub-float')` + `data-id`), grumpy (−15, combo reset, `bub-shake` on the arena). Combo lives in `comboRef` (1.5s window): ×2 at 4 chain, ×3 at 8; the badge re-pops via `key={combo}`. SVG gradients (`bub-` prefix) render once in a hidden `<svg>` (ids are page-global); soap-bubble look = low-opacity tinted radial body + iridescent arc stroke + white specular ellipses. Menu/done screens are `.bub-overlay` glass panels **inside** the arena. Burst ring/droplets/floaters end invisible, so they carry base `opacity: 0` (reduced-motion safety). All keyframes are `bub*` in App.css; the reduced-motion block intentionally keeps `bubRise` running (the game needs movement) and disables only decorations.
- **Joke Machine**: jokes are served from a shuffled deck (`useRef`). When the deck empties it reshuffles, avoiding the last-shown joke at position 0.
- **Family Feud**: survey-style guessing game. `QUESTIONS` array (~75 entries) each has a `question` string and `answers` array of `{ text, points, aliases[] }`. `norm()` lowercases and strips punctuation before comparing guesses to aliases. Game picks `TOTAL_ROUNDS` (5) questions at random per game via a shuffled index array in a `useRef`. Phases: `'playing'` → `'round-end'` → `'game-end'`. Three strikes end the round early; "Reveal Answers" button also ends the round. Revealed slots show rank badge (`#1`, `#2`, …) + answer text + points pill. Board shakes on a wrong answer (`feudShake` keyframe). All questions are family-friendly — questions with alcohol, adult relationships, workplace, or other adult-only content are excluded.
- **Enchanted Garden**: seed picker shows 6 flower types (Sunflower, Rose, Tulip, Daisy, Lavender, Cherry Blossom). Each has its own `FlowerBloom` SVG component. `PlantSVG` uses per-seed `stemColor`/`leafColor`/`budColor`/`budTip`.
- **Magic Loops**: canvas-based loop drawing with 4 color palettes (Rainbow, Sparkle, Ocean, Fire) and a magic meter; filling the meter triggers confetti.
- **My Room**: drag-and-drop SVG room decorator — choose wall color, floor style, then drag furniture and decor items onto the canvas.
- **Yummy Food SVGs**: all 7 foods (Pizza, Burger, Sandwich, Fries, IceCream, Cake, Taco) use ingredient toggle via `added` Set passed as prop. Each Viz also takes a `done` prop (set on the done screen) that turns on `Sparkles` (all foods) and `Steam` (hot foods: pizza, burger, taco, fries).
  - **Visuals**: gradient-only realism, no SVG filters or CSS `drop-shadow` (mobile perf). All defs ids prefixed `food-`. Shared defs helpers at the top of the file: `VGrad` (vertical 3-stop body fill), `Glossy` (radial highlight at 35%/30%), `Shadow` (`food-shadow` ground ellipse), plus `Sparkles`/`Steam` decoration components. Color helpers imported from `src/utils/color.js`.
  - **Animations**: every ingredient renders inside `<g className="food-ing">` — mount-once drop-in keyframe (`foodIngDrop`) with `animation-fill-mode: backwards`, staggered via inline `animationDelay`. These groups must NOT carry a `transform` attribute (a running CSS animation overrides it) — nest an inner `<g>` for attribute transforms (see fries rotation, sparkle translate). All keyframes are `food*` in App.css (`foodIngDrop`, `foodPanelIn`, `foodSteamRise`, `foodFlameFlicker`, `foodSparkle`, `foodServePulse`, `foodFloatUp`, `foodCheckPop`, `foodEmojiBounce`); a `prefers-reduced-motion` block disables them all. Build/pick/done panels remount with `.food-panel-in` (`key={food.id}` on `.food-layout`).
  - **IceCream**: dynamic `viewBox` grows upward as scoops stack (`minY = Math.min(topY - R - 35, 0)`, `vh = 290 - minY`). Waffle cone lines wrapped in `<g clipPath="url(#food-cone-clip)">` so lines never extend outside the cone triangle. Scoops keyed by flavor id with `transition: cy` so they glide when a lower scoop toggles.
  - **Burger**: layers stacked with imperative `curY` counter (`let curY = 234; const nextY = h => { curY -= h; return curY; }`). Each ingredient height subtracted in render order; top bun uses final `curY`.
  - **Sandwich**: same `curY` stack pattern as Burger (starts at 232: bread 20 → ham 16 → cheese 10 → lettuce 14 → tomato 12 → cucumber 10 → mayo 8 → domed top slice). Both slices render from the single `bread` ingredient; mayo is a wavy closed ribbon like taco sour cream.
  - **Fries**: deterministic fry fan — `x: 60+i*9`, `top: 34+((i*23)%20)`, `rot: ((i*37)%15)-7` — never `Math.random()` in render. Render order: carton back panel → fries → salt/cheese/herbs → carton front panel, so fry bottoms stay hidden inside the box (no clip needed). Fry toppings render only when `fries` is also added; ketchup is a separate dip cup at the right.
  - **Cake**: 3 tiers computed via `lty = i => 258 - (i+1) * LAYER_H` (LAYER_H=44). Each layer: gradient rect + highlight stripe + frosting ellipse cap + drip paths. Candle flames are wrapped in `g.food-flame` (flicker keyframe; needs `transform-box: fill-box; transform-origin: 50% 100%`).
  - **Taco**: arch shell `M22,164 Q110,40 198,164 Z` with 3 depth layers for thickness. All fillings in `<g clipPath="url(#food-taco-clip)">` (animated `food-ing` groups live inside the clip group, never on the clipPath). Cheese and sour cream are wavy closed-ribbon SVG paths using alternating `q` bezier curves for top and bottom edges.

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
