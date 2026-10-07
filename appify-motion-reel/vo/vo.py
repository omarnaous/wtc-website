"""Voice-over for the motion-graphics showcase reel. The WTC film has a fixed timeline, so here each line
starts on a fixed frame (src/timing.js) and must finish before the next beat; the voice is Kokoro (am_puck),
re-intonated per sentence with Praat PSOLA like the Subscription Killer reel.
Writes vo/vo.wav and src/vo.json (mouth envelope + caption word timings).
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR, DUR_FRAMES = 30, 24000, 990
VOICE = "am_puck"
PACE = 1.2 / 1.1
P = lambda spoken, cap=None, speed=1.1, shift=0, rng=1.5, mel="fall", gain=0: dict(
    text=spoken, cap=cap or spoken, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# (start frame, must end by frame, sentence)
LINES = [
    (6, 100, P("Still posting plain photos of your products?", speed=1.1, shift=1, rng=1.6, mel="rise", gain=1)),
    (108, 200, P("Watch what we made for W.T.C.", "Watch what we made for WTC.", speed=1.05, shift=1.5, rng=1.6, mel="arch", gain=1)),
    (290, 400, P("Every number counts up, and every word hits the beat.", shift=1, rng=1.6, mel="arch")),
    (408, 520, P("Their products come alive, right in the frame.", shift=0.5, rng=1.6, mel="arch")),
    (645, 760, P("And it launches their new website in style.", shift=1, rng=1.6, mel="arch", gain=0.5)),
    (766, 865, P("Ending on a logo people remember.", shift=0, rng=1.5, mel="fall")),
    (876, 985, P("Want an ad like this for your brand? D.M. us Motion for a free sample.",
                 "Want an ad like this for your brand? DM us \"Motion\" for a free sample.", speed=1.1, shift=1, rng=1.6, mel="fall", gain=1)),
]


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
out = np.zeros(int(DUR_FRAMES / FPS * SR)); words = []
for li, (start, end, p) in enumerate(LINES):
    budget, speed = (end - start) / FPS, p["speed"]
    for _ in range(6):  # speak a touch faster if the line would run into the next beat
        y = intonate(tts(p["text"], speed), p)
        if len(y) / SR <= budget or speed >= 1.35: break
        speed *= 1.05
    pos = int(start / FPS * SR)
    out[pos:pos + len(y)] += y[: len(out) - pos]
    print(f"{start:4d} {len(y) / SR:4.2f}s / {budget:4.2f}s  speed {speed * PACE:.2f}  {p['text'][:48]}")
    env = np.convolve(np.abs(y), np.ones(480) / 480, "same")
    voiced = env > env.max() * 0.08
    vt = np.cumsum(voiced) / max(1, voiced.sum())
    cw = p["cap"].split()
    weights = np.array([max(2, len(w.strip('.,?!"\'$'))) + 1.5 for w in cw], float)
    edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
    for j, w in enumerate(cw):
        a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
        words.append({"w": w, "line": li, "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b) / SR * FPS, 2)})
out = room(out); out = out / np.abs(out).max() * 0.9
sf.write("vo/vo.wav", out, SR)
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(DUR_FRAMES)])
env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
json.dump({"duration": DUR_FRAMES, "mouth": [round(float(x), 3) for x in env], "words": words}, open("src/vo.json", "w"))
print("words", len(words))
