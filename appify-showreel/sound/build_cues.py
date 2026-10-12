"""Soundtrack for the showreel on src/timing.js: a 128.6 BPM four-on-the-floor (beat = 14 frames), a spark
whoosh on every cut, and a sound signature per style so each one is heard as well as seen."""
import json, re
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
B, S0, L, DUR = g("BEAT"), g("STYLE0"), g("STYLE_LEN"), g("DURATION")
END = S0 + 8 * L
st = lambda i: S0 + i * L
W = lambda a, b, gain=0.12, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": gain, "pan": pan}
BPM = 30 * 60 / B
cues = [
    {"type": "beat", "start": S0, "end": END, "bpm": BPM, "pattern": "four-on-floor", "gain": 0.22, "hats": 0.35},
    {"type": "lofi", "start": S0, "end": DUR, "bpm": BPM, "drums": 0.0, "gain": 0.2},
    {"type": "beat", "start": END + 2 * B, "end": DUR - 10, "bpm": BPM, "pattern": "four-on-floor", "gain": 0.14, "hats": 0.2},
    # hook
    {"type": "impact", "frame": 0, "gain": 0.4}, {"type": "stamp", "frame": 9, "gain": 0.35}, {"type": "pop", "frame": 17, "gain": 0.2},
    {"type": "riser", "start": 8, "end": S0 - 1, "gain": 0.14},
    # a spark whoosh + flash hit on every cut
    *[W(st(i) - 6, st(i) + 4, 0.12, (-0.3, 0.3)[i % 2]) for i in range(9)],
    *[{"type": "glint", "frame": st(i) + 1, "gain": 0.06} for i in range(9)],
    # 1 kinetic type: a stamp per word
    *[{"type": "stamp", "frame": st(0) + round(k * 10.5), "gain": 0.4} for k in range(4)],
    # 2 liquid: bubbly blips, falling then the merge
    *[{"type": "blip", "frame": st(1) + k * 4, "gain": 0.1, "freq": 900 - k * 60} for k in range(7)],
    {"type": "sweep", "start": st(1) + 22, "end": st(1) + 34, "gain": 0.08, "f0": 300, "f1": 900},
    {"type": "pop", "frame": st(1) + 24, "gain": 0.25},
    # 3 UI: cards, toggle, tap, notification
    *[{"type": "click", "frame": st(2) + 4 + k * 4, "gain": 0.12, "freq": 1400} for k in range(4)],
    {"type": "click", "frame": st(2) + 17, "gain": 0.2, "freq": 900},
    {"type": "click", "frame": st(2) + 26, "gain": 0.3, "freq": 700},
    {"type": "blip", "frame": st(2) + 31, "gain": 0.16, "freq": 1320}, {"type": "blip", "frame": st(2) + 35, "gain": 0.14, "freq": 1760},
    # 4 data viz
    {"type": "graph_rise", "start": st(3) + 8, "end": st(3) + 32, "gain": 0.14},
    {"type": "counter", "start": st(3) + 6, "end": st(3) + 34, "gain": 0.12},
    *[{"type": "graph_tick", "frame": st(3) + round(k * 2.5), "gain": 0.12} for k in range(7)],
    # 5 3D type
    W(st(4), st(4) + 20, 0.1, -0.4), W(st(4) + 20, st(4) + 40, 0.1, 0.4),
    {"type": "impact", "frame": st(4) + 2, "gain": 0.35},
    # 6 particles: suck in, then the boom
    {"type": "riser", "start": st(5), "end": st(5) + 19, "gain": 0.2},
    {"type": "bass_drop", "frame": st(5) + 20, "gain": 0.6}, {"type": "impact", "frame": st(5) + 20, "gain": 0.5},
    # 7 glitch
    *[{"type": "glitch", "frame": st(6) + k * 7, "gain": 0.3} for k in range(6)],
    # 8 logo reveal
    {"type": "sweep", "start": st(7), "end": st(7) + 12, "gain": 0.1, "f0": 260, "f1": 1040},
    {"type": "impact", "frame": st(7) + 8, "gain": 0.3}, {"type": "glint", "frame": st(7) + 14, "gain": 0.16},
    {"type": "chime", "frame": st(7) + 22, "gain": 0.12, "freq": 1568},
    # end card: tiles pop, CTA stamps
    *[{"type": "pop", "frame": END + 6 + k * 2, "gain": 0.12} for k in range(8)],
    {"type": "stamp", "frame": END + 26, "gain": 0.45},
    {"type": "chime", "frame": END + 32, "gain": 0.1, "freq": 2093},
]
json.dump({"fps": 30, "duration": DUR / 30, "seed": 13, "fade_out": 0.8, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues at", round(BPM, 1), "BPM")
