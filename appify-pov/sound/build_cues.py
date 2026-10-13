"""Soundtrack on src/timing.js. Music: the 120 BPM tech-house bed (sound.py "house"): filtered under the hook, a beat of
near-silence, the drop as the hero dissolves to black, a breakdown under the pull-back, back for the end card.
Effects: CC0 uisfx sounds (sound/sfx/). Tonal ones are moved only by whole semitones (ST) into the bar's chord
(Am, F, C, G, one chord per 60-frame bar). Swipe (organic pack) is G/A, typing/press are pitchless.
  python3 sound/build_cues.py          -> sound/cues.json        (music + effects)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (effects only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DROP, REVEAL, END, DUR = g("DROP"), g("REVEAL"), g("END"), g("DURATION")
SWIPES = [int(x) for x in re.search(r"SWIPES = \[([^\]]+)\]", src).group(1).split(",")]
CHIPS = [int(x) for x in re.findall(r"\[(\d+), \"", src)]
ST = lambda n: round(2 ** (n / 12), 5)
SFX_GAIN = 0.7
S = lambda name, frame, gain=1.0, rate=1.0, pan=0.0: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": round(gain * SFX_GAIN, 3), "rate": rate, "pan": pan}
chord = lambda f: ["Am", "F", "C", "G"][(f // 60) % 4]
SELECT = {"F": 0, "C": -5, "G": 2, "Am": -1}            # select is F -> F / C / G / E
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    {"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.5,
     "sections": [[0, "intro"], [DROP - 14, "gap"], [DROP, "drop"], [REVEAL, "break"], [END, "outro"]],
     "lp_auto": [[0, 1400], [DROP - 14, 1400], [DROP - 1, 1800], [DROP + 1, 12000]]},
]
cues += [S("receive", 0, 0.6), S("receive", 30, 0.45)]  # the captions pop (C+E over Am)
cues += [S("swipe", f, 0.55, 1.0, 0.15) for f in SWIPES]  # every thumb flick
cues += [
    {"type": "riser", "start": DROP - 14, "end": DROP, "gain": 0.05},
    {"type": "reverse_swell", "start": DROP - 18, "end": DROP, "gain": 0.13, "notes": ["F3", "A3", "C4", "E4"]},
    {"type": "impact", "frame": DROP, "gain": 0.18}, {"type": "thump", "frame": DROP, "gain": 0.3},
]
cues += [S("select", f, 0.5, ST(SELECT[chord(f)]), -0.3) for f in CHIPS]   # label chips
cues += [
    {"type": "swoosh", "start": REVEAL - 6, "end": REVEAL + 12, "peak": 0.4, "f": 2600, "gain": 0.18},
    {"type": "thump", "frame": REVEAL + 14, "gain": 0.22},
    S("reward", REVEAL + 14, 0.8),                                 # "It's a website." (B+E over C)
    {"type": "swoosh", "start": END - 7, "end": END + 9, "peak": 0.45, "f": 3000, "gain": 0.18},
    {"type": "thump", "frame": END + 24, "gain": 0.2},
    S("success", END + 24, 0.8, ST(-2)),                          # DM "WEBSITE" (C+A over Am)
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 17, "fade_out": 0.8, "peak_db": -3, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues")
