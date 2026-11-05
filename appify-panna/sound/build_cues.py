"""Sound for Panna.jsx: real music plus transition effects only (no hits, clicks or dings). Bed: "Never Going Broke"
(Arulo, Trap, 117 BPM, unused by other projects) from its loudest bar, time-stretched to the reel's 120 BPM grid so the
photo cuts (one per beat) land on beats. A swish on each rush cut (6 files rotating), a whoosh into "Then he needed a
website.", a bigger one into the site and one into the end card. Writes public/panna-bed.wav (gitignored),
sound/panna.json, sound/panna-sfx.json.
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/panna.json public/panna.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
src = open("src/Panna.jsx").read()
PK = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const PK = \{([^}]+)\}", src).group(1))}
DUR = PK["DURATION"]
MUSIC = "m301"
SFX = {"rush": ["s174", "s168", "s1461", "s1465", "s2632", "s1482"], "turn": "s2607", "site": "s3220", "end": "s1490"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
k = 120 / m["bpm"]; need = DUR / 30 / k
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/panna-raw.wav", "--dur", f"{need + 0.05:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/panna-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", "public/panna-bed.wav"], check=True)
os.remove("public/panna-raw.wav")
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm stretched to 120, from {at:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/panna-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["rush"][j]), PK["RUSH"] + j * PK["BEAT"] - 5, 0.22, (-0.3, 0.3)[j % 2]) for j in range(6)]
fx += [smp(sfx(SFX["turn"]), PK["TURN"] - 7, 0.3), smp(sfx(SFX["site"]), PK["SITE"] - 9, 0.34), smp(sfx(SFX["end"]), PK["END"] - 8, 0.32)]
for mus, path in ((True, "sound/panna.json"), (False, "sound/panna-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 33, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["appify-pannaking"] = {"music": [MUSIC], "sfx": sorted(SFX["rush"] + [SFX["turn"], SFX["site"], SFX["end"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
