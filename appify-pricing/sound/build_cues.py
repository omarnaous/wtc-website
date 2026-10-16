"""Soundtracks on src/timing.js. The four Stories are posted back to back, so each plan has its own sound kit:
a different music bed and different effects for the same beats (question, quiet beat, price slam, printed lines,
total, stamp, cut to the end card).
  Store360   "shop"    120 BPM tech-house · impact slam · dot-matrix printer · cash register · rubber stamp
  WebApp500  "system"  drone + half-time beat · glitch slam · typing + rising data blips · chart rise · paper slap
  App999     "app"     80 BPM tape lo-fi · phone UI sounds tuned to the chords (notification, purchase, toggles)
  Motion199  "motion"  trap beat + low drone · record scratch on the pause · 808 drop · swishes · coins on the saving
  python3 sound/build_cues.py      -> sound/<Plan>.json and sound/<Plan>-sfx.json (effects only), for every plan"""
import json, re
src = open("src/timing.js").read()
v = lambda name: float(re.search(rf"export const {name} = (?:b\()?([\d.]+)", src).group(1))
B = v("BEAT"); b = lambda n: round(n * B)
Q1, Q2, HUSH, ROLL, PRICE, RISE, PRINT = 2, 10, b(2.7), b(3.4), b(4), b(5.6), b(7)
TOTAL, STAMP, END, DUR = b(17), b(18), b(20), int(v("DURATION"))
line_at = lambda i, n: PRINT + 6 + i * min(24, (TOTAL - PRINT - 20) // n)   # same as lineAt in timing.js
plans = re.findall(r'id: "(\w+)".*?lines: \[(.*?)\],\n', open("src/plans.js").read(), re.S)
S = "sound/sfx/"
smp = lambda name, frame, gain, **k: {"type": "sample", "file": S + name + ".ogg", "frame": frame, "gain": gain, **k}


def shop(n):
    music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.42,
              "sections": [[0, "intro"], [HUSH, "gap"], [PRICE, "drop"], [END, "outro"]],
              "lp_auto": [[0, 900], [HUSH, 700], [PRICE - 1, 700], [PRICE + 2, 9000]]}]
    fx = [
        {"type": "swoosh", "start": 0, "end": 12, "peak": 0.4, "f": 2400, "gain": 0.12},
        {"type": "pop", "frame": Q1 + 1, "gain": 0.12, "pan": -0.2},
        {"type": "pop", "frame": Q2 + 1, "gain": 0.14, "pan": 0.2},
        {"type": "counter", "start": ROLL, "end": PRICE, "gain": 0.16},
        {"type": "reverse_swell", "start": HUSH + 4, "end": PRICE, "gain": 0.12, "notes": ["A3", "C4", "E4"]},
        {"type": "impact", "frame": PRICE, "gain": 0.26},
        {"type": "thump", "frame": PRICE, "gain": 0.3},
        {"type": "glint", "frame": PRICE + 10, "gain": 0.05},
        {"type": "swoosh", "start": RISE - 4, "end": RISE + 10, "peak": 0.5, "f": 1800, "gain": 0.1},
        {"type": "click", "frame": RISE + 6, "gain": 0.12},
        {"type": "printer", "start": PRINT, "end": PRINT + 14, "gain": 0.22},
    ]
    for i in range(n):
        a = line_at(i, n)
        fx += [{"type": "printer", "start": a, "end": a + 9, "gain": 0.2, "pan": 0.1 * (-1) ** i},
               {"type": "pop", "frame": a + 6, "gain": 0.11, "pan": -0.3}]
    fx += [
        {"type": "printer", "start": TOTAL, "end": TOTAL + 12, "gain": 0.22},
        {"type": "register", "frame": TOTAL + 10, "gain": 0.16},
        {"type": "stamp", "frame": STAMP, "gain": 0.3},
        {"type": "thump", "frame": STAMP, "gain": 0.16},
        {"type": "reverse_swell", "start": END - 14, "end": END, "gain": 0.1, "notes": ["G3", "B3", "D4"]},
        {"type": "swoosh", "start": END - 7, "end": END + 9, "peak": 0.45, "f": 2800, "gain": 0.2},
        {"type": "pop", "frame": END + 12, "gain": 0.12},
        {"type": "glint", "frame": END + 30, "gain": 0.05, "freq": 2794},
    ]
    return music, fx, 41


