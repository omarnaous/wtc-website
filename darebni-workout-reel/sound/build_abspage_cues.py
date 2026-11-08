"""Sound for AbsPage.jsx (the one-page abs day, same format as GlutesPage): music plus transitions only. Bed: "Flopper"
(Michael Ramir C., Mixkit, EDM, 125 BPM, stretched to 120 BPM so the tiles land on the beat), from its loudest bar. A whoosh as the photo shrinks
into the header, a soft swish under each row landing (rotating 4 files, low), a bigger whoosh into the end card and
one on its page turn. Writes public/abspage-bed.wav (gitignored), sound/abspage.json, -sfx.json.
  python3 sound/build_abspage_cues.py && python3 <motion-graphics>/scripts/sound.py sound/abspage.json public/abspage.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
END_LEN = int(re.search(r"\bEND_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
src = open("src/AbsPage.jsx").read()
ABP = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const ABP = \{([^}]+)\}", src).group(1))}
N_ROWS = 9
BUILT = ABP["ROW0"] + N_ROWS * ABP["BEAT"]; OUTRO = BUILT + ABP["HOLD"]; DUR = OUTRO + END_LEN
MUSIC = "m1222"
SFX = {"shrink": "s1492", "row": ["s1491", "s1489", "s2161", "s1499"], "end": "s3220", "swap": "s1465"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
k = 120 / m["bpm"]; need = DUR / 30 / k
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/abspage-raw.wav", "--dur", f"{need + 0.05:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/abspage-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", "public/abspage-bed.wav"], check=True)
os.remove("public/abspage-raw.wav")
print("bed:", m["title"], f"from {at:.2f} s, {DUR} frames")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/abspage-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["shrink"]), ABP["SHRINK"] - 6, 0.3)]
fx += [smp(sfx(SFX["row"][j % 4]), ABP["ROW0"] + j * ABP["BEAT"] - 4, 0.13, (-0.3, 0.3)[j % 2]) for j in range(N_ROWS)]
fx += [smp(sfx(SFX["end"]), OUTRO - 9, 0.32), smp(sfx(SFX["swap"]), OUTRO + SWAP - 7, 0.28)]
for mus, path in ((True, "sound/abspage.json"), (False, "sound/abspage-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 15, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used.setdefault("darebni-abs", {"music": [MUSIC], "sfx": []})
used["darebni-abs"]["sfx"] = sorted(set(used["darebni-abs"]["sfx"]) | {SFX["shrink"], SFX["end"], SFX["swap"], *SFX["row"]})
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
