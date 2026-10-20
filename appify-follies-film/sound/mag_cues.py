"""Soundtrack for "FDM — Issue 01" on src/mag-timing.js: 120 BPM tech-house (beat = 15 frames, bar = 60; Am F C G).
A filtered intro under the cover as the masthead rises, the drop when the cover lines land, a camera shutter for every
frame that lands on a spread (on the beat, on the 8ths for the contact sheet), a paper page turn (swoosh + rustle) on
every flip, and the back cover: the bed breaks to pads, a pop for Dev, a hit on the price, a chime on the DM pill.
  python3 sound/mag_cues.py  ->  sound/mag.json, sound/mag-sfx.json"""
import json, re
src = open("src/mag-timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
DUR, DROP, FLIP, BEAT = n("DURATION"), n("DROP"), n("FLIP"), n("BEAT")
FLIPS = [int(x) for x in re.search(r"FLIPS = \[([\d, ]+)\]", src).group(1).split(",")]
S1, S2, S3, BACK = FLIPS
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.45,
          "sections": [[0, "intro"], [DROP - 15, "gap"], [DROP, "drop"], [BACK, "break"], [BACK + 60, "outro"]],
          "lp_auto": [[0, 900], [DROP - 16, 900], [DROP + 1, 10000], [BACK - 4, 10000], [BACK + 4, 3000], [BACK + 58, 3000], [BACK + 62, 10000]]}]
fx = [{"type": "riser", "start": 10, "end": DROP - 2, "gain": 0.08},
      *[{"type": "tick", "frame": 4 + 3 * i, "gain": 0.02, "freq": 2637 - 60 * i} for i in range(7)],     # F O L L I E S
      {"type": "impact", "frame": DROP, "gain": 0.22}, {"type": "glint", "frame": DROP + 2, "gain": 0.05, "freq": 1760}]
for a in FLIPS:                                                                                         # page turns
    fx += [{"type": "swoosh", "start": a - FLIP, "end": a + 2, "peak": 0.55, "f": 1500, "gain": 0.15},
           {"type": "swish", "start": a - FLIP + 2, "end": a, "gain": 0.09}, {"type": "thump", "frame": a, "gain": 0.08}]
shutter = lambda fr, g=0.13, p=0.0: {"type": "click", "frame": round(fr), "gain": g, "freq": 1700, "pan": p}
fx += [shutter(S1 + 8 + k * BEAT, 0.13, (-0.2, 0.2, 0.0)[k]) for k in range(3)]                          # spread 1 frames
fx += [{"type": "pop", "frame": S1 + 8 + 3 * BEAT, "gain": 0.06}]                                        # the quote
fx += [shutter(S2 + 6, 0.14), {"type": "whoosh", "start": S2 + 6 + 2 * BEAT - 6, "end": S2 + 6 + 2 * BEAT + 8, "gain": 0.1}]   # she steps out
fx += [shutter(S3 + 6 + k * 7.5, 0.1, ((k % 3) - 1) * 0.3) for k in range(12)]                            # contact sheet
fx += [{"type": "whoosh", "start": S3 + 98, "end": S3 + 120, "gain": 0.12}]                               # push in
fx += [{"type": "pop", "frame": BACK + 14, "gain": 0.12}, {"type": "impact", "frame": BACK + 40, "gain": 0.16},
       {"type": "glint", "frame": BACK + 42, "gain": 0.05, "freq": 2093}, {"type": "chime", "frame": BACK + 58, "gain": 0.05, "freq": 1318.5},
       {"type": "glint", "frame": BACK + 74, "gain": 0.04, "freq": 1760}]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.5, "lowpass": 11000, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = "sound/mag.json" if music_on else "sound/mag-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
