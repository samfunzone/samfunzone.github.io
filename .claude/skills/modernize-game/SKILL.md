---
name: modernize-game
description: Visually modernize a game in this app — photorealistic SVG via gradients, animations everywhere, polished UI chrome. Use when asked to modernize, overhaul, polish, or make realistic/visually appealing any game in src/components/. Gold-standard example is MakingBoba.jsx.
---

# Modernize a Game (Photorealistic SVG + Animations)

Turn a flat, solid-color game into a layered, realistic, animated one — **without
new npm dependencies, image assets, or SVG filters**. Everything is SVG gradients
+ CSS keyframes. The completed reference implementation is
`src/components/MakingBoba.jsx` + the `/* ── Making Boba ── */` section of
`src/App.css` — read both before starting and copy their patterns.

## Hard constraints

- **No new deps, no bitmap assets.** Realism comes from layered SVG gradients.
- **No SVG filters** (`feGaussianBlur`, `feTurbulence`, …) — too costly on mobile.
  Shadows, gloss, and translucency are all gradients + opacity.
- **Keep the game's logic, options, and flow intact.** This is a visual/animation
  overhaul; never change documented game math (see the game's CLAUDE.md notes).
- All work stays in the game's component file + its CSS section in `App.css`.

## Step 0 — Fix latent bugs that block animations

Mount-once CSS animations require **stable React keys**. Before adding any,
audit the component for:
- Keys overwritten by spreads (`{ id: x, ...obj }` where `obj` has an `id`).
- Index-as-key on lists whose items are appended (fine) vs reordered (not fine).
- CSS vars referenced in keyframes but never set (e.g. keyframe uses
  `var(--sc,1)` but the JSX sets inline `transform` instead of `--sc` —
  inline `transform` is *overridden* by any running animation).

## Step 1 — Color helpers

SVG `<stop>` elements need literal color values, so derive shades in JS.
Helpers (`hexToRgb`, `mix`, `lighten`, `darken`) live at the top of
`MakingBoba.jsx`. **When a second game needs them, extract to
`src/utils/color.js` and import in both.** CSS buttons can keep using
`color-mix(in srgb, var(--c) N%, white)` instead.

## Step 2 — SVG defs

- Prefix every gradient/clipPath id with the game name (`boba-`, `food-`, …) —
  SVG ids are global to the page.
- Static gradients (glass sheen, ice, shadow, per-item glossy radials) are
  plain JSX in `<defs>`; per-item ones come from `ITEMS.map(...)`.
- Dynamic gradients (tinted by a user choice) just recompute stop colors from
  state on render — React updates the stops, no effects needed. Give state-less
  renders a fallback color (`thing?.color ?? '#…'`) so the defs always exist.

## Step 3 — Realism recipe (layer order matters)

1. **Ground shadow**: radial black→transparent ellipse under the object.
2. **Body fills**: vertical 3-stop gradient `lighten(c,.18) → c → darken(c,.22)`.
3. **Glossy spheres** (pearls, drops, swatches): radial gradient with highlight
   at `cx 35% / cy 30%` — `lighten(c,.55) → c → darken(c,.35)` — plus one small
   white specular ellipse offset up-left. Translucent items use `stopOpacity`.
4. **Glass/plastic walls**: horizontal white-sheen gradient (alternating
   .3/.05 opacity stops) painted over the contents, plus 1–2 vertical
   highlight-streak paths stroked with a white-fade gradient.
5. **Ice/crystal**: diagonal translucent blue-white gradient + white facet
   polylines + small deterministic rotation (`((i*47)%21)-10` — never
   `Math.random()` in render).
6. **Detail garnish**: condensation droplets, drizzle stripes, surface ellipse,
   wavy edges via alternating `q` beziers.
7. **Organic piles & stuffed shapes** (taco fillings, lettuce, crumbles): a thick
   stroked path along a bezier (`strokeLinecap="round"`) gives a band that follows
   a curve; add bump circles placed by a quadratic-point helper
   (`t => [(1-t)²x₀ + 2t(1-t)xc + t²x₁, …]`) for ruffled/crumbly silhouettes.
   For "contents spilling out of a container", prefer **two-layer occlusion**
   (back shell → fillings → front shell drawn last) over clipPaths — fillings
   just need their bottoms inside the front layer's band.
8. **Texture sells realism**: seeds, char marks, flecks, crumb holes, browned
   spots, concentric rings — a handful of small deterministic shapes per
   ingredient beats one perfect gradient. Per-item texture that must stay inside
   a shape (scoop specks) gets its own inline `clipPath` keyed by item id.

## Step 4 — Animation patterns (all CSS keyframes, no timers, no SMIL)

| Pattern | How |
|---|---|
| Entrance (drop/plop/pop) | mount-once keyframe + `animation-fill-mode: backwards` + stagger via inline `animationDelay: (i%batch)*70ms`; needs stable keys |
| Replay on selection | put `key={selection.id}` on the group — remount restarts the animation |
| Ambient loop (bubbles, sparkles, float, drip) | `infinite` keyframe; vary `animationDuration`/`Delay` inline per element |
| State-toggled (shake, slosh, tumble) | conditional class from React state; animate the **group**, not N children |
| Live feedback (slider tint) | state → attribute/opacity + CSS `transition` |
| Panel/step transitions | keyed panels remount → entrance keyframe on the panel class |

Critical rules:
- Any class that **rotates/scales** an SVG child needs
  `transform-box: fill-box; transform-origin: center;` or it orbits the canvas origin.
- A CSS animation **overrides the SVG `transform` attribute** — if an element
  needs both, nest two `<g>`s (outer = CSS animation, inner = attribute transform).
- Elements that end invisible (`forwards` to opacity 0) need base `opacity: 0`
  so reduced-motion (`animation: none`) doesn't leave them stuck visible.
- Animate **inside** clip groups; never animate the clipPath itself.
- Name all keyframes `<game>Something` (`bobaPour`) to avoid collisions.
- End with a `@media (prefers-reduced-motion: reduce)` block listing every
  animated class with `animation: none !important`.

## Step 5 — UI chrome

- Buttons: `linear-gradient(180deg, …)` glassy background, hover
  `translateY(-2px)` + colored shadow, `.selected` gradient with
  `inset 0 1px 0 rgba(255,255,255,.4)` top highlight.
- Swatches: inline `radial-gradient(circle at 35% 30%, lighten, c 60%, darken)`.
- Progress: gradient fill bar with `width` transition
  (`calc((100% - 20px) * step/max)`), ✓ glyphs in completed dots, pulse ring
  (animated box-shadow) on the active dot.
- Win screen: glassy card, floating emoji loop inside a
  `position: relative; overflow: hidden` panel (no horizontal overflow on mobile).
- Keep project conventions: game-prefixed classes, `.btn .btn-{color}`,
  SVG `style={{ maxWidth: '100%', height: 'auto' }}`, no `max-width` on
  horizontal strips.

## Step 6 — Verify (run it, don't just build it)

1. `npm run lint` and `npm run build` — clean (ignore pre-existing errors in
   other components; note them).
2. `npm run dev` (background), then drive Chrome headless with Playwright from a
   **temp dir** (`npm i playwright` in `$env:TEMP\<name>`, `channel: 'chrome'`,
   so the repo stays clean). Walk every step/option of the game, screenshot each
   phase, and check:
   - zero console errors/warnings (especially React key warnings),
   - extreme paths (0 items, max items, reset-and-replay),
   - 375px viewport: no horizontal scrollbar,
   - buttons with infinite pulse animations need `.click({ force: true })`.
3. Read the screenshots — gradients/animations must be *visibly* there.

## Step 7 — Document

Add/refresh the game's bullet in CLAUDE.md: id prefixes, dynamic-gradient
approach, which elements render conditionally, the `--sc`-style CSS-var
contracts, and any keys/animation invariants the next editor must not break.
