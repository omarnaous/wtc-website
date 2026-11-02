"""Sound for CreatineStory.jsx: "Complicated" (Arulo, hip hop, unused elsewhere) from its loudest stretch as the bed, and
a whoosh on each scene change and a deeper one as the jar's lid pops (the user wants music + transitions, nothing else). Writes public/creatine-bed.wav
(gitignored), sound/creatine2.json, sound/creatine2-sfx.json.
  python3 sound/build_creatine_cues.py && python3 <motion-graphics>/scripts/sound.py sound/creatine2.json public/creatine2.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
src = open("src/CreatineStory.jsx").read()
SC = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const CS = \{(.*?)\};", src).group(1))}
DUR = SC["DURATION"]; CUTS = [SC[k] for k in ("W1", "STR", "HAIR", "BRAIN", "BLOOD", "SCORE", "FIN", "END")]
MUSIC = "m281"
WHOOSH = ["s2627", "s2632", "s1488", "s2611", "s1490"]   # Fast swipe zoom, Whoosh wind sweep, Throw hard wind woosh, Weird swish glassy whoosh, Fast whoosh transition
POP = SC["FIN"] + 44                                  # the lid pops: a deeper whoosh
m = next(x for x in json.load(open(f"{LIB}/catalog.json"))["music"] if x["id"] == MUSIC)
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar, need = 4 * 60 / m["bpm"], DUR / 30
t, best, start = m["first_beat"], -1, 0
while t + need < len(x) / sr - 2:
    e = x[int(t * sr):int((t + need) * sr)].mean()
    if e > best: best, start = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/creatine2-bed.wav", "--dur", f"{need:.3f}", "--start", f"{start:.3f}", "--gain", "0.9"], check=True, capture_output=True)
print("bed:", m["title"], "by", m["artist"], f"from {start:.2f} s")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": frame, "gain": g, "pan": pan}
music = [smp(os.path.abspath("public/creatine2-bed.wav"), 0, 0.85)]
fx = [smp(f"{LIB}/sfx/{WHOOSH[k % len(WHOOSH)]}.mp3", c - 7, 0.3, (-0.3, 0.3)[k % 2]) for k, c in enumerate(CUTS)]
fx += [smp(f"{LIB}/sfx/s1486.mp3", POP - 10, 0.34)]      # Cinematic tunnel reverb woosh
for mus, path in ((True, "sound/creatine2.json"), (False, "sound/creatine2-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 31, "fade_out": 1.4, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json")); used["darebni-creatine-story"] = {"music": [MUSIC], "sfx": sorted(WHOOSH + ["s1486"])}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
