"""Soundtrack on src/timing.js. 120 BPM tech-house, muffled and tense under the ride (steel rolling, the HUD ticking down),
cut to silence for a breath right before ignition, the thrusters roar in, and the drop hits as the phone launches.
Steady landing burn, a touchdown thud as the thrusters cut, outro under the end card with pops on each line.
  python3 sound/gen_foley.py && python3 sound/build_cues.py   -> sound/cues.json, sound/cues-sfx.json"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
HOOK, RIDE, IGNITE, LAUNCH, HOVER, CLOSE, END, DUR = (n(k) for k in ["HOOK", "RIDE", "IGNITE", "LAUNCH", "HOVER", "CLOSE", "END", "DURATION"])
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.36,
          "sections": [[0, "intro"], [IGNITE - 8, "gap"], [LAUNCH, "drop"], [END, "outro"]],
          "lp_auto": [[0, 700], [IGNITE - 9, 1400], [LAUNCH - 1, 700], [LAUNCH + 2, 9500], [END, 6000]]}]
fx = [
    {"type": "drone", "start": 0, "end": LAUNCH, "gain": 0.07},
    {"type": "pop", "frame": HOOK + 2, "gain": 0.12},                                                   # hook caption
    {"type": "sample", "file": "sound/sfx/roll.wav", "frame": RIDE, "gain": 0.32},                     # the ride
    *[{"type": "tick", "frame": f, "gain": 0.1, "pan": 0.35} for f in range(HOOK + 10, IGNITE - 8, 15)],   # HUD countdown
    {"type": "riser", "start": RIDE + 20, "end": IGNITE - 6, "gain": 0.1},                              # cut 6 frames early: the breath
    {"type": "impact", "frame": IGNITE, "gain": 0.22}, {"type": "thump", "frame": IGNITE, "gain": 0.22},
    {"type": "sample", "file": "sound/sfx/roar.wav", "frame": IGNITE, "gain": 0.55},                   # thrusters
    {"type": "whoosh", "start": LAUNCH - 8, "end": LAUNCH + 14, "gain": 0.2},
    {"type": "impact", "frame": LAUNCH, "gain": 0.3}, {"type": "bass_drop", "frame": LAUNCH, "gain": 0.22},
    {"type": "whoosh", "start": HOVER - 16, "end": HOVER + 6, "gain": 0.12, "pan": 0.2},                # swings over the landing spot
    {"type": "impact", "frame": CLOSE, "gain": 0.2}, {"type": "thump", "frame": CLOSE, "gain": 0.3},  # touchdown
    {"type": "glint", "frame": CLOSE + 6, "gain": 0.07, "freq": 1318.5},                                # chip (E, Am bar)
    {"type": "swoosh", "start": END - 8, "end": END + 8, "peak": 0.5, "f": 2200, "gain": 0.16},
    {"type": "pop", "frame": END + 6, "gain": 0.14}, {"type": "pop", "frame": END + 16, "gain": 0.1},
    {"type": "pop", "frame": END + 26, "gain": 0.13}, {"type": "thump", "frame": END + 26, "gain": 0.12},
    {"type": "glint", "frame": END + 36, "gain": 0.07, "freq": 2349},                                   # wordmark spark
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 13, "fade_out": 1.0, "lowpass": 11000, "peak_db": -3,
            "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1)
    print(out, len(spec["cues"]), "cues")
