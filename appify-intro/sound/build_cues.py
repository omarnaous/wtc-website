"""Soundtrack on src/timing.js: 120 BPM tech-house (one bar = 60 frames, chords Am F C G). Muffled intro under the
hello, near silence while the spark flies at the camera, the drop on the first cut to the work, outro under the end
card. Pops on every word that lands, a glint when the idea lights up, a swoosh on each spark cut, phone UI sounds on the
app stores (tuned to the bar's chord), swishes as the reels drop in, an impact on the logo spark.
  python3 sound/build_cues.py   -> sound/cues.json (music + effects) and sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DEV_IN, HELLO, IDEA, SPARK, FLY, WEB, SECOND, APP, MOTION, END, DUR = (n(k) for k in ["DEV_IN", "HELLO", "IDEA", "SPARK", "FLY", "WEB", "SECOND", "APP", "MOTION", "END", "DURATION"])
smp = lambda name, frame, gain: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": gain}

music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.4,
          "sections": [[0, "intro"], [FLY, "gap"], [WEB, "drop"], [END, "outro"]],
          "lp_auto": [[0, 1100], [FLY, 700], [WEB - 1, 700], [WEB + 2, 9500]]}]
fx = [
    {"type": "swoosh", "start": DEV_IN, "end": DEV_IN + 20, "peak": 0.6, "f": 1600, "gain": 0.12},   # Dev rises
    {"type": "pop", "frame": HELLO + 1, "gain": 0.13}, {"type": "pop", "frame": HELLO + 9, "gain": 0.15},
    {"type": "pop", "frame": IDEA + 1, "gain": 0.13}, {"type": "pop", "frame": IDEA + 7, "gain": 0.15},
    {"type": "glint", "frame": SPARK, "gain": 0.09, "freq": 1396.9},                                   # the idea (F, bar 2)
    {"type": "chime", "frame": SPARK + 2, "gain": 0.05, "freq": 1760},
    {"type": "riser", "start": FLY - 6, "end": WEB, "gain": 0.1},                                      # the spark flies
    {"type": "reverse_swell", "start": FLY, "end": WEB, "gain": 0.12, "notes": ["A3", "C4", "E4"]},
    {"type": "impact", "frame": WEB, "gain": 0.26}, {"type": "thump", "frame": WEB, "gain": 0.3},
    {"type": "pop", "frame": WEB + 21, "gain": 0.12},                                                   # from $360
    {"type": "swish", "start": SECOND - 4, "end": SECOND + 8, "gain": 0.1},                             # Oddball slides in
    {"type": "swoosh", "start": APP - 7, "end": APP + 9, "peak": 0.45, "f": 2600, "gain": 0.18},
    {"type": "pop", "frame": APP + 21, "gain": 0.12},                                                   # from $999
    smp("purchase", APP + 30, 0.3),                                                                     # App Store (E+A, Am)
    smp("receive", APP + 40, 0.3),                                                                      # Google Play (C+E, Am)
    {"type": "pop", "frame": APP + 51, "gain": 0.1},
    {"type": "swoosh", "start": MOTION - 7, "end": MOTION + 9, "peak": 0.45, "f": 3000, "gain": 0.18},
    *[{"type": "swish", "start": MOTION + k * 8, "end": MOTION + k * 8 + 10, "gain": 0.09, "pan": (k - 1) * 0.4} for k in range(3)],
    {"type": "pop", "frame": MOTION + 23, "gain": 0.12},                                                # 3 videos · $199
    {"type": "reverse_swell", "start": END - 14, "end": END, "gain": 0.1, "notes": ["G3", "B3", "D4"]},
    {"type": "swoosh", "start": END - 7, "end": END + 9, "peak": 0.45, "f": 2200, "gain": 0.2},
    {"type": "impact", "frame": END + 22, "gain": 0.22},                                                # logo spark
    {"type": "glint", "frame": END + 24, "gain": 0.07, "freq": 2349},                                   # D (G bar)
    *[{"type": "pop", "frame": END + 45 + k * 4, "gain": 0.08, "pan": (k - 2) * 0.2} for k in range(5)],  # services
    {"type": "pop", "frame": END + 67, "gain": 0.14},                                                   # Book a call
    {"type": "thump", "frame": END + 67, "gain": 0.14},
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.0, "lowpass": 10000, "peak_db": -3,
            "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1)
    print(out, len(spec["cues"]), "cues")
