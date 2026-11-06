"""Sound for AppPreview.jsx (App Store app preview, 26 s): one continuous score, as Apple recommends, "Infinity" (Arulo,
corporate, 112 BPM, unused by other projects) from its loudest stretch, fading out under the end frame. No effects (previews
autoplay muted; the captions carry the story). Writes public/apppreview.wav via public/apppreview-bed.wav (gitignored).
  python3 sound/build_apppreview_cues.py && python3 <motion-graphics>/scripts/sound.py sound/apppreview.json public/apppreview.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
src = open("src/AppPreview.jsx").read()
n = len(re.findall(r'^\s*\["\w+", "', src, re.M)); LEN = int(re.search(r"const LEN = (\d+)", src).group(1))
DUR = (n * LEN + 90) / 30; MUSIC = "m440"
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR < len(x) / sr - 2:
    e = x[int(t * sr):int((t + DUR) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/apppreview-bed.wav", "--dur", f"{DUR:.3f}", "--gain", "0.9", "--start", f"{at:.3f}", "--fade", "2.0"], capture_output=True, text=True, check=True)
json.dump({"fps": 30, "duration": DUR, "seed": 7, "fade_out": 2.0, "peak_db": -2, "cues": [{"type": "sample", "file": os.path.abspath("public/apppreview-bed.wav"), "frame": 0, "gain": 0.85}]}, open("sound/apppreview.json", "w"), indent=1)
used = json.load(open(f"{LIB}/used.json")); used["darebni-app-preview"] = {"music": [MUSIC], "sfx": []}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
print(n, "scenes,", DUR, "s, bed from", round(at, 2))
