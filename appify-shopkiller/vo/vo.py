"""Voice-over for the Shopify Killer reel, generated locally with Kokoro TTS (voice am_michael).
Each line starts on its scene's frame; outputs vo.wav, per-frame mouth envelope and word timings.
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

FPS, DUR, SR = 30, 30.0, 24000
VOICE = "am_michael"
# (start frame, latest end frame, text, caption text)
LINES = [
    (8,   86,  "Still paying Shopify thirty bucks a month?", "Still paying Shopify $30 a month?"),
    (92,  262, "That's three-sixty a year. Thirty-six hundred over ten years... and you still don't own your store.", "That's $360 a year. $3,600 over ten years... and you still don't own your store."),
    (282, 326, "So... what if you paid once?", "So... what if you paid once?"),
    (346, 472, "Meet Shopify Killer. Your own store, built by Appify.", "Meet Shopify Killer. Your own store, built by Appify."),
    (482, 522, "Better design.", "Better design."),
    (527, 567, "Fully customizable.", "Fully customizable."),
    (572, 612, "Full control.", "Full control."),
    (617, 656, "Zero monthly fees.", "Zero monthly fees."),
    (668, 776, "That's thirty-two forty saved. It pays for itself in a year.", "That's $3,240 saved. It pays for itself in a year."),
    (786, 894, "Three-sixty, once. Yours for life. D.M. 'store' to start.", "$360 once. Yours for life. DM \"STORE\" to start."),
]

k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
out = np.zeros(int(DUR * SR)); words = []
for start, end, text, cap in LINES:
    budget = (end - start) / FPS
    speed = 1.05
    for _ in range(6):
        s, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
        nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 1200]  # trim silence
        if len(s) / sr <= budget or speed >= 1.3: break
        speed += 0.05
    dur = len(s) / sr
    print(f"{start:4d} {dur:5.2f}s / {budget:4.2f}s  speed {speed:.2f}  {text[:48]}")
    i = int(start / FPS * SR); out[i:i + len(s)] += s[: len(out) - i]
    # word timings: find voiced runs, spread caption words over them by length
    env = np.convolve(np.abs(s), np.ones(480) / 480, "same")
    voiced = env > env.max() * 0.08
    t_voiced = np.where(voiced)[0]
    cw = cap.split()
    weights = np.array([max(2, len(w.strip('.,?!"\'$'))) + 1.5 for w in cw], float)
    # map cumulative weight onto cumulative voiced time
    vt = np.cumsum(voiced) / max(1, voiced.sum())
    edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
    for j, w in enumerate(cw):
        a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
        words.append({"w": w, "line": len(words) and words[-1]["line"] + (j == 0) or 0, "start": round(start + a / sr * FPS, 2), "end": round(start + b / sr * FPS, 2)})
peak = np.abs(out).max(); out = out / peak * 0.9
sf.write("vo/vo.wav", out, SR)
# per-frame mouth envelope 0..1
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(int(DUR * FPS))])
env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
json.dump({"mouth": [round(float(x), 3) for x in env], "words": words}, open("src/vo.json", "w"))
print("words", len(words))
