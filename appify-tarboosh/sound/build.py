"""Sound for the Tarboosh spec ad, synthesized from scratch and locked to src/timing.js. Mostly ASMR foley:
foil crinkle (the sound the hook promises) on every petal, a soft shimmer as the light crosses the chocolate, a rising
drone cut dead before the crack, a sharp chocolate snap, near-silence, then a slowed-down burst, a wet marshmallow
squish with a jiggle, slow debris clinks. A tape rewind, a tape stop, and a punchy groove on "Your ads should."
    python3 sound/build.py  ->  public/sound.wav"""
import re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
FPS, DUR = g("FPS"), g("DURATION")
PEEL0, GAP, PLEN, PETALS = g("PEEL0"), g("PEEL_GAP"), g("PEEL_LEN"), g("PETALS")
GLINT, CRACK, BURST, REWIND, REW_END, NEVER, SHOULD, CREDIT = (g(k) for k in ["GLINT", "CRACK", "BURST", "REWIND", "REW_END", "NEVER", "SHOULD", "CREDIT"])

N = int(DUR / FPS * SR) + SR
L, R = np.zeros(N), np.zeros(N)
rng = np.random.default_rng(7)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)
def put(sig, frame, gain=1.0, pan=0.0):
    i = int(frame / FPS * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(freq, n):
    f = np.broadcast_to(freq, (n,)).astype(float)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def saw(freq, n, harm=12):
    return sum(tone(np.asarray(freq) * h, n) / h for h in range(1, harm))
noise = lambda n: rng.standard_normal(n)
A = lambda st: 440 * 2 ** (st / 12)
sec = lambda s: int(s * SR)

def crinkle(dur, rate=700, bright=1.0, shape=None):
    """Foil: a Poisson train of tiny clicks with heavy-tailed loudness, each a few ms of band-passed noise."""
    n = sec(dur); out = np.zeros(n)
    e = np.ones(n) if shape is None else shape(np.arange(n) / n)
    k = rng.poisson(rate * dur)
    for t in rng.integers(0, n, k):
        if rng.random() > e[t]: continue
        m = int(rng.uniform(0.0006, 0.004) * SR)
        if t + m >= n: continue
        amp = min(3.0, rng.pareto(2.2) + 0.15)
        out[t:t + m] += noise(m) * np.exp(-np.arange(m) / (m / 3)) * amp
    out = filt(out, "bandpass", [1800 * bright, min(16000, 11000 * bright)])
    bed = filt(noise(n), "bandpass", [3000, 9000]) * 0.05 * e
    return (out + bed) * np.minimum(1, np.arange(n) / sec(0.01))

# ── foil ────────────────────────────────────────────────────────────────────────────────────────────
n = sec(SHOULD / FPS); put(filt(noise(n), "lowpass", 220) * 0.03, 0)                     # warm room tone
put(crinkle(0.45, 900, shape=lambda x: np.sin(np.pi * x) ** 0.6), 3, 0.5, -0.2)          # the teaser crinkle under the hook
put(crinkle(0.3, 600, shape=lambda x: np.sin(np.pi * x)), 18, 0.3, 0.25)
for k in range(PETALS):
    s = PEEL0 + k * GAP
    put(crinkle(PLEN / FPS * 1.1, 1100, shape=lambda x: (np.sin(np.pi * np.minimum(1, x * 1.2)) ** 0.5)), s, 0.55, (k % 3 - 1) * 0.45)
    nn = sec(0.18); put(filt(noise(nn), "bandpass", [600, 2400]) * env(nn, 0.003, 0.04), s + PLEN * 0.7, 0.35, (k % 3 - 1) * 0.6)   # tear-off
    nn = sec(0.5); put(filt(noise(nn), "bandpass", [400, 3000]) * np.sin(np.pi * np.arange(nn) / nn) ** 2, s + PLEN * 0.7, 0.12, (k % 3 - 1) * 0.8)  # whoosh away

# ── the bare chocolate ────────────────────────────────────────────────────────────────────────────────
for j, st in enumerate([12, 16, 19, 24, 28]):
    m = sec(1.2); put(tone(A(st), m) * env(m, 0.01, 0.4), GLINT + 6 + j * 4, 0.035, (j - 2) / 3)
n = sec((CRACK - 2 - 130) / FPS); ts = np.arange(n) / SR
put((tone(np.linspace(A(-33), A(-29), n), n) * 0.6 + filt(noise(n), "bandpass", [200, 1200]) * 0.4) * (ts / ts[-1]) ** 2.2, 130, 0.25)   # drone, cut dead

# ── crack, silence, burst ─────────────────────────────────────────────────────────────────────────────
nn = sec(0.5)
snap = filt(noise(nn), "highpass", 2500) * env(nn, 0.0002, 0.006) * 2.2
tok = (tone(np.full(nn, 1150.0), nn) * 0.6 + tone(np.full(nn, 1720.0), nn) * 0.4) * env(nn, 0.0005, 0.025)
body = filt(noise(nn), "bandpass", [300, 2200]) * env(nn, 0.001, 0.03)
put(snap + tok + body, CRACK, 0.9)
put(crinkle(0.35, 260, bright=0.7, shape=lambda x: np.exp(-x * 4)), CRACK + 1, 0.35, 0.2)      # the crack running across
for k in range(5):                                                                                # tiny ticks in the silence
    nn = sec(0.02); put(filt(noise(nn), "highpass", 4000) * env(nn, 0.0003, 0.003), CRACK + 5 + k * 3.3, 0.06, rng.uniform(-0.6, 0.6))
nn = sec(1.6); ts = np.arange(nn) / SR                                                            # the burst, slowed down
boom = tone(np.linspace(70, 28, nn), nn) * env(nn, 0.004, 0.45)
whoosh = filt(noise(nn), "bandpass", [120, 1400]) * env(nn, 0.02, 0.5)
put(boom * 1.1 + whoosh * 0.6 + filt(noise(nn), "highpass", 1500) * env(nn, 0.001, 0.03) * 0.9, BURST, 0.95)
# the marshmallow squish: a wet, falling formant with a little bubbling, then a low jiggle
nn = sec(0.9); ts = np.arange(nn) / SR
wet = np.zeros(nn); cf = np.linspace(1400, 380, nn)
src_n = noise(nn) * (1 + 0.8 * np.sin(2 * np.pi * 28 * ts + 3 * np.sin(2 * np.pi * 7 * ts)))
for b in range(0, nn, 1024):
    seg = src_n[b:b + 1024]; c = cf[b]
    wet[b:b + len(seg)] = filt(seg, "bandpass", [c * 0.7, c * 1.4])
put(wet * env(nn, 0.03, 0.35) * 1.4, BURST + 2, 0.45)
nn = sec(1.8); ts = np.arange(nn) / SR
put(tone(95 + 25 * np.sin(2 * np.pi * 1.0 * ts), nn) * np.exp(-ts / 0.7) * np.abs(np.sin(2 * np.pi * 1.0 * ts)) ** 0.5, BURST + 3, 0.28)
for k in range(9):                                                                                 # slow debris clinks
    nn = sec(0.5); f0 = rng.uniform(500, 1100)
    put((tone(np.full(nn, f0), nn) + 0.5 * tone(np.full(nn, f0 * 2.7), nn)) * env(nn, 0.002, 0.12), BURST + 10 + k * 8 + rng.uniform(0, 5), 0.05, rng.uniform(-0.8, 0.8))
n = sec((REWIND - BURST) / FPS); ts = np.arange(n) / SR
put((tone(A(-24), n) + tone(A(-17), n) * 0.6 + tone(A(-12), n) * 0.4) * np.minimum(1, ts / 0.8) * np.minimum(1, (ts[-1] - ts) / 0.2) * 0.05, BURST + 6)   # a slow-mo pad

# ── rewind ────────────────────────────────────────────────────────────────────────────────────────────
n = sec((REW_END - REWIND) / FPS); ts = np.arange(n) / SR; x = ts / ts[-1]
chirps = np.zeros(n)
for k in range(10):                                                     # reversed snippets: fast rising chirps
    a, b = int(n * k / 10), int(n * (k + 1) / 10); m = b - a
    chirps[a:b] = tone(np.linspace(300 + 200 * k, 1600 + 300 * k, m), m) * np.linspace(0.2, 1, m) ** 2
put(chirps * 0.12 + crinkle(n / SR, 2200, bright=1.3) * 0.25 + filt(noise(n), "bandpass", [800, 6000]) * (0.4 + 0.6 * x) * 0.12, REWIND, 0.9)
nn = sec(0.35); ts = np.arange(nn) / SR
put(tone(np.linspace(900, 60, nn), nn) * np.exp(-ts / 0.15) * 0.5, REW_END - 2, 0.4)                   # tape stop
# ── "Your ads should.": impact, chord stab, groove ────────────────────────────────────────────────────
nn = sec(0.8)
put(tone(np.linspace(110, 40, nn), nn) * env(nn, 0.002, 0.25) * 1.2 + filt(noise(nn), "highpass", 1500) * env(nn, 0.0005, 0.03), SHOULD, 0.9)
nn = sec(2.2); ts = np.arange(nn) / SR
stab = sum(saw(A(st) * (1 + 0.003 * k), nn, 9) for k, st in enumerate([-24, -12, -8, -5, -1, 0, 4])) / 7
put(filt(stab, "lowpass", 3500) * env(nn, 0.004, 0.7), SHOULD, 0.55)
for b in range(SHOULD, DUR, 15):                                         # 120 BPM, a beat = 15 frames
    k = sec(0.3); put(tone(np.linspace(120, 45, k), k) * env(k, 0.002, 0.09), b, 0.5)
    h = sec(0.05); put(filt(noise(h), "highpass", 7000) * env(h, 0.0005, 0.012), b + 7, 0.12, 0.25)
    if ((b - SHOULD) // 15) % 2: c = sec(0.2); put(filt(noise(c), "bandpass", [900, 3500]) * env(c, 0.001, 0.05), b, 0.22)
for j, b in enumerate(range(SHOULD, DUR, 60)):
    nn = sec(2.0); put(filt(saw(A([-36, -40][j % 2]), nn, 6), "lowpass", 400) * env(nn, 0.01, 0.8), b, 0.2)
nn = sec(2.2); put((tone(A(12), nn) + 0.6 * tone(A(16), nn) + 0.4 * tone(A(19), nn)) * env(nn, 0.002, 0.7), CREDIT, 0.18)
put(crinkle(0.3, 800), SHOULD + 2, 0.25, 0.3)                            # one last crinkle on the whip

mix = np.stack([L, R], 1)[: int(DUR / FPS * SR)]
fade = sec(0.6); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-3 / 20) / np.abs(mix).max()
wavfile.write("public/sound.wav", SR, (mix * 32767).astype(np.int16))
print("public/sound.wav", round(len(mix) / SR, 2), "s")
