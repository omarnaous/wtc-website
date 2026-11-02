"""Sound for the Darebni push-day reel (Main.jsx, timing.js), from the real-audio library
(.claude/skills/appify-content/assets/tools/sound_library.py). An unused gym-energy track is cut on a downbeat and
time-stretched to 120 BPM as the bed, so the cards (every 8 beats) and the rep snaps (once a second) sit on its grid. Effects are
transitions only (no rep hits, clicks or dings): a whoosh on every cut, six files rotating, and a bigger one into the end card. Picks are saved
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
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", main).group(1))   # the end card's page turn
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
# MUSIC=<catalog id> swaps the bed for an alternative cut (sound-<id>.wav); START=<s> overrides where it starts
ALT = os.environ.get("MUSIC")
if ALT:
    cat = json.load(open(os.path.join(os.path.dirname(LIBTOOL), "../../../../../sound-library/catalog.json")))
    P = dict(P, music=next(m for m in cat["music"] if m["id"] == ALT))
# the reel is cut on a 120 BPM grid (a rep per second); a track at another tempo is time-stretched to 120 (pitch kept)
k = 120 / P["music"]["bpm"]
def loudest_start(m, need):
    """the start (on a bar line) of the loudest stretch of the track, so the reel sits on the drop, not the intro"""
    import numpy as np
    sr = 2000
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(os.path.dirname(LIBTOOL), "../../../../../sound-library", m["file"]), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32) ** 2
    bar = 4 * 60 / m["bpm"]; best, at = -1, None
    t = m["first_beat"]
    while t + need < len(x) / sr - 2:
        e = x[int(t * sr):int((t + need) * sr)].mean()
        if e > best: best, at = e, t
        t += bar
    return at
start = os.environ.get("START") or f"{loudest_start(P['music'], DUR / 30 / k):.3f}"
bed = json.loads(lib("bed", P["music"]["id"], "public/pushday-raw.wav", "--dur", f"{DUR / 30 / k + 0.05:.3f}", "--gain", "0.9", "--start", start))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "public/pushday-raw.wav", "-af", f"atempo={k:.5f}", "-t", f"{DUR / 30:.3f}", "public/pushday-bed.wav"], check=True)
os.remove("public/pushday-raw.wav")
print("bed:", bed["title"], "by", P["music"]["artist"], f"({bed['bpm']} bpm stretched to 120, from {bed['start']} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": os.path.abspath(f), "frame": round(frame), "gain": g, "pan": pan}
music = [smp("public/pushday-bed.wav", 0, 0.85)]
# only the music and a whoosh on each transition (the user found rep hits, clicks and dings childish):
# intro -> first exercise, every card change, into the finisher, and a bigger whoosh into the end card
cuts = [EX0 + i * EX_LEN for i in range(N_EX)] + [FIN]
fx = [smp(P["transition"][j % len(P["transition"])], c - 7, 0.3, (-0.25, 0.25)[j % 2]) for j, c in enumerate(cuts)]
fx += [smp(P["transition_big"], OUTRO - 9, 0.34), smp(P["transition"][len(cuts) % len(P["transition"])], OUTRO + SWAP - 7, 0.3)]
outs = ((True, f"sound/cues-{ALT}.json"),) if ALT else ((True, "sound/cues.json"), (False, "sound/cues-sfx.json"))
for mus, out in outs:
    spec = {"fps": 30, "duration": DUR / 30, "seed": 4, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "different effect files")
