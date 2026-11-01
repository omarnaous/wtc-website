"""Sound for FormClip.jsx (the supplied skull-crusher footage + Darebni labels), built from the real-audio library
(.claude/skills/appify-content/assets/tools/sound_library.py): an unused gym-energy track cut on a downbeat as the
bed, and real effects with no repeats: a different "wrong" sound on each of the clip's three red ✕ moments, a
different "correct" sound on each green ✓, varied whooshes on the camera changes, varied clicks for the checklist,
an impact + ding on the end card. The picks are saved in sound/picks.json so a re-run keeps the same sounds
(delete it to re-pick). Writes public/formclip-bed.wav, sound/formclip.json and sound/formclip-sfx.json.
  python3 sound/build_formclip_cues.py && python3 <motion-graphics>/scripts/sound.py sound/formclip.json public/formclip.wav"""
import json, os, subprocess, sys
LIBTOOL = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.claude/skills/appify-content/assets/tools/sound_library.py"))
PROJECT = "darebni-skullcrushers"
s = lambda sec: round(sec * 30)
END, DUR = s(26.3), s(26.3) + 120
SEG = [[0, s(1.9), s(4.3)], [s(4.5), s(7.6), s(10.6)], [s(10.8), s(13.9), s(16.5)]]   # keep in step with FL in FormClip.jsx
lib = lambda *a: subprocess.run([sys.executable, LIBTOOL, *a], capture_output=True, text=True, check=True).stdout
NOPE = "game,arcade,video-game,cartoon,toy,8-bit,funny,animals,water,error"   # keep it a premium gym reel
def files(tag, n, ex=NOPE, title=None):
    args = ["sfx", tag, "--n", str(n), "--project", PROJECT, "--max-dur", "3", "--exclude", ex] + (["--title", title] if title else [])
    return [l.split("\t")[0] for l in lib(*args).strip().splitlines()]

if os.path.exists("sound/picks.json"):
    P = json.load(open("sound/picks.json"))
else:
    track = json.loads(lib("pick-music", "--mood", "gym-energy", "--min-bpm", "85", "--max-bpm", "150", "--project", PROJECT))
    P = {"music": track, "wrong": files("wrong", 3, NOPE.replace(",error", "")), "correct": files("correct", 3),
         "whoosh": files("whoosh", 3) + files("swoosh", 1), "click": files("click", 3, title="click|tap|select|switch"),
         "impact": files("impact", 2, title="impact|hit|punch|boom|thud"), "ding": files("notification", 1, title="ding|chime|bell|success|positive")}
    json.dump(P, open("sound/picks.json", "w"), indent=1)
bed = json.loads(lib("bed", P["music"]["id"], "public/formclip-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9"))
print("bed:", bed["title"], "by", P["music"]["artist"], f"({bed['bpm']} bpm, from {bed['start']} s)")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": os.path.abspath(f), "frame": frame, "gain": g, "pan": pan}
music = [smp("public/formclip-bed.wav", 0, 0.55)]
fx = [smp(P["impact"][0], 1, 0.55)]
for k, (a, g, out) in enumerate(SEG):
    fx += [smp(P["wrong"][k], a + 3, 0.6), smp(P["correct"][k], g, 0.6)]
for k, cut in enumerate((s(4.4), s(10.7), s(16.5))):
    fx += [smp(P["whoosh"][k], cut - 8, 0.45, (-0.3, 0.3, 0)[k])]
fx += [smp(P["click"][k], SEG[2][2] + 60 + k * 45, 0.45) for k in range(3)]
fx += [smp(P["whoosh"][3], END - 8, 0.45), smp(P["impact"][1], END + 16, 0.6), smp(P["ding"][0], END + 18, 0.45)]
for mus, out in ((True, "sound/formclip.json"), (False, "sound/formclip-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 8, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues,", len({c["file"] for c in fx}), "different effect files")
