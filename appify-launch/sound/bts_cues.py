"""Sound for the "how we made it" reel, on Dev's voice (src/bts-vo.json, same anchors as src/bts-timing.js).
A lo-fi tape bed, a whoosh into the Claude chat, keyboard typing under the prompt, a glint as the rest blurs behind
the lock, a message-received sound for the reply, then the CTA: whoosh, typing PROMPT, the send, a chime on the logo.
Then vo/ is mixed on top with the bed ducked under the voice.
  python3 sound/bts_cues.py [src/bts-vo-v2.json bts-v2]  ->  sound/<name>.json, sound/<name>-sfx.json (then sound/bts_mix.py)"""
import json, sys
SRC, NAME = (sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else ("src/bts-vo.json", "bts")   # V2: src/bts-vo-v2.json bts-v2
VO = json.load(open(SRC)); L = {l["key"]: l for l in VO["lines"]}
DUR = VO["duration"]
CHAT, TYPE, TYPE_END, LOCK = L["claude"]["start"] - 4, L["prompt"]["start"] + 6, L["nah"]["start"] - 6, L["nah"]["start"]
REPLY, CTA, COMMENT = L["too"]["start"] + 2, L["cta"]["start"] - 6, L["cta"]["start"] + 2
smp = lambda name, frame, gain: {"type": "sample", "file": f"/root/.claude/skills/motion-graphics/assets/sfx/{name}.ogg", "frame": frame, "gain": gain}
music = [{"type": "lofi_tape", "start": 0, "end": DUR, "gain": 0.32}]
fx = [
    {"type": "pop", "frame": 2, "gain": 0.12},
    {"type": "pop", "frame": L["hook"]["start"] + 2, "gain": 0.12},                                   # "!" pops over his head
    {"type": "thump", "frame": L["ours"]["start"] + 14, "gain": 0.16},                                # lands his jump
    {"type": "swish", "start": L["nah"]["start"], "end": L["nah"]["start"] + 14, "gain": 0.08},        # the no-no wave

    {"type": "swoosh", "start": CHAT - 8, "end": CHAT + 8, "peak": 0.5, "f": 2200, "gain": 0.14},
    {"type": "typing", "start": TYPE, "end": TYPE_END, "gain": 0.16, "pan": 0.15},
    {"type": "glint", "frame": LOCK, "gain": 0.08, "freq": 1318.5}, {"type": "pop", "frame": LOCK + 2, "gain": 0.12},
    smp("receive", REPLY, 0.3),
    {"type": "swoosh", "start": CTA - 8, "end": CTA + 8, "peak": 0.5, "f": 2000, "gain": 0.16},
    {"type": "typing", "start": COMMENT, "end": COMMENT + 18, "gain": 0.16},
    smp("send", COMMENT + 22, 0.3),
    {"type": "chime", "frame": COMMENT + 36, "gain": 0.06, "freq": 1760},
]
end = L.get("deal") or L.get("mg")                                                           # last line: Deal? (V1) or the motion graphics offer (V2)
fx += [{"type": "thump", "frame": end["start"] + 14, "gain": 0.14}, {"type": "glint", "frame": end["start"] + 4, "gain": 0.06, "freq": 1760}]
if "mg" in L: fx.append({"type": "pop", "frame": L["mg"]["start"] + 4, "gain": 0.12})            # the motion graphics chip
for music_on in (True, False):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 9, "fade_out": 1.0, "lowpass": 11000, "peak_db": -3, "cues": (music if music_on else []) + fx}
    out = f"sound/{NAME}.json" if music_on else f"sound/{NAME}-sfx.json"
    json.dump(spec, open(out, "w"), indent=1); print(out, len(spec["cues"]), "cues")
