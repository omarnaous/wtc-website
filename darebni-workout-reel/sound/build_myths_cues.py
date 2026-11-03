"""Sound for MythsCartoon.jsx from src/myths.json: the voices; "Funkee Monkeee" (Michael Ramir C., funk, unused
elsewhere) as the bed, ducked under every line; and effects tied to what happens on screen: a whoosh + hit on each
myth title slam, a record scratch on each freeze-frame intro, pops for Karim's claims, correct-answer tones for the
facts, stamps, scissors for the barber, a zap for the brain, a boing for the scale, bubbles for water, a crowd laugh
on the jokes. Writes public/myths-bed.wav (gitignored), sound/myths.json, sound/myths-sfx.json.
  python3 sound/build_myths_cues.py && python3 <motion-graphics>/scripts/sound.py sound/myths.json public/myths.wav"""
import json, os, subprocess, sys
import numpy as np, scipy.io.wavfile as wf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
M = json.load(open("src/myths.json")); L = M["lines"]; DUR = M["DURATION"]; FPS = 30
MUSIC = "m1140"
m = next(x for x in json.load(open(f"{LIB}/catalog.json"))["music"] if x["id"] == MUSIC)
# the bed loops the track's body to cover the whole story (track is 98 s, story ~104 s)
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/myths-raw.wav", "--dur", "90", "--start", f"{m['first_beat'] + 4 * 60 / m['bpm'] * 2:.3f}", "--gain", "0.9", "--fade", "0.01"], check=True, capture_output=True)
sr, raw = wf.read("public/myths-raw.wav"); raw = raw.astype(np.float32) / 32768
need = int(DUR / FPS * sr) + sr
bar = int(round(4 * 60 / m["bpm"] * sr)); body = raw[: (len(raw) // bar) * bar]
loop = np.concatenate([body] * (need // len(body) + 1))[:need]
# duck under speech: 1.0 between lines, 0.32 under them, 0.2 s ramps; full level under title slams
env = np.ones(DUR + 30)
for l in L:
    a, b = l["at"] - 3, l["at"] + l["dur"] + 3
    env[max(0, a):b] = 0.32
k = np.ones(7) / 7; env = np.convolve(env, k, "same")
g = np.interp(np.arange(len(loop)) / sr * FPS, np.arange(len(env)), env)
fade = np.clip((len(loop) - np.arange(len(loop))) / (1.5 * sr), 0, 1)
bed = loop * (g * fade)[:, None] if loop.ndim == 2 else loop * g * fade
wf.write("public/myths-bed.wav", sr, (np.clip(bed, -1, 1) * 32767).astype(np.int16)); os.remove("public/myths-raw.wav")
X = lambda i: f"{LIB}/sfx/{i}.mp3"
smp = lambda f, frame, gn, pan=0.0: {"type": "sample", "file": f, "frame": int(frame), "gain": gn, "pan": pan}
music = [smp(os.path.abspath("public/myths-bed.wav"), 0, 0.42)]
voice = [smp(os.path.abspath(f"public/{fl}"), l["at"], 1.0 if len(l["files"]) == 1 else 0.75, (-0.12 if fl.endswith("K.wav") else 0.12) if len(l["files"]) > 1 else 0) for l in L for fl in l["files"]]
fx = []
WH = ["s1468", "s1471", "s2632", "s1461", "s1482", "s1474"]
for j, s in enumerate(x for x in M["scenes"].values() if x["title"] is not None):
    fx += [smp(X(WH[j % len(WH)]), s["title"] - 6, 0.34), smp(X("s3005"), s["title"] + 2, 0.5)]
holds = [l["hold"] for l in L if l.get("hold")]
for j, h in enumerate(holds): fx += [smp(X(["s704", "s709"][j % 2]), h["at"], 0.5)]
at = {l["i"]: l for l in L}
def mk(i, name): return at[i]["at"] + at[i]["marks"][name]
fx += [smp(X("s2354"), mk(2, "bald"), 0.35, -0.3), smp(X("s2357"), mk(2, "kidney"), 0.35), smp(X("s2356"), mk(2, "weight"), 0.35, 0.3)]
fx += [smp(X("s2364"), mk(3, "degree"), 0.4), smp(X("s424"), at[3]["at"] + at[3]["dur"] - 10, 0.32)]
fx += [smp(X("s1106"), mk(5, "studies"), 0.4), smp(X("s947"), mk(5, "bars") + 30, 0.35), smp(X("s957"), mk(6, "reps"), 0.35)]
fx += [smp(X("s1317"), at[7]["at"] + 8, 0.4), smp(X("s949"), at[7]["at"] + 70, 0.35)]
fx += [smp(X("s2624"), at[l]["at"], 0.3) for l in (7, 15, 18)]
fx += [smp(X("s952"), mk(9, "issn"), 0.35), smp(X("s2014"), at[10]["at"] + 4, 0.35), smp(X("s586"), at[11]["at"] + 4, 0.3)]
fx += [smp(X("s1430"), mk(14, "stamp"), 0.5), smp(X("s2378"), at[15]["at"] + 6, 0.45), smp(X("s954"), at[15]["at"] + 50, 0.3)]
fx += [smp(X("s2365"), mk(17, "brain"), 0.4), smp(X("s3060"), mk(17, "study"), 0.35), smp(X("s2050"), mk(18, "flex"), 0.35), smp(X("s2963"), mk(19, "warn"), 0.3)]
fx += [smp(X("s2894"), at[20]["at"] + 12, 0.4), smp(X("s3000"), mk(21, "water"), 0.4), smp(X("s2876"), mk(21, "fat"), 0.35), smp(X("s2870"), at[23]["at"], 0.35)]
fx += [smp(X("s1124"), mk(25, "scoop"), 0.4), smp(X("s2358"), mk(25, "nomagic"), 0.35), smp(X("s2354"), mk(25, "nomagic") + 10, 0.3)]
fx += [smp(X("s424"), at[27]["at"] + at[27]["dur"] - 4, 0.36), smp(X("s459"), at[28]["at"] + at[28]["dur"] - 6, 0.3), smp(X("s2018"), M["END"] + 20, 0.35)]
for mus, path in ((True, "sound/myths.json"), (False, "sound/myths-sfx.json")):
    spec = {"fps": FPS, "duration": DUR / FPS, "seed": 51, "fade_out": 1.0, "peak_db": -1.5, "cues": (music if mus else []) + voice + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "effect files")
used = json.load(open(f"{LIB}/used.json")); used["darebni-myths-cartoon"] = {"music": [MUSIC], "sfx": sorted({os.path.basename(c["file"])[:-4] for c in fx})}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
