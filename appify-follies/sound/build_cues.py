"""Soundtrack on src/timing.js: an 80 BPM tape lo-fi bed (an afternoon in Beirut), muffled under the hero film and
opening up when the lift doors first open. The lift is the sound design: a soft slide as the doors close, a two-note
lift bell as they open on each floor (tuned to that bar's chord: ii-V-I-VI in C), a tick as the Maison floor buttons
light up, a swish for each carousel slide, a camera click on every lookbook frame (on the 8ths), a reverse swell
into the end card and a glint on the credit.
  python3 sound/build_cues.py  ->  sound/cues.json (music + effects), sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DUR, END, CREDIT, LOOK0 = n("DURATION"), n("END"), n("CREDIT"), n("LOOK0")
FLOORS = [(int(a), int(b)) for a, b in re.findall(r"start: (\d+), end: (\d+)", src)]
MAISON = [int(x) for x in re.search(r"MAISON_STEPS = \[([\d, ]+)\]", src).group(1).split(",")]
SLIDES = [int(x) for x in re.findall(r"\[(\d+, \d+, \d+)\]", re.search(r"SLIDES = \{(.+?)\};", src).group(1)) for x in x.split(",")] if False else \
    [int(x) for grp in re.findall(r"\[([\d, ]+)\]", re.search(r"SLIDES = \{(.+?)\};", src).group(1)) for x in grp.split(",")]
# the lift bell for each floor start, tuned to the chord under it (bar k: Dm9, G13, Cmaj9, A7 ...)
BELL = {0: (880.0, 698.5), 1: (987.8, 784.0), 2: (1318.5, 1046.5), 3: (1108.7, 880.0)}
bell = lambda frame: [{"type": "chime", "frame": frame, "gain": 0.07, "freq": BELL[(frame // 90) % 4][0], "pan": -0.15},
                      {"type": "chime", "frame": frame + 5, "gain": 0.06, "freq": BELL[(frame // 90) % 4][1], "pan": 0.15}]
music = [{"type": "lofi_tape", "start": 0, "end": DUR, "gain": 0.42, "lp_auto": [[0, 900], [86, 900], [96, 9000], [DUR, 9000]]}]
fx = [
    {"type": "glint", "frame": 3, "gain": 0.06, "freq": 2349},                     # the wordmark on the film
    {"type": "pad", "start": 0, "end": 92, "gain": 0.05},                          # warm air over the desert film
    {"type": "swoosh", "start": 50, "end": 80, "peak": 0.6, "f": 900, "gain": 0.1},  # the film shrinks into the phone
]
for a, b in FLOORS:
    fx.append({"type": "swoosh", "start": b - 14, "end": b + 2, "peak": 0.75, "f": 600, "gain": 0.09})   # doors slide shut
    fx.append({"type": "thump", "frame": b, "gain": 0.07})
    if b < DUR: fx += bell(b + 2)                                                                     # doors open: ding
fx += [{"type": "tick", "frame": s, "gain": 0.035, "freq": 2637, "pan": 0.3} for s in MAISON[1:]]
fx += [{"type": "swish", "start": s - 2, "end": s + 10, "gain": 0.08, "pan": 0.25} for s in SLIDES]
fx += [{"type": "click", "frame": round(LOOK0 + k * 11.25), "gain": 0.12, "freq": 1800, "pan": (k % 3 - 1) * 0.2} for k in range(1, 12)]
fx += [{"type": "swish", "start": FLOORS[-1][0] + 16, "end": FLOORS[-1][0] + 60, "gain": 0.05}]     # the pop-ups scroll
fx += [{"type": "reverse_swell", "start": END - 30, "end": END + 12, "gain": 0.08, "notes": ["C4", "E4", "G4", "B4"]},
       {"type": "glint", "frame": END + 28, "gain": 0.06, "freq": 1975.5},                           # the wordmark lands
       {"type": "glint", "frame": CREDIT + 2, "gain": 0.05, "freq": 2637}]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 5, "fade_out": 1.4, "lowpass": 10500, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
