"""Soundtrack on the beat sheet in src/timing.js -> sound/cues.json. 120 BPM (one beat = 15 frames).
Filtered groove for the hook, the full beat drops on the smash, ASMR foley (ice, pour) on top,
a hit on every cut of the week, silence before the smiley, and the beat back on its eyes."""
import json, re
T = {k: int(v) for k, v in re.findall(r"(\w+):\s*(\d+),", open("src/timing.js").read().split("export const T")[1])}
BPM, END, B = 120, 600, 15
W = lambda a, b, g=0.12, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": g, "pan": pan}
cues = [
    # music
    {"type": "lofi", "start": 0, "end": T["smash"], "bpm": BPM, "lp": 1000, "drums": 0.5, "gain": 0.22},
    {"type": "lofi", "start": T["smash"], "end": T["drop"], "bpm": BPM, "drums": 0.0, "gain": 0.24, "bar0": 1},
    {"type": "beat", "start": T["smash"], "end": T["drop"], "bpm": BPM, "pattern": "four-on-floor", "gain": 0.2, "hats": 0.3},
    {"type": "lofi", "start": T["eyes"], "end": END, "bpm": BPM, "drums": 0.0, "gain": 0.26, "bar0": 0},
    {"type": "beat", "start": T["eyes"], "end": END - 30, "bpm": BPM, "pattern": "four-on-floor", "gain": 0.22, "hats": 0.35},
    # hook: the bill flutters, each line pops
    W(0, 40, 0.06, -0.3),
    *[{"type": "pop", "frame": T["hook"] + 2 + i * B, "gain": 0.16} for i in range(3)],
    {"type": "riser", "start": T["hook"] + 30, "end": T["smash"] - 1, "gain": 0.16},
    # the smash
    {"type": "bass_drop", "frame": T["smash"], "gain": 0.6},
    {"type": "impact", "frame": T["smash"], "gain": 0.45},
    {"type": "stamp", "frame": T["smash"] + 1, "gain": 0.3},
    # ASMR: ice, pour, milk
    *[{"type": "clink", "frame": T[k], "gain": 0.5, "pitch": p, "pan": pan} for k, p, pan in (("ice1", 1.0, -0.2), ("ice2", 1.12, 0.2), ("ice3", 0.94, 0))],
    *[{"type": "clink", "frame": T[k] + 4, "gain": 0.2, "pitch": p * 1.3, "pan": -pan} for k, p, pan in (("ice1", 1.0, -0.2), ("ice2", 1.12, 0.2), ("ice3", 0.94, 0))],
    {"type": "pour", "start": T["pour"] - 2, "end": T["full"] + 6, "gain": 0.5},
    {"type": "glint", "frame": T["full"] + 4, "gain": 0.1},
    W(T["straw"] - 6, T["straw"] + 4, 0.12),
    {"type": "clink", "frame": T["straw"] + 3, "gain": 0.25, "pitch": 0.8},
    W(T["turn"], T["price"], 0.1, 0.3),
    # the price
    {"type": "impact", "frame": T["price"], "gain": 0.5},
    {"type": "cash", "frame": T["price"] + 2, "gain": 0.35},
    {"type": "stamp", "frame": T["price"], "gain": 0.35},
    # the week: a hit and a whoosh on every cut
    *[{"type": "stamp", "frame": T["week"] + i * B, "gain": 0.3} for i in range(7)],
    *[W(T["week"] + i * B - 4, T["week"] + i * B + 2, 0.08, (-0.4, 0.4)[i % 2]) for i in range(7)],
    *[{"type": "blip", "frame": T["week"] + i * B + 2, "gain": 0.1, "freq": 660 * 2 ** (i * 2 / 12)} for i in range(7)],
    # EVERY. SINGLE. DAY.
    *[{"type": "impact", "frame": T[k], "gain": 0.4} for k in ("every", "single", "day")],
    {"type": "riser", "start": T["day"], "end": T["drop"] - 1, "gain": 0.14},
    # silence, then the smiley
    W(T["drop"] - 4, T["drop"] + 6, 0.1),
    {"type": "bass_drop", "frame": T["eyes"], "gain": 0.55},
    {"type": "pop", "frame": T["eyes"], "gain": 0.3}, {"type": "pop", "frame": T["eyes"] + 5, "gain": 0.3},
    {"type": "chime", "frame": T["mouth"] + 4, "gain": 0.14, "freq": 1568}, {"type": "chime", "frame": T["mouth"] + 12, "gain": 0.12, "freq": 2093},
    {"type": "glint", "frame": T["mouth"] + 28, "gain": 0.12},
    # finale + end card
    W(T["finale"] - 4, T["finale"] + 12, 0.14),
    {"type": "impact", "frame": T["finale"] + 8, "gain": 0.35},
    {"type": "cash", "frame": T["finale"] + 9, "gain": 0.25},
    {"type": "chime", "frame": T["end"] + 2, "gain": 0.12, "freq": 1760},
]
json.dump({"fps": 30, "duration": END / 30, "seed": 9, "fade_out": 1.2, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues")
