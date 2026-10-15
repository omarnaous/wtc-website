"""Appify Dynamic Island reel soundtrack. A warm 120 BPM bed in D major (pad from the first frame, the groove on the first
offer, back to the pad when the island closes) and a haptic-style sound for everything the phone does: the rise, the pen
writing "hello", island taps, the page filling, the digits rolling, the app icons, seven day-dots climbing the scale to a
success chime, and the spark's flight and landing on the wordmark.
Frames come from src/timing.js.     python3 sound/score.py  ->  public/sound.wav, public/sound-nomusic.wav
"""
import re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR, FPS = 48000, 30
T = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", T).group(1))
DURF = g("DURATION"); S = [int(x) for x in re.search(r"S = \[([^\]]+)\]", T).group(1).split(",")]
LINE, PILL, SPARK, WORD, LAND, TAG, URL = g("LINE"), g("PILL"), g("SPARK"), g("WORD"), g("LAND"), g("TAG"), g("URL")
SC = S
DUR = DURF / FPS; N = int(DUR * SR)
BPM = 120; BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4
rng = np.random.default_rng(14)

def f(fr): return fr / FPS
def sos(kind, fc, o=2): return butter(o, fc, kind, fs=SR, output="sos")
def lp(x, fc, o=2): return sosfilt(sos("lowpass", fc, o), x)
def hp(x, fc, o=2): return sosfilt(sos("highpass", fc, o), x)
def bp(x, lo, hi, o=2): return sosfilt(sos("bandpass", [lo, hi], o), x)
def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def noise(n): return rng.standard_normal(n)
def sine(fr, n): return np.sin(2 * np.pi * fr * np.arange(n) / SR)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

class Bus:
    def __init__(self): self.L = np.zeros(N + SR * 4); self.R = np.zeros(N + SR * 4)
    def put(self, sig, t, gn=1.0, pan=0.0):
        i = int(t * SR)
        if i < 0: sig, i = sig[-i:], 0
        n = min(len(sig), len(self.L) - i)
        if n <= 0: return
        self.L[i:i + n] += sig[:n] * gn * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.R[i:i + n] += sig[:n] * gn * np.sin((pan + 1) * np.pi / 4) * 1.414
    def st(self): return np.stack([self.L[:N], self.R[:N]], 1)

def reverb(x, secs=1.6, wet=0.25):
    n = int(secs * SR); ir = lp(noise(n) * env(n, secs / 5), 5000); ir /= np.sqrt((ir ** 2).sum())
    y = np.convolve(x, ir); out = np.zeros(len(y)); out[: len(x)] += x * (1 - wet); return out + y * wet

# ───────────────────────── instruments (soft; the WTC launch film's set)
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR; fr = 48 + 70 * np.exp(-t / 0.025)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.11) * 1.3) * 0.9 + hp(noise(n), 2500) * env(n, 0.002) * 0.15
def clap():
    n = int(0.25 * SR); x = np.zeros(n)
    for d in (0, 0.009, 0.019): i = int(d * SR); x[i:] += bp(noise(n - i), 900, 5000) * env(n - i, 0.012)
    i = int(0.019 * SR); x[i:] += bp(noise(n - i), 900, 4000) * env(n - i, 0.06) * 0.5
    return x * 0.6
def shaker():
    n = int(0.06 * SR); return bp(noise(n), 5000, 11000) * np.minimum(1, np.arange(n) / (0.012 * SR)) * env(n, 0.018) * 0.35
def keys(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, m in enumerate(notes):
        fr = hz(m); x += (np.sin(2 * np.pi * fr * t) + 0.18 * np.sin(4 * np.pi * fr * t) * env(n, 0.25) + 0.06 * np.sin(2 * np.pi * fr * 3.01 * t) * env(n, 0.08)) * (0.9 - k * 0.07)
    x *= np.minimum(1, t / 0.008) * env(n, 1.1) * (1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)); return lp(x, 2600) / len(notes)
def pad(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, m in enumerate(notes):
        for det in (-0.12, 0.12): x += np.sin(2 * np.pi * hz(m + det) * t + k)
    return lp(x * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.5), 1400) / (2 * len(notes))
def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(4 * np.pi * hz(m) * t)
    return np.tanh(x * 1.2 * np.minimum(1, t / 0.006) * env(n, 0.22)) * 0.8
def bell(m, gn=1.0, tau=1.4):
    n = int(3.0 * SR); fr = hz(m); x = np.zeros(n)
    for p, a, d in ((1, 1, 1), (2.0, 0.35, 0.6), (2.76, 0.2, 0.35), (5.4, 0.08, 0.15)): x += sine(fr * p, n) * a * env(n, tau * d)
    return x * np.minimum(1, np.arange(n) / (0.002 * SR)) * gn

