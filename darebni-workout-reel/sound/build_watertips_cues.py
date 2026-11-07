"""Sound for WaterTips.jsx: a real music bed plus transitions and water foley tied to what is on screen. Bed: "You're
Somewhere in Between" (Michael Ramir C., Mixkit, Disco, 120 BPM, so the kinetic beats land on it), from its loudest bar.
Whooshes on every scene change and tip card; a splash as the bottle lands, bubbles as it fills and refills, drips as it
drains; a low thump (synthesised) under each stat and the bench number. Writes public/watertips-bed.wav (gitignored),
sound/watertips.json, sound/watertips-sfx.json.
  python3 sound/build_watertips_cues.py && python3 <motion-graphics>/scripts/sound.py sound/watertips.json public/watertips.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
src = open("src/WaterTips.jsx").read()
WT = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const WT = \{([^}]+)\}", src).group(1))}
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
DUR = WT["OUTRO"] + END_LEN
MUSIC = "m928"
WH = ["s1492", "s1491", "s1489", "s787", "s1485", "s1493"]
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR / 30 < len(x) / sr - 1:
    e = x[int(t * sr):int((t + DUR / 30) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/watertips-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
print("bed:", m["title"], f"from {at:.2f} s, {DUR} frames")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
thump = lambda frame, g=0.5: {"type": "thump", "frame": round(frame), "gain": g}
music = [smp(os.path.abspath("public/watertips-bed.wav"), 0, 0.8)]
B, TL = WT["TIPS"] + 20, WT["TIP_LEN"]
moves = [WT["DROP"], WT["STATS"], WT["BENCH"], WT["TIPS"], B + TL - 12, B + 2 * TL - 12, WT["BRIDGE"]]
fx = [smp(sfx(WH[k % len(WH)]), a - 5, 0.26, (-0.25, 0.25)[k % 2]) for k, a in enumerate(moves)]
fx += [smp(sfx("s754"), WT["BOTTLE"] + 12, 0.35), smp(sfx("s3000"), WT["BOTTLE"] + 20, 0.3), smp(sfx("s3000"), WT["BOTTLE"] + 40, 0.22, 0.2)]
fx += [smp(sfx("s1317"), WT["DRAIN"] + 6 + k * 9, 0.28, (-0.3, 0, 0.3)[k]) for k in range(3)]
fx += [thump(WT["ROW0"] + k * WT["ROW_STEP"], 0.45) for k in range(3)] + [thump(WT["BENCH"] + 40, 0.55), thump(WT["DRAIN"] + 12, 0.4)]
fx += [smp(sfx("s3000"), WT["BRIDGE"] + 8, 0.3), smp(sfx("s3000"), WT["BRIDGE"] + 28, 0.24, -0.2)]
fx += [smp(sfx("s1489"), WT["OUTRO"] - 9, 0.32), smp(sfx("s1491"), WT["OUTRO"] + SWAP - 7, 0.28)]
for mus, path in ((True, "sound/watertips.json"), (False, "sound/watertips-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 31, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-water"] = {"music": [MUSIC], "sfx": sorted(set(WH + ["s754", "s3000", "s1317"]))}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
