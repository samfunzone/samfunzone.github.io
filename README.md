# Samritha's Fun Zone 🎉

A colorful, interactive React app built for kids — packed with games, creative activities, and fun!

**Live site:** https://samfunzone.github.io

## Games & Activities

| Tab | What it does |
|-----|-------------|
| 🧠 Memory Match | Flip cards to find matching emoji pairs — choose 8, 10, or 12 pairs; optional hard mode shuffles the board every 2 matches |
| 😂 Joke Machine | Two-step kid-friendly joke reveal |
| 🎨 Drawing | Freehand canvas with colors, brush size, undo, and save |
| 🫧 Squishy Stuff | Pick an emoji to squish, or draw your own shape and extrude it into 3D (Three.js), then stretch, squeeze & squish it |
| 🧋 Making Boba | Step-by-step boba tea builder with a realistic, fully animated SVG cup — 8 teas pour in with a splash, glossy pearls bounce in, ice cubes plop, bubbles rise, condensation drips, sweetness live-tints the drink, then shake it to mix and finish with a dome lid, straw, and sparkles |
| 🍽️ Yummy Food | Build 7 dishes — pizza, burger, sandwich, fries, ice cream, birthday cake, taco — from photorealistic animated SVG ingredients: toppings drop in, cheese melts and drips, candles flicker, scoops glide, then cook it and watch your dish get served with steam, sparkles, and a happy bounce |
| 🪆 Dressing Dolls | Dress up an SVG doll — skin tone, 8 hair styles, tops, bottoms, dresses, shoes, hats & accessories; face expressions (eyes, brows, mouth); 6 scene backgrounds; one-click Randomize and themed quick-look presets (Princess, Beach, Sports, Artist, Party) |
| 🏠 My Room | Drag furniture and decor onto a room canvas; customize wall color, floor style, and layout |
| 📺 Family Feud | Survey-style guessing game — read the question, type your answer, and try to uncover all the top responses before 3 strikes. 5 random rounds drawn from a 75-question family-friendly pool; includes a Reveal Answers button |
| 🧩 Riddle Machine | 50 lateral-thinking riddles with hints; shuffled deck so they never repeat |
| 🔍 Number Detective | Guess a secret number (1–100 up to 1–100,000) using higher/lower clues and a hot/cold thermometer. Range bar shows the remaining candidates as a segment on the full number line. **Hard Mode** hides previous clues and the range boundary numbers — only the latest result is shown; tap 💡 to peek at history |
| 🐠 Bubble Pop | 45-second underwater arcade popper — pop rising soap bubbles for points, chain combos for ×2/×3 multipliers, catch star and rainbow bubbles, dodge the grumpy ones; three speed settings |
| 🔍 Word Search | Find hidden words in a letter grid — 4 themes × 3 sizes (easy 8×8 across/down, medium 10×10 +diagonals, hard 12×12 all 8 directions incl. backwards). Drag to select; hints and star ratings |
| 🔤 Unscramble | Rearrange scrambled letters into the right word — 4 categories, 8 rounds shortest→longest, two-level hints (emoji, then ghost first letter), streak scoring |
| ✏️ Doodle Dance | Freeform doodle activity with playful animated flourishes |
| அ Tamil Tango | Learn the Tamil alphabet — a classroom in disguise. Four modes: **Learn Grid** (tap any of the 216 உயிர்மெய் cells to see how a consonant + vowel combine, e.g. க் + ஆ = கா → "kaa"), **Mix It!** (join a consonant + vowel to build the right letter; look-alike distractors reinforce the vowel signs), **Extract It!** (split a letter back into its parts), and **Listen & Find** (hear a letter, tap the right one). Every letter shows its romanized spelling and speaks with native-voice clips (`public/audio/tamil/`, cut from row recordings by `scripts/split-tamil-rows.py`) |
| 🏃 Running Races | Tap-to-mash race against 2 AI runners along a zigzag track — pick a name, choose from 12 characters, and race at easy/medium/hard difficulty; rubberband AI keeps it close either way |
| 🚗 Driving Cars | First-person driving game — pick a destination, then steer with a draggable wheel and GAS/BRAKE pedals down an S-curving road; curves drift you off-road if you don't steer, scenery rushes past, and a checkered finish line marks the arrival. Three trip lengths/difficulties |
| 🛒 Little Shop | Money-math cashier game under a striped storefront awning — customers order items ("I need 2 ⚽ & 1 🍪 please!"), ring them up on the wooden shelf, total them on a glowing cash register, and count out change from a coin-and-bill drawer. Three levels ramp the math: whole-dollar addition with pick-the-total → whole-dollar quantities (decimal-free multiplication) → quarter prices with coin change |

