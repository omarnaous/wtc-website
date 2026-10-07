"""Sound cues on the voice-led anchors in src/vo.json -> sound/cues.json.
Same sound palette as the Subscription Killer reel: lo-fi groove at 92 BPM (muffled for the problem, cut for the
record-scratch turn, full from the reveal), swishes on slides, a vine boom on the big number, coins and counters."""
import json
vo = json.load(open("src/vo.json")); A = vo["anchors"]
turn, show, conv, cta, end = A["turn"], A["show"], A["conv"], A["cta"], A["end"]
swipe = turn - 27
at = lambda w: next(x["start"] for x in vo["words"] if x["w"].startswith(w))
p85, p83 = round(at("85%")), round(at("83%"))
W = lambda a, b, g=0.1, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": g, "pan": pan}
cues = [
    # bed
    {"type": "lofi", "start": 0, "end": turn - 6, "bpm": 92, "lp": 1100, "drums": 0.7, "gain": 0.55},
    {"type": "lofi", "start": show, "end": end, "bpm": 92, "gain": 0.55},
    # hook
    {"type": "pop", "frame": 0, "gain": 0.2},
    W(swipe - 2, swipe + 14, 0.14),                                    # post scrolled away
    {"type": "buzz", "frame": swipe + 12, "gain": 0.2},                 # SCROLLED PAST.
    # turn -> reveal
    {"type": "scratch", "frame": turn - 6, "gain": 0.45},
    {"type": "riser", "start": turn + 2, "end": show, "gain": 0.2},
    {"type": "bass_drop", "frame": show, "gain": 0.7},
    {"type": "impact", "frame": show, "gain": 0.35},
    # film: a soft swish as each technique label slides in
    *[W(show + round(s * 30) - 6, show + round(s * 30) + 4, 0.1, 0.25 if i % 2 else -0.25) for i, s in enumerate((1.5, 5.5, 9.5, 17.5, 21.5))],
    # data beat
    W(conv - 4, conv + 10, 0.14),
    {"type": "counter", "start": p85 - 4, "end": p85 + 26, "gain": 0.18},
    {"type": "vine_boom", "frame": p85 + 26, "gain": 0.55},             # 85% lands
    W(p83 - 16, p83 - 4, 0.1),                                          # ring panel slides up
    {"type": "graph_rise", "start": p83 - 2, "end": p83 + 28, "gain": 0.09, "f0": 300, "f1": 1000},
    {"type": "coins", "frame": p83 + 28, "gain": 0.4, "count": 12, "dur": 0.6},
    # CTA
    W(cta - 4, cta + 10, 0.12),
    {"type": "stamp", "frame": cta + 22, "gain": 0.5},                  # direct message box lands
    W(cta + 28, cta + 40, 0.08),
    {"type": "click", "frame": cta + 40, "gain": 0.16, "freq": 1300},
]
json.dump({"fps": 30, "duration": round(end / 30, 3), "seed": 21, "fade_out": 1.0, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues,", round(end / 30, 1), "s")
