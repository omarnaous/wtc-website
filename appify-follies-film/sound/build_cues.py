"""Runway soundtrack on src/timing.js: 120 BPM tech-house (beat = 15 frames, bar = 60; chords Am F C G). A muffled
intro under the empty desert, a beat of silence, the drop as the first look lands. Each look: the shutter slams (swoosh +
impact on the bar), a camera shutter click on every beat as the model turns. The line-up: a click per look arriving,
a swish as they turn and walk away. The bed breaks to pads for the wordmark, glints on each line.
  python3 sound/build_cues.py  ->  sound/cues.json (music + effects), sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DUR, DROP, LINEUP, TURN, END, BEAT = n("DURATION"), n("DROP"), n("LINEUP"), n("TURN"), n("END"), n("BEAT")
LOOKS = [int(x) for x in re.findall(r"\{ at: (\d+),", src)]
ET = [int(x) for x in re.search(r"END_TEXT = \[([\d, ]+)\]", src).group(1).split(",")]
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.42,
          "sections": [[0, "intro"], [DROP - 15, "gap"], [DROP, "drop"], [END, "break"], [END + 120, "outro"]],
          "lp_auto": [[0, 800], [DROP - 16, 800], [DROP + 1, 10000], [END - 2, 10000], [END + 2, 2600], [DUR, 2600]]}]
fx = [{"type": "pad", "start": 0, "end": DROP, "gain": 0.04},
      {"type": "glint", "frame": 8, "gain": 0.06, "freq": 1760},                                   # wordmark in the sky
      {"type": "riser", "start": 20, "end": DROP - 3, "gain": 0.1}]
for a in LOOKS + [LINEUP]:
    fx += [{"type": "swoosh", "start": a - 7, "end": a + 4, "peak": 0.6, "f": 2200, "gain": 0.16},
           {"type": "impact", "frame": a, "gain": 0.2 if a == DROP else 0.14}]
for a in LOOKS:                                                                                     # the model turns on the beat
    fx += [{"type": "click", "frame": a + k * BEAT, "gain": 0.13, "freq": 1700, "pan": (-0.2, 0.2, 0, 0.1)[k]} for k in range(1, 4)]
fx += [{"type": "click", "frame": LINEUP + k * BEAT, "gain": 0.12, "freq": 1500 + 100 * k, "pan": (-0.4, -0.15, 0.15, 0.4)[k]} for k in range(4)]
fx += [{"type": "swish", "start": TURN - 2, "end": TURN + 16, "gain": 0.08}, {"type": "swoosh", "start": TURN + 20, "end": END, "peak": 0.7, "f": 900, "gain": 0.1}]
fx += [{"type": "glint", "frame": ET[0], "gain": 0.07, "freq": 1318.5}, {"type": "glint", "frame": ET[1], "gain": 0.05, "freq": 1760},
       {"type": "tick", "frame": ET[2], "gain": 0.04, "freq": 2637}, {"type": "glint", "frame": ET[3], "gain": 0.05, "freq": 2093}]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 11, "fade_out": 1.5, "lowpass": 11000, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
