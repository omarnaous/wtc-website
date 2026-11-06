"""Sound for ChartTop3.jsx (8 s story, the Top 3 proof): "Happy Times" (Alejandro Magaña, pop, 120 BPM, unused by other projects) from its
loudest bar, a whoosh as the rank starts rolling, a success chime + a light pop as #4 locks with the confetti, and a soft
whoosh under the "Next stop: #1" line. Writes public/charttop3-bed.wav (gitignored) and sound/charttop3.json.
  python3 sound/build_chartstory_cues.py && python3 <motion-graphics>/scripts/sound.py sound/charttop3.json public/charttop3.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
src = open("src/ChartTop3.jsx").read()
CS = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const CT3 = \{([^}]+)\}", src).group(1))}
DUR, MUSIC = CS["DURATION"] / 30, "m158"
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR < len(x) / sr - 2:
    e = x[int(t * sr):int((t + DUR) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/charttop3-bed.wav", "--dur", f"{DUR:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
X = lambda i: f"{LIB}/sfx/{i}.mp3"
smp = lambda f, frame, g: {"type": "sample", "file": f, "frame": frame, "gain": g}
cues = [smp(os.path.abspath("public/charttop3-bed.wav"), 0, 0.8), smp(X("s1489"), 0, 0.28), smp(X("s2632"), CS["HL"] - 4, 0.26), smp(X("s2039"), CS["NUM"], 0.36), smp(X("s3005"), CS["NUM"] + 1, 0.28), smp(X("s168"), CS["NEXT"] - 5, 0.22)]
json.dump({"fps": 30, "duration": DUR, "seed": 44, "fade_out": 0.6, "peak_db": -2, "cues": cues}, open("sound/charttop3.json", "w"), indent=1)
used = json.load(open(f"{LIB}/used.json")); used["darebni-chart-story"] = {"music": [MUSIC], "sfx": ["s1489", "s2039", "s3005", "s168", "s2632"]}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
print("bed from", round(at, 2), "s")
