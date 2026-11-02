"""Sound for StoryCreatine.jsx: "Hip Hop 02" (Lily J, 97 BPM, unused elsewhere) from its loudest stretch as the bed, and
a whoosh on each scene change only (the user wants music + transitions, nothing else). Writes public/creatine-bed.wav
(gitignored), sound/creatine.json, sound/creatine-sfx.json.
  python3 sound/build_creatine_cues.py && python3 <motion-graphics>/scripts/sound.py sound/creatine.json public/creatine.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
src = open("src/StoryCreatine.jsx").read()
SC = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const SC = \{(.*?)\};", src).group(1))}
DUR = SC["DURATION"]; CUTS = [SC[k] for k in ("PAPER", "STR", "REPS", "TWIST", "SAFE", "DOSE", "END")]
MUSIC = "m738"
WHOOSH = ["s1491", "s787", "s1489", "s1493"]     # Arrow whoosh, Cinematic whoosh stutter, Air woosh, Swirling whoosh
m = next(x for x in json.load(open(f"{LIB}/catalog.json"))["music"] if x["id"] == MUSIC)
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar, need = 4 * 60 / m["bpm"], DUR / 30
t, best, start = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, start = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/creatine-bed.wav", "--dur", f"{need:.3f}", "--start", f"{start:.3f}", "--gain", "0.9"], check=True, capture_output=True)
print("bed:", m["title"], "by", m["artist"], f"from {start:.2f} s")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": frame, "gain": g, "pan": pan}
music = [smp(os.path.abspath("public/creatine-bed.wav"), 0, 0.85)]
fx = [smp(f"{LIB}/sfx/{WHOOSH[k % len(WHOOSH)]}.mp3", c - 7, 0.3, (-0.3, 0.3)[k % 2]) for k, c in enumerate(CUTS)]
for mus, path in ((True, "sound/creatine.json"), (False, "sound/creatine-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 31, "fade_out": 1.4, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json")); used["darebni-creatine"] = {"music": [MUSIC], "sfx": sorted(WHOOSH)}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
