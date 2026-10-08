"""Voice-over for the motion-graphics showcase reel: one continuous read in full sentences, no dead air.
The voice leads: the hook lasts as long as its line, the WTC film starts right after the turn, its narration
runs back to back over the film, then the conversion beat and the CTA follow straight on.
Kokoro (am_puck), re-intonated per sentence with Praat PSOLA. Writes vo/vo.wav and src/vo.json
(scene anchors + mouth envelope + caption word timings); timing.js reads the anchors.
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR = 30, 24000
VOICE = "am_puck"
PACE = 1.2 / 1.1                # same read speed as the Subscription Killer reel
GAP = 0.15                      # same breath between sentences as Subscription Killer
# the film plays at its real speed (its sound is part of the product), cut down to its highlights.
# The try-on segment stretches to fit what Dev says over it, so the logo shot always lands on the reveal line.
CUT = [[0.0, 8.6], [9.6, 11.4], [21.3, 25.0]]   # kinetic+counters, try-on, logo hero
def f2r(sec):                    # film-clock seconds -> frames after the film starts in the reel
    t = 0.0
    for a, b in CUT:
        if sec <= b: return round((t + max(0.0, sec - a)) * 30)
        t += b - a
    return round(t * 30)
P = lambda spoken, cap=None, speed=1.1, shift=0, rng=1.5, mel="fall", gain=0: dict(
    text=spoken, cap=cap or spoken, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# delivery settings mirror the Subscription Killer reel (speed ~1.0-1.12, shift -1..2, range 1.5-1.7)
# beats: (key, sentence, pause after in seconds)
HOOK = [("hook", P("POV: you finally post your product... and the only like is from your mom.", "POV: you finally post your product… and the only like is from your mom.", speed=1.08, shift=1, rng=1.6, mel="arch", gain=1), 0.25),
        ("brutal", P("Brutal.", speed=0.95, shift=-1.5, rng=1.3, mel="fall", gain=0.5), 0.12),
        ("swipe", P("Even the algorithm scrolled past it.", speed=1.02, shift=-1, rng=1.4, mel="dip"), 0.0)]
DAMAGE = 36                      # frames of the "emotional damage" crash-zoom (silent, the sting plays)
TURN = [("turn", P("Okay, now watch what happens when it actually moves.", speed=1.02, shift=1.5, rng=1.7, mel="arch", gain=1.5), 0.0)]
FILM_LINES = [
    ("wow", dict(P("Wait... did you just stop scrolling?", "Wait… did you just stop scrolling?", speed=1.0, shift=1.5, rng=1.7, mel="rise", gain=1), after=5.5), 0.2),
    ("why", P("Yeah, that's kind of our thing here at Appify.", speed=1.05, shift=0.5, rng=1.6, mel="arch", gain=0.5), 0.12),
    ("svc", P("We do product ads, launch ads, logo reveals.", "We do product ads, launch ads, logo reveals.", speed=1.05, shift=1, rng=1.6, mel="arch", gain=0.5), 0.2)]
REVEAL = [("reveal", P("This one's a website launch ad we did for Watch Trade Chronicles.", speed=1.05, shift=1.5, rng=1.6, mel="arch", gain=1), 0.0)]
TWIST = [("but", P("And no, you don't need to sell watches.", speed=1.03, shift=0.5, rng=1.6, mel="fall", gain=0.5), 0.15),
         ("dm", P("Whatever your product is, we'll take your graphics from zero to a hundred...", "Whatever your product is, we'll take your graphics from zero to a hundred…", speed=1.06, shift=1, rng=1.6, mel="rise", gain=0.5), 0.1),
         ("exactly", P("real quick.", "Real quick.", speed=1.0, shift=1.5, rng=1.5, mel="fall", gain=1.5), 1.0)]
PROOF = [("proof", P("Still not sold? Check out this study from twenty twenty-six.", "Still not sold? Check out this study from 2026.", speed=1.05, shift=1, rng=1.6, mel="arch", gain=0.5), 0.15),
         ("study", P("Wise Owl found that eighty-five percent of people say a video convinced them to buy.",
                     "Wyzowl found that 85% of people say a video convinced them to buy.", speed=1.08, shift=1, rng=1.6, mel="arch", gain=1), 0.3)]
CTA = [("q1", P("So yeah... photos get scrolled.", "So yeah… photos get scrolled.", speed=1.02, shift=0, rng=1.5, mel="fall", gain=0.5), 0.15),
       ("q2", P("Motion gets watched.", speed=1.0, shift=1.5, rng=1.7, mel="fall", gain=1), 0.3),
       ("fun", P("Comment motion, and we'll make yours move.", "Comment \u201cMOTION\u201d and we'll make yours move.", speed=1.02, shift=1, rng=1.6, mel="fall", gain=1), 0.25),
       ("refund", P("And if you don't love it? You get a full refund.", speed=1.03, shift=0.5, rng=1.6, mel="arch", gain=0.5), 0.12),
       ("zero", P("Zero risk.", speed=0.98, shift=1, rng=1.5, mel="fall", gain=1), 0.0)]


def smooth(a, b, u):
    x = np.clip((u - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)


def melody(kind, u):
    """pitch offset in semitones over normalised phrase time u (0..1)"""
    decl = -1.2 * u                                      # natural downdrift through a phrase
    if kind == "rise": return 0.6 * decl + 4.5 * smooth(0.6, 1, u)
    if kind == "arch": return decl + 2.0 * np.sin(np.pi * np.clip(u * 1.15, 0, 1)) - 1.5 * smooth(0.8, 1, u)
    if kind == "dip":  return decl - 1.0 * smooth(0.5, 1, u)
    return decl + 1.2 * np.sin(np.pi * np.clip(u * 1.6, 0, 1)) - 3.0 * smooth(0.65, 1, u)   # fall


def intonate(s, ph):
    snd = parselmouth.Sound(s, SR)
    man = call(snd, "To Manipulation", 0.01, 60, 450)
    pt = call(man, "Extract pitch tier")
    n = call(pt, "Get number of points")
    ts = np.array([call(pt, "Get time from index", i) for i in range(1, n + 1)])
    fs = np.array([call(pt, "Get value at index", i) for i in range(1, n + 1)])
    if n > 3:
        centre = np.median(fs)
        d = 12 * np.log2(fs / centre)
        u = (ts - ts[0]) / max(1e-6, ts[-1] - ts[0])
        st = ph["shift"] + ph["rng"] * d + melody(ph["mel"], u)
        new = call("Create PitchTier", "p", snd.xmin, snd.xmax)
        for t, v in zip(ts, centre * 2 ** (st / 12)):
            call(new, "Add point", float(t), float(np.clip(v, 65, 420)))
        call([new, man], "Replace pitch tier")
    out = call(man, "Get resynthesis (overlap-add)").values[0]
    return out * 10 ** (ph["gain"] / 20)


def tts(text, speed):
    s, sr = k.create(text, voice=VOICE, speed=speed * PACE, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]
    return s[max(0, nz[0] - 200): nz[-1] + 900]


def breath(dur=0.16):
    """soft inhale before a long line: band-limited noise with a swell"""
    n = int(dur * SR); rng = np.random.default_rng(7)
    x = np.convolve(rng.standard_normal(n), np.hanning(18) / 9, "same")
    x -= np.convolve(x, np.ones(40) / 40, "same")          # drop the rumble
    return x * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.012


def room(x):
    """tiny room so it sounds recorded, not pasted in"""
    n = int(0.22 * SR); rng = np.random.default_rng(3)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
    wet = np.convolve(x, ir / np.abs(ir).sum() * 6, "full")[: len(x)]
    return x + 0.09 * wet


k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
F = lambda sec: int(round(sec * FPS))
say = lambda p: intonate(tts(p["text"], p["speed"]), p)
A, placed = {"hook": 0}, []
t = 6
def put(group, film_after=None):
    """lay a group of beats back to back from frame t; returns the frame after the last one"""
    global t
    for key, p, pause in group:
        y = say(p)
        if "after" in p and film_after: t = max(t, film_after(p["after"]))
        A[key] = t; placed.append((t, p, y)); t += F(len(y) / SR) + F(pause)
    return t
put(HOOK)
A["damage"] = t + 3                                    # crash-zoom on Dev's face: EMOTIONAL DAMAGE
t = A["damage"] + DAMAGE + 3
put(TURN)
A["show"] = t + 2                                      # hard cut into the film right after "...when it moves."
A["rate"] = 1
t = A["show"] + 6
put(FILM_LINES[:1], film_after=lambda sec: A["show"] + f2r(sec))
A["talk"] = A["wow"]                                   # the film's own sound stops when Dev reacts
put(FILM_LINES[1:])
# stretch the try-on segment so the logo shot (film 21.3 s) starts as the reveal line does
CUT[1][1] = round(CUT[1][0] + min(21.3 - 9.6, max(1.8, (t - A["show"]) / FPS - (CUT[0][1] - CUT[0][0]))), 2)
t = max(t, A["show"] + f2r(21.3))
put(REVEAL)
FILM = round(sum(b - a for a, b in CUT) * 30)
A["film"] = FILM; A["cut"] = [list(c) for c in CUT]
A["twist"] = max(t + F(GAP) + 6, A["show"] + FILM)     # the film plays to its end (or the reveal line does), then the twist
t = A["twist"] + 6
put(TWIST)
A["morph"] = A["exactly"]                              # the plain sneaker turns into a motion ad on "real quick."
A["conv"] = t
t = A["conv"] + 4
put(PROOF)
A["cta"] = t - 6
put(CTA)
total = t + 45
A["end"] = total
out = np.zeros(int(total / FPS * SR) + SR); words = []
for li, (start, p, y) in enumerate(placed):
    pos = int(start / FPS * SR)
    out[pos:pos + len(y)] += y[: len(out) - pos]
    env = np.convolve(np.abs(y), np.ones(480) / 480, "same")
    voiced = env > env.max() * 0.08
    vt = np.cumsum(voiced) / max(1, voiced.sum())
    cw = p["cap"].split()
    weights = np.array([(16 if "%" in w else 14 if w.strip("'s").isdigit() else max(2, len(w.strip('.,?!"\'$:…“”')))) + 1.5 for w in cw], float)  # "85%" / "2026" are said in full
    edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
    for j, w in enumerate(cw):
        a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
        words.append({"w": w, "line": li, "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b) / SR * FPS, 2)})
    print(f"{start:6.0f}  {len(y) / SR:4.2f}s  {p['text'][:60]}")
out = out[: int(total / FPS * SR)]
out = room(out); out = out / np.abs(out).max() * 0.9
sf.write("vo/vo.wav", out, SR)
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(total)])
env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
# snap the spoken numbers to the real voice onset after the pause (the word estimate above is approximate)
for w in words:
    if "%" in w["w"]:
        st = int(w["start"])
        for i in range(max(1, st - 8), min(total - 1, st + 18)):
            if env[i - 1] < 0.06 and env[i] > 0.3: w["start"] = float(i); break
json.dump({"duration": total, "anchors": A, "mouth": [round(float(x), 3) for x in env], "words": words}, open("src/vo.json", "w"))
print("anchors", A, f"total {total / FPS:.1f}s")
