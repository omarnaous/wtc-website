"""Light soundtrack for the WTC launch film: a soft deep-house groove at 120 BPM under watch foley
(quartz tick, crown clack, bezel ratchet, velcro, keys, a bell). No sub drops, no risers.

    python3 scripts/score.py public/sound.wav

Frames are 30 fps and match src/timing.js (scene starts: open 0, planets 60, orbit 150, strap 270,
wall 390, site 480, logo 630; 750 frames).
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 25.0
N = int(DUR * SR)
FPS = 30
BPM = 120
BEAT = 60 / BPM
STEP = BEAT / 4
BAR = BEAT * 4
rng = np.random.default_rng(5)


def f(frame): return frame / FPS
def sos(kind, fc, o=2): return butter(o, fc, kind, fs=SR, output="sos")
def lp(x, fc, o=2): return sosfilt(sos("lowpass", fc, o), x)
def hp(x, fc, o=2): return sosfilt(sos("highpass", fc, o), x)
def bp(x, lo, hi, o=2): return sosfilt(sos("bandpass", [lo, hi], o), x)
def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def noise(n): return rng.standard_normal(n)
def sine(fr, n, ph=0.0): return np.sin(2 * np.pi * fr * np.arange(n) / SR + ph)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


class Bus:
    def __init__(self): self.L = np.zeros(N + SR * 4); self.R = np.zeros(N + SR * 4)
    def put(self, sig, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i < 0: sig, i = sig[-i:], 0
        n = min(len(sig), len(self.L) - i)
        if n <= 0: return
        self.L[i:i + n] += sig[:n] * g * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.R[i:i + n] += sig[:n] * g * np.sin((pan + 1) * np.pi / 4) * 1.414
    def st(self): return np.stack([self.L[:N], self.R[:N]], 1)


def reverb(x, secs=1.6, wet=0.25):
    n = int(secs * SR)
    ir = noise(n) * env(n, secs / 5)
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    y = np.convolve(x, ir)[: len(x) + n]
    out = np.zeros(len(y)); out[: len(x)] += x * (1 - wet)
    return out + y * wet


# ───────────────────────── instruments (soft)
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    fr = 48 + 70 * np.exp(-t / 0.025)
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.11)
    return np.tanh(body * 1.3) * 0.9 + hp(noise(n), 2500) * env(n, 0.002) * 0.15

def clap():
    n = int(0.25 * SR); x = np.zeros(n)
    for d in (0, 0.009, 0.019):
        i = int(d * SR); m = n - i; x[i:] += bp(noise(m), 900, 5000) * env(m, 0.012)
    i = int(0.019 * SR); x[i:] += bp(noise(n - i), 900, 4000) * env(n - i, 0.06) * 0.5
    return x * 0.6

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return hp(noise(n), 8000) * env(n, 0.045 if open_ else 0.012) * 0.5

def shaker():
    n = int(0.06 * SR); a = np.minimum(1, np.arange(n) / (0.012 * SR))
    return bp(noise(n), 5000, 11000) * a * env(n, 0.018) * 0.35

def keys(notes, dur):
    """Electric piano: sine + soft bell partial, slow tremolo, warm."""
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, m in enumerate(notes):
        fr = hz(m)
        x += (np.sin(2 * np.pi * fr * t) + 0.18 * np.sin(2 * np.pi * fr * 2 * t) * env(n, 0.25)
              + 0.06 * np.sin(2 * np.pi * fr * 3.01 * t) * env(n, 0.08)) * (0.9 - k * 0.07)
    x *= np.minimum(1, t / 0.008) * env(n, 1.1) * (1 + 0.12 * np.sin(2 * np.pi * 4.2 * t))
    return lp(x, 2600) / len(notes)

def pad(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, m in enumerate(notes):
        for det in (-0.12, 0.12):
            x += np.sin(2 * np.pi * hz(m + det) * t + k)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.5)
    return lp(x * a, 1400) / (2 * len(notes))

def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return np.tanh(x * 1.2 * np.minimum(1, t / 0.006) * env(n, 0.22)) * 0.8

# ───────────────────────── watch foley
def tick(fr=4200, g=1.0):
    """A quartz second hand: a dry, tiny mechanical tick."""
    n = int(0.06 * SR)
    x = hp(noise(n), 3000) * env(n, 0.0015) * 0.8 + sine(fr, n) * env(n, 0.006) * 0.6 + sine(fr * 0.53, n) * env(n, 0.01) * 0.3
    return x * g

def ratchet(dur, rate0=18, rate1=30):
    """Bezel / crown ratchet: a run of fine clicks."""
    n = int(dur * SR); x = np.zeros(n + SR); t = 0.0
    while t < dur:
        r = rate0 + (rate1 - rate0) * (t / dur)
        c = tick(rng.uniform(5200, 6400), rng.uniform(0.35, 0.6)); i = int(t * SR); x[i:i + len(c)] += c
        t += 1 / r
    return x[:n + int(0.06 * SR)]

def clack():
    """Crown pushed home / chronograph pusher: two clicks and a small case body."""
    n = int(0.25 * SR); x = np.zeros(n)
    for d, fr in ((0, 2300), (0.022, 3100)):
        i = int(d * SR); m = n - i
        x[i:] += hp(noise(m), 1500) * env(m, 0.0025) + sine(fr, m) * env(m, 0.012) * 0.5
    x += sine(160, n) * env(n, 0.03) * 0.35
    return x * 0.8

def velcro(dur=0.28):
    n = int(dur * SR); t = np.arange(n) / SR
    grains = (rng.random(n) < 260 / SR).astype(float)
    grains = np.convolve(grains, np.exp(-np.arange(int(0.003 * SR)) / (0.0008 * SR)))[:n]
    body = bp(noise(n), 1200, 7000) * (0.25 + grains * 2.2)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7
    return body * shape * 0.5

def key_click():
    n = int(0.05 * SR)
    return (hp(noise(n), 2500) * env(n, 0.003) + sine(rng.uniform(1100, 1700), n) * env(n, 0.005) * 0.4) * rng.uniform(0.5, 0.9)

def mouse():
    n = int(0.08 * SR); x = np.zeros(n)
    for d in (0, 0.045):
        i = int(d * SR); m = n - i; x[i:] += hp(noise(m), 2000) * env(m, 0.002) + sine(2400, m) * env(m, 0.004) * 0.4
    return x * 0.7

def bell(m, g=1.0, tau=1.4):
    n = int(3.0 * SR); fr = hz(m); x = np.zeros(n)
    for p, a, d in ((1, 1, 1), (2.0, 0.35, 0.6), (2.76, 0.2, 0.35), (5.4, 0.08, 0.15)):
        x += np.sin(2 * np.pi * fr * p * np.arange(n) / SR) * a * env(n, tau * d)
    return x * np.minimum(1, np.arange(n) / (0.002 * SR)) * g

def ping(fr=2600):
    """Light 'added to bag' coin ping."""
    n = int(1.0 * SR)
    return (sine(fr, n) + 0.45 * sine(fr * 1.5, n)) * env(n, 0.22) * np.minimum(1, np.arange(n) / 30)

def air(dur, g=1.0):
    """A soft, airy swish (not a whoosh-boom)."""
    n = int(dur * SR); t = np.linspace(0, 1, n)
    return bp(noise(n), 2500, 9000) * np.sin(np.pi * t) ** 3 * 0.35 * g


# ───────────────────────── arrangement
music, fol = Bus(), Bus()
CHORDS = [  # Am9, Fmaj9, Cmaj9, G6/9 (voicings around middle C)
    ([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 52, 55, 59, 62], 36), ([55, 59, 62, 64, 69], 43),
]
BASS_STEPS = [0, 3, 6, 10, 14]
G0 = f(24)          # groove enters (filtered) when the Moon lands
G_OPEN = f(60)      # filter fully open on the planets
BREAK0, BREAK1 = f(616), f(636)  # drop to just the tick before the logo
END = f(744)

drums, keysb, bassb, padb = Bus(), Bus(), Bus(), Bus()
bar = 0
t = G0
while t < END - 1e-6:
    ch, root = CHORDS[bar % 4]
    padb.put(pad(ch, BAR + 0.4), t, 0.55)
    for s in (2, 6, 11, 14):  # syncopated key stabs
        st = t + s * STEP
        if st < END: keysb.put(keys([m + 12 * (s == 11) for m in ch[1:4]], 0.9), st, 0.5, pan=0.15 if s % 2 else -0.15)
    for s in BASS_STEPS:
        bt = t + s * STEP
        if bt < END: bassb.put(bass(root - 12 + (12 if s == 10 else 0), STEP * 1.6), bt, 0.42)
    for s in range(16):
        dt = t + s * STEP
        if dt >= END: break
        if s % 4 == 0: drums.put(kick(), dt, 0.6)
        if s in (4, 12): drums.put(clap(), dt, 0.32, pan=0.05)
        if s % 4 == 2: drums.put(hat(True), dt, 0.28, pan=0.3)
        sw = STEP * 0.12 if s % 2 else 0
        drums.put(shaker(), dt + sw, 0.22 if s % 2 else 0.12, pan=-0.35)
    t += BAR; bar += 1

def automate(x, pts):
    """Piecewise-linear gain curve over seconds."""
    tt = np.arange(len(x)) / SR
    return x * np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])[:, None]

dr, ky, bs, pd = drums.st(), keysb.st(), bassb.st(), padb.st()
# The intro (and the site build-up) plays through a low-pass, like hearing it from the next room.
def filt_mix(x, pts):
    dark = np.stack([lp(x[:, 0], 700), lp(x[:, 1], 700)], 1)
    tt = np.arange(len(x)) / SR
    k = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])[:, None]
    return x * k + dark * (1 - k)
FILT = [(0, 0), (G0, 0), (G_OPEN - 0.2, 0.15), (G_OPEN, 1), (f(480), 1), (f(484), 0.1), (f(520), 0.1), (f(524), 1), (99, 1)]
groove = filt_mix(dr * 0.9 + bs * 0.9, FILT) + filt_mix(ky * 0.8 + pd * 0.9, [(p[0], 0.5 + 0.5 * p[1]) for p in FILT])
groove = automate(groove, [(0, 1), (BREAK0 - 0.05, 1), (BREAK0 + 0.25, 0.0), (BREAK1 - 0.02, 0.0), (BREAK1, 1), (99, 1)])

# ── foley, locked to the picture
# 1. open: the hand sweeps; the ticks speed up into the landing
for fr in range(0, 22, 2): fol.put(tick(4200 + fr * 30, 0.5 + fr / 44), f(fr), 0.5, pan=-0.4 + fr / 30)
fol.put(clack(), f(24), 0.9)
fol.put(reverb(bell(81, 0.5, 1.0), 1.4, 0.35), f(24), 0.22)
fol.put(air(0.5), f(32), 0.5, pan=-0.4)
fol.put(air(0.4), f(52), 0.6)
# quartz tick under the opening, on the second
for s in (0, 30): fol.put(tick(3600, 0.8), f(s + 2), 0.25, pan=0.2)
# 2. planets: a light swish per watch
for i in range(6): fol.put(air(0.28, 0.9), f(57 + 15 * i), 0.5, pan=0.35 if i % 2 == 0 else -0.35)
# 3. orbit: wipe tick, bezel ratchet as the count runs, a bell when it lands
fol.put(clack(), f(150), 0.45)
fol.put(ratchet(f(195) - f(160), 14, 34), f(160), 0.45, pan=0.15)
fol.put(reverb(bell(76, 0.6), 1.6, 0.35), f(195), 0.3)
fol.put(air(0.6), f(207), 0.35, pan=-0.3)
# 4. strap studio: velcro on every swap, a clasp click when it lands
sw = [0, 18, 32, 44, 54, 62, 69, 75, 80]
for i, s in enumerate(sw[1:]):
    d = max(0.12, 0.3 - i * 0.025)
    fol.put(velcro(d), f(270 + s) - 0.04, 0.7, pan=0.25)
fol.put(clack(), f(350), 0.7)
fol.put(reverb(bell(83, 0.5, 0.9), 1.4, 0.35), f(352), 0.18)
# 5. wall: cards land as tiny ticks, the light sweep is a soft swish
fol.put(clack(), f(390), 0.4)
for i in range(12): fol.put(tick(rng.uniform(4000, 5600), 0.6), f(391 + i * 2), 0.25, pan=-0.5 + i / 11)
fol.put(air(1.2, 1.2), f(416), 0.6)
fol.put(air(0.8, 1.0), f(466), 0.6)
# 6. site: lid, typing, enter, scroll, add to bag
S = 480
fol.put(clack(), f(S + 2), 0.45)
t = f(S + 12)
while t < f(S + 32): fol.put(key_click(), t, 0.5, pan=rng.uniform(-0.2, 0.2)); t += rng.uniform(0.055, 0.1)
fol.put(key_click() * 1.4, f(S + 33), 0.6)
fol.put(air(0.4), f(S + 36), 0.35, pan=0.3)
fol.put(air(1.0, 0.8), f(S + 54), 0.35)
fol.put(mouse(), f(S + 104), 0.7, pan=0.2)
fol.put(ping(2637), f(S + 106), 0.18, pan=0.25)
fol.put(ping(3951), f(S + 109), 0.1, pan=0.25)
# 7. break: only the second hand, then the mark lands on the downbeat
for s in (BREAK0 + 0.1, BREAK0 + 0.6):
    fol.put(tick(3600, 1.0), s, 0.45)
fol.put(clack(), f(636), 1.0)
for i, m in enumerate((69, 76, 81)): fol.put(reverb(bell(m, 0.5, 1.6), 2.2, 0.4), f(636) + i * 0.09, 0.2, pan=(-0.3, 0, 0.3)[i])
for i in range(7): fol.put(tick(4600 + i * 150, 0.6), f(637 + i * 2), 0.22, pan=-0.6 + i * 0.2)
fol.put(air(0.6), f(652), 0.35)
fol.put(reverb(bell(88, 0.4, 0.8), 1.4, 0.4), f(700), 0.12)  # the button appears

# ── mix
mix = groove * 0.62 + fol.st() * 0.9
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(0.9 * SR); mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]
mix = np.tanh(mix * 0.9)
rms = np.sqrt((mix ** 2).mean())
mix *= 10 ** (-17 / 20) / rms            # around -17 dB RMS: light, not slammed
peak = np.abs(mix).max()
if peak > 10 ** (-1 / 20): mix *= 10 ** (-1 / 20) / peak
out = sys.argv[1] if len(sys.argv) > 1 else "public/sound.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f"wrote {out}: rms {20*np.log10(np.sqrt((mix**2).mean())):.1f} dB, peak {20*np.log10(np.abs(mix).max()):.1f} dB")