> Whack-a-Mole, Magic Loops, and Enchanted Garden exist in `src/components/` but are currently disabled (not in the `TABS` array).

## Getting Started

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**.

## Stack

- React 19 + Vite
- Three.js (3D Squishy Stuff)
- Plain CSS (no UI library) — mobile-responsive
- Per-game code-splitting (`React.lazy`) — the initial load is just the app
  shell (~62 kB gzip); each game's JS (including Three.js) downloads on first
  open

## Analytics

Usage is tracked with [Umami](https://umami.is) (cloud-hosted, cookieless — no
consent banner needed). The script tag lives in `index.html`; the helpers are in
`src/utils/analytics.js`.

- **Time per game** — this is a single-page app, so each game switch sends a
  *virtual pageview* (`/game/<id>`) via `trackGameView()`, fired from a
  `useEffect` on the active tab in `src/App.jsx`. Umami derives time-on-page from
  the gap between pageviews, so each game gets its own duration. See it in the
  Umami **Pages** report (each game appears as `/game/<id>`).
- **Mobile vs desktop** — Umami's **Devices** report (automatic, no code).
- **Region/location** — Umami's **Country / Region / City** report, IP-based and
  high-level only — no GPS (automatic, no code).
- **Completion / drop-off** — games with a real "finish" fire a
  `game_complete` event (`track('game_complete', { game })`) at the win/done
  moment: Memory Match, Number Detective (real solve only, not "give up"),
  Bubble Pop (timer ran out), Word Search, Unscramble, Family Feud, Tamil Tango
  (with `mode`), Drawing (Save), Making Boba (finished cup), Yummy Food (served,
  with `dish`), Running Races (race result locked in, with `won`), Driving Cars
  (arrived), Little Shop (day finished, with `stars`). Per game, drop-off ≈ `1 − (game_complete ÷ /game/<id> opens)` —
  many opens but few completes means kids start it and lose interest. Umami's
  **Funnels** can chart open → complete directly. Open-ended toys (Dressing
  Dolls, My Room, Squishy, Joke, Riddle, Doodle) have no completion event — for
  those, time-on-page is the engagement signal.

Notes:
- All tracking calls no-op safely (`try/catch` + optional chaining) if the script
  is blocked or offline — analytics never breaks the app.
- Visitors running ad-blockers or strict privacy browsers (Brave, Firefox/Safari
  tracking protection) block the Umami script, so expect some undercount. Treat
  numbers as a lower bound.
- The last game viewed before leaving the site records ~0s (no following
  pageview to measure against); averages across many sessions stay meaningful.
- **No heartbeat by design.** Per-game time is measured from the gap between
  consecutive pageviews, so it under-counts (the last game of a session reads
  ~0s). A periodic heartbeat ping would close that gap but would over-count idle
  time — a kid who wanders off with the tab open keeps getting credited. If a
  heartbeat is ever added, gate it on the Page Visibility API (pause when the tab
  is hidden) **and** an activity check (only ping after recent pointer/key input),
  never a raw interval. Until traffic is high enough to need that precision, the
  conservative under-count is the safer bias for an engagement metric.
- A generic `track(event, props)` helper is also exported for richer custom
  events later (e.g. `track('game_won', { game: 'numdet', stars: 3 })`).

## Deployment

Deployed to GitHub Pages via GitHub Actions on every push to `main`.
Workflow: `.github/workflows/deploy.yml`
