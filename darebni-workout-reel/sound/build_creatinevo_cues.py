"""Sound for CreatineVO.jsx: the narrator's lines (public/vo/*.mp3, timed by src/creatine-vo.json) on top, an unused
hip-hop bed underneath (lower, so the voice reads), a whoosh on each scene change and a deeper one as the lid pops.
The NoMusic mix keeps the voice and the whooshes. Writes public/creatinevo-bed.wav (gitignored), sound/creatinevo*.json.
  python3 sound/build_creatinevo_cues.py && python3 <motion-graphics>/scripts/sound.py sound/creatinevo.json public/creatinevo.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
V = json.load(open("src/creatine-vo.json")); DUR = V["DURATION"]
CUTS = [V[k] for k in ("W1", "STR", "HAIR", "BRAIN", "FIN", "END")]
MUSIC = "m318"                                       # Thunder (Arulo, hip hop)
WHOOSH = ["s1471", "s166", "s168", "s1461", "s2605", "s174"]
m = next(x for x in json.load(open(f"{LIB}/catalog.json"))["music"] if x["id"] == MUSIC)
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar, need = 4 * 60 / m["bpm"], DUR / 30
t, best, start = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, start = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/creatinevo-bed.wav", "--dur", f"{need:.3f}", "--start", f"{start:.3f}", "--gain", "0.9"], check=True, capture_output=True)
print("bed:", m["title"], "by", m["artist"], f"from {start:.2f} s")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": frame, "gain": g, "pan": pan}
music = [smp(os.path.abspath("public/creatinevo-bed.wav"), 0, 0.32)]
voice = [smp(os.path.abspath(f"public/{l['file']}"), l["at"], 1.0) for l in V["lines"]]
fx = [smp(f"{LIB}/sfx/{WHOOSH[k % len(WHOOSH)]}.mp3", c - 7, 0.22, (-0.3, 0.3)[k % 2]) for k, c in enumerate(CUTS)]
fx += [smp(f"{LIB}/sfx/s1486.mp3", V["FIN"] + 34, 0.26)]
for mus, path in ((True, "sound/creatinevo.json"), (False, "sound/creatinevo-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 41, "fade_out": 1.0, "peak_db": -1.5, "cues": (music if mus else []) + voice + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json")); used["darebni-creatine-vo"] = {"music": [MUSIC], "sfx": sorted(WHOOSH + ["s1486"])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
