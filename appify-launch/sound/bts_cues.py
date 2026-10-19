"""Soundtrack for the "how we made it" reel, on src/bts-timing.js. A lo-fi tape bed under Dev talking, a little voice
blip on each word as his line types out, a whoosh into the Claude chat, keyboard typing under the prompt, a glint as the
rest blurs behind the lock, a message-received sound for the reply, then the CTA: whoosh, typing PROMPT, a tap on Post,
a chime on the logo.
  python3 sound/bts_cues.py  ->  sound/bts.json, sound/bts-sfx.json"""
import json, re
src = open("src/bts-timing.js").read()
n = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
DUR, CHAT, TYPE, TYPE_END, LOCK, REPLY, CTA, COMMENT = (n(k) for k in ["BTS_DURATION", "CHAT", "TYPE", "TYPE_END", "LOCK", "REPLY", "CTA", "COMMENT"])
LINES = [(int(a), int(b), t) for a, b, t in re.findall(r'\[(\d+), (\d+), "([^"]+)"\]', src)]
smp = lambda name, frame, gain: {"type": "sample", "file": f"/root/.claude/skills/motion-graphics/assets/sfx/{name}.ogg", "frame": frame, "gain": gain}
music = [{"type": "lofi_tape", "start": 0, "end": DUR, "gain": 0.32}]
voice = []
for a, b, text in LINES:                       # Dev "speaks": one soft blip per word, pitch wandering (A minor pentatonic)
    notes = [880, 987.8, 1046.5, 1174.7, 1318.5]
    for k, _ in enumerate(text.split(" ")):
        voice.append({"type": "blip", "frame": a + 3 * k, "gain": 0.05, "freq": notes[(k * 3 + a) % 5], "pan": -0.2})
fx = voice + [
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
