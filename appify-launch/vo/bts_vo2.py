"""V2 of Dev's voice for the "how we made it" reel: smoother and slower. Instead of one take per line, Dev reads the
script in three flowing passages (commas, not full stops), so there are no hard stops between lines, at a relaxed pace
and with a gentler pitch treatment. Same voice (Kokoro am_puck + Praat PSOLA + small room) as the other reels.
Each passage is made of keyed segments; the key's start/end comes from its words, so the scenes and Dev's reactions
still land on the right phrase. Writes src/bts-vo-v2.json and vo/bts-v2.wav.
usage: python3 vo/bts_vo2.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR = 30, 24000
VOICE, SPEED, GAP, START, TAIL = "am_puck", 1.08, 0.24, 10, 60
# passages: (melody, pitch shift, range, [(key, spoken, caption)])
PASSAGES = [
    ("arch", 1.0, 1.3, [
        ("hook", "Wait, did you see the Tesla Roadster fly?", "Wait… did you see the Tesla Roadster fly? 🚀"),
        ("ours", "Well, we made our app do the exact same thing,", "Well… we made our app do the exact same thing 😎"),
        ("studio", "and no, we didn't hire a fancy 3D studio,", "and no, we didn't hire a fancy 3D studio,"),
        ("claude", "we literally just told Claude what we wanted.", "we literally just told Claude what we wanted."),
    ]),
    ("fall", 0.3, 1.3, [
        ("prompt", "It was this prompt, a phone on a giant test track, rockets, smoke, the whole vibe,",
                   "It was this prompt: a phone on a giant test track, rockets, smoke, the whole vibe 👀"),
        ("nah", "but nope, I'm not giving you the whole thing in this video.", "but nope… I'm not giving you the whole thing in this video 😏"),
    ]),
    ("fall", 0.6, 1.35, [
        ("too", "The good news is, you can make one too,", "The good news? You can make one too."),
        ("cta", "just comment prompt, and I'll DM you the whole thing,", "Just comment PROMPT and I'll DM you the whole thing,"),
        ("mg", "and if you need motion graphics for your brand, we can help you out too.", "and if you need motion graphics for your brand, we can help you out too ✨"),
    ]),
]

def smooth(a, b, u):
    x = np.clip((u - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
def melody(kind, u):
    decl = -0.8 * u
    if kind == "arch": return decl + 1.2 * np.sin(np.pi * np.clip(u * 1.1, 0, 1)) - 1.0 * smooth(0.85, 1, u)
    return decl + 0.8 * np.sin(np.pi * np.clip(u * 1.4, 0, 1)) - 1.8 * smooth(0.75, 1, u)
def intonate(s, mel, shift, rng):
    snd = parselmouth.Sound(s, SR)
    man = call(snd, "To Manipulation", 0.01, 60, 450); pt = call(man, "Extract pitch tier")
    n = call(pt, "Get number of points")
    ts = np.array([call(pt, "Get time from index", i) for i in range(1, n + 1)])
    fs = np.array([call(pt, "Get value at index", i) for i in range(1, n + 1)])
    if n > 3:
        centre = np.median(fs); d = 12 * np.log2(fs / centre); u = (ts - ts[0]) / max(1e-6, ts[-1] - ts[0])
        st = shift + rng * d + melody(mel, u)
        new = call("Create PitchTier", "p", snd.xmin, snd.xmax)
        for t, v in zip(ts, centre * 2 ** (st / 12)): call(new, "Add point", float(t), float(np.clip(v, 65, 420)))
        call([new, man], "Replace pitch tier")
    return call(man, "Get resynthesis (overlap-add)").values[0]
def room(x):
    n = int(0.22 * SR); rng = np.random.default_rng(3)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
    return x + 0.09 * np.convolve(x, ir / np.abs(ir).sum() * 6, "full")[: len(x)]

k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
takes = []
for mel, shift, rng, segs in PASSAGES:
    s, _ = k.create(" ".join(t for _, t, _ in segs), voice=VOICE, speed=SPEED, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 900]
    takes.append(intonate(s, mel, shift, rng))
total_s = START / FPS + sum(len(y) for y in takes) / SR + GAP * (len(takes) - 1)
total = int(total_s * FPS) + TAIL
out = np.zeros(int(total / FPS * SR) + SR); words, lines = [], []
pos = int(START / FPS * SR)
for (mel, shift, rng, segs), y in zip(PASSAGES, takes):
    out[pos:pos + len(y)] += y
    env = np.convolve(np.abs(y), np.ones(480) / 480, "same"); voiced = env > env.max() * 0.08
    vt = np.cumsum(voiced) / max(1, voiced.sum())
    cw = [(key, w) for key, _, cap in segs for w in cap.split()]
    w8 = np.array([max(2, len(w.strip('.,?!:"\'…'))) + 1.5 for _, w in cw], float)
    edges = np.concatenate([[0], np.cumsum(w8) / w8.sum()])
    seg_words = {}
    for j, (key, w) in enumerate(cw):
        a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
        wd = {"w": w, "line": [s[0] for s in segs].index(key) + 100 * len(lines), "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b) / SR * FPS, 2)}
        words.append(wd); seg_words.setdefault(key, []).append(wd)
    for key, _, cap in segs:
        ws = seg_words[key]
        lines.append({"key": key, "start": int(ws[0]["start"]), "end": int(np.ceil(ws[-1]["end"])), "cap": cap})
        print(f"{key:7s} {lines[-1]['start']:4d}-{lines[-1]['end']:4d}  {cap}")
    pos += len(y) + int(GAP * SR)
out = room(out[: int(total / FPS * SR)]); out = out / np.abs(out).max() * 0.9
sf.write("vo/bts-v2.wav", out, SR)
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(total)])
mouth = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
json.dump({"duration": total, "lines": lines, "words": words, "mouth": [round(float(x), 3) for x in mouth]}, open("src/bts-vo-v2.json", "w"))
print(f"total {total} frames = {total / FPS:.2f}s")
