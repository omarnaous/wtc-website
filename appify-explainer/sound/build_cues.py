"""Soundtrack on src/timing.js: a 120 BPM tech-house bed (muffled under the first line, silent on the dotted pause,
the drop on "stopped the scroll?", outro under the logo), typing on every typed line, a click + pop on each "enter",
a sound for each card (cart, ad timeline, both stores, the dashboard), an impact on the logo spark and a counter on
the price. Tonal blips sit on the chord of their bar (Am F C G, one bar = 60 frames).
  python3 sound/build_cues.py   -> sound/cues.json (music + effects) and sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
num = lambda name: float(re.search(rf"export const {name} = ([\d.]+)", src).group(1))
TYPE1, COLLAPSE, SLAM, BAR, PROMPT, PLEN, CHAR, LOGO, PRICE, DUR = (num(k) for k in ["TYPE1", "COLLAPSE", "SLAM", "BAR", "PROMPT", "PROMPT_LEN", "CHAR", "LOGO", "PRICE", "DURATION"])
PROMPTS = re.findall(r'"([^"]+)"', re.search(r"PROMPTS = \[(.*?)\]", src).group(1))
prompt_at = lambda i: PROMPT + i * PLEN
enter_at = lambda i: prompt_at(i) + -(-len(PROMPTS[i]) * CHAR // 1) + 4
F = lambda x: int(round(x))

music = [{"type": "house", "start": 0, "end": int(DUR), "bpm": 120, "gain": 0.4,
          "sections": [[0, "intro"], [F(COLLAPSE), "gap"], [F(SLAM), "drop"], [F(LOGO), "outro"]],
          "lp_auto": [[0, 1200], [F(COLLAPSE), 800], [F(SLAM) - 1, 800], [F(SLAM) + 2, 9500]]}]
fx = [
    {"type": "typing", "start": F(TYPE1), "end": F(TYPE1 + 18 * 2.2), "gain": 0.16},
    {"type": "reverse_swell", "start": F(COLLAPSE + 2), "end": F(SLAM), "gain": 0.12, "notes": ["A3", "C4", "E4"]},
    {"type": "tick", "frame": F(COLLAPSE + 6), "gain": 0.06},
    {"type": "impact", "frame": F(SLAM), "gain": 0.24},
    {"type": "thump", "frame": F(SLAM), "gain": 0.3},
    {"type": "whoosh", "start": F(BAR - 8), "end": F(BAR + 8), "gain": 0.12},
    {"type": "pop", "frame": F(BAR + 2), "gain": 0.12},
]
for i, p in enumerate(PROMPTS):
    a, e = prompt_at(i), enter_at(i)
    fx += [{"type": "typing", "start": F(a), "end": F(e - 4), "gain": 0.13, "pan": 0.1},
           {"type": "click", "frame": F(e), "gain": 0.16},
           {"type": "pop", "frame": F(e + 1), "gain": 0.13, "pan": -0.15}]
e0, e1, e2, e3 = (enter_at(i) for i in range(4))
fx += [
    {"type": "click", "frame": F(e0 + 18), "gain": 0.12}, {"type": "coin", "frame": F(e0 + 22), "gain": 0.12},           # added to cart
    {"type": "swish", "start": F(e1), "end": F(e1 + 12), "gain": 0.1},                                                    # ad timeline
    *[{"type": "pop", "frame": F(e1 + 4 + k * 6), "gain": 0.09, "pan": (k - 1) * 0.3} for k in range(3)],               # Stop / the / scroll.
    {"type": "blip", "frame": F(e2 + 14), "freq": 880.0, "gain": 0.12},                                                   # App Store ✓ (A, Am/F bar)
    {"type": "blip", "frame": F(e2 + 20), "freq": 1046.5, "gain": 0.12},                                                  # Google Play ✓ (C)
    {"type": "graph_rise", "start": F(e3 + 2), "end": F(e3 + 22), "f0": 349.2, "f1": 1396.9, "gain": 0.08},              # dashboard grows
    *[{"type": "blip", "frame": F(e3 + 10 + k * 4), "freq": [698.5, 880.0, 1046.5][k], "gain": 0.08} for k in range(3)], # rows (F A C)
    {"type": "whoosh", "start": F(LOGO - 8), "end": F(LOGO + 8), "gain": 0.14},
    {"type": "impact", "frame": F(LOGO + 16), "gain": 0.2},                                                               # the spark lands
    {"type": "glint", "frame": F(LOGO + 18), "gain": 0.06, "freq": 2093},
    {"type": "typing", "start": F(LOGO + 22), "end": F(LOGO + 48), "gain": 0.1},
    {"type": "counter", "start": F(PRICE), "end": F(PRICE + 12), "gain": 0.12},
    {"type": "pop", "frame": F(PRICE + 12), "gain": 0.12},
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 88, "fade_out": 0.8, "lowpass": 10000, "peak_db": -3,
            "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1)
    print(out, len(spec["cues"]), "cues")
