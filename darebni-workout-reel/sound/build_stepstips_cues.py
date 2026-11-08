"""Sound for StepsTips.jsx: a real music bed ("House 02", Mixkit, House, 123 BPM, unused by other projects) from its loudest
bar, held low under the voice-over (public/stepsvo.wav, sound/build_steps_vo.py); whooshes on every scene change and tip
card; a low thump (synthesised) under the "Hype?" and "Marketing" stamps, the -47% and the verdict. Timings from
src/steps_vo.json. Writes public/stepstips-bed.wav (gitignored), sound/stepstips.json, sound/stepstips-sfx.json.
  python3 sound/build_stepstips_cues.py && python3 <motion-graphics>/scripts/sound.py sound/stepstips.json public/stepstips.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
V = json.load(open("src/steps_vo.json")); S, M = V["scenes"], V["marks"]
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
DUR = V["duration"]
MUSIC = "m744"
WH = ["s1492", "s1491", "s1489", "s787", "s1485", "s1493"]
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR / 30 < len(x) / sr - 1:
    e = x[int(t * sr):int((t + DUR / 30) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/stepstips-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
print("bed:", m["title"], f"from {at:.2f} s, {DUR} frames")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
thump = lambda frame, g=0.5: {"type": "thump", "frame": round(frame), "gain": g}
music = [smp(os.path.abspath("public/stepstips-bed.wav"), 0, 0.42)]
voice = [smp(os.path.abspath("public/stepsvo.wav"), 0, 1.0)]
moves = [S["origin"]["start"], S["science"]["start"], S["age"]["start"], S["tips"]["start"], M["TIP1"] - 18, M["TIP2"] - 18, S["verdict"]["start"], S["bridge"]["start"]]
fx = [smp(sfx(WH[k % len(WH)]), a - 5, 0.22, (-0.25, 0.25)[k % 2]) for k, a in enumerate(moves)]
fx += [thump(M["HYPE"] - 2, 0.45), thump(M["MKT"] - 2, 0.4), thump(M["DEATH"] - 3, 0.42), thump(M["YES"] - 2, 0.32), thump(M["MAGIC"] + 18, 0.32), thump(M["HIT"] + 20, 0.36)]
fx += [smp(sfx("s1489"), S["outro"]["start"] - 9, 0.28), smp(sfx("s1491"), S["outro"]["start"] + SWAP - 7, 0.24)]
for mus, path in ((True, "sound/stepstips.json"), (False, "sound/stepstips-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 31, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + voice + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-steps-tips"] = {"music": [MUSIC], "sfx": sorted(set(WH))}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
