"""Sound cues on the voice-led anchors in src/vo.json -> sound/cues.json"""
import json
vo = json.load(open("src/vo.json")); A = vo["anchors"]
turn, show, conv, cta, end = A["turn"], A["show"], A["conv"], A["cta"], A["end"]
swipe = turn - 27
cues = [
    {"type": "lofi", "start": 0, "end": turn - 2, "bpm": 92, "lp": 1100, "drums": 0.6, "gain": 0.45},   # muffled under the plain photo
    {"type": "pop", "frame": 4, "gain": 0.18},
    {"type": "whoosh", "start": swipe - 2, "end": swipe + 14, "gain": 0.16},
    {"type": "buzz", "frame": swipe + 12, "gain": 0.14, "dur": 0.25},                               # SCROLLED PAST.
    {"type": "scratch", "frame": turn - 4, "gain": 0.45},
    {"type": "impact", "frame": turn, "gain": 0.5},
    {"type": "whoosh", "start": turn + 5, "end": turn + 19, "gain": 0.12},
    *[{"type": "pop", "frame": show + round(s * 30), "gain": 0.16} for s in (1.5, 5.5, 9.5, 17.5, 21.5)],  # technique labels
    # conversion beat (the film's audio fades out here, see vo/mix.py)
    {"type": "lofi", "start": conv, "end": end, "bpm": 92, "gain": 0.42},
    {"type": "whoosh", "start": conv - 4, "end": conv + 10, "gain": 0.14},
    {"type": "pop", "frame": conv + 9, "gain": 0.16}, {"type": "pop", "frame": conv + 18, "gain": 0.16},
    {"type": "graph_rise", "start": conv + 24, "end": conv + 70, "gain": 0.09, "f0": 300, "f1": 1000},
    {"type": "counter", "start": conv + 26, "end": conv + 70, "gain": 0.16},
    {"type": "coins", "frame": conv + 70, "gain": 0.32, "count": 10, "dur": 0.5},
    {"type": "pop", "frame": conv + 70, "gain": 0.22},                                               # 3x badge
    # CTA
    {"type": "whoosh", "start": cta - 4, "end": cta + 10, "gain": 0.14},
    {"type": "pop", "frame": cta + 4, "gain": 0.16}, {"type": "pop", "frame": cta + 10, "gain": 0.16},
    {"type": "stamp", "frame": cta + 22, "gain": 0.4},
    {"type": "click", "frame": cta + 38, "gain": 0.16, "freq": 1300},
]
json.dump({"fps": 30, "duration": round(end / 30, 3), "seed": 9, "fade_out": 0.8, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues,", round(end / 30, 1), "s")
