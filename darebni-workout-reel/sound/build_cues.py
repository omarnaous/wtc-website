"""Sound for the Darebni push-day reel (Main.jsx, timing.js), from the real-audio library
(.claude/skills/appify-content/assets/tools/sound_library.py). An unused gym-energy track is cut on a downbeat and
time-stretched to 120 BPM as the bed, so the cards (every 8 beats) and the rep snaps (once a second) sit on its grid. Effects rotate
so nothing repeats back to back: whooshes on card changes, sub-bass hits on the 2 rep tops per card (4 variants) with a quiet real gym-metal clank on the second, clicks on
the stat chips, an impact on the first exercise and the finisher, on the 5 s end card a tick per checklist point and a notification on the download button. Picks are saved
in sound/picks-pushday.json (delete to re-pick). Writes public/pushday-bed.wav, sound/cues.json, sound/cues-sfx.json.
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, os, re, subprocess, sys
LIBTOOL = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.claude/skills/appify-content/assets/tools/sound_library.py"))
PROJECT = "darebni-pushday"
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
EX0, EX_LEN, N_EX = n("EX0"), n("EX_LEN"), n("N_EX")
FIN = EX0 + EX_LEN * N_EX; OUTRO = FIN + 75; DUR = OUTRO + n("END_LEN")
main = open("src/Main.jsx").read()
TICKS = [int(x) for x in re.findall(r"\{ at: (\d+), big:", main)]; CTA = int(re.search(r"OUTRO_CTA = (\d+)", main).group(1))
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
# the reel is cut on a 120 BPM grid (a rep per second); a track at another tempo is time-stretched to 120 (pitch kept)
k = 120 / P["music"]["bpm"]
bed = json.loads(lib("bed", P["music"]["id"], "public/pushday-raw.wav", "--dur", f"{DUR / 30 / k + 0.05:.3f}", "--gain", "0.9"))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/pushday-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", "public/pushday-bed.wav"], check=True)
os.remove("public/pushday-raw.wav")
print("bed:", bed["title"], "by", P["music"]["artist"], f"({bed['bpm']} bpm stretched to 120, from {bed['start']} s)")
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
        fx += [smp(P["rep"][r % len(P["rep"])], a + 15 + 30 * k, 0.5, (-0.1, 0.1)[r % 2])]
        if k: fx += [smp(P["metal"][i % len(P["metal"])], a + 15 + 30 * k, 0.16)]
        r += 1
fx += [smp(P["whoosh"][-1], FIN - 8, 0.45), smp(P["impact"][1], FIN, 0.6)]
fx += [smp(P["rep"][(r + k) % len(P["rep"])], FIN + 15 + 30 * k, 0.45) for k in range(2)]
# end card: whoosh in, the phone rising, a tick per checklist point, the notification on the download button
fx += [smp(P["whoosh"][-2], OUTRO - 8, 0.4), smp(P["whoosh"][0], OUTRO + 6, 0.3)]
fx += [smp(P["tick"][j % len(P["tick"])], OUTRO + a, 0.4) for j, a in enumerate(TICKS)]
fx += [smp(P["impact"][0], OUTRO + CTA, 0.35), smp(P["ding"][0], OUTRO + CTA + 2, 0.5)]
for mus, out in ((True, "sound/cues.json"), (False, "sound/cues-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 4, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "different effect files")
