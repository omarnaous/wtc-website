"""Sound for LatRaiseFix.jsx (built from build_pushupfix_cues.py), from the real-audio library: music plus transition whooshes
only. Bed: "Ramp It Up" (Ahjay Stelino, Mixkit, Rhythmic Underscore, 120 BPM, unused by other projects) from its loudest bar, ducked to 18% under
the clip's opening voice-over (0-3.3 s, played from the clip in PushUpFix.jsx). Whooshes: one on each camera move, one as "Do it right" covers the top half, one into the end card and one on its page turn. Writes
public/pushupfix-bed.wav (gitignored), sound/pushupfix.json, sound/pushupfix-sfx.json.
  python3 sound/build_pushupfix_cues.py && python3 <motion-graphics>/scripts/sound.py sound/pushupfix.json public/pushupfix.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
src = open("src/PushUpFix.jsx").read()
CLIP = 809;                                                          # PUF.CLIP = the clip length (PLAYED)
 DEMO = int(re.search(r"DEMO: (\d+)", src).group(1))
MOVES = [int(x) for x in re.search(r"MOVES: \[([^\]]+)\]", src).group(1).split(",")]
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
DUR = CLIP + END_LEN
MUSIC = "m69"
SFX = {"move": ["s1492", "s1491", "s1493", "s1485"], "demo": "s1490", "end": "s1489", "swap": "s1465"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR / 30 < len(x) / sr - 2:
    e = x[int(t * sr):int((t + DUR / 30) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/pushupfix-raw.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/pushupfix-raw.wav", "-af",
  "volume='if(lt(t,3.5),0.18,if(lt(t,4.3),0.18+0.82*(t-3.5)/0.8,1))':eval=frame", "public/pushupfix-bed.wav"], check=True)
os.remove("public/pushupfix-raw.wav")
print("bed:", m["title"], "by", m["artist"], f"(from {at:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/pushupfix-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["move"][k % 4]), a - 4, 0.26, (-0.25, 0.25)[k % 2]) for k, a in enumerate(MOVES)] + [smp(sfx(SFX["demo"]), DEMO - 6, 0.3, 0.2)]
fx += [smp(sfx(SFX["end"]), CLIP - 8, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/pushupfix.json"), (False, "sound/pushupfix-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-pushupfix"] = {"music": [MUSIC], "sfx": sorted(set(SFX["move"] + [SFX["demo"], SFX["end"], SFX["swap"]]))}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
