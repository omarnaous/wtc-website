"""Sound for the Darebni push-day reel, from src/timing.js. A 120 BPM gym house bed: filtered under the intro,
a bass drop on the first exercise, a break under the CTA. Every exercise card lands with a swoosh + slap and a stamp
per stat chip; every rep has a weight hit at the top (a sub thump plus a metal clink), exactly on the beat the demo
snaps to the top (t = 15 + 30k into each card, see GifCard in Main.jsx); the finisher gets a sting; the coach's
flexes get a pop; the PLAN button a hit + chime. Writes sound/cues.json (music) and sound/cues-sfx.json.
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
EX0, EX_LEN, N_EX = n("EX0"), n("EX_LEN"), n("N_EX")
FIN = EX0 + EX_LEN * N_EX; OUTRO = FIN + 75; DUR = OUTRO + 120
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.5,
          "sections": [[0, "intro"], [EX0 - 15, "gap"], [EX0, "drop"], [OUTRO, "break"], [OUTRO + 60, "outro"]],
          "lp_auto": [[0, 700], [EX0 - 16, 1800], [EX0 + 1, 11000], [OUTRO - 2, 11000], [OUTRO + 4, 2600], [OUTRO + 58, 2600], [OUTRO + 62, 11000]]}]
fx = [{"type": "riser", "start": 30, "end": EX0 - 3, "gain": 0.1}]
fx += [{"type": "stamp", "frame": 22 + i * 4, "gain": 0.05} for i in range(4)]                       # intro chips
fx += [{"type": "pop", "frame": f, "gain": 0.07} for f in (25, 55, 85)]                               # coach flexes
fx += [{"type": "bass_drop", "frame": EX0, "gain": 0.35}, {"type": "impact", "frame": EX0, "gain": 0.18}]
rep = lambda a, k: [{"type": "thump", "frame": a + 15 + 30 * k, "gain": 0.16}, {"type": "clink", "frame": a + 15 + 30 * k, "gain": 0.05, "pan": (-0.25, 0.25)[k % 2]}]
for i in range(N_EX):
    a = EX0 + i * EX_LEN
    if i: fx += [{"type": "swoosh", "start": a - 7, "end": a + 3, "peak": 0.6, "f": 1600, "gain": 0.12}, {"type": "slap", "frame": a, "gain": 0.12}]
    fx += [{"type": "stamp", "frame": a + 6 + k * 4, "gain": 0.045} for k in range(3)]
    for k in range(4): fx += rep(a, k)
fx += [{"type": "swoosh", "start": FIN - 7, "end": FIN + 3, "peak": 0.6, "f": 1600, "gain": 0.12}, {"type": "sting", "frame": FIN, "gain": 0.16}]
for k in range(2): fx += rep(FIN, k)
fx += [{"type": "swoosh", "start": OUTRO - 7, "end": OUTRO + 4, "peak": 0.6, "f": 1400, "gain": 0.1},
       {"type": "impact", "frame": OUTRO + 26, "gain": 0.14}, {"type": "chime", "frame": OUTRO + 27, "gain": 0.05, "freq": 1318.5},
       {"type": "pop", "frame": OUTRO + 34 + 15, "gain": 0.07}, {"type": "glint", "frame": OUTRO + 44, "gain": 0.04, "freq": 2093}]
for mus, out in ((True, "sound/cues.json"), (False, "sound/cues-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 4, "fade_out": 1.2, "lowpass": 12000, "peak_db": -3, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
