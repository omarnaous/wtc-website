"""Sound for LungeFix.jsx (built from build_legpress_cues.py), from the real-audio library: music plus transition whooshes
only. Bed: "K.O. Games" (Michael Ramir C., Breakbeat, 111 BPM, unused by other projects) from its loudest bar, ducked to
18% under the clip's opening voice-over (0-4 s, played from the clip in LungeFix.jsx). Whooshes: one on the clip's camera
orbit (side -> front), one as "Do it right" covers the top half, one into the end card and one on its page turn. Writes
public/lungefix-bed.wav (gitignored), sound/lungefix.json, sound/lungefix-sfx.json.
  python3 sound/build_lungefix_cues.py && python3 <motion-graphics>/scripts/sound.py sound/lungefix.json public/lungefix.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
src = open("src/LungeFix.jsx").read()
CLIP = int(re.search(r"CLIP: (\d+)", src).group(1)); ORBIT = int(re.search(r"ORBIT: (\d+)", src).group(1)); DEMO = int(re.search(r"DEMO: (\d+)", src).group(1))
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
DUR = CLIP + END_LEN
MUSIC = "m1103"
SFX = {"orbit": "s1493", "demo": "s1490", "end": "s1489", "swap": "s1491"}
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR / 30 < len(x) / sr - 2:
    e = x[int(t * sr):int((t + DUR / 30) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/lungefix-raw.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/lungefix-raw.wav", "-af",
  "volume='if(lt(t,4.1),0.18,if(lt(t,4.9),0.18+0.82*(t-4.1)/0.8,1))':eval=frame", "public/lungefix-bed.wav"], check=True)
os.remove("public/lungefix-raw.wav")
print("bed:", m["title"], "by", m["artist"], f"(from {at:.2f} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
music = [smp(os.path.abspath("public/lungefix-bed.wav"), 0, 0.85)]
fx = [smp(sfx(SFX["orbit"]), ORBIT - 2, 0.3, -0.2), smp(sfx(SFX["demo"]), DEMO - 6, 0.3, 0.2)]
fx += [smp(sfx(SFX["end"]), CLIP - 8, 0.32), smp(sfx(SFX["swap"]), CLIP + SWAP - 7, 0.3)]
for mus, path in ((True, "sound/lungefix.json"), (False, "sound/lungefix-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-lungefix"] = {"music": [MUSIC], "sfx": sorted(SFX.values())}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
