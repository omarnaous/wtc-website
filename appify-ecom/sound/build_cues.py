"""Soundtrack on src/timing.js. Music: a 120 BPM tech-house bed (sound.py "house"), muffled under the chat, cut to
near-silence for a beat of tension, then the drop when the store starts building; a breakdown under the price, back
for the end card. Effects: real CC0 UI sounds from uisfx (sound/sfx/, see README.txt), kept in tune with the bed on every on-screen action:
typing, send, receive, add-to-cart, checkout, notification, toggles, chart steps, launch.
  python3 sound/build_cues.py          -> sound/cues.json        (music + effects)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (effects only, to post with a trending track)"""
import json, re, sys, os
src = open("src/timing.js").read()
g = lambda k: float(re.search(rf"export const {k} = (-?[\d.]+)", src).group(1))
TYPE0, RATE = g("TYPE0"), float(re.search(r"TYPE_RATE = ([\d.]+)", src).group(1))
SEND, DOTS, REPLY, GAP, BUILD, DAY_LEN, END = [int(g(k)) for k in ["SEND", "DOTS", "REPLY", "GAP", "BUILD", "DAY_LEN", "END"]]
MSG = re.search(r'export const MSG = "([^"]+)"', src).group(1)
PRICE = BUILD + 7 * DAY_LEN
day = lambda i: BUILD + i * DAY_LEN
SFX = "sound/sfx"   # relative: run from the project folder
S = lambda name, frame, gain=1.0, rate=1.0, pan=0.0: {"type": "sample", "file": f"{SFX}/{name}.ogg", "frame": frame, "gain": gain, "rate": rate, "pan": pan}
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    {"type": "house", "start": 0, "end": 600, "bpm": 120, "gain": 0.5,
     "sections": [[0, "intro"], [GAP, "gap"], [BUILD, "drop"], [PRICE, "break"], [END, "outro"]],
     "lp_auto": [[0, 1300], [GAP, 1300], [BUILD - 1, 1800], [BUILD + 1, 12000]]},
]
# Tuning: the bed is A minor, one chord per bar (60 frames): Am, F, C, G, repeat. The UI sounds are the uisfx
# "minimal" pack (tuned to A440); each one is moved only by whole semitones (ST) so its notes sit in the chord of
# the bar it lands in. Typing / press are noise-like (no pitch) and swipe is already G/A, so those stay as they are.
ST = lambda n: round(2 ** (n / 12), 5)
keys = [f for f in range(0, int(TYPE0 + len(MSG) / RATE) + 1, 2)]
cues += [S("typing", f, 1.2, 0.94 + 0.12 * ((f * 37) % 11) / 10, (-0.15, 0.15)[i % 2]) for i, f in enumerate(keys)]
cues += [
    S("send", SEND, 0.9),                         # A + B  over Am
    S("receive", REPLY, 0.9),                     # C + E  over F
    {"type": "riser", "start": GAP, "end": BUILD, "gain": 0.05},
    {"type": "reverse_swell", "start": BUILD - 18, "end": BUILD, "gain": 0.14, "notes": ["G3", "C4", "E4", "G4"]},
    {"type": "impact", "frame": BUILD, "gain": 0.18},
    {"type": "thump", "frame": BUILD, "gain": 0.3},
]
for i in range(7):                                # every new day: a swipe (organic pack, G/A)
    cues.append(S("swipe", day(i), 0.8, 1.0, (-0.25, 0.25)[i % 2]))
d = day
cues += [
    # day 1 (bar C): the design snaps in. snap is C#; -1 +1 +3 +6 +8 +11 semitones = C D E G A C
    *[S("snap", d(0) + t, 0.6, ST(n)) for t, n in zip([15, 19, 23, 25, 27, 29], [-1, 1, 3, 6, 8, 11])],
    # day 2 (bars C, G): products drop in. select is F; -5 -1 +2 +7 = C E G C
    *[S("select", d(1) + 4 + k * 4, 0.5, ST(n)) for k, n in enumerate([-5, -1, 2, 7])],
    S("add-to-cart", d(1) + 28, 1.0, ST(-1)),    # F+C -> E+B over G
    S("open", d(2) + 2, 0.6),                     # E over G
    S("press", d(2) + 27, 0.9),                   # click (mechanical)
    S("purchase", d(2) + 30, 1.0),                # E + A over Am
    S("notification", d(3) + 14, 1.0, ST(-1)),   # F -> E over Am
    S("toggle-on", d(3) + 31, 0.8),               # E over Am
    # day 5 (bar F): the chart draws. progress-step is D#; +2 +6 +9 +14 = F A C F
    *[S("progress-step", d(4) + t, 0.65, ST(n)) for t, n in zip([8, 14, 20, 26], [2, 6, 9, 14])],
    S("reward", d(5) + 4, 0.8, ST(1)),            # B+E -> C+F over F
    S("level-up", d(6) + 4, 0.9, ST(-4)),         # E B G# -> C G E over C
    S("success", d(6) + 12, 0.7),                 # D + B over C
    {"type": "impact", "frame": PRICE + 6, "gain": 0.2}, {"type": "thump", "frame": PRICE + 6, "gain": 0.3},
    S("achievement", PRICE + 14, 0.7),            # F# D A over G
    S("swipe", END, 0.8),
    *[S("typing", END + 6 + k * 2, 1.1, 0.95 + 0.1 * (k % 3) / 2) for k in range(8)],
    S("success", END + 32, 0.8, ST(-2)),          # D+B -> C+A over Am
]
spec = {"fps": 30, "duration": 20, "seed": 9, "fade_out": 0.8, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues")
