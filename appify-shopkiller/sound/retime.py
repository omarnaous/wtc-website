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
A = {a[0]: a[2] for a in vo["anchors"]}
def word_at(line, w):
    """frame where the voice says word w on script line `line` (punctuation ignored)"""
    strip = lambda x: "".join(ch for ch in x if ch.isalnum() or ch in "$,")
    return next(x["start"] for x in vo["words"] if x["line"] == line and strip(x["w"]) == strip(w))
spec = json.load(open("sound/cues.base.json"))
# cost bars: same cascade as Cost() in scenes.jsx (10 bars, the last lands as the voice says "years")
ten = word_at(1, "years") - A["cost"]
step = max(3, min(7, (ten - 62) / 9))
bars = [c for c in spec["cues"] if c.get("at_bars")]
spec["cues"] = [c for c in spec["cues"] if not c.get("at_bars")]
for b in bars:
    for i in range(10):
        spec["cues"].append({"type": b["type"], "frame": round(A["cost"] + 50 + i * step + 3), "gain": b.get("gain", 0.2),
                             "freq": round(b.get("freq", 600) * 2 ** (i * 2 / 12)), "pan": round(-0.35 + i * 0.075, 2), "_placed": True})
# storefront demo (Features in scenes.jsx): four 45-frame beats, each stretched over its voice line
FEAT = [A["feat0"], A["feat1"], A["feat2"], A["feat3"], A["compare"]]
def demo_at(d):
    k = max(0, min(3, int(d // 45))); beat = FEAT[k + 1] - FEAT[k]
    return FEAT[k] + (d - 45 * k) * max(45, min(beat, 90)) / 45
spec["duration"] = round(vo["duration"] / spec["fps"], 3)
for c in spec["cues"]:
    if "at_word" in c:  # locked to a spoken word, already in voice-led frames
        c["frame"] = round(word_at(*c.pop("at_word")) + c.pop("offset", 0)); continue
    if c.pop("_placed", False): continue  # bar ticks above are already in voice-led frames
    if "at_demo" in c:  # a storefront demo moment (frame or [start, end] on the demo's 0-180 clock)
        d = c.pop("at_demo")
        if isinstance(d, list): c["start"], c["end"] = round(demo_at(d[0])), round(demo_at(d[1]))
        else: c["frame"] = round(demo_at(d))
        continue
    if "frame" in c: c["frame"] = warp(c["frame"])
    if "start" in c:
        s, e = c["start"], c["end"]
        c["start"] = warp(s)
        c["end"] = NEW[OLD.index(e)] if e in OLD else max(c["start"] + 4, warp(e - 1) + 1)
json.dump(spec, open("sound/cues.json", "w"), indent=1)
print("cues", len(spec["cues"]), "duration", spec["duration"])
