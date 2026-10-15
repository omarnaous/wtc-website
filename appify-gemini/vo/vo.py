"""Voice-over for the Gemini 3.5 spec commercial. Kokoro (af_heart, warm and close), re-intonated per line with
Praat PSOLA (the same treatment as the Appify motion reel). The picture follows the voice: every line's start frame
goes to src/vo.json, and src/timing.js derives the scenes from it.
    python3 vo/vo.py <kokoro-dir>        ->  vo/vo.wav + src/vo.json"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR = 30, 24000
VOICE = "af_heart"
P = lambda text, speed=1.0, shift=0, rng=1.4, mel="fall", gain=0: dict(text=text, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# (key, line, frames of air after it). The four verbs sit on a fixed 48-frame grid so each capability gets its scene.
LINES = [
    ("ask",   P("You used to ask AI questions.", speed=0.98, shift=0, rng=1.3, mel="fall"), 14),
    ("hand",  P("Now, you hand it the whole job.", speed=0.97, shift=0.5, rng=1.5, mel="arch", gain=0.5), 40),
    ("name",  P("Gemini three point five.", speed=0.92, shift=0.5, rng=1.5, mel="fall", gain=1), 30),
    ("plans", P("It plans.", speed=0.95, shift=1, rng=1.4, mel="fall"), "grid"),
    ("codes", P("It codes.", speed=0.95, shift=1, rng=1.4, mel="fall"), "grid"),
    ("sees",  P("It sees.", speed=0.95, shift=1, rng=1.4, mel="fall"), "grid"),
    ("builds", P("It builds.", speed=0.95, shift=1, rng=1.4, mel="fall"), "grid"),
    ("sleep", P("And while you sleep... it keeps going.", speed=0.94, shift=0, rng=1.5, mel="dip", gain=0.5), 40),
    ("end",   P("Gemini three point five.", speed=0.92, shift=0.5, rng=1.5, mel="fall", gain=1), 10),
    ("over",  P("Just hand it over.", speed=0.95, shift=1, rng=1.5, mel="fall", gain=1), 0),
]
GRID = 48


def smooth(a, b, u):
    x = np.clip((u - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
def melody(kind, u):
    decl = -1.2 * u
    if kind == "rise": return 0.6 * decl + 4.5 * smooth(0.6, 1, u)
    if kind == "arch": return decl + 2.0 * np.sin(np.pi * np.clip(u * 1.15, 0, 1)) - 1.5 * smooth(0.8, 1, u)
    if kind == "dip":  return decl - 1.0 * smooth(0.5, 1, u)
    return decl + 1.2 * np.sin(np.pi * np.clip(u * 1.6, 0, 1)) - 3.0 * smooth(0.65, 1, u)
def intonate(s, ph):
    snd = parselmouth.Sound(s, SR)
    man = call(snd, "To Manipulation", 0.01, 75, 500)
    pt = call(man, "Extract pitch tier")
    n = call(pt, "Get number of points")
    ts = np.array([call(pt, "Get time from index", i) for i in range(1, n + 1)])
    fs = np.array([call(pt, "Get value at index", i) for i in range(1, n + 1)])
    if n > 3:
        centre = np.median(fs); d = 12 * np.log2(fs / centre); u = (ts - ts[0]) / max(1e-6, ts[-1] - ts[0])
        st = ph["shift"] + ph["rng"] * d + melody(ph["mel"], u)
        new = call("Create PitchTier", "p", snd.xmin, snd.xmax)
        for t, v in zip(ts, centre * 2 ** (st / 12)): call(new, "Add point", float(t), float(np.clip(v, 90, 480)))
        call([new, man], "Replace pitch tier")
    return call(man, "Get resynthesis (overlap-add)").values[0] * 10 ** (ph["gain"] / 20)
def tts(text, speed):
    s, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]
    return s[max(0, nz[0] - 200): nz[-1] + 900]
def room(x):
    n = int(0.25 * SR); rng = np.random.default_rng(3)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
    return x + 0.08 * np.convolve(x, ir / np.abs(ir).sum() * 6, "full")[: len(x)]

k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
t, A, placed = 24, {}, []                       # 0.8 s of blinking cursor before the first word
for key, p, after in LINES:
    y = intonate(tts(p["text"], p["speed"]), p)
    n = int(round(len(y) / SR * FPS))
    A[key] = {"at": t, "len": n, "text": p["text"].replace("three point five", "3.5")}
    placed.append((t, y))
    t += GRID if after == "grid" else n + after
A["total"] = t + 75                              # 2.5 s hold on the end card
out = np.zeros(int(A["total"] / FPS * SR) + SR)
for at, y in placed:
    i = int(at / FPS * SR); out[i:i + len(y)] += y
out = room(out)[: int(A["total"] / FPS * SR)]
out *= 10 ** (-3 / 20) / np.abs(out).max()
sf.write("vo/vo.wav", out, SR)
json.dump(A, open("src/vo.json", "w"), indent=1)
print({k_: (v["at"], v["len"]) if isinstance(v, dict) else v for k_, v in A.items()})
