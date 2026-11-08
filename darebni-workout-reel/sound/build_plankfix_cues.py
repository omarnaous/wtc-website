"""Sound for PlankFix.jsx (built from build_plankfix_cues.py), from the real-audio library: music plus transition whooshes only. Bed:
"Karma" (Michael Ramir C., EDM, 128 BPM, unused by other projects) from its loudest bar, ducked to 18% under the clip's
opening voice-over (0-2.2 s). Whooshes: one on each camera change (the move to the neck, the two hard cuts around the
back shot, the moves to the feet and to the last wide plank), one into
the end card and one on its page turn. Writes public/plankfix-bed.wav (gitignored), sound/plankfix.json, sound/plankfix-sfx.json.
  python3 sound/build_plankfix_cues.py && python3 <motion-graphics>/scripts/sound.py sound/plankfix.json public/plankfix.wav"""
import json, os, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
import re
CLIP = 633                                               # keep in step with PF.CLIP in PlankFix.jsx
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))   # the end card's page turn
DUR = CLIP + END_LEN
MOVES = [(162, 162), (250, 250), (317, 317), (396, 396), (501, 501)]   # camera move 158, hard cuts 246 / 313, moves 392 / 497 (whoosh 4 frames ahead)
MUSIC = "m1183"
SFX = {"move": ["s1492", "s1491", "s1489", "s1493"], "end": "s3220", "swap": "s1465"}
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
out = subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/plankfix-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{start:.3f}"], capture_output=True, text=True, check=True).stdout
# duck the bed under the clip's own voice-over (0-2.2 s, played from the clip in PlankFix.jsx), then bring it back up
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/plankfix-bed.wav", "-af",
  "volume='if(lt(t,2.4),0.18,if(lt(t,3.2),0.18+0.82*(t-2.4)/0.8,1))':eval=frame", "public/plankfix-bed-duck.wav"], check=True)
os.replace("public/plankfix-bed-duck.wav", "public/plankfix-bed.wav")
print("bed:", m["title"], "by", m["artist"], f"({m['bpm']} bpm, from {start:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/plankfix-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k % 4]), a - 4, 0.32, (-0.3, 0.3, 0, -0.15)[k % 4]) for k, (a, b) in enumerate(MOVES)]
fx += [smp(sfx(SFX["end"]), CLIP - 7, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/plankfix.json"), (False, "sound/plankfix-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-plankfix"] = {"music": [MUSIC], "sfx": sorted(SFX["move"] + [SFX["end"], SFX["swap"]])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
