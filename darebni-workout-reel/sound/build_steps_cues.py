"""Sound for StepsToon.jsx from src/steps.json: the two voices; "Life is a Dream" (Michael Ramir C., disco, 120 BPM, unused
elsewhere) as the bed, ducked under every line; and effects tied to what happens on screen: a ticking clock under the
midnight scene, pops as the step count and the goal land, a small crowd laugh on Sam's "Bro…", a record scratch + reel
rewind into the 1965 flashback, a camera shutter on "1965", a slide as the kanji walks off and a punch on the stamp,
a tech slide into the chart, pops on the study badge and "10K?", a success chime on −47%, a long pop on the Zzz, and a
dazzle hit + chimes on the sign-off. Writes public/steps-bed.wav (gitignored), sound/steps.json, sound/steps-sfx.json.
  python3 sound/build_steps_cues.py && python3 <motion-graphics>/scripts/sound.py sound/steps.json public/steps.wav"""
import json, os, subprocess, sys
import numpy as np, scipy.io.wavfile as wf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
M = json.load(open("src/steps.json")); L = M["lines"]; DUR = M["DURATION"]; FPS = 30
MUSIC = "m837"
m = next(x for x in json.load(open(f"{LIB}/catalog.json"))["music"] if x["id"] == MUSIC)
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/steps-raw.wav", "--dur", f"{DUR / FPS + 1:.2f}", "--start", f"{m['first_beat'] + 4 * 60 / m['bpm'] * 8:.3f}", "--gain", "0.9", "--fade", "0.01"], check=True, capture_output=True)
sr, raw = wf.read("public/steps-raw.wav"); raw = raw.astype(np.float32) / 32768
# duck under speech: 1.0 between lines, 0.3 under them
env = np.ones(DUR + 30)
for l in L: env[max(0, l["at"] - 3):l["at"] + l["dur"] + 3] = 0.3
env = np.convolve(env, np.ones(7) / 7, "same")
g = np.interp(np.arange(len(raw)) / sr * FPS, np.arange(len(env)), env)
fade = np.clip((len(raw) - np.arange(len(raw))) / (1.5 * sr), 0, 1)
bed = raw * ((g * fade)[:, None] if raw.ndim == 2 else g * fade)
wf.write("public/steps-bed.wav", sr, (np.clip(bed, -1, 1) * 32767).astype(np.int16)); os.remove("public/steps-raw.wav")
X = lambda i: f"{LIB}/sfx/{i}.mp3"
smp = lambda f, frame, gn, pan=0.0: {"type": "sample", "file": f, "frame": int(frame), "gain": gn, "pan": pan}
music = [smp(os.path.abspath("public/steps-bed.wav"), 0, 0.4)]
voice = [smp(os.path.abspath(f"public/{fl}"), l["at"], 1.0 if len(l["files"]) == 1 else 0.75, (-0.12 if fl.endswith("K.wav") else 0.12) if len(l["files"]) > 1 else 0) for l in L for fl in l["files"]]
at = {l["i"]: l for l in L}
mk = lambda i, name: at[i]["at"] + at[i]["marks"][name]
os.makedirs("public/steps", exist_ok=True)
cut = lambda src, out, t, fo=0.4: subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", X(src), "-t", str(t), "-af", f"afade=t=in:d=0.05,afade=t=out:st={max(0.05, t - fo)}:d={fo}", out], check=True)
cut("s1045", "public/steps/tick.wav", (M["scenes"]["origin"]["title"] - 6) / FPS, 0.6)       # the clock ticks until the flashback
cut("s424", "public/steps/laugh.wav", 1.2, 0.6)
fx = [smp(os.path.abspath("public/steps/tick.wav"), 0, 0.16)]
fx += [smp(X("s2357"), mk(0, "count"), 0.3), smp(X("s2364"), mk(0, "goal"), 0.36), smp(os.path.abspath("public/steps/laugh.wav"), at[1]["at"] + 4, 0.12)]
fx += [smp(X("s2359"), at[2]["at"], 0.3)]
WH = ["s1489", "s1492"]
for j, s in enumerate(x for x in M["scenes"].values() if x["title"] is not None):
    fx += [smp(X(WH[j % 2]), s["title"] - 6, 0.32), smp(X("s3005"), s["title"] + 2, 0.45)]
o = M["scenes"]["origin"]["title"]
fx += [smp(X("s704"), o - 2, 0.4), smp(X("s1095"), o + 4, 0.25), smp(X("s1438"), mk(3, "year"), 0.4), smp(X("s2357"), mk(3, "box"), 0.3)]
fx += [smp(X("s2363"), mk(4, "walker"), 0.3), smp(X("s2149"), mk(4, "walker") + 18, 0.38)]
fx += [smp(X("s3120"), at[6]["at"] + 4, 0.3), smp(X("s2364"), mk(6, "studies"), 0.32), smp(X("s2357"), mk(6, "seven"), 0.3), smp(X("s2039"), mk(6, "drop"), 0.34)]
fx += [smp(X("s2364"), mk(7, "ten"), 0.3), smp(X("s2358"), mk(10, "zzz"), 0.3), smp(os.path.abspath("public/steps/laugh.wav"), at[10]["at"] + 2, 0.1)]
fx += [smp(X("s746"), at[11]["at"] - 2, 0.3), smp(X("s2357"), mk(12, "follow") + 2, 0.3), smp(X("s270"), mk(13, "download") + 2, 0.3)]
for mus, path in ((True, "sound/steps.json"), (False, "sound/steps-sfx.json")):
    spec = {"fps": FPS, "duration": DUR / FPS, "seed": 52, "fade_out": 1.0, "peak_db": -1.5, "cues": (music if mus else []) + voice + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "effect files")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-steps-cartoon"] = {"music": [MUSIC], "sfx": sorted({os.path.basename(c["file"])[:-4] for c in fx} - {"tick", "laugh"} | {"s1045", "s424"})}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
