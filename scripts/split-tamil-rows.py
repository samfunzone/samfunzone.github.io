"""Split downloaded Tamil row recordings into per-syllable clips.

Input: scripts/downloaded-from-internet/{v1,v2,...}/ (any of .mp3/.mpeg),
  filename must start with the row index (0-18):
  0*           -> 13 sounds: 12 uyir vowels then aytham (ஃ)
  {1..18}*     -> 13 sounds: pulli consonant (க்) then the 12
                  uyirmey syllables (ka kaa ki kii ku kuu ke kee
                  kai ko koo kau)

Workflow (pass --src to point at a different take, e.g. v2/ with better
recordings — outputs are namespaced by the src folder name so re-runs
never clobber a previous take's markers/staging):
  1. python split-tamil-rows.py --marker-init --src downloaded-from-internet/v2
       Loudness-envelope analysis -> initial 13 independent [start,end]
       pairs per file (one per sound, can have gaps between them),
       written to scripts/marker-init-v2.json (consumed by marker-qa.html
       with ?src=v2, served with:  cd scripts && python -m http.server 8777).
  2. Adjust markers by ear in marker-qa.html, download row-markers-v2.json
       into scripts/.
  3. python split-tamil-rows.py --markers row-markers-v2.json --src downloaded-from-internet/v2
       Cuts the 247 clips into scripts/row-split-staging-v2/ and regenerates
       row-split-qa.html there for a final listen.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent

SR = 16000
HOP = 160          # 10 ms envelope hop
WIN = 320          # 20 ms envelope window
N_SOUNDS = 13      # sounds per file
SPEECH_REL_DB = 35    # region threshold: within this of the file's peak
JUNK_REL_DB = 26      # regions quieter than peak-26 are junk noise
MIN_GAP_F = 8         # merge regions separated by < 80 ms
MIN_REGION_F = 6      # discard regions shorter than 60 ms

UYIR_TR = ["a", "aa", "i", "ii", "u", "uu", "e", "ee", "ai", "o", "oo", "au"]
MEY_TR = ["k", "ng", "s", "nj", "d", "nn", "th", "n", "p", "m",
          "y", "r", "l", "v", "zh", "ll", "rr", "n2"]
UYIR = ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"]
SIGN = ["", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"]
MEY_CONS = ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம",
            "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன"]


def row_index(p):
    m = re.match(r"(\d+)", p.stem)
    if not m:
        raise ValueError(f"can't find a leading row index in {p.name}")
    return int(m.group(1))


def src_files(src_dir):
    files = [p for p in src_dir.iterdir() if p.suffix.lower() in (".mp3", ".mpeg")]
    return sorted(files, key=row_index)


def labels_for(idx):
    """13 display labels + 13 output clip names for file index."""
    if idx == 0:
        labels = [f"{UYIR[v]} ({UYIR_TR[v]})" for v in range(12)] + ["ஃ (akh)"]
        names = [f"ta_v{v}.mp3" for v in range(12)] + ["ta_aytham.mp3"]
    else:
        ci = idx - 1
        cons, tr = MEY_CONS[ci], MEY_TR[ci]
        labels = [f"{cons}் ({tr})"] + \
            [f"{cons}{SIGN[v]} ({tr}{UYIR_TR[v]})" for v in range(12)]
        names = [f"ta_m{ci}.mp3"] + \
            [f"ta_c{ci}_v{v}.mp3" for v in range(12)]
    return labels, names


# ---------------------------------------------------------------- analysis

def decode_pcm(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path),
         "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def envelope_db(x):
    n = max((len(x) - WIN) // HOP, 1)
    idx = np.arange(WIN)[None, :] + HOP * np.arange(n)[:, None]
    rms = np.sqrt((x[idx] ** 2).mean(axis=1))
    db = 20 * np.log10(rms + 1e-6)
    k = 5
    return np.convolve(db, np.ones(k) / k, mode="same")


def frame_t(i):
    return i * HOP / SR + WIN / (2 * SR)


def find_regions(db):
    mask = db > db.max() - SPEECH_REL_DB
    d = np.diff(mask.astype(int))
    starts = list(np.where(d == 1)[0] + 1)
    ends = list(np.where(d == -1)[0] + 1)
    if mask[0]:
        starts.insert(0, 0)
    if mask[-1]:
        ends.append(len(mask))
    merged = []
    for s, e in zip(starts, ends):
        if merged and s - merged[-1][1] < MIN_GAP_F:
            merged[-1][1] = e
        else:
            merged.append([s, e])
    return [r for r in merged if r[1] - r[0] >= MIN_REGION_F]


def refine_regions(regions, db):
    """Drop junk (quiet noise) regions, split merged syllables, until 13."""
    def peak(r):
        return db[r[0]:r[1]].max()

    file_peak = max(peak(r) for r in regions)
    regions = [r for r in regions if peak(r) > file_peak - JUNK_REL_DB]

    while len(regions) > N_SOUNDS:
        regions.remove(min(regions, key=peak))

    while len(regions) < N_SOUNDS:
        best, best_depth = None, -1.0
        for r in regions:
            s, e = r
            if e - s < 24:
                continue
            inner = db[s + 6:e - 6]
            di = int(np.argmin(inner)) + s + 6
            depth = min(db[s:di].max(), db[di:e].max()) - db[di]
            if depth > best_depth:
                best, best_depth, best_di = r, depth, di
        if best is None:
            break
        i = regions.index(best)
        regions[i:i + 1] = [[best[0], best_di], [best_di, best[1]]]

    return regions


def initial_bounds(path):
    """13 independent [start, end] pairs (s), one per sound, plus duration.

    Pairs are independent (not shared boundaries) so a stray extra take or
    noise blip between two sounds can be excluded by hand in the UI instead
    of being split down the middle and half-included in both clips.
    """
    x = decode_pcm(path)
    dur = len(x) / SR
    db = envelope_db(x)
    regions = refine_regions(find_regions(db), db)
    if len(regions) != N_SOUNDS:
        print(f"  !! {path.name}: only {len(regions)} regions — "
              "spread evenly, fix by ear")
        step = dur / N_SOUNDS
        return [[round(i * step, 3), round((i + 1) * step, 3)]
                for i in range(N_SOUNDS)], dur
    pairs = []
    for a, b in zip(regions, regions[1:] + [None]):
        start = max(0.0, frame_t(a[0]) - 0.12)
        end = min(dur, frame_t(a[1]) + 0.15)
        if b is not None:
            # don't let this sound's padding cross into the next one's
            mid = (frame_t(a[1]) + frame_t(b[0])) / 2
            end = min(end, mid)
        pairs.append([round(start, 3), round(end, 3)])
    return pairs, dur


def ffprobe_dur(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def write_marker_init(src_dir, init_json, seed=None, refresh=()):
    """Build marker-init.json. If `seed` (a previously downloaded
    row-markers*.json of already-refined pairs) is given, every file keeps
    its seeded pairs as-is EXCEPT those named in `refresh` (e.g. a row whose
    recording was swapped for a cleaner take) which get fresh loudness
    analysis — so re-running doesn't discard already-QA'd rows.
    """
    seed_data = json.loads(Path(seed).read_text(encoding="utf-8")) if seed else {}
    data = []
    for f in src_files(src_dir):
        idx = row_index(f)
        labels, _ = labels_for(idx)
        if f.name in seed_data and f.name not in refresh:
            pairs, dur = seed_data[f.name], ffprobe_dur(f)
            print(f"{f.name}: seeded from {seed}")
        else:
            pairs, dur = initial_bounds(f)
            print(f"{f.name}: " +
                  " ".join(f"[{a:.2f}-{b:.2f}]" for a, b in pairs))
        data.append({"file": f.name, "labels": labels,
                     "bounds": pairs, "dur": round(dur, 3)})
    init_json.write_text(json.dumps(data, ensure_ascii=False, indent=1),
                          encoding="utf-8")
    print(f"\nWrote {init_json}")
    tag = init_json.stem.removeprefix("marker-init").removeprefix("-")
    qs = f"?src={tag}" if tag else ""
    print("Serve the marker page:  cd scripts && python -m http.server 8777")
    print(f"  -> http://localhost:8777/marker-qa.html{qs}")


# ---------------------------------------------------------------- cutting

def cut(src, a, b, dest):
    fade_out = max(b - a - 0.03, 0.01)
    subprocess.run(
        # -ss BEFORE -i: input seek resets timestamps to 0 so the afade
        # timeline matches the clip
        ["ffmpeg", "-y", "-v", "error",
         "-ss", f"{a:.3f}", "-i", str(src), "-t", f"{b - a:.3f}",
         "-af", f"afade=t=in:d=0.02,afade=t=out:st={fade_out:.3f}:d=0.03",
         "-codec:a", "libmp3lame", "-q:a", "4", str(dest)],
        check=True)


def cut_from_markers(markers_path, src_dir, out_dir):
    marks = json.loads(Path(markers_path).read_text(encoding="utf-8"))
    out_dir.mkdir(exist_ok=True)
    rows_html = []
    for f in src_files(src_dir):
        idx = row_index(f)
        pairs = marks.get(f.name)
        if not pairs or len(pairs) != N_SOUNDS or any(len(p) != 2 for p in pairs):
            print(f"!! no/invalid markers for {f.name} — skipped")
            continue
        labels, names = labels_for(idx)
        for name, label, (a, b) in zip(names, labels, pairs):
            cut(f, a, b, out_dir / name)
        print(f"{f.name}: cut {len(names)} clips")
        tiles = "".join(
            f'<button class="clip" data-src="{name}">{label}</button>'
            for name, label in zip(names, labels))
        rows_html.append(
            f'<section><h2>{f.name}</h2><div class="row">{tiles}</div>'
            f'<button class="playall">▶ Play row in order</button></section>')

    qa = QA_TEMPLATE.replace("{{ROWS}}", "\n".join(rows_html))
    (out_dir / "row-split-qa.html").write_text(qa, encoding="utf-8")
    print(f"\nDone. Clips + row-split-qa.html in {out_dir}")


QA_TEMPLATE = """<!DOCTYPE html>
<html lang="ta"><head><meta charset="utf-8">
<title>Tamil row-split QA</title>
<style>
  body { font-family: system-ui, sans-serif; background: #10214b; color: #fff;
         margin: 0; padding: 24px; }
  h1 { font-size: 1.3rem; } h2 { font-size: 1rem; color: #9db4e8; margin: 18px 0 8px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  .clip { font-size: 1.15rem; padding: 10px 14px; border-radius: 10px; border: none;
          cursor: pointer; background: #2b4a8f; color: #fff; }
  .clip.playing { background: #e8a33d; color: #222; }
  .playall { margin-top: 8px; background: #3d7d4f; color: #fff; border: none;
             border-radius: 8px; padding: 6px 12px; cursor: pointer; }
</style></head><body>
<h1>Tamil row-split QA — tap a tile, check the sound matches the label</h1>
{{ROWS}}
<script>
  let audio = null;
  function play(btn) {
    document.querySelectorAll('.clip.playing').forEach(b => b.classList.remove('playing'));
    if (audio) audio.pause();
    audio = new Audio(btn.dataset.src + '?t=' + Date.now());
    btn.classList.add('playing');
    audio.onended = () => btn.classList.remove('playing');
    audio.play();
    return audio;
  }
  document.querySelectorAll('.clip').forEach(b => b.onclick = () => play(b));
  document.querySelectorAll('.playall').forEach(pb => pb.onclick = async () => {
    const tiles = [...pb.parentElement.querySelectorAll('.clip')];
    for (const t of tiles) {
      await new Promise(res => { const a = play(t); a.onended = () => { t.classList.remove('playing'); res(); }; a.onerror = res; });
      await new Promise(res => setTimeout(res, 250));
    }
  });
</script>
</body></html>
"""


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="downloaded-from-internet",
                     help="folder of row recordings, relative to scripts/ "
                          "(e.g. downloaded-from-internet/v2)")
    ap.add_argument("--marker-init", action="store_true")
    ap.add_argument("--markers", help="row-markers-<tag>.json to cut from")
    ap.add_argument("--seed", help="a previously downloaded row-markers*.json "
                                    "to reuse already-refined pairs from")
    ap.add_argument("--refresh", action="append", default=[],
                     help="filename (repeatable) to re-analyze instead of "
                          "reusing from --seed, e.g. a swapped-in recording")
    args = ap.parse_args()

    src_dir = (HERE / args.src).resolve()
    tag = src_dir.name if src_dir.name != "downloaded-from-internet" else ""
    suffix = f"-{tag}" if tag else ""

    if args.markers:
        cut_from_markers(HERE / args.markers, src_dir,
                          HERE / f"row-split-staging{suffix}")
    else:
        write_marker_init(src_dir, HERE / f"marker-init{suffix}.json",
                           seed=HERE / args.seed if args.seed else None,
                           refresh=set(args.refresh))
