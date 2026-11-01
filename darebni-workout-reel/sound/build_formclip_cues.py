"""Sound for FormClip.jsx (the supplied skull-crusher footage + Darebni labels). A 120 BPM house bed; an error buzz
on each of the clip's red ✕ moments and a success sample + chime on each green ✓ (times from FL.SEG); a whoosh on
each camera change; a tick per checklist line; the bed breaks for the comment-PLAN end card. Writes
sound/formclip.json and sound/formclip-sfx.json.
  python3 sound/build_formclip_cues.py && python3 <motion-graphics>/scripts/sound.py sound/formclip.json public/formclip.wav"""
import json
s = lambda sec: round(sec * 30)
END, DUR = s(26.3), s(26.3) + 120
SEG = [[0, s(1.9), s(4.3)], [s(4.5), s(7.6), s(10.6)], [s(10.8), s(13.9), s(16.5)]]   # keep in step with FL in FormClip.jsx
SFX = "/root/.claude/skills/motion-graphics/assets/sfx/"
music = [{"type": "house", "start": 0, "end": DUR, "bpm": 120, "gain": 0.4,
          "sections": [[0, "drop"], [END, "break"], [END + 60, "outro"]],
          "lp_auto": [[0, 11000], [END - 2, 11000], [END + 4, 2600], [END + 58, 2600], [END + 62, 11000]]}]
fx = [{"type": "impact", "frame": 1, "gain": 0.16}]
for a, g, out in SEG:
    fx += [{"type": "buzz", "frame": a + 3, "gain": 0.13},
           {"type": "sample", "file": SFX + "success.ogg", "frame": g, "gain": 0.4},
           {"type": "chime", "frame": g + 1, "gain": 0.035, "freq": 1318.5}]
for cut in (s(4.4), s(10.7), s(16.5)):
    fx += [{"type": "whoosh", "start": cut - 6, "end": cut + 6, "gain": 0.08}]
fx += [{"type": "tick", "frame": SEG[2][2] + 60 + k * 45, "gain": 0.05, "freq": 1760 + 160 * k} for k in range(3)]
fx += [{"type": "swoosh", "start": END - 7, "end": END + 4, "peak": 0.6, "f": 1400, "gain": 0.1},
       {"type": "impact", "frame": END + 16, "gain": 0.13}, {"type": "chime", "frame": END + 17, "gain": 0.05, "freq": 1318.5}]
for mus, out in ((True, "sound/formclip.json"), (False, "sound/formclip-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 8, "fade_out": 1.2, "lowpass": 12000, "peak_db": -3, "cues": (music if mus else []) + fx}
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
