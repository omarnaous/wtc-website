"""Soundtrack for the launch reel, on src/timing.js. The film part is scored like a runway show: projector air and a
beep per count on the leader, a reverse swell into the flash, then a 120 BPM tech-house bed drops as ÉPICÉE rises.
A swoosh on every wipe, a shutter click as each photo of the contact sheet and the paper prints lands, the bed
breaks (filtered, pads) under the wordmark and rises into the chilli wipe, then drops again on "Now online." with
the devices landing; a tick for the URL, a glint for the credit.  Tonal hits are in A minor (the bed is Am F C G).
  python3 sound/build_cues.py  ->  sound/cues.json (music + effects), sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
CUT = n("FILM_CUT"); DUR = CUT + n("STAGE_LEN"); ST = CUT
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.38,
          "sections": [[0, "gap"], [72, "drop"], [565, "break"], [ST + 10, "drop"], [ST + 200, "outro"]],
          "lp_auto": [[0, 500], [70, 500], [74, 9500], [560, 9500], [570, 1400], [ST - 30, 1400], [ST + 8, 9500], [DUR, 9500]]}]
fx = [
    {"type": "drone", "start": 0, "end": 76, "gain": 0.05},                                         # projector air
    *[{"type": "blip", "frame": f, "gain": 0.09, "freq": 880} for f in (0, 26, 52)],                 # 3, 2, 1
    {"type": "reverse_swell", "start": 44, "end": 72, "gain": 0.1, "notes": ["A3", "C4", "E4"]},
    {"type": "impact", "frame": 72, "gain": 0.2}, {"type": "glint", "frame": 72, "gain": 0.05, "freq": 1760},   # the flash
    {"type": "glint", "frame": 118, "gain": 0.05, "freq": 1318.5},                                  # the chilli rule under ÉPICÉE
    {"type": "swoosh", "start": 238, "end": 262, "peak": 0.5, "f": 2400, "gain": 0.16},              # chilli wipe
    *[{"type": "click", "frame": 260 + 6 * i, "gain": 0.1, "freq": 1600 + 120 * i, "pan": (-0.3, 0.3)[i % 2]} for i in range(4)],  # contact sheet
    {"type": "glint", "frame": 300, "gain": 0.05, "freq": 1760},                                    # LIBRE.
    {"type": "swoosh", "start": 424, "end": 446, "peak": 0.55, "f": 1800, "gain": 0.14},             # paper rises
    *[{"type": "click", "frame": 440 + 8 * i, "gain": 0.1, "freq": 1500, "pan": (-0.25, 0.25)[i]} for i in range(2)],
    {"type": "swish", "start": 464, "end": 482, "gain": 0.08},                                      # the ink band
    {"type": "swoosh", "start": 552, "end": 576, "peak": 0.5, "f": 1400, "gain": 0.16},              # ink wipe
    {"type": "impact", "frame": 565, "gain": 0.14},                                                  # wordmark
    {"type": "glint", "frame": 652, "gain": 0.05, "freq": 1318.5},                                  # its rule
    {"type": "riser", "start": ST - 60, "end": ST, "gain": 0.09},
    {"type": "swoosh", "start": ST - 12, "end": ST + 10, "peak": 0.5, "f": 2600, "gain": 0.18},      # chilli wipe to the launch card
    {"type": "impact", "frame": ST + 10, "gain": 0.22}, {"type": "thump", "frame": ST + 12, "gain": 0.16},   # laptop lands
    {"type": "thump", "frame": ST + 28, "gain": 0.1},                                                # phone lands
    {"type": "pop", "frame": ST + 30, "gain": 0.08}, {"type": "pop", "frame": ST + 38, "gain": 0.08},  # Now / online.
    {"type": "swish", "start": ST + 96, "end": ST + 140, "gain": 0.06, "pan": 0.2},                  # the pages scroll
    {"type": "blip", "frame": ST + 62, "gain": 0.06, "freq": 1318.5},                                # the URL
    {"type": "glint", "frame": ST + 120, "gain": 0.06, "freq": 2093},                                # Website by appify
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 3, "fade_out": 1.6, "lowpass": 11000, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