# ───────────────────────── foley: what the phone does
def haptic(depth=1.0):
    """an iPhone tap: a short low thump with a tiny click on top"""
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (70 + 40 * np.exp(-t / 0.01)) * t) * env(n, 0.028) * depth + hp(noise(n), 3500) * env(n, 0.0012) * 0.25
def tick(fr=2200, gn=1.0):
    n = int(0.05 * SR); return (sine(fr, n) * env(n, 0.01) + hp(noise(n), 4000) * env(n, 0.0015) * 0.5) * gn * 0.6
def pop(m):
    n = int(0.12 * SR); t = np.arange(n) / SR; fr = hz(m)
    return np.sin(2 * np.pi * np.cumsum(fr * (0.7 + 0.3 * (1 - np.exp(-t / 0.01)))) / SR) * env(n, 0.05)
def swish(dur=0.45, lo=500, hi=6000):
    n = int(dur * SR); p = np.linspace(0, 1, n); return bp(noise(n), lo, hi) * np.sin(np.pi * p) ** 2 * 0.5
def rise_whoosh(dur=0.9):
    n = int(dur * SR); p = np.linspace(0, 1, n)
    return lp(noise(n), 900) * np.sin(np.pi * p) ** 1.5 * 0.6 + np.sin(2 * np.pi * np.cumsum(40 + 30 * p) / SR) * np.sin(np.pi * p) * 0.4
def pen(dur):
    """a felt pen on glass: soft filtered friction with stroke-shaped swells"""
    n = int(dur * SR); t = np.arange(n) / SR
    a = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 2.6 * t)) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.1)
    return bp(noise(n), 1800, 6000) * a * 0.12
def glide(dur, m0, m1):
    n = int(dur * SR); p = np.linspace(0, 1, n); fr = hz(m0) * (hz(m1) / hz(m0)) ** (p ** 0.8)
    return lp(np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * p) ** 0.6, 3000) * 0.25
def glitter(dur, up=True):
    n = int(dur * SR); x = np.zeros(n)
    for k in range(int(dur * 60)):
        tt = rng.uniform(0, dur); i = int(tt * SR); m = int(0.12 * SR); fr = rng.choice([hz(m_) for m_ in (86, 88, 90, 93, 95, 98)])
        seg = sine(fr, m) * env(m, 0.03) * rng.uniform(0.2, 0.5) * ((tt / dur) if up else 1)
        x[i:i + m] += seg[: n - i]
    return x
def land_chord():
    n = int(3.5 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t / 0.35) + 36) / SR) * env(n, 0.45) * 0.9
    ch = np.zeros(n)
    for m in (62, 69, 74, 78, 81, 86): b = bell(m, 0.45, 1.8)[:n]; ch[: len(b)] += b * 0.45
    gl = np.zeros(n); g1 = glitter(1.0, False); gl[: len(g1)] = g1
    return reverb(sub + ch + gl * 0.6, 2.2, 0.35)

fx = Bus()
DM = [74, 76, 78, 79, 81, 83, 85, 86]  # D major, D5 up
def morph(fr, m0, m1, gn=0.3):
    """a shape changing: a soft air move plus a short tonal slide between two chord tones"""
    fx.put(swish(0.5, 300, 4000), f(fr - 4), gn); fx.put(glide(0.32, m0, m1), f(fr), gn * 0.5); fx.put(haptic(1.0), f(fr + 6), gn * 1.3)
