"""Sound for the skull-crusher form-check reel (FormCheck.jsx, constants FC there). A 120 BPM house bed; a hit on
the hook; for each mistake an error buzz as the red ✕ lands and a success sample as it turns green ✓, with a soft
thump at the bottom of every rep the mannequin does; the demo's reps hit on the beat (thump + clink); a hit and
chime on the PLAN button. Writes sound/form.json and sound/form-sfx.json.
  python3 sound/build_form_cues.py && python3 <motion-graphics>/scripts/sound.py sound/form.json public/form.wav"""
import json, re
src = open("src/FormCheck.jsx").read()
FC = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const FC = \{(.*?)\};", src).group(1))}
M0, M_LEN, WRONG, MORPH, DEMO, CTA, DUR = (FC[k] for k in ("M0", "M_LEN", "WRONG", "MORPH", "DEMO", "CTA", "DURATION"))
SFX = "/root/.claude/skills/motion-graphics/assets/sfx/"
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.42,
          "sections": [[0, "drop"], [CTA, "break"], [CTA + 60, "outro"]],
          "lp_auto": [[0, 11000], [CTA - 2, 11000], [CTA + 4, 2600], [CTA + 58, 2600], [CTA + 62, 11000]]}]
fx = [{"type": "impact", "frame": 2, "gain": 0.18}, {"type": "slap", "frame": 14, "gain": 0.1}]
for i in range(3):
    a = M0 + i * M_LEN
    fx += [{"type": "swoosh", "start": a - 7, "end": a + 3, "peak": 0.6, "f": 1600, "gain": 0.1},
           {"type": "buzz", "frame": a + 10, "gain": 0.12},
           {"type": "riser", "start": a + WRONG - 12, "end": a + WRONG + 5, "gain": 0.05},
           {"type": "sample", "file": SFX + "success.ogg", "frame": a + WRONG + MORPH // 2, "gain": 0.4}]
    fx += [{"type": "thump", "frame": a + 23 + 30 * k, "gain": 0.08} for k in range(5)]
fx += [{"type": "swoosh", "start": DEMO - 7, "end": DEMO + 3, "peak": 0.6, "f": 1600, "gain": 0.1}, {"type": "slap", "frame": DEMO, "gain": 0.1}]
for k in range(4):
    fx += [{"type": "thump", "frame": DEMO + 15 + 30 * k, "gain": 0.15}, {"type": "clink", "frame": DEMO + 15 + 30 * k, "gain": 0.04}]
fx += [{"type": "swoosh", "start": CTA - 7, "end": CTA + 4, "peak": 0.6, "f": 1400, "gain": 0.1},
       {"type": "impact", "frame": CTA + 20, "gain": 0.13}, {"type": "chime", "frame": CTA + 21, "gain": 0.05, "freq": 1318.5}]
for mus, out in ((True, "sound/form.json"), (False, "sound/form-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 6, "fade_out": 1.2, "lowpass": 12000, "peak_db": -3, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
