"""Soundtrack on the beat sheet in src/timing.js -> sound/cues.json.
A mellow lo-fi café groove at 112.5 BPM (one beat = 16 frames) that drops out for the hush before the
bill and before the hero, a four-on-the-floor kick for the week, and foley for what is on screen."""
import json, re
T = {k: int(v) for k, v in re.findall(r"(\w+):\s*(\d+),", open("src/timing.js").read().split("export const T")[1])}
BPM, END = 112.5, 600
W = lambda a, b, g=0.12, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": g, "pan": pan}
cues = [
    # music: muffled at dawn, opens up with the coffee, cut for the hush, back on the bill, cut before the hero
    {"type": "lofi", "start": 0, "end": T["coffee"], "bpm": BPM, "lp": 900, "drums": 0.0, "gain": 0.2},
    {"type": "lofi", "start": T["coffee"], "end": T["hush"], "bpm": BPM, "drums": 0.6, "gain": 0.22, "bar0": 1},
    {"type": "lofi", "start": T["bill"], "end": T["quiet"], "bpm": BPM, "gain": 0.24, "bar0": 2},
    {"type": "lofi", "start": T["hero"], "end": END, "bpm": BPM, "gain": 0.24, "bar0": 0},
    {"type": "beat", "start": T["day0"], "end": T["quiet"], "bpm": BPM, "pattern": "four-on-floor", "gain": 0.16, "hats": 0.25},
    {"type": "beat", "start": T["hero"], "end": T["end"] + 64, "bpm": BPM, "pattern": "four-on-floor", "gain": 0.16, "hats": 0.25},
    # 6:59 -> 7:00, the alarm
    *[{"type": "tick", "frame": T["dawn"] + i * 16, "gain": 0.1, "pan": -0.2} for i in range(3)],
    *[{"type": "blip", "frame": T["flip"] + i * 5, "gain": 0.16, "freq": 1320} for i in range(3)],
    # dive into the sun -> the coffee
    {"type": "riser", "start": T["dive"], "end": T["coffee"], "gain": 0.16},
    W(T["coffee"] - 8, T["coffee"] + 6, 0.14),
    {"type": "glint", "frame": T["coffee"] + 2, "gain": 0.12},
    {"type": "impact", "frame": T["cup"], "gain": 0.25},                       # the cup lands
    # the bill flutters in, the hush, then it snaps on as the sleeve
    W(T["hush"] - 30, T["hush"] + 2, 0.1, -0.4),
    {"type": "rip", "start": T["bill"] - 4, "end": T["bill"] + 4, "gain": 0.2},
    {"type": "impact", "frame": T["bill"], "gain": 0.35},
    {"type": "cash", "frame": T["bill"] + 2, "gain": 0.3},
    {"type": "stamp", "frame": T["price"], "gain": 0.4},                       # $1 badge
    # the week: one pop per day, rising
    W(T["week"] - 2, T["week"] + 12, 0.1),
    *[{"type": "blip", "frame": T["day0"] + i * 16, "gain": 0.14, "freq": 523 * 2 ** (i * 2 / 12)} for i in range(7)],
    *[{"type": "pop", "frame": T["day0"] + i * 16, "gain": 0.14} for i in range(7)],
    *[{"type": "stamp", "frame": T["words"] + i * 16, "gain": 0.3} for i in range(3)],   # Every. Single. Day.
    # the drop-out, then the hero
    {"type": "riser", "start": T["quiet"] - 8, "end": T["hero"] - 1, "gain": 0.18},
    {"type": "bass_drop", "frame": T["hero"], "gain": 0.55},
    {"type": "impact", "frame": T["hero"], "gain": 0.4},
    {"type": "coin", "frame": T["hero"] + 6, "gain": 0.25},                    # $1 / day
    {"type": "glint", "frame": T["hero"] + 10, "gain": 0.1},
    # end card
    W(T["end"] - 8, T["end"] + 8, 0.14),
    {"type": "chime", "frame": T["end"] + 8, "gain": 0.12, "freq": 1568},
    {"type": "chime", "frame": T["end"] + 14, "gain": 0.09, "freq": 2093},
]
json.dump({"fps": 30, "duration": END / 30, "seed": 5, "fade_out": 1.2, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues")
