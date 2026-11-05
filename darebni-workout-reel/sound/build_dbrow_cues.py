"""Sound for DbRow.jsx (built from build_legpress_cues.py), from the real-audio library: music plus transition whooshes only (the user finds hits,
clicks and dings childish). Bed: "No Warning" (Michael Ramir C., Breakbeat, 110 BPM, unused by other projects) from
its loudest bar, ducked to 18% under the clip's opening voice-over. Whooshes: one on each of the clip's camera changes (cut at 6 s, moves at 9 s, 14 s and 18.2 s), one into
the end card and one on its page turn. Writes public/dbrow-bed.wav (gitignored), sound/dbrow.json, sound/dbrow-sfx.json.
  python3 sound/build_dbrow_cues.py && python3 <motion-graphics>/scripts/sound.py sound/dbrow.json public/dbrow.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
import re
CLIP = 630                                               # keep in step with DR in DbRow.jsx
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))   # the end card's page turn
DUR = CLIP + END_LEN
MOVES = [(181, 181), (272, 272), (422, 422), (549, 549)]   # whoosh lands just before each
MUSIC = "m1150"
SFX = {"move": ["s174", "s1482", "s1490", "s168"], "end": "s2639", "swap": "s1461"}
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
out = subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/dbrow-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{start:.3f}"], capture_output=True, text=True, check=True).stdout
# duck the bed under the clip's own voice-over (0-4.5 s, played from the clip in DbRow.jsx), then bring it back up
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/dbrow-bed.wav", "-af",
  "volume='if(lt(t,4.6),0.18,if(lt(t,5.4),0.18+0.82*(t-4.6)/0.8,1))':eval=frame", "public/dbrow-bed-duck.wav"], check=True)
os.replace("public/dbrow-bed-duck.wav", "public/dbrow-bed.wav")
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm, from {start:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/dbrow-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k % 4]), a - 4, 0.32, (-0.3, 0.3, 0, -0.15)[k % 4]) for k, (a, b) in enumerate(MOVES)]
fx += [smp(sfx(SFX["end"]), CLIP - 7, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/dbrow.json"), (False, "sound/dbrow-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-dbrow"] = {"music": [MUSIC], "sfx": sorted(SFX["move"] + [SFX["end"], SFX["swap"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
