# PLAN: Tamil Tango — restore sound (and make lint green)

**Rank: #3.** This is the app's only real README TODO, and sound is the core of an
alphabet-learning game — right now kids see romanized spellings but never hear the letters,
and the whole **Listen & Find** mode is disabled. Risk: depends on an external voice being
good enough; timebox the sourcing step.

## Goal

1. Regenerate the 246 letter clips in `public/audio/tamil/` with a voice that passes the
   quality bar below, flip `SOUND_ENABLED` back on, restore the 🔊 buttons and the
   **Listen & Find** mode.
2. While in this file: fix the one `npm run lint` error (`react-hooks/set-state-in-effect`
   at `TamilLetters.jsx:520`) and the unused eslint-disable warning at line 535, so the
   repo lints clean.

## Why the old clips failed (from README + commit `ece2d51`)

- Short vs long vowels (குறில்/நெடில்) were indistinguishable: க vs கா, கி vs கீ.
- The entire ங row was pronounced wrong.
- Source was Google Translate's `tl=ta` endpoint — not a controllable TTS.

## Quality bar (hard gate — do NOT ship clips that fail this)

Build the QA page (step 2) and A/B these minimum pairs; each pair must be audibly different
and correct: `க/கா`, `கி/கீ`, `கு/கூ`, `கெ/கே`, `கொ/கோ`, and the full ங row
(`ங ஙா ஙி ஙீ …` — must sound like "nga", not "ga" or gibberish). Also spot-check ழ (the
retroflex zh) — TTS voices often render it as plain l.

## Files to touch

- `scripts/gen-tamil-clips.mjs` — **new** one-off generator (the old ones were removed;
  recreate, and this time commit it).
- `scripts/tamil-clip-qa.html` — **new** local QA page.
- `public/audio/tamil/*.mp3` — 246 regenerated clips.
- `src/components/TamilLetters.jsx` — re-enable flag/buttons/mode; lint fixes.
- `README.md` — remove the TODO section, update the Tamil Tango row and the analytics
  completion list mention.
- `CLAUDE.md` — update the Tamil Tango paragraph (it documents the disabled state).

## Steps (in order)

### 1. Generator script

Voice options, in preference order (try A; if it fails the quality bar, try B, then C):
- **A. Google Cloud Text-to-Speech**, voice `ta-IN-Wavenet-A/B/C/D` (needs an API key;
  free tier covers 246 short clips many times over).
- **B. Azure Speech**, voice `ta-IN-PallaviNeural` or `ta-IN-ValluvarNeural`.
- **C. Record a human** (family member!) reading the 246 letters — highest quality,
  zero API cost; the script then just renames/normalizes files.

Script requirements:
- Read `UYIR` (12) and `MEY` (18) **from the arrays in `src/components/TamilLetters.jsx`**
  — copy them verbatim into the script (or regex-extract); the clip index IS the array
  index, so order must match exactly. Filenames (see `TamilLetters.jsx:56–64`):
  - `ta_v{vi}.mp3` — the 12 உயிர் `u.base` glyphs
  - `ta_m{ci}.mp3` — the 18 மெய் `m.pulli` glyphs (the pure consonant sound, e.g. "ik/k̚")
  - `ta_c{ci}_v{vi}.mp3` — 216 composed `m.cons + u.sign` glyphs
- Synthesize the **bare glyph text**, with SSML `<prosody rate="slow">` (or provider
  equivalent) — slow rate is what makes குறில்/நெடில் length audible.
