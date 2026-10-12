"""Soundtrack on src/timing.js. Music: a 120 BPM tech-house bed (sound.py "house"), muffled under the chat, cut to
near-silence for a beat of tension, then the drop when the store starts building; a breakdown under the price, back
for the end card. Effects: real CC0 UI sounds from uisfx (pack "glass", sound/sfx/) on every on-screen action:
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
# typing the prompt: a key every couple of characters, slightly varied so it sounds like hands, not a loop
keys = [f for f in range(0, int(TYPE0 + len(MSG) / RATE) + 1, 2)]
cues += [S("typing", f, 1.1, 0.92 + 0.16 * ((f * 37) % 11) / 10, (-0.15, 0.15)[i % 2]) for i, f in enumerate(keys)]
cues += [
    S("send", SEND, 1.0),
    S("receive", REPLY, 1.0),
    {"type": "riser", "start": GAP, "end": BUILD, "gain": 0.06},
    {"type": "reverse_swell", "start": BUILD - 18, "end": BUILD, "gain": 0.14, "notes": ["A3", "C4", "E4", "G4"]},
    {"type": "impact", "frame": BUILD, "gain": 0.18},
    {"type": "thump", "frame": BUILD, "gain": 0.3},
]
for i in range(7):                                    # every new day: a swipe
    cues.append(S("swipe", day(i), 0.9, 0.95 + 0.03 * i, (-0.25, 0.25)[i % 2]))
d = day
cues += [
    *[S("snap", d(0) + t, 0.7, 0.9 + 0.08 * k) for k, t in enumerate([15, 19, 23, 25, 27, 29])],   # day 1: the design snaps in
    *[S("select", d(1) + 4 + k * 4, 0.55, 1.0 + 0.06 * k) for k in range(4)],                    # day 2: products drop in
    S("add-to-cart", d(1) + 28, 1.1),
    S("open", d(2) + 2, 0.7), S("press", d(2) + 27, 0.9), S("purchase", d(2) + 30, 1.1),        # day 3: checkout
    S("notification", d(3) + 14, 1.1), S("toggle-on", d(3) + 31, 0.9),                         # day 4: new order, inventory
    *[S("progress-step", d(4) + t, 0.7, 1.0 + 0.1 * k) for k, t in enumerate([8, 14, 20, 26])],  # day 5: the chart draws
    S("reward", d(5) + 4, 0.8),                                                                 # day 6: motion
    S("level-up", d(6) + 4, 1.0), S("success", d(6) + 12, 0.8),                                 # day 7: live
    {"type": "impact", "frame": PRICE + 6, "gain": 0.2}, {"type": "thump", "frame": PRICE + 6, "gain": 0.3},
    S("achievement", PRICE + 14, 0.8),
    S("swipe", END, 0.9, 1.05),
    *[S("typing", END + 6 + k * 2, 1.0, 0.95 + 0.1 * (k % 3) / 2) for k in range(8)],
    S("success", END + 32, 0.9),
]
spec = {"fps": 30, "duration": 20, "seed": 9, "fade_out": 0.8, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues")
