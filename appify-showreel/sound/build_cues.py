"""Soundtrack for the showreel on src/timing.js (120 BPM, beat = 15 frames).
Smooth, not busy: a lo-fi groove carries it, soft whooshes on the spark cuts, and only three real hits
(the particle boom, the logo landing, the CTA). The whole mix is low-passed so nothing is harsh.
  python3 sound/build_cues.py          -> sound/cues.json        (music + transitions)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (transitions only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
B, S0, L, N, DUR = g("BEAT"), g("STYLE0"), g("STYLE_LEN"), g("N"), g("DURATION")
END = S0 + N * L
st = lambda i: S0 + i * L
BPM = 30 * 60 / B
W = lambda a, b, gain=0.06, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": gain, "pan": pan}
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    # the bed: muffled for the hook, opens up on the first cut, keeps going under the end card
    {"type": "lofi", "start": 0, "end": S0, "bpm": BPM, "lp": 1200, "drums": 0.5, "gain": 0.3},
    {"type": "lofi", "start": S0, "end": DUR, "bpm": BPM, "drums": 0.8, "gain": 0.28, "bar0": 1},
    {"type": "beat", "start": S0, "end": END, "bpm": BPM, "pattern": "four-on-floor", "gain": 0.07, "hats": 0.12},
]
LAND = 8   # frames from a card's start to its landing (Main.jsx)
cues += [
    # editorial cuts: each card swishes through the air and slaps down on the pile
    *[{"type": "swish", "start": st(i) - 3, "end": st(i) + LAND, "gain": 0.22, "pan": (-0.35, 0.35)[i % 2]} for i in range(N)],
    *[{"type": "slap", "frame": st(i) + LAND, "gain": 0.42, "pan": (-0.15, 0.15)[i % 2]} for i in range(N)],
    {"type": "swish", "start": S0 - 10, "end": S0 + 4, "gain": 0.16, "pan": 0.2},   # the hook is pulled away
    {"type": "swish", "start": END - 3, "end": END + LAND, "gain": 0.26},            # the end card, the last print
    {"type": "slap", "frame": END + LAND, "gain": 0.55},
    {"type": "impact", "frame": st(6) + 20, "gain": 0.2},                          # launch FX: the boom
    {"type": "glint", "frame": st(8) + 24, "gain": 0.05},                          # the logo lands
    {"type": "stamp", "frame": END + 30, "gain": 0.22},                            # Comment "MOTION"
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.0, "lowpass": 7000, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues at", BPM, "BPM")