def system(n):
    # A minor: drone on A1 the whole way, a pad and a half-time beat from the price on
    music = [
        {"type": "drone", "start": 0, "end": DUR, "freq": 55, "gain": 0.2},
        {"type": "pad", "start": PRICE, "end": DUR, "chord": [110, 130.81, 164.81, 220], "gain": 0.13, "fade_in": 0.4},
        {"type": "beat", "start": PRICE, "end": DUR, "bpm": 120, "pattern": "half-time", "gain": 0.34, "hats": 0.3},
    ]
    blips = [880 * 2 ** (k / 12) for k in (0, 3, 5, 7, 10, 12, 15, 17)]          # A minor pentatonic, stepping up
    fx = [
        {"type": "typing", "start": 0, "end": 30, "gain": 0.14},                   # the question is typed
        {"type": "glitch", "frame": HUSH, "gain": 0.09},
        {"type": "graph_rise", "start": ROLL - 4, "end": PRICE, "f0": 300, "f1": 1200, "gain": 0.1},
        {"type": "glitch", "frame": PRICE, "gain": 0.14},
        {"type": "impact", "frame": PRICE, "gain": 0.22},
        {"type": "thump", "frame": PRICE, "gain": 0.3, "freq": 55},
        {"type": "sweep", "start": RISE - 2, "end": RISE + 12, "f0": 400, "f1": 1600, "gain": 0.07},
        {"type": "blip", "frame": RISE + 6, "freq": 440, "gain": 0.12},
        {"type": "typing", "start": PRINT, "end": PRINT + 12, "gain": 0.12},
    ]
    for i in range(n):
        a = line_at(i, n)
        fx += [{"type": "typing", "start": a, "end": a + 7, "gain": 0.1, "pan": 0.15 * (-1) ** i},
               {"type": "blip", "frame": a + 6, "freq": blips[i % len(blips)], "gain": 0.13, "pan": -0.2}]
    fx += [
        {"type": "graph_rise", "start": TOTAL - 4, "end": TOTAL + 10, "f0": 440, "f1": 1760, "gain": 0.08},
        {"type": "chime", "frame": TOTAL + 10, "freq": 1760, "gain": 0.06},
        {"type": "slap", "frame": STAMP, "gain": 0.3},
        {"type": "thump", "frame": STAMP, "gain": 0.14, "freq": 55},
        {"type": "whoosh", "start": END - 10, "end": END + 8, "gain": 0.16},
        {"type": "glitch", "frame": END, "gain": 0.08},
        {"type": "blip", "frame": END + 12, "freq": 1318.5, "gain": 0.12},
        {"type": "blip", "frame": END + 16, "freq": 1760, "gain": 0.1},
    ]
    return music, fx, 52


def app(n):
    # 80 BPM tape lo-fi in C (bar = 90 frames): Dm9 0-90, G13 90-180, Cmaj9 180-270, A7 270-360, Dm9 360-.
    # Every UI sound is a note of the chord it lands in (pitches from assets/sfx/README.md).
    music = [{"type": "lofi_tape", "start": 0, "end": DUR, "bpm": 80, "gain": 0.5,
              "lp_auto": [[0, 800], [HUSH, 600], [PRICE - 1, 600], [PRICE + 2, 7000]]}]
    fx = [
        smp("notification", Q1 + 1, 0.32),                                          # F (Dm9)
        {"type": "pop", "frame": Q2 + 1, "gain": 0.1},
        {"type": "counter", "start": ROLL, "end": PRICE, "gain": 0.1},
        smp("purchase", PRICE, 0.4),                                                # E + A (Dm9)
        {"type": "thump", "frame": PRICE, "gain": 0.28},
        {"type": "impact", "frame": PRICE, "gain": 0.1},
        smp("swipe", RISE, 0.3),                                                    # G/A (Dm9)
        smp("press", PRINT, 0.25),
    ]
    for i in range(n):
        a = line_at(i, n)
        fx += [smp("press", a, 0.18, pan=0.15 * (-1) ** i), smp("toggle-on", a + 6, 0.24, pan=-0.2)]   # E (G13, Cmaj9)
    fx += [
        smp("success", TOTAL + 10, 0.32),                                           # D + B (Cmaj9)
        smp("reward", STAMP, 0.32),                                                 # B + E (A7)
        {"type": "thump", "frame": STAMP, "gain": 0.16},
        smp("swipe", END - 6, 0.32),                                                # G/A (A7)
        {"type": "swoosh", "start": END - 7, "end": END + 9, "peak": 0.45, "f": 3200, "gain": 0.1},
        smp("open", END + 12, 0.3),                                                 # E (A7)
    ]
    return music, fx, 63


