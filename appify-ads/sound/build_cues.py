"""Soundtrack on src/timing.js. Music: the 120 BPM tech-house bed (sound.py "house"), muffled under the hook, a beat of
near-silence, the drop on the comparison, a breakdown under the service list, back for the end card.
Effects: CC0 uisfx sounds (sound/sfx/, README.txt). Tonal ones are tuned to A440 and moved only by whole semitones (ST)
into the chord of the bar they land in (Am, F, C, G, one chord per 60-frame bar). Press/typing are pitchless clicks.
  python3 sound/build_cues.py          -> sound/cues.json        (music + effects)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (effects only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
TAP, WAIT, SMART, VS, ROW_LEN, END, DUR = [g(k) for k in ["TAP", "WAIT", "SMART", "VS", "ROW_LEN", "END", "DURATION"]]
NROWS = len(re.findall(r'^\s+\["[^"]+", "[^"]+", "[^"]+"\],?$', src, re.M))
row = lambda i: VS + 10 + i * ROW_LEN
SERVICE = VS + 10 + NROWS * ROW_LEN + 25
ST = lambda n: round(2 ** (n / 12), 5)
SFX_GAIN = 0.7
S = lambda name, frame, gain=1.0, rate=1.0, pan=0.0: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": round(gain * SFX_GAIN, 3), "rate": rate, "pan": pan}
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    {"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.5,
     "sections": [[0, "intro"], [VS - 14, "gap"], [VS, "drop"], [SERVICE, "break"], [END, "outro"]],
     "lp_auto": [[0, 1300], [VS - 14, 1300], [VS - 1, 1800], [VS + 1, 12000]]},
]
cues += [
    # hook (bars Am, F): the finger nearly presses Boost, she stops it
    S("press", TAP, 0.8),
    S("receive", WAIT, 0.7),                                      # C+E over Am
    {"type": "stamp", "frame": WAIT + 6, "gain": 0.16},           # WAIT. NOT YET.
    S("receive", SMART, 0.7),                                     # C+E over F
    {"type": "riser", "start": VS - 14, "end": VS, "gain": 0.05},
    {"type": "reverse_swell", "start": VS - 18, "end": VS, "gain": 0.13, "notes": ["F3", "A3", "C4", "E4"]},
    {"type": "impact", "frame": VS, "gain": 0.18}, {"type": "thump", "frame": VS, "gain": 0.3},
]
# the comparison: a click as the Boost side lands, a note as the Ads Manager tick lands (in the bar's chord)
SEL = [0, -5, 2, -1, 4, 7]           # select is F -> F, C, G, E, A, C over F, C, G, Am, Am, F
for i in range(NROWS):
    cues += [S("press", row(i), 0.5, 1.0, -0.3), S("select", row(i) + 8, 0.55, ST(SEL[i % len(SEL)]), 0.3)]
for i, n in [(0, 0), (2, 2), (4, 0)]:   # her comments: receive (C+E) -> as is over F/Am, +2 (D+F#) over G
    cues.append(S("receive", row(i) + 12, 0.55, ST(n)))
cues += [
    S("swipe", SERVICE, 0.8),
    {"type": "thump", "frame": SERVICE + 5, "gain": 0.22},
    *[S("snap", SERVICE + 16 + k * 7, 0.6, ST(n)) for k, n in enumerate([-1, 3, 6, 10, 13])],   # C E | G B D
    S("swipe", END, 0.8),
    {"type": "thump", "frame": END + 24, "gain": 0.2},
    S("success", END + 24, 0.8, ST(-2)),                          # C+A over Am: DM "ADS"
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 13, "fade_out": 0.8, "peak_db": -3, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues,", NROWS, "rows")
