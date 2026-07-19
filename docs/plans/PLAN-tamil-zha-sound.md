# PLAN: Tamil Tango — fix the ழ (zha) sound

**Status: not started.** The ழ row clips don't sound right in the app. ழ is the
retroflex approximant ("zh" as in "Tamizh") — the hardest Tamil sound for any
recording/TTS pipeline, and the one README's old quality bar already flagged
("TTS voices often render it as plain l").

## Where the zha clips live (exact mapping — don't re-derive)

- `MEY[14]` in `src/components/TamilLetters.jsx` is `{ pulli: 'ழ்', cons: 'ழ', tr: 'zh' }`
  (0-based index 14; clip filename index IS the array index).
- Its 13 clips in `public/audio/tamil/`:
  - `ta_m14.mp3` — the pulli sound ழ்
  - `ta_c14_v0.mp3 … ta_c14_v11.mp3` — ழ ழா ழி ழீ ழு ழூ ழெ ழே ழை ழொ ழோ ழௌ
- Source row recording: `scripts/downloaded-from-internet/15-zh-row.mp3`
  (row files are numbered 0-vowels then 1–18 consonant rows, so row **15** = MEY
  index **14**; all 13 sounds of the row are in that one MP3).
- Cut boundaries: the `"15"` entry in `scripts/row-markers.json` (human-dragged
  in `scripts/marker-qa.html`), consumed by `scripts/split-tamil-rows.py --markers`.

## Step 1 — Diagnose: bad cut or bad source? (do this first, it forks the plan)

Listen before touching anything:

1. Play the raw row: `scripts/downloaded-from-internet/15-zh-row.mp3`.
   - If the *speaker* says zha correctly here, the problem is the **cut
     boundaries** (clips clipped mid-syllable, bleeding into neighbors, or
     offset by one) → Path A.
   - If the pronunciation is wrong/muddy in the source itself → Path B.
2. Cross-check the shipped clips on the listening QA page
   (`scripts/row-split-qa.html` in `scripts/row-split-staging/`, or
   `scripts/tamil-clip-qa.html`) — serve `scripts/` with `python -m http.server`.
   An off-by-one (e.g. ழி playing ழீ) is a marker problem, not a voice problem.

## Path A — re-cut row 15 (marker fix)

1. Serve `scripts/` (`python -m http.server`), open `marker-qa.html`, load the
   existing `row-markers.json`, fix ONLY row 15's boundaries on the waveform,
   download the updated `row-markers.json` (replace the file in `scripts/`).
2. Re-run `scripts/split-tamil-rows.py --markers row-markers.json` → clips land
   in `scripts/row-split-staging/`.
3. Listen to the 13 new row-15 clips on the regenerated `row-split-qa.html`.
4. Copy ONLY `ta_m14.mp3` + `ta_c14_v*.mp3` into `public/audio/tamil/`
   (don't touch the other 233 clips — they passed QA already).

## Path B — re-source the row recording

Project rule: **do not regenerate from TTS** (scrapped twice already — short/long
vowels came out identical and pronunciation was wrong). Options in order:
1. Record a human (family member) reading the 13 sounds of the ழ row slowly —
   one take, save as `scripts/downloaded-from-internet/15-zh-row.mp3`
   (keep the old file until QA passes; work on a copy).
2. Find a better native recording of just that row from the same style of
   alphabet-recitation source as the original downloads.
Then run the full Path A flow on the new file (`--marker-init` first to get
fresh boundary guesses for row 15, then human marker QA, then cut + copy).

## Quality bar (hard gate before shipping)

A/B on the QA page — each contrast must be audibly distinct and correct:
- ழ vs ள vs ல (za/La/la — the classic triple; ழ must NOT sound like either L)
- ழ vs ழா (short/long), ழி vs ழீ, ழு vs ழூ
- `ta_m14.mp3` (ழ்) must be the bare consonant sound, not "zha"

## Ship

- Replace the 13 files in `public/audio/tamil/` in one commit (plus the updated
  `row-markers.json` / source MP3 if changed).
- Test in the app: Learn Grid row ழ, Mix It! with a ழ answer, Listen & Find.
  Hard-refresh — `playClip` caches Audio objects per page load AND GitHub Pages
  serves long-lived asset caching, so a stale clip can mask the fix.
- No code changes expected in `TamilLetters.jsx` (the SOUND map is filename-stable).

## Acceptance criteria

1. Human sign-off on the quality-bar contrasts above (cannot be automated).
2. All 13 zha clips replaced; the other 233 files byte-identical (git diff shows
   only the 13 + markers/source).
3. In the deployed app after hard refresh: tapping ழ cells speaks the corrected
   sound; no console errors; fallback TTS path untouched.
