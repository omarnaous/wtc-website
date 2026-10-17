"""One soundtrack per Story, on src/timing.js. The beds alternate so a highlight played straight through doesn't loop
the same music: odd Stories ride a 120 BPM tech-house bed, even ones a 90 BPM tape lo-fi bed (both grids put the
sticker lift, the answer and the lines on a beat). Typing while the question writes itself, a whoosh as the sticker
lifts, a riser into the answer, an impact on it, pops as the details land. Only non-tonal effects, so nothing fights
either bed's chords.
  python3 sound/build_cues.py   -> sound/<id>.json and sound/<id>-sfx.json for every Story"""
import json, re
src = open("src/timing.js").read()
n = lambda k: float(re.search(rf"export const {k} = ([\d.]+)", src).group(1))
STICKER, TYPE, CPF, LIFT, ANSWER, OUTRO, DUR = (n(k) for k in ["STICKER", "TYPE", "CPF", "LIFT", "ANSWER", "OUTRO", "DURATION"])
LINES = [int(x) for x in re.search(r"LINES = \[([\d, ]+)\]", src).group(1).split(",")]
faqs = re.findall(r'id: "(\w+)", q: "([^"]+)"[^\n]*?(chips: \[[^\]]*\])?', open("src/faqs.js").read())
smp = lambda name, frame, gain: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": int(frame), "gain": gain}

for i, (fid, q, chips) in enumerate(faqs):
    typed_end = TYPE + len(q) / CPF
    if i % 2 == 0:
        bed = {"type": "house", "start": 0, "end": int(DUR), "bpm": 120, "gain": 0.36,
               "sections": [[0, "intro"], [int(LIFT), "gap"], [int(ANSWER), "drop"], [int(OUTRO) + 30, "outro"]],
               "lp_auto": [[0, 1200], [int(LIFT), 800], [int(ANSWER) - 1, 800], [int(ANSWER) + 2, 9500]]}
    else:
        bed = {"type": "lofi_tape", "start": 0, "end": int(DUR), "bpm": 90, "gain": 0.42,
               "lp_auto": [[0, 1400], [int(ANSWER) - 1, 1400], [int(ANSWER) + 2, 7000]]}
    fx = [
        {"type": "pop", "frame": int(STICKER) + 2, "gain": 0.14},
        {"type": "swoosh", "start": int(STICKER) - 4, "end": int(STICKER) + 10, "peak": 0.5, "f": 2200, "gain": 0.1},
        *[{**smp("typing", t, 0.22 + 0.06 * ((t // 3) % 3)), "pan": ((t // 3) % 5 - 2) * 0.08} for t in range(int(TYPE), int(typed_end), 3)],   # a key every 3 frames
        {"type": "swoosh", "start": int(LIFT) - 2, "end": int(LIFT) + 16, "peak": 0.4, "f": 1800, "gain": 0.14},
        {"type": "riser", "start": int(LIFT) + 4, "end": int(ANSWER), "gain": 0.08},
        {"type": "impact", "frame": int(ANSWER), "gain": 0.22}, {"type": "thump", "frame": int(ANSWER), "gain": 0.26},
        {"type": "pop", "frame": int(ANSWER) + 11, "gain": 0.1},
        *[{"type": "pop", "frame": t + 3, "gain": 0.09, "pan": (k - 1) * 0.25} for k, t in enumerate(LINES)],
        {"type": "pop", "frame": int(OUTRO) + 3, "gain": 0.08},
    ]
    for music_on in (True, False):
        spec = {"fps": 30, "duration": DUR / 30, "seed": 40 + i, "fade_out": 0.6, "lowpass": 10000, "peak_db": -3,
                "cues": ([bed] if music_on else []) + fx}
        out = f"sound/{fid}.json" if music_on else f"sound/{fid}-sfx.json"
        json.dump(spec, open(out, "w"), indent=1)
    print(fid, "house" if i % 2 == 0 else "lofi", len(q), "chars")
