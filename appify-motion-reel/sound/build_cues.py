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
def at(w, frm=0):  # first caption word starting with w at/after frame frm (same as wordAt in timing.js); None if absent
    return next((round(x["start"]) for x in vo["words"] if x["start"] >= frm - 1 and x["w"].lstrip('\u201c"').lower().startswith(w.lower())), None)
has = lambda *ks: all(k in A for k in ks)
dmg = A["damage"]; DAMAGE = 36
fly = A.get("fly", (at("scrolled", A.get("swipe", 0)) or 0) - 6)
W = lambda a, b, g=0.1, pan=0: {"type": "whoosh", "start": a, "end": b, "gain": g, "pan": pan}
talk = A["talk"]
cues = [
    # bed: muffled under the POV, cut dead for the crash-zoom, back until the hard cut (the film plays its own sound),
    # back very low once Dev talks over the film
    {"type": "lofi", "start": 0, "end": dmg, "bpm": 92, "lp": 1100, "drums": 0.7, "gain": 0.18},
    {"type": "lofi", "start": talk, "end": end, "bpm": 92, "gain": 0.18},
    # POV: one like, from mom
    {"type": "pop", "frame": 4, "gain": 0.18},
    {"type": "blip", "frame": at("mom", A["hook"]), "gain": 0.16},
    {"type": "pop", "frame": at("mom", A["hook"]) + 1, "gain": 0.16},
    W(fly - 2, fly + 14, 0.14),                                                # the post gets flung away
    # EMOTIONAL DAMAGE: dun, dun, DUNNN on the three zoom snaps
    {"type": "sting", "frame": dmg, "gain": 0.55, "step": 8 / 30, "hold": 0.75},
    {"type": "impact", "frame": dmg + 16, "gain": 0.3},
    W(dmg + DAMAGE - 5, dmg + DAMAGE + 2, 0.12),                               # snap back out
    # hard cut into the film
    {"type": "bass_drop", "frame": show, "gain": 0.7},
    {"type": "impact", "frame": show, "gain": 0.4},
    W(A["reveal"] - 4, A["reveal"] + 10, 0.1),
    {"type": "impact", "frame": A["reveal"] + 4, "gain": 0.25},                # Made by Appify lands
    W(A["cta"] - 4, A["cta"] + 10, 0.12),
]
if has("turn"):   # "now watch what happens when it moves" -> WATCH THIS.
    cues += [{"type": "lofi", "start": dmg + DAMAGE, "end": show - 4, "bpm": 92, "lp": 1100, "drums": 0.7, "gain": 0.18, "bar0": 2},
             {"type": "riser", "start": A["turn"] + 10, "end": show - 12, "gain": 0.18},
             {"type": "stamp", "frame": show - 16, "gain": 0.4}]
lab = [s for s in (1.5, 5.5, 9.6, 21.3) if any(a <= s < b for a, b in CUT) and ff(s) <= talk + 6]   # technique labels shown before Dev talks
cues += [W(ff(s) - 6, ff(s) + 4, 0.07, 0.25 if i % 2 else -0.25) for i, s in enumerate(lab)]
if has("wow"):
    cues.append({"type": "vine_boom", "frame": A["wow"], "gain": 0.35})        # did you just stop scrolling?
if has("svc"):
    cues += [{"type": "pop", "frame": at(w, A["svc"]) - 2, "gain": 0.18, "pan": p} for w, p in (("product", -0.3), ("launch", 0), ("logo", 0.3))]
ap = at("appify", A.get("why", talk))
if ap is not None and A.get("ad"):
    cues.append({"type": "pop", "frame": ap - 2, "gain": 0.2})                 # Appify badge
if has("morph"):  # twist: the plain sneaker becomes a motion ad
    cues += [
        W(A["twist"] - 4, A["twist"] + 10, 0.12),
        {"type": "riser", "start": A["dm"] + 20, "end": A["morph"] - 4, "gain": 0.12},   # zero to a hundred...
        {"type": "scratch", "frame": A["morph"] - 6, "gain": 0.35},                      # ...real quick.
        {"type": "bass_drop", "frame": A["morph"] + 6, "gain": 0.5},
        {"type": "counter", "start": A["morph"] + 8, "end": A["morph"] + 34, "gain": 0.1, "pan": 0.3},   # graphics level 0 -> 100
        {"type": "impact", "frame": A["morph"] + 34, "gain": 0.25},
        {"type": "pop", "frame": A["morph"] + 10, "gain": 0.2}, {"type": "pop", "frame": A["morph"] + 14, "gain": 0.2},   # NEW DROP.
        {"type": "counter", "start": A["morph"] + 16, "end": A["morph"] + 34, "gain": 0.08, "pan": -0.3},  # $129 counts up
    ]
if has("study"):  # the report slides in, the magnifier scans, highlight, 85% pops off the page, SOURCE stamp
    p85 = at("85%", A["study"])
    cues += [
        W(A["conv"] - 2, A["conv"] + 14, 0.12),
        W(A["conv"] + 4, A["study"] + 10, 0.05, 0.3),
        {"type": "sweep", "start": p85 - 4, "end": p85 + 8, "gain": 0.08},
        {"type": "counter", "start": p85, "end": p85 + 20, "gain": 0.15},
        {"type": "impact", "frame": p85 + 4, "gain": 0.4},
        {"type": "pop", "frame": p85 + 10, "gain": 0.14},
        {"type": "stamp", "frame": p85 + 28, "gain": 0.45},
    ]
cues.append({"type": "stamp", "frame": at("full", A["refund"]) - 2, "gain": 0.5})   # 100% REFUND sticker
if A.get("ad"):   # Send Message button lands, then the cursor taps it
    tap = at("tap", A["fun"])
    cues += [{"type": "pop", "frame": tap - 6, "gain": 0.22}, {"type": "click", "frame": tap + 16, "gain": 0.3, "freq": 1100}]
else:
    cues += [
        {"type": "click", "frame": A["q2"] - 2, "gain": 0.16, "freq": 900},    # photos get scrolled gets crossed out
        {"type": "pop", "frame": A["zero"] - 1, "gain": 0.2},                  # ZERO RISK
        {"type": "stamp", "frame": A["fun"] - 4, "gain": 0.5},                 # COMMENT "MOTION" lands
        {"type": "click", "frame": A["fun"] + 20, "gain": 0.14, "freq": 1300},
    ]
json.dump({"fps": 30, "duration": round(end / 30, 3), "seed": 21, "fade_out": 1.0, "cues": cues}, open("sound/cues.json", "w"), indent=1)
print(len(cues), "cues,", round(end / 30, 1), "s")
