"""Soundtrack on src/timing.js. Music: the 120 BPM tech-house bed (sound.py "house"): filtered under the dribble while the
shot clock ticks down, a beat of near-silence, the drop on the dunk, a breakdown under the pull-back, back for the end.
Effects: CC0 uisfx sounds (sound/sfx/); tonal ones moved only by whole semitones (ST) into the bar's chord
(Am, F, C, G, one chord per 60-frame bar). Press/typing are pitchless; swipe is G/A.
  python3 sound/build_cues.py          -> sound/cues.json        (music + effects)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (effects only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DROP, STATEMENT, END, DUR = g("DROP"), g("STATEMENT"), g("END"), g("DURATION")
lst = lambda k: [int(x) for x in re.search(rf"{k} = \[([^\]]+)\]", src).group(1).replace("DROP", str(DROP)).split(",")]
SECTIONS, TICKS = lst("SECTIONS"), lst("TICKS")
CHIPS = [int(x) for x in re.findall(r"\[(\d+), \"", src)]
ST = lambda n: round(2 ** (n / 12), 5)
SFX_GAIN = 0.7
S = lambda name, frame, gain=1.0, rate=1.0, pan=0.0: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": round(gain * SFX_GAIN, 3), "rate": rate, "pan": pan}
chord = lambda f: ["Am", "F", "C", "G"][(f // 60) % 4]
SELECT = {"F": 0, "C": -5, "G": 2, "Am": -1}            # select is F -> F / C / G / E
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    {"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.5,
     "sections": [[0, "intro"], [DROP - 14, "gap"], [DROP, "drop"], [STATEMENT, "break"], [END, "outro"]],
     "lp_auto": [[0, 1400], [DROP - 14, 1400], [DROP - 1, 1800], [DROP + 1, 12000]]},
]
cues += [S("receive", 0, 0.55), S("receive", 48, 0.5)]                       # captions (C+E over Am)
cues += [S("press", t, 0.8, 1.0, 0.2) for t in TICKS]                         # shot clock
cues += [
    {"type": "riser", "start": DROP - 14, "end": DROP, "gain": 0.05},
    {"type": "swoosh", "start": DROP - 6, "end": DROP + 4, "peak": 0.7, "f": 4200, "gain": 0.16},   # through the net
    {"type": "impact", "frame": DROP, "gain": 0.22}, {"type": "thump", "frame": DROP, "gain": 0.34},
]
cues += [S("swipe", s, 0.7, 1.0, (-0.25, 0.25)[k % 2]) for k, s in enumerate(SECTIONS[1:])]
cues += [S("select", f, 0.5, ST(SELECT[chord(f)]), -0.2) for f in CHIPS]
cues += [
    {"type": "swoosh", "start": STATEMENT - 6, "end": STATEMENT + 12, "peak": 0.4, "f": 2600, "gain": 0.16},
    {"type": "thump", "frame": STATEMENT + 20, "gain": 0.22},
    S("reward", STATEMENT + 20, 0.8),                               # B+E over G (bar of 440)
    {"type": "swoosh", "start": STATEMENT + 52, "end": STATEMENT + 80, "peak": 0.5, "f": 2200, "gain": 0.12},   # the ball flies out
    {"type": "thump", "frame": END + 16, "freq": 70, "gain": 0.3},  # lands on Dev's finger
    {"type": "slap", "frame": END + 16, "gain": 0.08},
    {"type": "thump", "frame": END + 30, "gain": 0.18},
    S("success", END + 30, 0.8, ST(-2)),                            # D+B -> C+A over F (bar of 540)
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 0.8, "peak_db": -3, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues")
