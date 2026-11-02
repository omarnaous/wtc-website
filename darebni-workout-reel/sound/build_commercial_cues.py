"""Sound for Commercial.jsx: "Epical Drums 02" (Grigoriy Nuzhny, percussion trailer, 120.02 BPM, unused elsewhere)
from 43.0 s, so its near-silent gap (track 56.4-58.0 s) sits under the Arabic word and its re-entry slam on frame 450,
the DAREBNI hit. Effects are transitions only: a whoosh on each section change (rotating files), a low impact under
the slam and the logo. Writes public/commercial-bed.wav (gitignored), sound/commercial.json, sound/commercial-sfx.json.
  python3 sound/build_commercial_cues.py && python3 <motion-graphics>/scripts/sound.py sound/commercial.json public/commercial.wav"""
import json, os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL, LIB = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py", f"{ROOT}/sound-library"
DUR, START = 990, 43.0
HIT, LOGO = 450, 840
CUTS = [120, 180, 240, 300, 660, 750]                  # section changes (keep in step with CM in Commercial.jsx)
WHOOSH = ["s1490", "s2605", "s1488", "s2611"]           # Fast whoosh transition, Quick air woosh, Throw hard wind woosh, Weird swish glassy whoosh
IMPACT = ["s3057", "s2916"]                             # Apocalyptic stomp impact, Movie impact transition
subprocess.run([sys.executable, LIBTOOL, "bed", "m677", "public/commercial-bed.wav", "--dur", f"{DUR / 30:.3f}", "--start", f"{START}", "--gain", "0.9", "--fade", "1.6"], check=True, capture_output=True)
smp = lambda i, frame, g, pan=0.0: {"type": "sample", "file": i if i.startswith("/") else f"{LIB}/sfx/{i}.mp3", "frame": frame, "gain": g, "pan": pan}
music = [smp(os.path.abspath("public/commercial-bed.wav"), 0, 0.9)]
fx = [smp(WHOOSH[k % len(WHOOSH)], c - 7, 0.3, (-0.3, 0.3)[k % 2]) for k, c in enumerate(CUTS)]
fx += [smp(IMPACT[0], HIT, 0.5), smp(WHOOSH[2], LOGO - 7, 0.3), smp(IMPACT[1], LOGO, 0.32)]
for mus, path in ((True, "sound/commercial.json"), (False, "sound/commercial-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 0.4, "peak_db": -2, "cues": (music if mus else []) + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-commercial"] = {"music": ["m677"], "sfx": sorted(set(WHOOSH + IMPACT))}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
