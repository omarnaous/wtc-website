"""Soundtrack on src/timing.js: 120 BPM tech-house (one bar = 60 frames, chords Am F C G). A muffled intro under the
icon and the name, the drop as the first feature lands, a short break before the end card, then the outro. A tap on
every screen push (the phone's own click), a soft pop on each caption, a UI chime in the bar's chord when each
feature's frame lands, an impact and a sparkle on "Now on the App Store".
  python3 sound/build_cues.py   -> sound/cues.json (music + effects) and sound/cues-sfx.json (effects only)"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
ICON, NAME, TAG, PHONE, FEAT, FEAT_LEN, END, DUR = (n(k) for k in ["ICON", "NAME", "TAG", "PHONE", "FEAT", "FEAT_LEN", "END", "DURATION"])
FEATS = [FEAT + k * FEAT_LEN for k in range(7)]
smp = lambda name, frame, gain, semis=0: {"type": "sample", "file": f"sound/sfx/{name}.ogg", "frame": frame, "gain": gain, **({"rate": 2 ** (semis / 12)} if semis else {})}
# the chord of the bar a frame lands in (bars of 60 frames: Am F C G) -> a chime that belongs to it
CHORD = ["Am", "F", "C", "G"]
chime_for = {"Am": ("toggle-on", 0), "F": ("select", 0), "C": ("toggle-on", 0), "G": ("success", 0)}   # E, F, E, D+B
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.4,
          "sections": [[0, "intro"], [FEAT - 30, "gap"], [FEAT, "drop"], [END - 30, "break"], [END, "outro"]],
          "lp_auto": [[0, 1200], [FEAT - 30, 700], [FEAT - 1, 700], [FEAT + 2, 9500], [END - 30, 2500], [END, 9500]]}]
fx = [
    {"type": "pop", "frame": ICON + 2, "gain": 0.14}, {"type": "glint", "frame": ICON + 4, "gain": 0.07, "freq": 1318.5},
    {"type": "pop", "frame": NAME + 2, "gain": 0.12}, {"type": "pop", "frame": TAG + 2, "gain": 0.08},
    {"type": "swoosh", "start": PHONE - 4, "end": PHONE + 14, "peak": 0.5, "f": 1800, "gain": 0.12},
    {"type": "riser", "start": FEAT - 30, "end": FEAT, "gain": 0.09},
    {"type": "impact", "frame": FEAT, "gain": 0.2}, {"type": "thump", "frame": FEAT, "gain": 0.24},
]
for k, at in enumerate(FEATS):
    if k: fx.append(smp("press", at, 0.35))                                           # the screen pushes
    fx.append({"type": "pop", "frame": at + 5, "gain": 0.09})                          # caption
    name, semis = chime_for[CHORD[((at + 12) // 60) % 4]]
    fx.append(smp(name, at + 12, 0.22, semis))                                         # the frame lands on the feature
fx += [
    {"type": "reverse_swell", "start": END - 24, "end": END, "gain": 0.1, "notes": ["G3", "B3", "D4"]},
    {"type": "swoosh", "start": END - 6, "end": END + 12, "peak": 0.45, "f": 2200, "gain": 0.16},
    {"type": "pop", "frame": END + 19, "gain": 0.12},
    {"type": "impact", "frame": END + 31, "gain": 0.2}, {"type": "glint", "frame": END + 33, "gain": 0.07, "freq": 1760},
    {"type": "pop", "frame": END + 45, "gain": 0.1},
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 7, "fade_out": 1.0, "lowpass": 10000, "peak_db": -3,
            "cues": (music if music_on else []) + fx}
    out = "sound/cues.json" if music_on else "sound/cues-sfx.json"
    json.dump(spec, open(out, "w"), indent=1)
    print(out, len(spec["cues"]), "cues")
