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
# the film plays at its real speed (its sound is part of the product), cut down to its highlights
CUT = [(0.0, 8.6), (9.6, 12.4), (17.6, 20.4), (21.0, 24.2)]   # real-speed highlight cut: kinetic+counters, try-on, website, logo
FILM = round(sum(b - a for a, b in CUT) * 30)
def f2r(sec):                    # film-clock seconds -> frames after the film starts in the reel
    t = 0.0
    for a, b in CUT:
        if sec <= b: return round((t + max(0.0, sec - a)) * 30)
        t += b - a
    return round(t * 30)
P = lambda spoken, cap=None, speed=1.1, shift=0, rng=1.5, mel="fall", gain=0: dict(
    text=spoken, cap=cap or spoken, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# delivery settings mirror the Subscription Killer reel (speed ~1.0-1.12, shift -1..2, range 1.5-1.7)
# script: hook question -> open loop -> payoff over the film -> quiz on the data -> CTA question
HOOK = [P("Still posting boring product photos and expecting engagement?", speed=1.1, shift=1, rng=1.5, mel="rise", gain=1)]
# film lines: P(...) plus an optional "after": film-clock second the line may not start before
FILM_LINES = [
    P("What if your product could do this?", speed=1.05, shift=2, rng=1.6, mel="rise", gain=2),
    dict(P("See how every number counts up, and every product comes alive? That's what stops the scroll.", shift=1, rng=1.6, mel="arch", gain=0.5), after=5.5),
    dict(P("This is the launch film we made for W.T.C. Now imagine it with your brand.",
           "This is the launch film we made for WTC. Now imagine it with your brand.", shift=1, rng=1.6, mel="arch", gain=1), after=17.6),
]
CONV = [P("Quick question, how many people say a video convinced them to buy? Eighty-five percent! And eighty-three percent of marketers say it grew their sales.",
          "Quick question: how many people say a video convinced them to buy? 85%! And 83% of marketers say it grew their sales.", speed=1.08, shift=1, rng=1.7, mel="arch", gain=1)]
CTA = [P("Ready to stop the scroll? Direct message us the word Motion, and grab our limited time offer before it's gone.",
         "Ready to stop the scroll? Direct message us the word \"Motion\" and grab our limited-time offer before it's gone.", shift=1, rng=1.6, mel="fall", gain=1)]


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
say = lambda ps: [intonate(tts(p["text"], p["speed"]), p) for p in ps]
hook, film, conv, cta = say(HOOK), say(FILM_LINES), say(CONV), say(CTA)
dur = lambda ys: sum(len(y) for y in ys) / SR + GAP * (len(ys) - 1)
A = {"hook": 0}
v_hook = 6
A["turn"] = v_hook + F(dur(hook)) + 4
A["show"] = A["turn"] + 15
A["rate"] = 1
A["film"] = FILM
A["cut"] = [list(c) for c in CUT]
film_starts, t = [], A["show"] + 8
for p, y in zip(FILM_LINES, film):
    t = max(t, A["show"] + f2r(p.get("after", 0))); film_starts.append(t); t += F(len(y) / SR + GAP)
film_end_voice = t - F(GAP)
A["talk"] = film_starts[1]        # Dev starts talking again after the kinetic opening: the film's sound stops here
v_conv = max(film_end_voice + F(GAP), A["show"] + FILM - 30)   # cut in over the last second of the logo
A["conv"] = v_conv
v_cta = v_conv + F(dur(conv) + GAP)
A["cta"] = max(v_cta - 4, A["conv"] + 120)
v_cta = max(v_cta, A["cta"] + 2)
total = v_cta + F(dur(cta)) + 40
A["end"] = total
out = np.zeros(int(total / FPS * SR) + SR); words = []
li = 0
placed = [(v_hook, HOOK[0], hook[0])] + list(zip(film_starts, FILM_LINES, film)) + [(v_conv, CONV[0], conv[0]), (v_cta, CTA[0], cta[0])]
for start, p, y in placed:
        pos = int(start / FPS * SR)
        out[pos:pos + len(y)] += y
        env = np.convolve(np.abs(y), np.ones(480) / 480, "same")
        voiced = env > env.max() * 0.08
        vt = np.cumsum(voiced) / max(1, voiced.sum())
        cw = p["cap"].split()
        weights = np.array([(16 if "%" in w else max(2, len(w.strip('.,?!"\'$:')))) + 1.5 for w in cw], float)  # "85%" is said as 'eighty-five percent'
        edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
        for j, w in enumerate(cw):
            a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
            words.append({"w": w, "line": li, "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b) / SR * FPS, 2)})
        print(f"{pos / SR * FPS:6.0f}  {len(y) / SR:4.2f}s  {p['text'][:56]}")
        li += 1
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
print("anchors", A, f"total {total / FPS:.1f}s, film voice ends {film_end_voice - A['show']} of {FILM} film frames")
