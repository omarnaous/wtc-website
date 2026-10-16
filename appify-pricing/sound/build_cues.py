"""Soundtracks on src/timing.js, one per plan: a 120 BPM tech-house bed (muffled intro under the question, silence on
the quiet beat, the drop on the price slam, outro under the end card), a rolling counter into the slam, a dot-matrix
printer while the receipt prints, a pop per ticked line, a register on the total, a stamp, and a swoosh on the cut.
  python3 sound/build_cues.py      -> sound/<Plan>.json and sound/<Plan>-sfx.json (effects only), for every plan"""
import json, re
src = open("src/timing.js").read()
v = lambda name: float(re.search(rf"export const {name} = (?:b\()?([\d.]+)", src).group(1))
B = v("BEAT"); b = lambda n: round(n * B)
Q1, Q2, HUSH, ROLL, PRICE, RISE, PRINT = 2, 10, b(2.7), b(3.4), b(4), b(5.6), b(7)
TOTAL, STAMP, END, DUR = b(17), b(18), b(20), int(v("DURATION"))
line_at = lambda i, n: PRINT + 6 + i * min(24, (TOTAL - PRINT - 20) // n)   # same as lineAt in timing.js
plans = re.findall(r'id: "(\w+)".*?lines: \[(.*?)\],\n', open("src/plans.js").read(), re.S)

for pid, lines in plans:
    n = lines.count('"') // 2
    for music in (True, False):
        cues = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.42,
                 "sections": [[0, "intro"], [HUSH, "gap"], [PRICE, "drop"], [END, "outro"]],
                 "lp_auto": [[0, 900], [HUSH, 700], [PRICE - 1, 700], [PRICE + 2, 9000]]}] if music else []
        cues += [
            {"type": "swoosh", "start": 0, "end": 12, "peak": 0.4, "f": 2400, "gain": 0.12},
            {"type": "pop", "frame": Q1 + 1, "gain": 0.12, "pan": -0.2},
            {"type": "pop", "frame": Q2 + 1, "gain": 0.14, "pan": 0.2},
            {"type": "counter", "start": ROLL, "end": PRICE, "gain": 0.16},                 # the price rolls up
            {"type": "reverse_swell", "start": HUSH + 4, "end": PRICE, "gain": 0.12, "notes": ["A3", "C4", "E4"]},
            {"type": "impact", "frame": PRICE, "gain": 0.26},                                # the slam
            {"type": "thump", "frame": PRICE, "gain": 0.3},
            {"type": "glint", "frame": PRICE + 10, "gain": 0.05},
            {"type": "swoosh", "start": RISE - 4, "end": RISE + 10, "peak": 0.5, "f": 1800, "gain": 0.1},
            {"type": "click", "frame": RISE + 6, "gain": 0.12},                              # printer slot opens
            {"type": "printer", "start": PRINT, "end": PRINT + 14, "gain": 0.22},            # receipt header
        ]
        for i in range(n):
            a = line_at(i, n)
            cues.append({"type": "printer", "start": a, "end": a + 9, "gain": 0.2, "pan": 0.1 * (-1) ** i})
            cues.append({"type": "pop", "frame": a + 6, "gain": 0.11, "pan": -0.3})       # the line's tick
        cues += [
            {"type": "printer", "start": TOTAL, "end": TOTAL + 12, "gain": 0.22},
            {"type": "register", "frame": TOTAL + 10, "gain": 0.16},                         # the total
            {"type": "stamp", "frame": STAMP, "gain": 0.3},                                  # the stamp
            {"type": "thump", "frame": STAMP, "gain": 0.16},
            {"type": "reverse_swell", "start": END - 14, "end": END, "gain": 0.1, "notes": ["G3", "B3", "D4"]},
            {"type": "swoosh", "start": END - 7, "end": END + 9, "peak": 0.45, "f": 2800, "gain": 0.2},
            {"type": "pop", "frame": END + 12, "gain": 0.12},                                # Book a call lands
            {"type": "glint", "frame": END + 30, "gain": 0.05, "freq": 2794},
        ]
        spec = {"fps": 30, "duration": DUR / 30, "seed": 41, "fade_out": 0.8, "lowpass": 10000, "peak_db": -3, "cues": cues}
        out = f"sound/{pid}{'' if music else '-sfx'}.json"
        json.dump(spec, open(out, "w"), indent=1)
        print(out, len(cues), "cues")
