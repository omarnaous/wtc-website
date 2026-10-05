"""Synthesizes the reveal soundtrack (royalty-free, generated from scratch).
Cue times are tied to frames at 30 fps in src/timing.js."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
DUR = 8.0
FPS = 30
N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def f2s(frame): return frame / FPS
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); n = min(len(sig), N - i)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + n] += sig[:n] * gain * l * 1.414; R[i:i + n] += sig[:n] * gain * r * 1.414
def reverb(x, secs=2.2, wet=0.35, seed=1):
    g = np.random.default_rng(seed)
    n = int(secs * SR); ir = g.standard_normal(n) * np.exp(-np.arange(n) / (secs / 6.5 * SR))
    ir = lp(ir, 7000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 3

# 1. Ignite tick: tiny glassy click as the spark appears.
n = int(0.5 * SR); tt = np.arange(n) / SR
tick = (np.sin(2 * np.pi * 3520 * tt) * 0.6 + np.sin(2 * np.pi * 5280 * tt) * 0.3) * env_exp(n, 0.05)
place(reverb(tick, 1.4, 0.5, 2), f2s(10), 0.18, 0.2)

# 2. Riser: band-swept noise + gliding tone, cut dead just before the hit.
a, b = f2s(21), f2s(80)
n = int((b - a) * SR); tt = np.arange(n) / SR; p = tt / tt[-1]
noise = rng.standard_normal(n)
chunks = []
for k in range(40):
    s, e = k * n // 40, (k + 1) * n // 40
    c = 300 + (6500 - 300) * (p[s] ** 2)
    chunks.append(bp(noise[s:e] if k == 0 else noise[max(0, s - 2000):e], c * 0.7, min(c * 1.4, 20000))[-(e - s):])
swept = np.concatenate(chunks)
freq = 110 * (2 ** (2.2 * p ** 1.6))
tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(freq * 1.5) / SR)
riser = (swept * 0.5 + tone * 0.35) * (p ** 2.4)
riser[-int(0.008 * SR):] *= np.linspace(1, 0, int(0.008 * SR))
place(riser, a, 0.55, -0.1); place(riser[::-1][::-1] * 0.9, a + 0.012, 0.5, 0.15)

# 3. THE HIT: sub drop + punch + transient + boom tail.
h = f2s(84)
n = int(2.6 * SR); tt = np.arange(n) / SR
f_sub = 38 + 110 * np.exp(-tt / 0.045)
sub = np.sin(2 * np.pi * np.cumsum(f_sub) / SR) * env_exp(n, 0.55)
punch = np.sin(2 * np.pi * np.cumsum(180 + 240 * np.exp(-tt / 0.012)) / SR) * env_exp(n, 0.07)
crack = hp(rng.standard_normal(n), 2500) * env_exp(n, 0.012)
boom = lp(rng.standard_normal(n), 260, 4) * env_exp(n, 0.5) * 2.2
body = np.tanh((sub * 1.2 + punch * 0.7 + crack * 0.5 + boom * 0.5) * 1.6)
place(reverb(body, 2.6, 0.32, 3), h, 0.95)
shimmer = hp(rng.standard_normal(n), 6000) * env_exp(n, 0.35)
place(reverb(shimmer, 2.0, 0.6, 4), h, 0.10, -0.5); place(reverb(shimmer[::-1].copy()[::-1], 2.0, 0.6, 5), h + 0.01, 0.10, 0.5)

# 4. Spark lands on the i: bright chime, two partials, long shimmer.
s = f2s(112)
n = int(2.4 * SR); tt = np.arange(n) / SR
ting = (np.sin(2 * np.pi * 1760 * tt) + 0.55 * np.sin(2 * np.pi * 2637 * tt) + 0.25 * np.sin(2 * np.pi * 3520 * tt + 0.5)) * env_exp(n, 0.45)
ting *= np.minimum(1, tt / 0.002)
place(reverb(ting, 2.4, 0.45, 6), s, 0.22, 0.25)
place(reverb(lp(rng.standard_normal(int(0.08 * SR)), 900) * env_exp(int(0.08 * SR), 0.02), 1.0, 0.3, 7), s, 0.25)

# 5. URL reveal: soft airy whoosh.
w = f2s(126); n = int(0.9 * SR); tt = np.arange(n) / SR
wh = bp(rng.standard_normal(n), 900, 5000) * np.sin(np.pi * tt / tt[-1]) ** 2
place(reverb(wh, 1.5, 0.4, 8), w, 0.10, -0.3)

# 6. Pad bed from the hit to the end: A-major-ish airy chord, fades out.
a = f2s(84); n = N - int(a * SR); tt = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * fr * tt + i) * g for i, (fr, g) in enumerate([(110, .5), (164.8, .35), (220, .3), (277.2, .22), (329.6, .18)]))
pad = lp(pad, 1800) * np.minimum(1, tt / 1.2) * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * tt))
place(pad, a, 0.07)

# 7. Sheen glint during the final hold.
g = f2s(170); n = int(1.6 * SR); tt = np.arange(n) / SR
gl = (np.sin(2 * np.pi * 2349 * tt) * 0.5 + np.sin(2 * np.pi * 3136 * tt) * 0.3) * env_exp(n, 0.4) * np.minimum(1, tt / 0.03)
place(reverb(gl, 2.0, 0.6, 9), g, 0.06, -0.2)

# master: fade tail, soft clip, normalize to -1 dBFS
fade = np.ones(N); k = int(0.7 * SR); fade[-k:] = np.linspace(1, 0, k) ** 2
st = np.stack([L * fade, R * fade], 1)
st = np.tanh(st * 1.1)
st *= (10 ** (-1 / 20)) / np.abs(st).max()
wavfile.write("public/reveal.wav", SR, (st * 32767).astype(np.int16))
print("peak", np.abs(st).max(), "rms dB", 20 * np.log10(np.sqrt((st ** 2).mean())))
