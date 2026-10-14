"""Freez Mix film soundtrack: a soft deep-house groove at 120 BPM (the instruments from the WTC launch film's score)
under drink foley: a crown cap pried off (clicks, hiss, the cap tinkling on the counter), a glugging pour, carbonation
fizz, a liquid swish on every pour-wipe, glass bottles clinking, bubble bloops in key, ice knocking on the studio swaps.
Frames are 30 fps and match src/timing.js.   python3 sound/score.py public/sound.wav   (add --nomusic for foley only)
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 22.0
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


def bell(m, g=1.0, tau=1.4):
    n = int(3.0 * SR); fr = hz(m); x = np.zeros(n)
    for p, a, d in ((1, 1, 1), (2.0, 0.35, 0.6), (2.76, 0.2, 0.35), (5.4, 0.08, 0.15)):
        x += np.sin(2 * np.pi * fr * p * np.arange(n) / SR) * a * env(n, tau * d)
    return x * np.minimum(1, np.arange(n) / (0.002 * SR)) * g


# ───────────────────────── drink foley
def click_metal(fr=3400):
    n = int(0.03 * SR)
    return hp(noise(n), 2500) * env(n, 0.0018) * 0.9 + sine(fr, n) * env(n, 0.006) * 0.4

def cap_pop():
    """A crown cap pried off: two metal clicks, then the hiss of the gas and a soft low 'pff'."""
    n = int(0.6 * SR); x = np.zeros(n); t = np.arange(n) / SR
    for d, fr in ((0, 3300), (0.014, 4100)):
        i = int(d * SR); c = click_metal(fr); x[i:i + len(c)] += c
    i = int(0.02 * SR); m = n - i; tt = t[:m]
    hiss = bp(noise(m), 2600, 11000) * np.minimum(1, tt / 0.004) * np.exp(-tt / 0.2)
    pff = bp(noise(m), 250, 1200) * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.05)
    x[i:] += hiss * 0.85 + pff * 0.6
    return x

def cap_ting(fr=3100, a=1.0):
    """The metal cap landing on the counter: a bright ting with inharmonic partials."""
    n = int(0.7 * SR); x = np.zeros(n)
    for p, w, d in ((1, 1, 0.16), (2.32, 0.5, 0.09), (3.9, 0.3, 0.05), (5.4, 0.18, 0.03)):
        x += sine(fr * p, n, rng.uniform(0, 6)) * w * env(n, d)
    return (x + hp(noise(n), 4000) * env(n, 0.002) * 0.6) * a * 0.5

def cap_bounce():
    n = int(1.1 * SR); x = np.zeros(n); t, gap, a = 0.0, 0.17, 1.0
    for k in range(6):
        c = cap_ting(3100 * rng.uniform(0.98, 1.02), a); i = int(t * SR); m = min(len(c), n - i); x[i:i + m] += c[:m]
        t += gap; gap *= 0.6; a *= 0.6
    return x

def fizz(dur, rate=700, g=1.0):
    """Carbonation: a crackle of tiny bubble pops over a faint hiss."""
    n = int(dur * SR); x = np.zeros(n)
    for i in rng.integers(0, max(1, n - 200), int(rate * dur)):
        m = int(rng.uniform(0.0004, 0.0018) * SR); x[i:i + m] += noise(m) * np.exp(-np.arange(m) / (m / 3)) * min(2.5, rng.pareto(2.5) + 0.2)
    x = hp(x, 3500) + hp(noise(n), 7000) * 0.04
    return x * g * 0.5

def bloop(fr=600, g=1.0):
    """A bubble rising and popping: a sine whose pitch jumps up as it bursts."""
    n = int(0.09 * SR); t = np.arange(n) / SR
    f_ = fr * (1 + 1.3 * (1 - np.exp(-t / 0.014)))
    return np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.minimum(1, t / 0.002) * np.exp(-t / 0.03) * g

def glug(dur):
    """A pour into a glass: the liquid stream plus glugs that rise in pitch as it fills."""
    n = int(dur * SR); p = np.linspace(0, 1, n)
    stream = bp(noise(n), 500, 2600) * (0.55 + 0.45 * np.sin(2 * np.pi * 11 * p * dur)) * 0.5
    x = stream * np.minimum(1, p / 0.05) * np.minimum(1, (1 - p) / 0.15)
    t = 0.04
    while t < dur - 0.1:
        k = t / dur; b = bloop(170 + 380 * k, 0.9); i = int(t * SR); x[i:i + len(b)] += b[: n - i]
        t += rng.uniform(0.09, 0.17)
    return x

def splash(dur=0.3, fc=2200, g=1.0):
    """A liquid swish for a pour-wipe: band-passed noise sweeping up, then a few droplets."""
    n = int(dur * SR); p = np.linspace(0, 1, n); x = np.zeros(n + int(0.2 * SR))
    lo = bp(noise(n), 400, 1400) * np.sin(np.pi * p) ** 1.5
    hi = bp(noise(n), fc, min(14000, fc * 3.5)) * np.sin(np.pi * np.clip(p * 1.2 - 0.1, 0, 1)) ** 2
    x[:n] += (lo * 0.6 + hi * 0.5)
    for k in range(3):
        b = bloop(rng.uniform(700, 1300), 0.35); i = int((dur * 0.6 + k * 0.05) * SR); x[i:i + len(b)] += b
    return x * g

def glass_clink(pitch=1.0, g=1.0):
    """Two glass bottles touching: a bright, slightly inharmonic 'tink'."""
    n = int(1.2 * SR); x = np.zeros(n)
    for fr, w, d in ((2650, 1, 0.32), (4180, 0.6, 0.2), (6020, 0.4, 0.11), (8300, 0.2, 0.05), (1720, 0.25, 0.4)):
        x += sine(fr * pitch, n, rng.uniform(0, 6)) * w * env(n, d)
    x = x * np.minimum(1, np.arange(n) / (0.0006 * SR)) + hp(noise(n), 5000) * env(n, 0.0015) * 0.8
    return reverb(x * 0.45, 1.2, 0.25) * g

def ice(dur=0.18):
    """Ice cubes knocking in a glass: a handful of short glassy clicks."""
    n = int((dur + 0.1) * SR); x = np.zeros(n)
    for k in range(int(rng.integers(4, 8))):
        i = int(rng.uniform(0, dur) * SR); m = int(0.035 * SR); fr = rng.uniform(3200, 6200)
        x[i:i + m] += (sine(fr, m) * env(m, 0.008) + hp(noise(m), 3000) * env(m, 0.0015)) * rng.uniform(0.4, 1)
    return x * 0.5

def set_down():
    """A glass bottle set down on a table: a low 'tok' and a small tink."""
    n = int(0.3 * SR)
    return sine(rng.uniform(170, 220), n) * env(n, 0.025) * 0.8 + bp(noise(n), 200, 900) * env(n, 0.01) * 0.6 + sine(rng.uniform(3000, 4200), n) * env(n, 0.03) * 0.2

def air(dur, g=1.0):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    return bp(noise(n), 2500, 9000) * np.sin(np.pi * t) ** 3 * 0.35 * g


# ───────────────────────── arrangement
import re, json
TJ = open("src/timing.js").read()
num = lambda k: int(re.search(rf"\b{k}: (\d+)", TJ).group(1))
FLAVOR_AT = [int(v) for v in re.search(r"FLAVOR_AT = \[([^\]]+)\]", TJ).group(1).split(",")]
SWAPS = [int(v) for v in re.search(r"swaps: \[([^\]]+)\]", TJ).group(1).split(",")]
S_ = {k: num(k) for k in ["open", "flavors", "orbit", "studio", "wall", "logo"]}
CAP, POUR0, W1, W2, BRK, HIT, CLINK = num("cap"), num("pour0"), num("w1"), num("w2"), num("brk"), num("hit"), num("clink")
COUNT0, COUNT1 = num("count0"), num("count1")
NOMUSIC = "--nomusic" in sys.argv
PENT = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]   # A minor pentatonic, in key with the groove

music, fol = Bus(), Bus()
CHORDS = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 52, 55, 59, 62], 36), ([55, 59, 62, 64, 69], 43)]
BASS_STEPS = [0, 3, 6, 10, 14]
G0, G_OPEN = f(CAP), f(S_["flavors"])
BREAK0, BREAK1 = f(BRK), f(HIT)
END = DUR - 0.2
drums, keysb, bassb, padb = Bus(), Bus(), Bus(), Bus()
bar, t = 0, G0
while t < END - 1e-6:
    ch, root = CHORDS[bar % 4]
    padb.put(pad(ch, BAR + 0.4), t, 0.55)
    for s in (2, 6, 11, 14):
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
        drums.put(shaker(), dt + (STEP * 0.12 if s % 2 else 0), 0.22 if s % 2 else 0.12, pan=-0.35)
    t += BAR; bar += 1

def automate(x, pts):
    tt = np.arange(len(x)) / SR
    return x * np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])[:, None]
def filt_mix(x, pts):
    dark = np.stack([lp(x[:, 0], 700), lp(x[:, 1], 700)], 1)
    tt = np.arange(len(x)) / SR
    k = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])[:, None]
    return x * k + dark * (1 - k)
FILT = [(0, 0), (G0, 0), (G_OPEN - 0.25, 0.15), (G_OPEN, 1), (99, 1)]
dr, ky, bs, pd = drums.st(), keysb.st(), bassb.st(), padb.st()
groove = filt_mix(dr * 0.9 + bs * 0.9, FILT) + filt_mix(ky * 0.8 + pd * 0.9, [(p[0], 0.5 + 0.5 * p[1]) for p in FILT])
groove = automate(groove, [(0, 1), (BREAK0 - 0.05, 1), (BREAK0 + 0.2, 0.0), (BREAK1 - 0.02, 0.0), (BREAK1, 1), (99, 1)])

# ── foley, locked to the picture
fol.put(fizz(DUR, 260, 0.5), 0, 0.35)                                   # carbonation under everything
fol.put(fizz(f(CAP), 900, 0.8), 0, 0.5, pan=-0.2)                        # the quiet second before the cap
for fr_, p_ in ((8, 74), (17, 79), (24, 76)): fol.put(bloop(hz(p_) / 2, 0.5), f(fr_), 0.25, pan=0.3)
# 1. open: the cap, the tinkling cap, the pour, words
fol.put(cap_pop(), f(CAP) - 0.03, 1.0)
fol.put(cap_bounce(), f(CAP + 7), 0.5, pan=0.45)
fol.put(glug(1.45), f(POUR0 + 1), 0.75, pan=-0.1)
fol.put(fizz(2.0, 1800, 1.0), f(POUR0 + 4), 0.6, pan=0.15)
for i, fr_ in enumerate((W1, W1 + 4, W2, W2 + 4)): fol.put(bloop(hz(PENT[3 + i]) / 2, 0.6), f(fr_ + 3), 0.3, pan=-0.3 + i * 0.2)
fol.put(air(0.4), f(82), 0.5)
# 2. flavours: a liquid swish into each one, a glass clink when the pair meets
for k, at in enumerate(FLAVOR_AT):
    a = S_["flavors"] + at
    fol.put(splash(0.32 if k < 2 else 0.24, 1700 + (k * 470) % 2600), f(a) - 0.06, 0.75 if k < 2 else 0.6, pan=0.3 if k % 2 else -0.3)
    if k < 2:
        for j in range(5): fol.put(bloop(hz(PENT[j + k]) / 2, 0.6), f(a + 2 + j * 1.5), 0.22, pan=rng.uniform(-0.5, 0.5))
    else:
        fol.put(glass_clink(0.92 + (k % 5) * 0.045), f(a + 5), 0.42, pan=0.12 if k % 2 else -0.12)
# 3. orbit: a swish in, a bubble per number as the counter runs, a clink + bell when it lands on 13
O = S_["orbit"]
fol.put(splash(0.4, 2000), f(O) - 0.08, 0.7)
last = 0
for fr_ in range(COUNT0, COUNT1 + 1):
    x = min(1, max(0, (fr_ - COUNT0) / (COUNT1 - COUNT0))); c = round(13 * (1 - (1 - x) ** 3))
    if c > last:
        fol.put(bloop(hz(PENT[c - 1]) / 2, 0.8), f(O + fr_), 0.28, pan=-0.5 + c / 13); last = c
fol.put(glass_clink(1.05), f(O + COUNT1), 0.5)
fol.put(reverb(bell(81, 0.5, 1.2), 1.6, 0.35), f(O + COUNT1), 0.16)
fol.put(air(0.5), f(O + 74), 0.45)
# 4. studio: the husband & wife clink, then ice knocks on every flavour swap
St = S_["studio"]
fol.put(splash(0.4, 1500), f(St) - 0.08, 0.65)
fol.put(glass_clink(1.0), f(St + CLINK), 0.7)
fol.put(reverb(bell(88, 0.4, 0.9), 1.4, 0.35), f(St + CLINK + 1), 0.12)
for i, s in enumerate(SWAPS[1:]):
    fol.put(ice(max(0.08, 0.18 - i * 0.015)), f(St + 14 + s) - 0.02, 0.6, pan=0.25)
    fol.put(splash(0.16, 3000), f(St + 14 + s) - 0.05, 0.35, pan=0.2)
# 5. wall: bottles set down outward from the centre, a light sweep, the dive
Wl = S_["wall"]
fol.put(splash(0.4, 2400), f(Wl) - 0.08, 0.6)
times = sorted(set(round(np.hypot(r - 0.5, c - 6) * 1.6) for r in range(2) for c in range(13)))
for i, d in enumerate(times[:12]): fol.put(set_down(), f(Wl + d + 3), 0.35, pan=-0.6 + i / 10)
fol.put(air(1.3, 1.1), f(Wl + 24), 0.5)
fol.put(air(0.6, 1.2), f(Wl + 66), 0.6)
# 6. break: only the fizz, one drip, then the logo pours in and lands on the downbeat
fol.put(fizz(f(HIT) - f(BRK), 1400, 1.0), f(BRK), 0.6)
fol.put(bloop(hz(76) / 2, 0.8), f(BRK + 8), 0.3)
fol.put(splash(0.3, 1800, 1.2), f(S_["logo"]), 0.8)
for i, p_ in enumerate((1.0, 1.12, 1.26)): fol.put(glass_clink(p_), f(HIT) + i * 0.07, 0.45, pan=(-0.3, 0, 0.3)[i])
for i, m in enumerate((69, 76, 81)): fol.put(reverb(bell(m, 0.5, 1.6), 2.2, 0.4), f(HIT) + i * 0.09, 0.16, pan=(-0.3, 0, 0.3)[i])
for j in range(8): fol.put(bloop(hz(PENT[j + 2]) / 2, 0.6), f(HIT + 2 + j * 1.2), 0.2, pan=rng.uniform(-0.6, 0.6))
for i, fr_ in enumerate((S_["logo"] + 18, S_["logo"] + 24)): fol.put(bloop(hz(PENT[5 + i]) / 2, 0.6), f(fr_ + 3), 0.25)
fol.put(reverb(bell(88, 0.4, 0.8), 1.4, 0.4), f(S_["logo"] + 40), 0.1)

# ── mix
mix = (0 if NOMUSIC else groove * 0.6) + fol.st() * 0.95
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(0.9 * SR); mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]
mix = np.tanh(mix * 0.9)
mix *= 10 ** ((-19 if NOMUSIC else -17) / 20) / np.sqrt((mix ** 2).mean())
peak = np.abs(mix).max()
if peak > 10 ** (-1 / 20): mix *= 10 ** (-1 / 20) / peak
out = [a for a in sys.argv[1:] if not a.startswith("--")]
out = out[0] if out else "public/sound.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f"wrote {out}: rms {20*np.log10(np.sqrt((mix**2).mean())):.1f} dB, peak {20*np.log10(np.abs(mix).max()):.1f} dB")