def motion(n):
    # trap beat + low drone in A minor; the record scratch stops the question dead on the quiet beat
    music = [
        {"type": "drone", "start": 0, "end": DUR, "freq": 55, "gain": 0.14},
        {"type": "pad", "start": 0, "end": HUSH, "chord": [110, 164.81, 220, 261.63], "gain": 0.1, "fade_in": 0.3},
        {"type": "pad", "start": PRICE, "end": DUR, "chord": [110, 130.81, 164.81, 196, 220], "gain": 0.11, "fade_in": 0.2},
        {"type": "beat", "start": PRICE, "end": DUR, "bpm": 120, "pattern": "trap", "gain": 0.32, "hats": 0.28},
    ]
    fx = [
        {"type": "swish", "start": Q1 - 2, "end": Q1 + 8, "gain": 0.1, "pan": -0.3},
        {"type": "swish", "start": Q2 - 2, "end": Q2 + 8, "gain": 0.1, "pan": 0.3},
        {"type": "scratch", "frame": HUSH, "gain": 0.16},
        {"type": "riser", "start": HUSH + 2, "end": PRICE, "gain": 0.08},
        {"type": "bass_drop", "frame": PRICE, "gain": 0.3},
        {"type": "impact", "frame": PRICE, "gain": 0.16},
        {"type": "swish", "start": RISE - 4, "end": RISE + 8, "gain": 0.1},
        {"type": "click", "frame": PRINT, "gain": 0.12},
    ]
    for i in range(n):
        a = line_at(i, n)
        fx += [{"type": "swish", "start": a - 3, "end": a + 6, "gain": 0.07, "pan": 0.2 * (-1) ** i},
               {"type": "click", "frame": a + 6, "gain": 0.11, "pan": -0.2}]
    fx += [
        {"type": "cash_riffle", "frame": TOTAL, "gain": 0.12, "dur": 0.4},
        {"type": "coins", "frame": TOTAL + 8, "gain": 0.16, "count": 8},          # the saving
        {"type": "coin_drop", "frame": STAMP, "gain": 0.16},
        {"type": "stamp", "frame": STAMP, "gain": 0.2},
        {"type": "reverse_swell", "start": END - 14, "end": END, "gain": 0.1, "notes": ["A3", "C4", "E4"]},
        {"type": "whoosh", "start": END - 8, "end": END + 8, "gain": 0.16},
        {"type": "bass_drop", "frame": END, "gain": 0.14},
        {"type": "glint", "frame": END + 14, "gain": 0.05, "freq": 2637},
    ]
    return music, fx, 74


KITS = {"Store360": shop, "WebApp500": system, "App999": app, "Motion199": motion}
for pid, lines in plans:
    n = lines.count('"') // 2
    music, fx, seed = KITS[pid](n)
    for with_music in (True, False):
        spec = {"fps": 30, "duration": DUR / 30, "seed": seed, "fade_out": 0.8, "lowpass": 10000, "peak_db": -3,
                "cues": (music if with_music else []) + fx}
        out = f"sound/{pid}{'' if with_music else '-sfx'}.json"
        json.dump(spec, open(out, "w"), indent=1)
        print(out, len(spec["cues"]), "cues")
