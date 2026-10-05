"""Move the sound design (sound/cues.base.json, designed on the original 33 s cut) onto the
voice-led cut in src/vo.json -> sound/cues.json. Same rule as warp() in src/timing.js."""
import json
vo = json.load(open("src/vo.json"))
OLD = [a[1] for a in vo["anchors"]]; NEW = [a[2] for a in vo["anchors"]]
def warp(f):
    if f >= OLD[-1]: return NEW[-1]
    i = 0
    while i < len(OLD) - 2 and f >= OLD[i + 1]: i += 1
    to_next = OLD[i + 1] - f
    g = NEW[i + 1] - to_next if to_next <= 30 and i < len(OLD) - 2 else NEW[i] + (f - OLD[i])
    return max(NEW[i], min(NEW[i + 1] - 1, g))
spec = json.load(open("sound/cues.base.json"))
spec["duration"] = round(vo["duration"] / spec["fps"], 3)
for c in spec["cues"]:
    if "frame" in c: c["frame"] = warp(c["frame"])
    if "start" in c:
        s, e = c["start"], c["end"]
        c["start"] = warp(s)
        c["end"] = NEW[OLD.index(e)] if e in OLD else max(c["start"] + 4, warp(e - 1) + 1)
json.dump(spec, open("sound/cues.json", "w"), indent=1)
print("cues", len(spec["cues"]), "duration", spec["duration"])
