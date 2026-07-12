"""Split downloaded Tamil row recordings into per-syllable clips.

Input: scripts/downloaded-from-internet/
  0-vowels.mp3           -> 13 sounds: 12 uyir vowels then aytham (ஃ)
  {1..18}-{name}-row.mp3 -> 13 sounds: pulli consonant (க்) then the 12
                            uyirmey syllables (ka kaa ki kii ku kuu ke kee
                            kai ko koo kau)

Workflow:
  1. python split-tamil-rows.py --marker-init
       Loudness-envelope analysis -> initial 14 boundary times per file,
       written to scripts/marker-init.json (consumed by marker-qa.html,
       served with:  cd scripts && python -m http.server 8777).
  2. Adjust markers by ear in marker-qa.html, download row-markers.json
       into scripts/.
  3. python split-tamil-rows.py --markers row-markers.json
       Cuts the 247 clips into scripts/row-split-staging/ and regenerates
       row-split-qa.html there for a final listen.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
SRC = HERE / "downloaded-from-internet"
OUT = HERE / "row-split-staging"
INIT_JSON = HERE / "marker-init.json"

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


def src_files():
    return sorted(SRC.glob("*.mp3"), key=lambda p: int(p.name.split("-")[0]))


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
    """14 boundary times (s) framing 13 sounds, plus total duration."""
    x = decode_pcm(path)
    dur = len(x) / SR
    db = envelope_db(x)
    regions = refine_regions(find_regions(db), db)
    if len(regions) != N_SOUNDS:
        print(f"  !! {path.name}: only {len(regions)} regions — "
              "spread evenly, fix by ear")
        step = dur / N_SOUNDS
        return [round(i * step, 3) for i in range(N_SOUNDS + 1)], dur
    bounds = [max(0.0, frame_t(regions[0][0]) - 0.12)]
    for a, b in zip(regions, regions[1:]):
        bounds.append((frame_t(a[1]) + frame_t(b[0])) / 2)
    bounds.append(min(dur, frame_t(regions[-1][1]) + 0.15))
    return [round(t, 3) for t in bounds], dur


def write_marker_init():
    data = []
    for f in src_files():
        idx = int(f.name.split("-")[0])
        labels, _ = labels_for(idx)
        bounds, dur = initial_bounds(f)
        print(f"{f.name}: bounds at {' '.join(f'{t:.2f}' for t in bounds)}")
        data.append({"file": f.name, "labels": labels,
                     "bounds": bounds, "dur": round(dur, 3)})
    INIT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=1),
                         encoding="utf-8")
    print(f"\nWrote {INIT_JSON}")
    print("Serve the marker page:  cd scripts && python -m http.server 8777")
    print("  -> http://localhost:8777/marker-qa.html")


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


def cut_from_markers(markers_path):
    marks = json.loads(Path(markers_path).read_text(encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    rows_html = []
    for f in src_files():
        idx = int(f.name.split("-")[0])
        bounds = marks.get(f.name)
        if not bounds or len(bounds) != N_SOUNDS + 1:
            print(f"!! no/invalid markers for {f.name} — skipped")
            continue
        labels, names = labels_for(idx)
        for i, (name, label) in enumerate(zip(names, labels)):
            cut(f, bounds[i], bounds[i + 1], OUT / name)
        print(f"{f.name}: cut {len(names)} clips")
        tiles = "".join(
            f'<button class="clip" data-src="{name}">{label}</button>'
            for name, label in zip(names, labels))
        rows_html.append(
            f'<section><h2>{f.name}</h2><div class="row">{tiles}</div>'
            f'<button class="playall">▶ Play row in order</button></section>')

    qa = QA_TEMPLATE.replace("{{ROWS}}", "\n".join(rows_html))
    (OUT / "row-split-qa.html").write_text(qa, encoding="utf-8")
    print(f"\nDone. Clips + row-split-qa.html in {OUT}")


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
    if "--markers" in sys.argv:
        cut_from_markers(HERE / sys.argv[sys.argv.index("--markers") + 1])
    else:
        write_marker_init()
