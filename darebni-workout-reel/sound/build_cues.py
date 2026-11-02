"""Sound for the Darebni push-day reel (Main.jsx, timing.js), from the real-audio library
(.claude/skills/appify-content/assets/tools/sound_library.py). An unused gym-energy track near 120 BPM is cut on a
downbeat as the bed, so the cards (every 8 beats) and the rep snaps (once a second) sit on its grid. Effects rotate
so nothing repeats back to back: whooshes on card changes, metal/weight hits on the 2 rep tops per card (4 variants), clicks on
the stat chips, an impact on the first exercise and the finisher, a whoosh as the phones rise and a notification on the download button. Picks are saved
in sound/picks-pushday.json (delete to re-pick). Writes public/pushday-bed.wav, sound/cues.json, sound/cues-sfx.json.
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, os, re, subprocess, sys
LIBTOOL = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.claude/skills/appify-content/assets/tools/sound_library.py"))
PROJECT = "darebni-pushday"
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
EX0, EX_LEN, N_EX = n("EX0"), n("EX_LEN"), n("N_EX")
FIN = EX0 + EX_LEN * N_EX; OUTRO = FIN + 75; DUR = OUTRO + 120
lib = lambda *a: subprocess.run([sys.executable, LIBTOOL, *a], capture_output=True, text=True, check=True).stdout
NOPE = "game,arcade,video-game,cartoon,toy,8-bit,funny,animals,water,error"
def files(tag, k, title=None, ex=NOPE):
    args = ["sfx", tag, "--n", str(k), "--project", PROJECT, "--max-dur", "3", "--exclude", ex] + (["--title", title] if title else [])
    return [l.split("\t")[0] for l in lib(*args).strip().splitlines()]
if os.path.exists("sound/picks-pushday.json"):
    P = json.load(open("sound/picks-pushday.json"))
else:
    P = {"music": json.loads(lib("pick-music", "--mood", "gym-energy", "--min-bpm", "110", "--max-bpm", "135", "--project", PROJECT)),
         "whoosh": files("whoosh", 4) + files("transition", 2), "rep": files("metal", 4, title="hit|clank|impact|metal|drop|bang"),
         "click": files("click", 3, title="click|tap|select|switch"), "impact": files("impact", 2, title="impact|hit|boom|punch|thud"),
         "ding": files("notification", 1, title="ding|chime|bell|positive|success")}
    json.dump(P, open("sound/picks-pushday.json", "w"), indent=1)
bed = json.loads(lib("bed", P["music"]["id"], "public/pushday-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9"))
print("bed:", bed["title"], "by", P["music"]["artist"], f"({bed['bpm']} bpm, from {bed['start']} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": os.path.abspath(f), "frame": round(frame), "gain": g, "pan": pan}
music = [smp("public/pushday-bed.wav", 0, 0.55)]
fx = [smp(P["click"][k % len(P["click"])], 22 + k * 4, 0.3) for k in range(4)]
fx += [smp(P["impact"][0], EX0, 0.6)]
r = 0
for i in range(N_EX):
    a = EX0 + i * EX_LEN
    if i: fx += [smp(P["whoosh"][i % len(P["whoosh"])], a - 8, 0.4, (-0.3, 0.3)[i % 2])]
    fx += [smp(P["click"][(i + k) % len(P["click"])], a + 6 + k * 4, 0.22) for k in range(3)]
    for k in range(2):
        fx += [smp(P["rep"][r % len(P["rep"])], a + 15 + 30 * k, 0.32, (-0.15, 0.15)[r % 2])]; r += 1
fx += [smp(P["whoosh"][-1], FIN - 8, 0.45), smp(P["impact"][1], FIN, 0.6)]
fx += [smp(P["rep"][k % len(P["rep"])], FIN + 15 + 30 * k, 0.3) for k in range(2)]
fx += [smp(P["whoosh"][-2], OUTRO - 8, 0.4), smp(P["whoosh"][0], OUTRO + 6, 0.3), smp(P["ding"][0], OUTRO + 30, 0.5)]
for mus, out in ((True, "sound/cues.json"), (False, "sound/cues-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 4, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "different effect files")
