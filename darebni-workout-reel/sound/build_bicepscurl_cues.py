"""Sound for BicepsCurl.jsx (built from build_dbrow_cues.py), from the real-audio library: music plus transition whooshes only (the user finds hits,
clicks and dings childish). Bed: "Rising Forest" (Diego Nava, House, 124 BPM, unused by other projects) from
its loudest bar, ducked to 18% under the clip's opening voice-over. Whooshes: one on each of the clip's camera changes (cut at 6 s, moves at 9 s, 14 s and 18.2 s), one into
the end card and one on its page turn. Writes public/bicepscurl-bed.wav (gitignored), sound/bicepscurl.json, sound/bicepscurl-sfx.json.
  python3 sound/build_bicepscurl_cues.py && python3 <motion-graphics>/scripts/sound.py sound/bicepscurl.json public/bicepscurl.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
import re
CLIP = 458                                               # keep in step with BC.CLIP in BicepsCurl.jsx
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))   # the end card's page turn
DUR = CLIP + END_LEN
MOVES = [(122, 122), (240, 240), (344, 344)]   # the hard cuts at 118, 236, 340 (whoosh 4 frames ahead)   # whoosh lands just before each
MUSIC = "m471"
SFX = {"move": ["s2632", "s1465", "s166", "s1468"], "end": "s2607", "swap": "s1474"}
cat = {m["id"]: m for m in json.load(open(f"{LIB}/catalog.json"))["music"]}
m = cat[MUSIC]
def loudest_start(m, need):
    sr = 2000
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
    bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
    while t + need < len(x) / sr - 2:
        e = x[int(t * sr):int((t + need) * sr)].mean()
        if e > best: best, at = e, t
        t += bar
    return at
start = loudest_start(m, DUR / 30)
out = subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/bicepscurl-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{start:.3f}"], capture_output=True, text=True, check=True).stdout
# duck the bed under the clip's own voice-over (0-4.5 s, played from the clip in DbRow.jsx), then bring it back up
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/bicepscurl-bed.wav", "-af",
  "volume='if(lt(t,4.1),0.18,if(lt(t,4.9),0.18+0.82*(t-4.1)/0.8,1))':eval=frame", "public/bicepscurl-bed-duck.wav"], check=True)
os.replace("public/bicepscurl-bed-duck.wav", "public/bicepscurl-bed.wav")
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm, from {start:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/bicepscurl-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k % 4]), a - 4, 0.32, (-0.3, 0.3, 0, -0.15)[k % 4]) for k, (a, b) in enumerate(MOVES)]
fx += [smp(sfx(SFX["end"]), CLIP - 7, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/bicepscurl.json"), (False, "sound/bicepscurl-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-bicepscurl"] = {"music": [MUSIC], "sfx": sorted(SFX["move"] + [SFX["end"], SFX["swap"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
