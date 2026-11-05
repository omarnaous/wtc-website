"""Sound for DeltsArmsPage.jsx (the one-page version of the delts + arms reel): music plus transitions only. Same bed as
DeltsArms ("Siren Song", Michael Ramir C., stretched to 120 BPM, from its loudest bar). A whoosh as the photo shrinks
into the header, a soft swish under each row landing (rotating 4 files, low), a bigger whoosh into the end card and
one on its page turn. Writes public/deltsarmspage-bed.wav (gitignored), sound/deltsarmspage.json, -sfx.json.
  python3 sound/build_deltsarmspage_cues.py && python3 <motion-graphics>/scripts/sound.py sound/deltsarmspage.json public/deltsarmspage.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
END_LEN = int(re.search(r"\bEND_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
src = open("src/DeltsArmsPage.jsx").read()
DP = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const DP = \{([^}]+)\}", src).group(1))}
N_ROWS = 9
BUILT = DP["ROW0"] + N_ROWS * DP["BEAT"]; OUTRO = BUILT + DP["HOLD"]; DUR = OUTRO + END_LEN
MUSIC = "m1155"
SFX = {"shrink": "s2632", "row": ["s168", "s1461", "s174", "s1482"], "end": "s3220", "swap": "s1465"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
k = 120 / m["bpm"]; need = DUR / 30 / k
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/deltsarmspage-raw.wav", "--dur", f"{need + 0.05:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/deltsarmspage-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", "public/deltsarmspage-bed.wav"], check=True)
os.remove("public/deltsarmspage-raw.wav")
print("bed:", m["title"], f"from {at:.2f} s, {DUR} frames")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/deltsarmspage-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["shrink"]), DP["SHRINK"] - 6, 0.3)]
fx += [smp(sfx(SFX["row"][j % 4]), DP["ROW0"] + j * DP["BEAT"] - 4, 0.13, (-0.3, 0.3)[j % 2]) for j in range(N_ROWS)]
fx += [smp(sfx(SFX["end"]), OUTRO - 9, 0.32), smp(sfx(SFX["swap"]), OUTRO + SWAP - 7, 0.28)]
for mus, path in ((True, "sound/deltsarmspage.json"), (False, "sound/deltsarmspage-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 15, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used.setdefault("darebni-deltsarms", {"music": [MUSIC], "sfx": []})
used["darebni-deltsarms"]["sfx"] = sorted(set(used["darebni-deltsarms"]["sfx"]) | {SFX["shrink"], SFX["end"], SFX["swap"], *SFX["row"]})
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
