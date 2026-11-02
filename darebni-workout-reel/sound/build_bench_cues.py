"""Sound for BenchElbows.jsx, from the real-audio library: music plus transition whooshes only (the user finds hits,
clicks and dings childish). Bed: "Super Strong" (Michael Ramir C., EDM, 120 BPM, unused by other projects) from its
loudest bar. Whooshes: a long sweep under each of the clip's two camera moves (9.5-10.4 s, 15.6-16.5 s), a short one
into the end card. Writes public/bench-bed.wav (gitignored), sound/bench.json, sound/bench-sfx.json.
  python3 sound/build_bench_cues.py && python3 <motion-graphics>/scripts/sound.py sound/bench.json public/bench.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
CLIP, END_LEN = 555, 135; DUR = CLIP + END_LEN          # keep in step with BE in BenchElbows.jsx
MOVES = [(285, 312), (468, 495)]
MUSIC = "m1010"
SFX = {"move": ["s1474", "s2632"], "end": "s2627"}       # Transition windy swoosh, Whoosh wind sweep, Fast swipe zoom
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
out = subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/bench-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{start:.3f}"], capture_output=True, text=True, check=True).stdout
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm, from {start:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/bench-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k]), a - 4, 0.32, (-0.3, 0.3)[k]) for k, (a, b) in enumerate(MOVES)]
fx += [smp(sfx(SFX["end"]), CLIP - 7, 0.32)]
for mus, path in ((True, "sound/bench.json"), (False, "sound/bench-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-bench-elbows"] = {"music": [MUSIC], "sfx": sorted(SFX["move"] + [SFX["end"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
