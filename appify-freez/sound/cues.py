"""Writes sound/cues.json (with music) and sound/cues-nomusic.json (effects only) from src/timing.js + src/flavors.js,
then: python3 <skill>/scripts/sound.py sound/cues.json public/sound.wav"""
import re, json
t = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", t).group(1))
FPS, DUR = g("FPS"), g("DURATION")
POP, LOGO, PARADE, GAP, COUNT_END, DROP, TOGETHER, END_LOGO = (g(k) for k in ["POP", "LOGO", "PARADE", "GAP", "COUNT_END", "DROP", "TOGETHER", "END_LOGO"])
WORDS = [int(x) for x in re.search(r"WORDS = \[([^\]]+)\]", t).group(1).split(",")]
slots = json.loads(re.search(r"export const SLOTS = (\[.*?\]);", open("src/flavors.js").read(), re.S).group(1))
fx = [
    {"type": "pop", "frame": POP, "gain": 0.9},
    {"type": "thump", "frame": POP, "gain": 0.5, "freq": 60},
    {"type": "swoosh", "start": POP, "end": POP + 22, "gain": 0.22, "f": 6000, "peak": 0.2},     # the fizz rushing up
    {"type": "glint", "frame": POP + 4, "gain": 0.06},
    {"type": "impact", "frame": LOGO, "gain": 0.55},
] + [{"type": "pop", "frame": w, "gain": 0.4} for w in WORDS]
for k, s in enumerate(slots):
    at = s["at"]
    fx.append({"type": "swoosh", "start": at - 7, "end": at + 3, "gain": 0.16 if s["len"] == 15 else 0.24, "f": 1800 + (k * 530) % 3200, "peak": 0.7})
    if s["top"]: fx.append({"type": "glint", "frame": at + 6, "gain": 0.07})
    else: fx.append({"type": "clink", "frame": at + (3 if s["len"] == 15 else 7), "gain": 0.32, "pitch": 0.9 + (k % 4) * 0.08, "pan": 0.2 if k % 2 else -0.2})
fx += [
    {"type": "thump", "frame": GAP, "gain": 0.5},
    {"type": "counter", "start": GAP + 3, "end": COUNT_END, "gain": 0.3},
    {"type": "pop", "frame": COUNT_END, "gain": 0.5},
    {"type": "riser", "start": GAP + 4, "end": DROP - 3, "gain": 0.45},
    {"type": "impact", "frame": DROP, "gain": 0.95},
    {"type": "clink", "frame": DROP + 3, "gain": 0.3, "pitch": 1.0, "pan": -0.3},
    {"type": "clink", "frame": DROP + 6, "gain": 0.26, "pitch": 1.12, "pan": 0.3},
    {"type": "clink", "frame": DROP + 9, "gain": 0.22, "pitch": 0.94},
    {"type": "whoosh", "frame": TOGETHER, "gain": 0.1},
    {"type": "chime", "frame": END_LOGO, "gain": 0.18},
]
music = {"type": "house", "start": 0, "end": DUR, "gain": 0.75,
         "sections": [[0, "intro"], [PARADE, "drop"], [GAP, "gap"], [DROP, "drop"], [DUR - 30, "outro"]],
         "lp_auto": [[0, 700], [PARADE - 2, 900], [PARADE, 16000]]}
base = {"fps": FPS, "duration": DUR / FPS, "seed": 11, "peak_db": -3}
json.dump({**base, "cues": [music] + fx}, open("sound/cues.json", "w"), indent=1)
json.dump({**base, "cues": fx}, open("sound/cues-nomusic.json", "w"), indent=1)
print(len(fx), "effects")
