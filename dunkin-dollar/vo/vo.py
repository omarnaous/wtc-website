"""Voice-over: a warm, unhurried read (Kokoro af_heart), each line placed on its beat from src/timing.js.
-> vo/vo.wav + src/vo.json (line starts, word timings for nothing but the mouth-free captions)
usage: python3 vo/vo.py <kokoro-dir>"""
import json, re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
FPS, SR = 30, 24000
T = {k: int(v) for k, v in re.findall(r"(\w+):\s*(\d+),", open("src/timing.js").read().split("export const T")[1])}
DUR = 600
# (frame, text, speed): the three words land exactly on their beats
LINES = [
    (T["dawn"] + 14, "Seven a.m. Beirut.", 0.95),
    (T["cup"] + 4, "Your morning coffee...", 0.98),
    (T["bill"] + 2, "for one dollar.", 0.95),
    (T["words"], "Every.", 1.0), (T["words"] + 16, "Single.", 1.0), (T["words"] + 32, "Day.", 1.0),
    (T["end"] + 8, "Your daily Dunkin'.", 0.95),
]
k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
out = np.zeros(int(DUR / FPS * SR) + SR); placed = []
for fr, text, sp in LINES:
    s, _ = k.create(text, voice="af_heart", speed=sp, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 120): nz[-1] + 600]
    i = int(fr / FPS * SR); out[i:i + len(s)] += s[: len(out) - i]
    placed.append({"frame": fr, "text": text, "end": round(fr + len(s) / SR * FPS)})
    print(f"{fr:4d}-{placed[-1]['end']:4d}  {text}")
n = int(0.18 * SR); rng = np.random.default_rng(3)
ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
out = out + 0.07 * np.convolve(out, ir / np.abs(ir).sum() * 6, "full")[: len(out)]
out = out[: int(DUR / FPS * SR)]; out = out / np.abs(out).max() * 0.9
sf.write("vo/vo.wav", out, SR)
json.dump({"lines": placed}, open("src/vo.json", "w"), indent=1)
