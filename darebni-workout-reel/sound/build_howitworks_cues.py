"""Sound for HowItWorks.jsx: music plus transition whooshes only (the user finds hits, clicks and dings childish).
Bed: "I Do!" (Michael Ramir C., EDM, 128 BPM, unused by other projects) from its loudest bar, time-stretched to 120 BPM so
the scene cuts (HW.CUTS, all on the 15-frame beat grid) land on beats. A whoosh on every cut, a bigger one into the end card.
Writes public/howitworks-bed.wav (gitignored), sound/howitworks.json, sound/howitworks-sfx.json.
  python3 sound/build_howitworks_cues.py && python3 <motion-graphics>/scripts/sound.py sound/howitworks.json public/howitworks.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
src = open("src/HowItWorks.jsx").read()
CUTS = [int(x) for x in re.search(r"CUTS: \[([^\]]+)\]", src).group(1).split(",")]
DUR = int(re.search(r"DURATION: (\d+)", src).group(1))
MUSIC = os.environ.get("MUSIC", "m1001")   # MUSIC=<id> builds an alternative bed (files tagged -<id>)
TAG = f"-{MUSIC}" if "MUSIC" in os.environ else ""
SFX = {"cut": ["s1468", "s2632", "s174", "s1465", "s168", "s2607"], "end": "s1490"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
k = 120 / m["bpm"]; need = DUR / 30 / k
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, f"public/howitworks{TAG}-raw.wav", "--dur", f"{need + 0.05:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"public/howitworks{TAG}-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", f"public/howitworks{TAG}-bed.wav"], check=True)
os.remove(f"public/howitworks{TAG}-raw.wav")
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm stretched to 120, from {at:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
music = [smp(os.path.abspath(f"public/howitworks{TAG}-bed.wav"), 0, 0.85)]
fx = [smp(f"{LIB}/sfx/{SFX['cut'][j % 6]}.mp3", c - 7, 0.3, (-0.25, 0.25)[j % 2]) for j, c in enumerate(CUTS[1:-1])]
fx += [smp(f"{LIB}/sfx/{SFX['end']}.mp3", CUTS[-1] - 9, 0.34)]
for mus, path in ((True, f"sound/howitworks{TAG}.json"), (False, f"sound/howitworks{TAG}-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
if TAG: sys.exit(0)   # alternatives are logged once one is chosen
used = json.load(open(f"{LIB}/used.json"))
used["darebni-howitworks"] = {"music": [MUSIC], "sfx": sorted(SFX["cut"] + [SFX["end"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
