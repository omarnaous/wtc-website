"""Effects for "Follies — the boutique" on src/shop-timing.js (120 BPM: beat = 15 frames, bar = 60). The music is
sound/runway.py, which mixes these on top. A camera shutter on every 8th cut of the lookbook rush, swooshes on the
triptych strips, a riser and a hit into the site. In the browser: one long scroll swish down the
homepage and a pop as each section chip lands. End card: Dev pops in, a tick for every
feature, a hit on "Pay once. Own it forever.", a chime on the DM pill,
a glint on the credit.
  python3 sound/shop_cues.py  ->  sound/shop-sfx.json
  python3 <motion-graphics>/scripts/sound.py sound/shop-sfx.json public/shop-sfx.wav
  python3 sound/runway.py public/shop-sfx.wav public/shop.wav"""
import json, re
src = open("src/shop-timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
DUR, TRI, PUNCH, SITE, END, BEAT, FEAT0 = n("DURATION"), n("TRIPTYCH"), n("PUNCH"), n("SITE"), n("END"), n("BEAT"), n("FEAT0")
CHIPS = [int(a) for a in re.findall(r'^  \[(\d+), "', src, re.M)]
NFEAT = len(re.search(r"FEATURES = \[(.*?)\];", src, re.S).group(1).split('","'))
SFX = "/root/.claude/skills/motion-graphics/assets/sfx/"
fx = [{"type": "impact", "frame": 0, "gain": 0.2}]
shutter = lambda fr, g=0.12, p=0.0: {"type": "click", "frame": round(fr), "gain": g, "freq": 1700, "pan": p}
fx += [shutter(i * 7.5, 0.11, ((i % 3) - 1) * 0.3) for i in range(1, 8)]                                  # rush cuts
for b in range(4):                                                                                         # triptych strips
    a = TRI + b * BEAT
    fx += [{"type": "swoosh", "start": a - 5, "end": a + 3, "peak": 0.6, "f": 1800, "gain": 0.1}, {"type": "thump", "frame": a + 2, "gain": 0.07}]
fx += [shutter(PUNCH + i * 7.5, 0.12, (-0.25, 0.25)[i % 2]) for i in range(6)]                              # punch frames
fx += [{"type": "riser", "start": PUNCH + 30, "end": SITE - 1, "gain": 0.07},
       {"type": "impact", "frame": SITE, "gain": 0.2}, {"type": "glint", "frame": SITE + 2, "gain": 0.05, "freq": 1760}]
fx += [{"type": "swish", "start": SITE + 34, "end": SITE + 344, "gain": 0.025}]                          # the long scroll
for i, a in enumerate(CHIPS):                                                                             # a chip per section
    fx += [{"type": "pop", "frame": SITE + a, "gain": 0.07}, {"type": "glint", "frame": SITE + a + 1, "gain": 0.025, "freq": (1318.5, 1568, 1760)[i % 3]}]
fx += [{"type": "impact", "frame": END, "gain": 0.14}, {"type": "pop", "frame": END + 12, "gain": 0.12}]
fx += [{"type": "tick", "frame": round(FEAT0 + i * 7.5), "gain": 0.035, "freq": 1760 + 60 * i} for i in range(NFEAT)]
own = round(FEAT0 + NFEAT * 7.5 + 8)                                                                      # pay once, own it
fx += [{"type": "impact", "frame": own, "gain": 0.15}, {"type": "glint", "frame": own + 2, "gain": 0.045, "freq": 1760},
       {"type": "chime", "frame": own + 20, "gain": 0.05, "freq": 1318.5},                                         # the DM pill
       {"type": "glint", "frame": own + 40, "gain": 0.035, "freq": 2093}]
spec = {"fps": 30, "duration": DUR / 30, "seed": 23, "fade_out": 1.5, "lowpass": 11000, "peak_db": -3, "cues": fx}
json.dump(spec, open("sound/shop-sfx.json", "w"), indent=1); print("sound/shop-sfx.json", len(fx), "cues")
