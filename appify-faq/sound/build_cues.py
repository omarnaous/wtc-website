"""One soundtrack per Story, on src/timing.js. The beds alternate so a highlight played straight through doesn't loop
the same music: odd Stories ride a 120 BPM tech-house bed, even ones a 90 BPM tape lo-fi bed (every cue is a multiple
of 30 frames, so it lands on a beat of both). The effects follow what each Story shows: a pop and a swish when a
sticker is placed, keyclicks while nothing types, the tap on a quiz answer, clock ticks on the countdown, a pop per
hashtag. Only non-tonal effects, so nothing fights either bed's chords.
  python3 sound/build_cues.py   -> sound/<id>.json and sound/<id>-sfx.json for every Story"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
Q, A, B, C, D, E, TAP, DUR = (n(k) for k in ["Q", "A", "B", "C", "D", "E", "TAP", "DURATION"])
stories = re.findall(r'id: "(\w+)", kind: "(\w+)"', open("src/faqs.js").read())
smp = lambda name, frame, gain: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": int(frame), "gain": gain}
place = lambda at, g=0.12, pan=0: [{"type": "pop", "frame": at + 2, "gain": g, "pan": pan},
                                   {"type": "swish", "start": at - 3, "end": at + 7, "gain": 0.05, "pan": pan}]

for i, (sid, kind) in enumerate(stories):
    if i % 2 == 0:
        bed = {"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.34,
               "sections": [[0, "intro"], [A - 30, "gap"], [A, "drop"], [E + 60, "outro"]],
               "lp_auto": [[0, 1400], [A - 1, 1400], [A + 2, 9500]]}
    else:
        bed = {"type": "lofi_tape", "start": 0, "end": DUR, "bpm": 90, "gain": 0.42,
               "lp_auto": [[0, 1600], [A - 1, 1600], [A + 2, 7000]]}
    fx = place(Q, 0.14) + [{"type": "thump", "frame": A, "gain": 0.16}] + place(A, 0.13)
    if kind == "quiz":
        fx += [smp("press", TAP, 0.5), {"type": "pop", "frame": TAP + 2, "gain": 0.12}] + place(C + 10, 0.1) + place(D + 10, 0.08)
    elif kind == "countdown":
        fx += [{"type": "tick", "frame": t, "gain": 0.07} for t in range(B, DUR - 20, 30)] + place(C, 0.11) + place(D, 0.08) + place(E, 0.1, 0.3)
    elif kind == "tags":
        fx += [p for k in range(5) for p in place(B + k * 7, 0.1, (k - 2) * 0.25)] + place(D + 10, 0.08)
    elif kind == "neon":
        fx += [p for k in range(4) for p in place(B + k * 8, 0.09, -0.2)] + place(D, 0.07) + place(E, 0.07)
    else:
        fx += place(B, 0.1, -0.2) + place(C, 0.11, 0.2) + place(D, 0.09) + place(E, 0.1, 0.25)
    for music_on in (True, False):
        spec = {"fps": 30, "duration": DUR / 30, "seed": 60 + i, "fade_out": 0.6, "lowpass": 10000, "peak_db": -3,
                "cues": ([bed] if music_on else []) + fx}
        json.dump(spec, open(f"sound/{sid}.json" if music_on else f"sound/{sid}-sfx.json", "w"), indent=1)
    print(sid, kind, "house" if i % 2 == 0 else "lofi")
