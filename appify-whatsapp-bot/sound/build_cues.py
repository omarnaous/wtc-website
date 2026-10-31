"""Sound for the WhatsApp booking-bot reel, from src/timing.js. The hook is a pile-up of incoming-message pings over a
tense filtered intro; the flip drops the 120 BPM bed with a hit; the demo uses real UI sounds (send for the client,
receive for the bot, soft typing while it "types", a press on every tap, success on the booking, a notification
when the meeting lands in the calendar); the diagram gets a pop + tick per step and a swish as the line draws; the
CTA breaks the bed down with a hit and a chime on the DM pill. Writes sound/cues.json and sound/cues-sfx.json.
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, re
src = open("src/timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
DUR, FLIP, DEMO, DIAGRAM, CTA, NODE0, STEP = n("DURATION"), n("FLIP"), n("DEMO"), n("DIAGRAM"), n("CTA"), n("NODE0") if re.search(r"\bNODE0 = (\d+)", src) else 0, 0
NODE0 = DIAGRAM + int(re.search(r"NODE0 = DIAGRAM \+ (\d+)", src).group(1)); STEP = int(re.search(r"NODE_STEP = (\d+)", src).group(1))
FLOOD = [int(x) for x in re.search(r"FLOOD = \[([\d, ]+)\]", src).group(1).split(",")]
CH = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src.split("export const CHAT")[1].split("};")[0])}
SFX = "/root/.claude/skills/motion-graphics/assets/sfx/"
smp = lambda f, name, g, pan=0.0: {"type": "sample", "file": SFX + name + ".ogg", "frame": f, "gain": g, "pan": pan}
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.4,
          "sections": [[0, "intro"], [FLIP - 15, "gap"], [FLIP, "drop"], [CTA, "break"], [CTA + 90, "outro"]],
          "lp_auto": [[0, 800], [FLIP - 16, 1400], [FLIP + 1, 10000], [CTA - 2, 10000], [CTA + 4, 2600], [CTA + 88, 2600], [CTA + 92, 10000]]}]
fx = [smp(a, "receive", 0.22 + 0.03 * i, ((i % 3) - 1) * 0.4) for i, a in enumerate(FLOOD)]
fx += [{"type": "riser", "start": 40, "end": FLIP - 2, "gain": 0.08}, {"type": "impact", "frame": FLIP, "gain": 0.2},
       {"type": "whoosh", "start": FLIP - 4, "end": FLIP + 10, "gain": 0.1}, {"type": "whoosh", "start": DEMO - 6, "end": DEMO + 8, "gain": 0.08}]
d = lambda k: DEMO + CH[k]
fx += [smp(d("ask"), "send", 0.35), smp(d("days"), "receive", 0.35), smp(d("tapDay"), "press", 0.4), smp(d("pickDay"), "send", 0.3),
       smp(d("times"), "receive", 0.35), smp(d("tapTime"), "press", 0.4), smp(d("pickTime"), "send", 0.3),
       smp(d("booked"), "success", 0.4), smp(d("calendar"), "notification", 0.35)]
fx += [{"type": "typing", "start": d(a), "end": d(b), "gain": 0.04} for a, b in [("type1", "days"), ("type2", "times"), ("type3", "booked")]]
fx += [{"type": "whoosh", "start": DIAGRAM - 6, "end": DIAGRAM + 8, "gain": 0.08}, {"type": "swish", "start": NODE0, "end": NODE0 + STEP * 4, "gain": 0.04}]
for i in range(5):
    fx += [{"type": "pop", "frame": NODE0 + i * STEP, "gain": 0.1}, {"type": "glint", "frame": NODE0 + i * STEP + 1, "gain": 0.03, "freq": (1318.5, 1568, 1760, 2093, 2637)[i]}]
fx += [{"type": "impact", "frame": CTA, "gain": 0.14}, {"type": "pop", "frame": CTA + 14, "gain": 0.1}]
fx += [{"type": "tick", "frame": CTA + 26 + i * 8, "gain": 0.04, "freq": 1760 + 120 * i} for i in range(3)]
fx += [{"type": "impact", "frame": CTA + 66, "gain": 0.12}, {"type": "chime", "frame": CTA + 68, "gain": 0.05, "freq": 1318.5}]
for mus, out in ((True, "sound/cues.json"), (False, "sound/cues-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 9, "fade_out": 1.2, "lowpass": 11000, "peak_db": -3, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
