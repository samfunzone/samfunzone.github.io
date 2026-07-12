# One-off generator for the Tamil Tango letter clips (public/audio/tamil/).
#
# Voice: Azure neural `ta-IN-PallaviNeural` via Microsoft Edge's free TTS
# endpoint (the `edge-tts` package) — no API key needed. This replaced the old
# Google Translate `tl=ta` clips, which failed QA (short/long vowels identical,
# ங row wrong). See PLAN-tamil-sound-and-lint.md for the quality bar.
#
# Usage:
#   pip install edge-tts
#   python scripts/gen-tamil-clips.py [--out scripts/tamil-clips-staging] [--voice ta-IN-PallaviNeural]
#
# Then open scripts/tamil-clip-qa.html (file:// is fine) and LISTEN to the
# minimum pairs before copying the staging dir over public/audio/tamil/.
#
# IMPORTANT: filenames are keyed by ARRAY INDEX in TamilLetters.jsx — the
# UYIR/MEY lists below are copied verbatim from src/components/TamilLetters.jsx
# and must stay in the same order. Never generate from a Unicode range.

import argparse
import asyncio
import sys
from pathlib import Path

# Windows consoles default to cp1252, which can't print Tamil glyphs.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed — run: pip install edge-tts")

# ── Copied verbatim from src/components/TamilLetters.jsx ────────────────────
UYIR = [  # 12 உயிர் (vowels): (standalone letter, combining sign)
    ("அ", ""),
    ("ஆ", "ா"),
    ("இ", "ி"),
    ("ஈ", "ீ"),
    ("உ", "ு"),
    ("ஊ", "ூ"),
    ("எ", "ெ"),
    ("ஏ", "ே"),
    ("ஐ", "ை"),
    ("ஒ", "ொ"),
    ("ஓ", "ோ"),
    ("ஔ", "ௌ"),
]
MEY = [  # 18 மெய் (consonants): (pulli form, bare inherent-'a' form)
    ("க்", "க"),
    ("ங்", "ங"),
    ("ச்", "ச"),
    ("ஞ்", "ஞ"),
    ("ட்", "ட"),
    ("ண்", "ண"),
    ("த்", "த"),
    ("ந்", "ந"),
    ("ப்", "ப"),
    ("ம்", "ம"),
    ("ய்", "ய"),
    ("ர்", "ர"),
    ("ல்", "ல"),
    ("வ்", "வ"),
    ("ழ்", "ழ"),
    ("ள்", "ள"),
    ("ற்", "ற"),
    ("ன்", "ன"),
]
# ────────────────────────────────────────────────────────────────────────────

RATE = "-30%"  # slow — makes the குறில்/நெடில் (short/long vowel) length audible
RETRIES = 4


def clip_list():
    """(filename, glyph text) for all 246 clips, matching the SOUND map."""
    clips = []
    for vi, (base, _sign) in enumerate(UYIR):
        clips.append((f"ta_v{vi}.mp3", base))
    for ci, (pulli, cons) in enumerate(MEY):
        clips.append((f"ta_m{ci}.mp3", pulli))
        for vi, (_base, sign) in enumerate(UYIR):
            clips.append((f"ta_c{ci}_v{vi}.mp3", cons + sign))
    return clips


async def synth(text, path, voice):
    for attempt in range(1, RETRIES + 1):
        try:
            await edge_tts.Communicate(text, voice, rate=RATE).save(str(path))
            if path.stat().st_size > 500:  # sanity: never keep an empty/near-empty clip
                return
            raise RuntimeError(f"suspiciously small file ({path.stat().st_size} bytes)")
        except Exception as e:
            if attempt == RETRIES:
                raise
            print(f"  retry {attempt} for {path.name}: {e}")
            await asyncio.sleep(1.5 * attempt)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="scripts/tamil-clips-staging")
    ap.add_argument("--voice", default="ta-IN-PallaviNeural")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    clips = clip_list()
    assert len(clips) == 12 + 18 + 18 * 12 == 246

    for i, (name, text) in enumerate(clips, 1):
        path = out / name
        if path.exists() and path.stat().st_size > 500:
            continue  # resumable
        await synth(text, path, args.voice)
        print(f"[{i}/{len(clips)}] {name}  {text}")
        await asyncio.sleep(0.15)  # be polite to the free endpoint

    # Final assertion: exact expected names, nothing missing, nothing extra.
    expected = {name for name, _ in clips}
    actual = {p.name for p in out.glob("*.mp3")}
    missing, extra = expected - actual, actual - expected
    if missing or extra:
        sys.exit(f"FAILED — missing: {sorted(missing)} extra: {sorted(extra)}")
    total = sum(p.stat().st_size for p in out.glob("*.mp3"))
    print(f"OK — {len(actual)} clips, {total / 1e6:.2f} MB total, in {out}")
    print("Now open scripts/tamil-clip-qa.html and listen to the minimum pairs.")


if __name__ == "__main__":
    asyncio.run(main())
