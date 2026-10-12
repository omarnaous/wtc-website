"""Soundtrack on src/timing.js: the 80 BPM tape lo-fi bed (same engine as the showreel), muffled under the hook and
opening on "Or own it." Soft ticks on the builder meter (one per month), a swoosh per spark cut, a soft sub thump
when each Appify card lands, a stamp + hit when the builder passes $360, and a stamp under "DM LAUNCH".
  python3 sound/build_cues.py          -> sound/cues.json        (music + effects)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (effects only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
B = float(re.search(r"export const BEAT = ([\d.]+)", src).group(1))
b = lambda n: round(n * B)
TURN, ROWS, MATH, END, DUR = b(3), b(5), b(19), b(22), 600
ROW_LEN, N, CROSS = b(2), 7, 4
row = lambda i: ROWS + 4 + i * ROW_LEN
BPM = 30 * 60 / B
HOOK_TICKS = [14, 23, 32, 41, 50, 59]
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    {"type": "lofi_tape", "start": 0, "end": DUR, "bpm": BPM, "gain": 0.4, "lp_auto": [[0, 850], [TURN - 4, 950], [TURN + 8, 6800]]},
]
cues += [
    {"type": "thump", "frame": 0, "gain": 0.22},
    *[{"type": "cash", "frame": t, "gain": 0.09} for t in HOOK_TICKS],                         # the meter, month by month
    {"type": "reverse_swell", "start": TURN - 22, "end": TURN, "gain": 0.13, "notes": ["E3", "G3", "B3", "D4"]},
    {"type": "impact", "frame": TURN + 8, "gain": 0.22},                                       # $360 slams in
    {"type": "thump", "frame": TURN + 8, "gain": 0.28},
    {"type": "glint", "frame": TURN + 24, "gain": 0.05},
]
for k, a in enumerate([TURN, ROWS, MATH, END]):                                                 # spark cuts
    cues.append({"type": "swoosh", "start": a - 7, "end": a + 9, "peak": 0.45, "f": [2600, 3000, 2200, 2800][k], "gain": 0.2, "pan": (-0.3, 0.3)[k % 2]})
for i in range(N):                                                                              # feature rows
    r = row(i)
    cues.append({"type": "swoosh", "start": r - 4, "end": r + 8, "peak": 0.5, "f": 2000 + 220 * i, "gain": 0.09, "pan": -0.3})
    cues.append({"type": "cash", "frame": r + 1, "gain": 0.08, "pan": -0.4})                   # builder meter +2 months
    cues.append({"type": "thump", "frame": r + 10, "gain": 0.09})                               # the Appify ✓
cues += [
    {"type": "reverse_swell", "start": row(CROSS) - 14, "end": row(CROSS) + 6, "gain": 0.12, "notes": ["E3", "G3", "B3", "D4"]},
    {"type": "stamp", "frame": row(CROSS) + 6, "gain": 0.24},                                   # already paid more than Appify
    {"type": "impact", "frame": row(CROSS) + 6, "gain": 0.1},
    {"type": "riser", "start": MATH + 2, "end": MATH + 26, "gain": 0.05},                       # the 3-year bars grow
    {"type": "impact", "frame": MATH + 30, "gain": 0.16},                                       # You keep $1,044
    {"type": "glint", "frame": MATH + 32, "gain": 0.05},
    {"type": "glint", "frame": END + 30, "gain": 0.05, "freq": 2794},                           # day 7: LIVE
    {"type": "stamp", "frame": END + 40, "gain": 0.2},                                          # DM "LAUNCH"
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 33, "fade_out": 1.0, "lowpass": 9000, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues at", BPM, "BPM")
