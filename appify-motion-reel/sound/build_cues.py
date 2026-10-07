"""Sound cues on the voice-led anchors in src/vo.json -> sound/cues.json. Subscription Killer palette:
a very low lo-fi bed, hits only where something happens on screen."""
import json
vo = json.load(open("src/vo.json")); A = vo["anchors"]
show, end = A["show"], A["end"]
CUT = A.get("cut", [[0, 25]])
def ff(sec):  # film-clock seconds -> reel frame (same as filmFrame in timing.js)
    t = 0.0
    for a, b in CUT:
        if sec <= b: return show + round((t + max(0.0, sec - a)) * 30)
        t += b - a
    return show + round(t * 30)
at = lambda w: round(next(x["start"] for x in vo["words"] if x["w"].startswith(w)))
p85 = at("85%")
W = lambda a, b, g=0.1, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": g, "pan": pan}
cues = [
    # bed: muffled under the POV, gone for the hard cut (the film plays its own sound), back very low once Dev reacts
    {"type": "lofi", "start": 0, "end": show - 4, "bpm": 92, "lp": 1100, "drums": 0.7, "gain": 0.18},
    {"type": "lofi", "start": A["talk"], "end": end, "bpm": 92, "gain": 0.18},
    # POV
    {"type": "pop", "frame": 4, "gain": 0.18},
    W(A["swipe"] - 2, A["swipe"] + 14, 0.14),                                  # the post gets scrolled away
    {"type": "buzz", "frame": A["swipe"] + 12, "gain": 0.16},                  # good luck with that
    # pattern interrupt -> hard cut
    {"type": "riser", "start": A["turn"] + 10, "end": show - 12, "gain": 0.18},
    {"type": "stamp", "frame": show - 14, "gain": 0.4},                        # THIS?
    {"type": "bass_drop", "frame": show, "gain": 0.7},
    {"type": "impact", "frame": show, "gain": 0.4},
    *[W(ff(s) - 6, ff(s) + 4, 0.07, 0.25 if i % 2 else -0.25) for i, s in enumerate((1.5, 5.5, 9.6, 21.3))],   # technique labels
    # reaction + reveal
    {"type": "vine_boom", "frame": A["talk"], "gain": 0.35},                   # okay... THAT got my attention
    W(A["reveal"] - 4, A["reveal"] + 10, 0.1),
    {"type": "impact", "frame": A["reveal"] + 4, "gain": 0.25},                # Made by Appify lands
    # twist
    W(A["twist"] - 4, A["twist"] + 10, 0.12),
    {"type": "scratch", "frame": A["morph"] - 8, "gain": 0.35},                # "Exactly."
    {"type": "bass_drop", "frame": A["morph"] + 6, "gain": 0.5},
    {"type": "pop", "frame": A["morph"] + 10, "gain": 0.2}, {"type": "pop", "frame": A["morph"] + 14, "gain": 0.2},   # NEW DROP.
    {"type": "counter", "start": A["morph"] + 16, "end": A["morph"] + 34, "gain": 0.12},                          # $129 counts up
    # proof
    *[{"type": "pop", "frame": A["conv"] + 6 + i * 12, "gain": 0.16} for i in range(3)],                         # Stop. Watch. Remember.
    {"type": "counter", "start": p85 - 2, "end": p85 + 20, "gain": 0.15},
    {"type": "impact", "frame": p85 + 2, "gain": 0.4},
    {"type": "coins", "frame": p85 + 20, "gain": 0.3, "count": 8, "dur": 0.4},
    # CTA
    W(A["cta"] - 4, A["cta"] + 10, 0.12),
    {"type": "click", "frame": A["q2"] - 2, "gain": 0.16, "freq": 900},        # the first question gets crossed out
    {"type": "stamp", "frame": A["fun"] - 4, "gain": 0.5},                     # DM "MOTION" lands
    {"type": "click", "frame": A["fun"] + 20, "gain": 0.14, "freq": 1300},
]
json.dump({"fps": 30, "duration": round(end / 30, 3), "seed": 21, "fade_out": 1.0, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues,", round(end / 30, 1), "s")
