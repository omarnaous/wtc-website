"""Sound for the "how we made it" reel, on Dev's voice (src/bts-vo.json, same anchors as src/bts-timing.js).
A lo-fi tape bed, a whoosh into the Claude chat, keyboard typing under the prompt, a glint as the rest blurs behind
the lock, a message-received sound for the reply, then the CTA: whoosh, typing PROMPT, the send, a chime on the logo.
Then vo/ is mixed on top with the bed ducked under the voice.
  python3 sound/bts_cues.py   ->  sound/bts.json, sound/bts-sfx.json (then sound/bts_mix.py)"""
import json
VO = json.load(open("src/bts-vo.json")); L = {l["key"]: l for l in VO["lines"]}
DUR = VO["duration"]
CHAT, TYPE, TYPE_END, LOCK = L["claude"]["start"] - 4, L["prompt"]["start"] + 6, L["nah"]["start"] - 6, L["nah"]["start"]
REPLY, CTA, COMMENT = LOCK + 24, L["join"]["start"] - 4, L["cta"]["start"] + 4
smp = lambda name, frame, gain: {"type": "sample", "file": f"/root/.claude/skills/motion-graphics/assets/sfx/{name}.ogg", "frame": frame, "gain": gain}
music = [{"type": "lofi_tape", "start": 0, "end": DUR, "gain": 0.32}]
fx = [
    {"type": "pop", "frame": 2, "gain": 0.12},
    {"type": "swoosh", "start": CHAT - 8, "end": CHAT + 8, "peak": 0.5, "f": 2200, "gain": 0.14},
    {"type": "typing", "start": TYPE, "end": TYPE_END, "gain": 0.16, "pan": 0.15},
    {"type": "glint", "frame": LOCK, "gain": 0.08, "freq": 1318.5}, {"type": "pop", "frame": LOCK + 2, "gain": 0.12},
    smp("receive", REPLY, 0.3),
    {"type": "swoosh", "start": CTA - 8, "end": CTA + 8, "peak": 0.5, "f": 2000, "gain": 0.16},
    {"type": "typing", "start": COMMENT, "end": COMMENT + 18, "gain": 0.16},
    smp("send", COMMENT + 22, 0.3),
    {"type": "chime", "frame": COMMENT + 36, "gain": 0.06, "freq": 1760},
]
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 9, "fade_out": 1.0, "lowpass": 11000, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = "sound/bts.json" if music_on else "sound/bts-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
