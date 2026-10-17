"""Soundtrack on src/timing.js: 120 BPM tech-house (one bar = 60 frames, chords Am F C G). Muffled intro under the
hello and the mission, a breath before the drop on "What we do", the drop under the five services, a break for the
slogan, outro under the end card. Pops on words that land, a glint when "spotlight" flares, a swish as each service
comes in, phone UI sounds on the app stores (tuned to the bar's chord), a glint on Dev's spark, an impact on "Appify it."
and on the logo spark.
  python3 sound/build_cues.py   -> sound/cues.json (music + effects) and sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DEV_IN, HELLO, MISSION, M_SPOT, WHAT, SVC_LEN, IDEA, SPARK, APPIFY, FLY, END, DUR = (n(k) for k in
    ["DEV_IN", "HELLO", "MISSION", "M_SPOT", "WHAT", "SVC_LEN", "IDEA", "SPARK", "APPIFY", "FLY", "END", "DURATION"])
M_WORDS = [int(x) for x in re.search(r"M_WORDS = \[([\d, ]+)\]", src).group(1).split(",")]
SVCS = [WHAT + k * SVC_LEN for k in range(5)]
smp = lambda name, frame, gain: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": gain}

music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.4,
          "sections": [[0, "intro"], [WHAT - 30, "gap"], [WHAT, "drop"], [IDEA, "break"], [END, "outro"]],
          "lp_auto": [[0, 1100], [WHAT - 30, 700], [WHAT - 1, 700], [WHAT + 2, 9500], [IDEA, 3000], [END, 9500]]}]
cut = lambda at, f, g=0.18: {"type": "swoosh", "start": at - 7, "end": at + 9, "peak": 0.45, "f": f, "gain": g}
fx = [
    {"type": "swoosh", "start": DEV_IN, "end": DEV_IN + 20, "peak": 0.6, "f": 1600, "gain": 0.12},    # Dev rises
    {"type": "pop", "frame": HELLO + 1, "gain": 0.13}, {"type": "pop", "frame": HELLO + 9, "gain": 0.15},
    cut(MISSION, 2400, 0.16),
    {"type": "pop", "frame": MISSION + 9, "gain": 0.1},                                                 # We turn ideas into
    *[{"type": "pop", "frame": w + 1, "gain": 0.13, "pan": (k - 1) * 0.3} for k, w in enumerate(M_WORDS)],
    {"type": "glint", "frame": M_SPOT, "gain": 0.08, "freq": 1318.5},                                  # spotlight (E, Am bar)
    {"type": "chime", "frame": M_SPOT + 2, "gain": 0.05, "freq": 1760},
    {"type": "riser", "start": WHAT - 36, "end": WHAT, "gain": 0.1},
    {"type": "reverse_swell", "start": WHAT - 30, "end": WHAT, "gain": 0.12, "notes": ["A3", "C4", "E4"]},
    cut(WHAT, 3000, 0.14), {"type": "impact", "frame": WHAT, "gain": 0.24}, {"type": "thump", "frame": WHAT, "gain": 0.28},
    *[{"type": "swish", "start": s - 6, "end": s + 6, "gain": 0.1, "pan": 0.3} for s in SVCS[1:]],     # next service
    *[{"type": "pop", "frame": s + 5, "gain": 0.11} for s in SVCS],                                     # service name
    *[{"type": "pop", "frame": s + 23, "gain": 0.1} for s in SVCS[:4]],                                 # price
    smp("purchase", SVCS[2] + 20, 0.28), smp("receive", SVCS[2] + 30, 0.28),                            # App Store, Google Play
    {"type": "pop", "frame": SVCS[2] + 37, "gain": 0.09},                                               # Admin panel
    *[{"type": "swish", "start": SVCS[3] + k * 7, "end": SVCS[3] + k * 7 + 10, "gain": 0.08, "pan": (k - 1) * 0.4} for k in range(3)],
    cut(IDEA, 2200, 0.16), {"type": "pop", "frame": IDEA + 5, "gain": 0.14},                            # Got an idea?
    {"type": "glint", "frame": SPARK, "gain": 0.09, "freq": 1396.9},                                    # Dev's spark (F bar)
    {"type": "chime", "frame": SPARK + 2, "gain": 0.05, "freq": 1760},
    {"type": "impact", "frame": APPIFY, "gain": 0.2}, {"type": "thump", "frame": APPIFY, "gain": 0.2},  # Appify it.
    {"type": "riser", "start": FLY - 6, "end": END, "gain": 0.09},
    {"type": "reverse_swell", "start": FLY - 4, "end": END, "gain": 0.1, "notes": ["G3", "B3", "D4"]},
    cut(END, 2200, 0.2), {"type": "impact", "frame": END + 22, "gain": 0.22},                          # logo spark
    {"type": "glint", "frame": END + 24, "gain": 0.07, "freq": 2349},
    {"type": "pop", "frame": END + 33, "gain": 0.1},                                                    # slogan
    *[{"type": "pop", "frame": END + 45 + k * 4, "gain": 0.08, "pan": (k - 2) * 0.2} for k in range(5)],  # services
    {"type": "pop", "frame": END + 67, "gain": 0.14}, {"type": "thump", "frame": END + 67, "gain": 0.14},  # the call to action
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.0, "lowpass": 10000, "peak_db": -3,
            "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1)
    print(out, len(spec["cues"]), "cues")