# 0 · a line draws itself and inflates into a pill; "Ideas," rises
fx.put(glide(f(PILL - LINE), 62, 74), f(LINE), 0.35)
fx.put(swish(0.35, 2000, 9000), f(LINE), 0.12)
fx.put(pop(74), f(PILL + 2), 0.35); fx.put(haptic(0.9), f(PILL + 4), 0.4)
fx.put(swish(0.4, 600, 5000), f(PILL), 0.18)
# 1 · website: lines draw (a tick each), dots pop
morph(S[0], 74, 78)
for k, d in enumerate((10, 16, 20, 24, 27, 30, 32)): fx.put(tick(1760 + 110 * k), f(S[0] + d), 0.14, pan=-0.3 + 0.1 * k)
for k in range(3): fx.put(pop(86 + k * 2), f(S[0] + 12 + 2 * k), 0.12, pan=-0.25)
# 2 · video: play draws, the progress line starts
morph(S[1], 78, 81)
fx.put(tick(2200), f(S[1] + 12), 0.16); fx.put(tick(1650), f(S[1] + 20), 0.14)
# 3 · phone: island, cards, list, tab dots
morph(S[2], 81, 74)
for k, d in enumerate((8, 12, 16, 19, 22, 24)): fx.put(tick(1480 + 140 * k), f(S[2] + d), 0.13, pan=0.25 - 0.1 * k)
for k in range(4): fx.put(pop(81 + [0, 2, 4, 5][k]), f(S[2] + 30 + 2 * k), 0.12, pan=-0.3 + 0.2 * k)
# 4 · ring: the disc opens it, 7 day-ticks climb the scale, the 7 lands
morph(S[3], 74, 69)
fx.put(haptic(1.4), f(S[3] + 10), 0.5)
for k in range(7): fx.put(reverb(bell(DM[k], 0.35, 0.35), 0.8, 0.25), f(S[3] + 14 + k * 4), 0.12, pan=-0.3 + k * 0.1)
fx.put(haptic(1.3), f(S[3] + 20), 0.45); fx.put(reverb(bell(86, 0.6, 1.2), 1.6, 0.35), f(S[3] + 44), 0.12)
# 5 · the ring becomes the spark and lands on the i
fx.put(swish(0.6, 300, 5000), f(SPARK - 4), 0.35)
fx.put(glitter(f(LAND - SPARK)), f(SPARK), 0.45, pan=0.15)
fx.put(glide(f(LAND - SPARK), 74, 86), f(SPARK), 0.22)
fx.put(swish(0.45, 500, 4000), f(WORD), 0.2)
fx.put(land_chord(), f(LAND), 0.42)
fx.put(swish(0.35, 800, 6000), f(TAG), 0.12); fx.put(tick(1320), f(TAG + 4), 0.1)
fx.put(glide(0.6, 81, 86), f(URL + 4), 0.12); fx.put(tick(1760), f(URL + 2), 0.08)

# ───────────────────────── music: pad from the start, the groove on the first offer, the pad again when the island closes
CHORDS = [([50, 54, 57, 61, 64], 38), ([47, 50, 54, 57, 61], 35), ([43, 47, 50, 54, 57], 31), ([45, 49, 52, 57, 59], 33)]
G0, G1 = f(S[0]), f(SPARK)
padb, keysb, bassb, drums = Bus(), Bus(), Bus(), Bus()
t, bar = G0 - BAR, -1  # one bar of pad before the downbeat
while t < DUR:
    ch, root = CHORDS[bar % 4]
    padb.put(pad(ch, BAR + 0.4), max(0, t), 0.5)
    if G0 <= t < G1:
        for s in (2, 6, 11, 14): keysb.put(keys([m + 12 * (s == 11) for m in ch[1:4]], 0.9), t + s * STEP, 0.4, pan=0.15 if s % 2 else -0.15)
        for s in (0, 3, 6, 10, 14): bassb.put(bass(root, STEP * 1.6), t + s * STEP, 0.35)
        for s in range(16):
            dt = t + s * STEP
            if s % 4 == 0: drums.put(kick(), dt, 0.5)
            if s in (4, 12): drums.put(clap(), dt, 0.25)
            drums.put(shaker(), dt + (STEP * 0.12 if s % 2 else 0), 0.18 if s % 2 else 0.1, pan=-0.35)
    t += BAR; bar += 1
tt = np.arange(N) / SR
gate = np.clip((tt - G0 + 0.02) / 0.03, 0, 1) * np.clip((G1 + 0.25 - tt) / 0.4, 0, 1)
groove = (drums.st() * 0.9 + bassb.st() * 0.8 + keysb.st() * 0.7) * gate[:, None]
# a filtered build into the downbeat: the pad opens up as the phone settles
pd = padb.st() * (0.6 + 0.4 * np.clip((tt - G0) / 0.4, 0, 1))[:, None]
fin = Bus(); fin.put(pad(CHORDS[0][0] + [69], DUR - f(LAND) + 0.6), f(LAND) - 0.2, 0.6)
mus = groove + pd * (1 - 0.6 * np.clip((tt - f(LAND)) / 0.3, 0, 1))[:, None] + fin.st()

def master(x, rms_db):
    x = np.stack([hp(x[:, 0], 35), hp(x[:, 1], 35)], 1)
    x = np.tanh(x * 0.9); x *= 10 ** (rms_db / 20) / np.sqrt((x ** 2).mean())
    pk = np.abs(x).max(); x *= min(1, 10 ** (-2.0 / 20) / pk)
    fi = int(0.02 * SR); x[:fi] *= np.linspace(0, 1, fi)[:, None]
    fd = int(1.0 * SR); x[-fd:] *= (np.linspace(1, 0, fd) ** 1.5)[:, None]; return x
full = master(mus * 0.55 + fx.st() * 0.85, -16)
nomusic = master(fx.st() * 0.85, -18)
for name, x in (("public/sound.wav", full), ("public/sound-nomusic.wav", nomusic)):
    wavfile.write(name, SR, (x * 32767).astype(np.int16)); print(name, f"{len(x)/SR:.2f}s rms {20*np.log10(np.sqrt((x**2).mean())):.1f} dB peak {20*np.log10(np.abs(x).max()):.1f} dB")
