"""Sound for the overload carousel's motion cover (OverloadCover in CarouselOverload.jsx): music plus transitions only.
Bed: "Goup the Wall" (Michael Ramir C., Rock, 116 BPM, unused by other projects) from its loudest bar; a whoosh as the bars
sink away and one as the trend line redraws. Writes public/overload-bed.wav (gitignored) and sound/overload-cover.json.
  python3 sound/build_overload_cover.py && python3 <motion-graphics>/scripts/sound.py sound/overload-cover.json public/overload-cover.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
DUR, MUSIC, SFX = 6.0, "m1064", {"title": "s1461", "line": "s168"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR < len(x) / sr - 2:
    e = x[int(t * sr):int((t + DUR) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/overload-bed.wav", "--dur", f"{DUR:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
print("bed:", m["title"], "by", m["artist"], f"from {at:.2f} s")
smp = lambda f, frame, g: {"type": "sample", "file": f, "frame": frame, "gain": g}
cues = [smp(os.path.abspath("public/overload-bed.wav"), 0, 0.85), smp(f"{LIB}/sfx/{SFX['title']}.mp3", 6, 0.3), smp(f"{LIB}/sfx/{SFX['line']}.mp3", 92, 0.28)]
json.dump({"fps": 30, "duration": DUR, "seed": 62, "fade_out": 0.8, "peak_db": -3, "cues": cues}, open("sound/overload-cover.json", "w"), indent=1)
used = json.load(open(f"{LIB}/used.json"))
used["darebni-overload-carousel"] = {"music": [MUSIC], "sfx": sorted(SFX.values())}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
