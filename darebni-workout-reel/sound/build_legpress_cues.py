"""Sound for LegPress.jsx (built from build_latpull_cues.py), from the real-audio library: music plus transition whooshes only (the user finds hits,
clicks and dings childish). Bed: "Trap Hamza" (Arulo, Trap, 110 BPM, unused by other projects) from its
loudest bar. Whooshes: one on each of the clip's camera changes (move at 4.3 s, cuts at 10 s and 13 s), one as "Do it right"
covers the top half, one into the end card and one on its page turn. Writes public/legpress-bed.wav (gitignored),
sound/legpress.json, sound/legpress-sfx.json.
  python3 sound/build_legpress_cues.py && python3 <motion-graphics>/scripts/sound.py sound/legpress.json public/legpress.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
import re
CLIP = 610                                               # keep in step with LPR in LegPress.jsx
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))   # the end card's page turn
DUR = CLIP + END_LEN
MOVES = [(132, 146), (302, 304), (391, 393), (526, 528)]   # whoosh lands just before each
MUSIC = "m267"
SFX = {"move": ["s2639", "s1465", "s166", "s2607"], "end": "s2615", "swap": "s1474"}
cat = {m["id"]: m for m in json.load(open(f"{LIB}/catalog.json"))["music"]}
m = cat[MUSIC]
def loudest_start(m, need):
    sr = 2000
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
    bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
    while t + need < len(x) / sr - 2:
        e = x[int(t * sr):int((t + need) * sr)].mean()
        if e > best: best, at = e, t
        t += bar
    return at
start = loudest_start(m, DUR / 30)
out = subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/legpress-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{start:.3f}"], capture_output=True, text=True, check=True).stdout
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm, from {start:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/legpress-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k % 4]), a - 4, 0.32, (-0.3, 0.3, 0, -0.15)[k % 4]) for k, (a, b) in enumerate(MOVES)]
fx += [smp(sfx(SFX["end"]), CLIP - 7, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/legpress.json"), (False, "sound/legpress-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-legpress"] = {"music": [MUSIC], "sfx": sorted(SFX["move"] + [SFX["end"], SFX["swap"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
