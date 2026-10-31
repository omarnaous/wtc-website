"""Sound for the Darebni push-day reel, from src/timing.js: a 120 BPM gym house bed (filtered intro, the drop on the
first exercise, a break for the CTA), a whoosh + thump on every exercise change, a soft tick per stat chip, a hit on
the finisher and a chime on the "PLAN" button. Writes sound/cues.json (music) and sound/cues-sfx.json (effects only).
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
EX0, EX_LEN, N_EX = n("EX0"), n("EX_LEN"), n("N_EX")
FIN = EX0 + EX_LEN * N_EX; OUTRO = FIN + 75; DUR = OUTRO + 120
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.45,
          "sections": [[0, "intro"], [EX0 - 15, "gap"], [EX0, "drop"], [OUTRO, "break"], [OUTRO + 60, "outro"]],
          "lp_auto": [[0, 900], [EX0 - 16, 1600], [EX0 + 1, 10000], [OUTRO - 2, 10000], [OUTRO + 4, 2800], [OUTRO + 58, 2800], [OUTRO + 62, 10000]]}]
fx = [{"type": "pop", "frame": 6, "gain": 0.12}, {"type": "riser", "start": 40, "end": EX0 - 2, "gain": 0.08}]
fx += [{"type": "tick", "frame": 22 + i * 4, "gain": 0.04, "freq": 1760 + 120 * i} for i in range(4)]
for i in range(N_EX):
    a = EX0 + i * EX_LEN
    fx += [{"type": "whoosh", "start": a - 6, "end": a + 6, "gain": 0.09}, {"type": "impact" if i == 0 else "thump", "frame": a, "gain": 0.2 if i == 0 else 0.1}]
    fx += [{"type": "tick", "frame": a + 6 + k * 4, "gain": 0.035, "freq": (1318.5, 1568, 1760)[k]} for k in range(3)]
fx += [{"type": "whoosh", "start": FIN - 6, "end": FIN + 6, "gain": 0.1}, {"type": "impact", "frame": FIN, "gain": 0.16}]
fx += [{"type": "whoosh", "start": OUTRO - 6, "end": OUTRO + 8, "gain": 0.08}, {"type": "pop", "frame": OUTRO + 26, "gain": 0.12},
       {"type": "chime", "frame": OUTRO + 27, "gain": 0.05, "freq": 1318.5}, {"type": "glint", "frame": OUTRO + 42, "gain": 0.04, "freq": 2093}]
for mus, out in ((True, "sound/cues.json"), (False, "sound/cues-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 4, "fade_out": 1.2, "lowpass": 11000, "peak_db": -3, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
