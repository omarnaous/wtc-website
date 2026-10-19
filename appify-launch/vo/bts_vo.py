"""Dev's voice for the "how we made it" reel, same voice and treatment as the Subscription Killer reel: Kokoro TTS
(am_puck) speaks each line, Praat PSOLA re-intonates it (register, pitch range, melody, loudness), a small room.
Lines are placed one after another on the voice, each held at least `min` frames so its scene can play, and
written to src/bts-vo.json (line starts, word timings, mouth envelope). bts-timing.js, Bts.jsx and
sound/bts_cues.py read from it.
usage: python3 vo/bts_vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR = 30, 24000
VOICE, PACE, GAP, TAIL = "am_puck", 1.2 / 1.1, 0.18, 75
P = lambda key, spoken, cap=None, mn=40, speed=1.1, shift=0, rng=1.5, mel="fall", gain=0: dict(
    key=key, text=spoken, cap=cap or spoken, min=mn, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# key, spoken, caption, minimum frames before the next line (so the scene under it has time)
SCRIPT = [
    P("hook", "Everyone's posting the Tesla Roadster trend.", "Everyone's posting the Tesla Roadster trend 🚀", mn=70, shift=1, rng=1.6, mel="arch", gain=1),
    P("ours", "So we made one, with an app.", "So we made one… with an app.", mn=50, shift=0.5, rng=1.6, mel="fall"),
    P("claude", "The whole video? Built with Claude.", mn=50, speed=1.08, shift=1, rng=1.6, mel="arch", gain=0.5),
    P("prompt", "Here's the prompt we used.", "Here's the prompt we used…", mn=84, speed=1.05, shift=0, rng=1.5, mel="dip"),
    P("nah", "Nah. Not all of it.", "…nah, not all of it 😏", mn=82, speed=1.05, shift=-1, rng=1.6, mel="fall", gain=0.5),
    P("join", "Want to join the Roadster trend?", mn=30, shift=1.5, rng=1.6, mel="rise", gain=1),
    P("cta", "Comment prompt, and we'll DM you how to make yours.", "Comment PROMPT and we'll DM you how to make yours", mn=30, shift=0.5, rng=1.6, mel="fall", gain=0.5),
]
START = 10


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
    man = call(snd, "To Manipulation", 0.01, 60, 450)
    pt = call(man, "Extract pitch tier")
    n = call(pt, "Get number of points")
    ts = np.array([call(pt, "Get time from index", i) for i in range(1, n + 1)])
    fs = np.array([call(pt, "Get value at index", i) for i in range(1, n + 1)])
    if n > 3:
        centre = np.median(fs); d = 12 * np.log2(fs / centre)
        u = (ts - ts[0]) / max(1e-6, ts[-1] - ts[0])
        st = ph["shift"] + ph["rng"] * d + melody(ph["mel"], u)
        new = call("Create PitchTier", "p", snd.xmin, snd.xmax)
        for t, v in zip(ts, centre * 2 ** (st / 12)): call(new, "Add point", float(t), float(np.clip(v, 65, 420)))
        call([new, man], "Replace pitch tier")
    return call(man, "Get resynthesis (overlap-add)").values[0] * 10 ** (ph["gain"] / 20)

def tts(text, speed):
    s, _ = k.create(text, voice=VOICE, speed=speed * PACE, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]
    return s[max(0, nz[0] - 200): nz[-1] + 900]

def room(x):
    n = int(0.22 * SR); rng = np.random.default_rng(3)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
    return x + 0.09 * np.convolve(x, ir / np.abs(ir).sum() * 6, "full")[: len(x)]

k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
F = lambda s: int(round(s * FPS))
ys = [intonate(tts(p["text"], p["speed"]), p) for p in SCRIPT]
starts, t, prev = [], START, None
for p, y in zip(SCRIPT, ys):
    s0 = t if prev is None else max(t, prev[0] + prev[1])
    starts.append(s0); prev = (s0, p["min"]); t = s0 + F(len(y) / SR + GAP)
total = max(t + TAIL, starts[-1] + SCRIPT[-1]["min"] + TAIL)
out = np.zeros(int(total / FPS * SR) + SR); words, lines = [], []
for li, (p, y, s0) in enumerate(zip(SCRIPT, ys, starts)):
    pos = int(s0 / FPS * SR); out[pos:pos + len(y)] += y
    env = np.convolve(np.abs(y), np.ones(480) / 480, "same"); voiced = env > env.max() * 0.08
    vt = np.cumsum(voiced) / max(1, voiced.sum())
    cw = p["cap"].split(); w8 = np.array([max(2, len(w.strip('.,?!"\'…'))) + 1.5 for w in cw], float)
    edges = np.concatenate([[0], np.cumsum(w8) / w8.sum()])
    for j, w in enumerate(cw):
        a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
        words.append({"w": w, "line": li, "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b) / SR * FPS, 2)})
    lines.append({"key": p["key"], "start": s0, "end": s0 + F(len(y) / SR), "cap": p["cap"]})
    print(f"{p['key']:7s} {s0:4d}-{lines[-1]['end']:4d}  {p['text']}")
out = room(out[: int(total / FPS * SR)]); out = out / np.abs(out).max() * 0.9
sf.write("vo/bts.wav", out, SR)
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(total)])
mouth = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
json.dump({"duration": total, "lines": lines, "words": words, "mouth": [round(float(x), 3) for x in mouth]}, open("src/bts-vo.json", "w"))
print(f"total {total} frames = {total / FPS:.2f}s")