- MP3, mono, 24–48 kbps is plenty; keep total under ~3 MB (the old set's ballpark) since
  GitHub Pages serves it.

### 2. QA page — `scripts/tamil-clip-qa.html`

Plain HTML file (open via `npm run dev` is NOT needed — use `file://` with clips referenced
by relative path `../public/audio/tamil/`). Render the 12 vowels, 18 consonants, and the
18×12 grid as buttons that play the corresponding file, plus a dedicated "minimum pairs"
row for the quality-bar list. A human must listen and sign off — this cannot be automated.

### 3. Re-enable in `TamilLetters.jsx` (only after QA passes)

- Line 54: `SOUND_ENABLED = false` → `true`; delete the ⚠️ comment block (lines 50–53) and
  the stale `// sound off for now` comment in `say`.
- Uncomment the Listen & Find entry in `MODES` (line ~89) and remove the "unreachable"
  comment at line ~79.
- Grep the file for `🔊 button hidden` — restore every commented-out 🔊 button (there is at
  least one in LearnMode's breakdown bar, line ~134; search for others).
- Verify `ListenMode` still works: it speaks on a `useEffect` keyed on round; test the
  `noVoice` banner path by renaming a clip temporarily (fallback goes clip → browser TTS →
  banner).

### 4. Lint fixes (do even if clip sourcing stalls — separate commit)

- `TamilLetters.jsx:535`: the warning says the `eslint-disable-line react-hooks/exhaustive-deps`
  directive is unused — delete just the directive.
- `TamilLetters.jsx:520` (`set-state-in-effect` error): the `useLayoutEffect` measures DOM
  to place SVG arrows — DOM measurement is the legitimate exception to this rule, but the
  early-return branch `if (!arena || !center) { setArrows({u:null,m:null}); return; }` is
  what trips it. Fix in this order of preference:
  1. Change the guard to plain `return;` (no setState). Safe because: when refs are null
     the arena isn't rendered, so stale `arrows` state paints nothing; and the effect
     re-runs on `selU/selM/round` changes once it mounts.
  2. If the linter still flags line 534's `setArrows`, keep the code and add
     `// eslint-disable-next-line react-hooks/set-state-in-effect -- DOM measurement, see react.dev/learn/you-might-not-need-an-effect#measuring-layout`
     ONLY on the flagged line.
  After the fix, confirm Extract It! mode still draws its two arrows when you tap a vowel
  and a consonant tile.

### 5. Docs

- README: delete the `## TODO` section; drop "_Sound is currently disabled…_" from the
  Tamil Tango row; mention three→four modes.
- CLAUDE.md: rewrite the "Sound is currently disabled" sentence of the Tamil Tango bullet
  to describe the enabled state (the rest of that bullet already documents the intended
  wiring — mostly deletions).

## Edge cases found while exploring

- The `SOUND` map keys are **glyph strings** — filenames come from array INDEX, so if the
  generator sorts letters differently than the `UYIR`/`MEY` arrays, every clip is silently
  wrong. Generate from the same arrays, never from a Unicode range.
- அ has an empty `sign` (`compose` returns the bare consonant) — clip `ta_c{ci}_v0.mp3` is
  the inherent-a form (க), not க் + அ spoken separately.
- `playClip` (`src/utils/speech.js`) caches `Audio` objects by URL and falls back to TTS on
  error — after replacing clips, hard-refresh when testing (cache is per-page-load, but the
  browser HTTP cache also applies; GitHub Pages serves long-lived caching for assets).
- Umami's `game_complete` for tamil sends `{ mode }` — re-enabling `listen` adds a new mode
  value; no code change needed, just expect it in the dashboard.
- Do not delete/rename existing clips until the new set passes QA — work in a temp dir,
  then replace the whole folder in one commit.

## Acceptance criteria

1. All 246 files exist with exact expected names (script should assert count + names).
2. Human QA sign-off on the minimum-pair list above (this is the gate; everything else is
   mechanical).
3. In the app: Learn Grid cell tap speaks; breakdown-bar 🔊 works; Mix It! speaks on a
   correct answer; **Listen & Find** appears on the start screen and is fully playable.
4. Temporarily blocking `public/audio/tamil/` (DevTools request blocking) → letters still
   play via browser TTS or show the needs-sound banner; no crashes.
5. `npm run lint` → **0 errors, 0 warnings** repo-wide.
6. README has no TODO section; CLAUDE.md matches reality; `npm run build` passes.
