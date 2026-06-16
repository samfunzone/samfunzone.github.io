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
| அ Tamil Tango | Learn the Tamil alphabet — a classroom in disguise. Three modes: **Learn Grid** (tap any of the 216 உயிர்மெய் cells to hear it and see how a consonant + vowel combine, e.g. க் + ஆ = கா → "kaa"), **Mix It!** (join a consonant + vowel to build the right letter; look-alike distractors reinforce the vowel signs), and **Listen & Find** (hear a letter, tap the match). Sound plays accurate native-voice audio clips bundled with the app (no dependence on the device's installed voices); every letter also shows its romanized spelling for reading support |

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

## Deployment

Deployed to GitHub Pages via GitHub Actions on every push to `main`.
Workflow: `.github/workflows/deploy.yml`
