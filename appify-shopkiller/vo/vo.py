"""Voice-over for the Shopify Killer reel, generated locally with Kokoro TTS (voice am_michael).
Each line starts on its scene's frame; outputs vo.wav, per-frame mouth envelope and word timings.
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

FPS, DUR, SR = 30, 30.0, 24000
VOICE = "am_puck"
# (start frame, latest end frame, text, caption text)
LINES = [
    (6,   86,  "Yo! Still paying Shopify thirty-nine bucks a month?!", "Yo! Still paying Shopify $39 a month?!"),
    (92,  262, "That's four sixty-eight a year! Forty-six eighty in ten years! And you still don't even own your store!", "That's $468 a year! $4,680 in ten years! And you still don't even own your store!"),
    (280, 326, "So... what if you paid once?", "So... what if you paid once?"),
    (338, 476, "Boom! Shopify Killer! Not some boring template. A stunning store, with real animations!", "Boom! Shopify Killer! Not some boring template. A stunning store, with real animations!"),
    (482, 522, "Way more beautiful!", "Way more beautiful!"),
    (527, 567, "Customize everything!", "Customize everything!"),
    (572, 612, "Full control!", "Full control!"),
    (617, 656, "Zero monthly fees!", "Zero monthly fees!"),
    (668, 772, "That's forty-three twenty saved! It pays for itself in ten months!", "That's $4,320 saved! It pays for itself in 10 months!"),
    (778, 899, "D.M. or comment, Appify E-commerce, to book your free prototype demo!", "DM or comment \"Appify Ecommerce\" to book your free prototype demo!"),
]

k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
out = np.zeros(int(DUR * SR)); words = []
for start, end, text, cap in LINES:
    budget = (end - start) / FPS
    speed = 1.2
    for _ in range(6):
        s, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
        nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 1200]  # trim silence
        if len(s) / sr <= budget or speed >= 1.4: break
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
