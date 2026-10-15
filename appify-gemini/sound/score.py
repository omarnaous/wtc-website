"""Gemini 3.5 spec commercial soundtrack. A soft deep-house bed (the WTC launch film's instruments) that ducks under the
voice-over, and a sound for everything the spark does: typing the job, the send, the charge, the burst, check ticks,
code typing + a success chime, a camera shutter + scan, snaps as the site builds, crickets and notification pings at night.
Frames follow src/vo.json (the voice) and src/timing.js.     python3 sound/score.py   ->  public/sound.wav, public/sound-nomusic.wav
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


def bell(m, g=1.0, tau=1.4):
    n = int(3.0 * SR); fr = hz(m); x = np.zeros(n)
    for p, a, d in ((1, 1, 1), (2.0, 0.35, 0.6), (2.76, 0.2, 0.35), (5.4, 0.08, 0.15)):
        x += np.sin(2 * np.pi * fr * p * np.arange(n) / SR) * a * env(n, tau * d)
    return x * np.minimum(1, np.arange(n) / (0.002 * SR)) * g


# ───────────────────────── timing from the voice + the picture
import json, re, subprocess
VO = json.load(open("src/vo.json"))
TJ = open("src/timing.js").read()
DUR = VO["total"] / FPS
N = int(DUR * SR)
at = lambda k: VO[k]["at"]
Sx = dict(ask=0, hand=at("hand") - 6, send=at("hand") + 58, name=at("name"), plans=at("plans") - 6, codes=at("codes") - 6,
          sees=at("sees") - 6, builds=at("builds") - 6, sleep=at("sleep") - 6, end=at("end") - 4)
PROMPT_LEN = len(re.search(r'PROMPT = "([^"]+)"', TJ).group(1))

class Bus2:
    def __init__(self): self.L = np.zeros(N + SR * 4); self.R = np.zeros(N + SR * 4)
    def put(self, sig, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i < 0: sig, i = sig[-i:], 0
        n = min(len(sig), len(self.L) - i)
        if n <= 0: return
        self.L[i:i + n] += sig[:n] * g * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.R[i:i + n] += sig[:n] * g * np.sin((pan + 1) * np.pi / 4) * 1.414
    def st(self): return np.stack([self.L[:N], self.R[:N]], 1)

def load(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)

# ───────────────────────── foley for what the spark does
def tick2(fr=2400, g=1.0):
    n = int(0.05 * SR); return (sine(fr, n) * env(n, 0.01) + hp(noise(n), 4000) * env(n, 0.0015) * 0.6) * g * 0.6
def pop(fr=700):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(fr * (1 + 1.2 * (1 - np.exp(-t / 0.012)))) / SR) * np.exp(-t / 0.03)
def swish(dur=0.45, lo=600, hi=7000):
    n = int(dur * SR); p = np.linspace(0, 1, n)
    return bp(noise(n), lo, hi) * np.sin(np.pi * p) ** 2 * 0.5
def riser(dur):
    n = int(dur * SR); p = np.linspace(0, 1, n)
    x = bp(noise(n), 800, 9000) * p ** 2.5 * 0.4 + sine(0, n) * 0
    x += np.sin(2 * np.pi * np.cumsum(220 * 2 ** (p * 2)) / SR) * p ** 2 * 0.15
    return x
def shimmer(dur=3.0):
    """the burst: a soft sub, a bright glassy chord and glitter"""
    n = int(dur * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t / 0.4) + 38) / SR) * np.exp(-t / 0.5) * 0.9
    ch = np.zeros(n)
    for m in (69, 76, 81, 85, 88): b = bell(m, 0.5, 1.6)[:n]; ch[:len(b)] += b * 0.5
    gl = np.zeros(n)
    for k in range(40):
        i = int(rng.uniform(0, 1.2) * SR); m = int(0.15 * SR); fr = rng.uniform(3000, 8000)
        gl[i:i + m] += sine(fr, m) * env(m, 0.04) * rng.uniform(0.1, 0.4)
    return reverb(sub + ch + gl, 2.0, 0.35)
def shutter():
    """a camera shutter: two mechanical clicks with a small whir between"""
    n = int(0.25 * SR); x = np.zeros(n)
    for d in (0, 0.07):
        i = int(d * SR); m = n - i; x[i:] += hp(noise(m), 1500) * env(m, 0.003) + sine(1800, m) * env(m, 0.006) * 0.3
    x += bp(noise(n), 2000, 6000) * env(n, 0.05) * 0.15
    return x * 0.9
def scan(dur):
    n = int(dur * SR); p = np.linspace(0, 1, n)
    return np.sin(2 * np.pi * np.cumsum(500 + 1500 * p) / SR) * np.sin(np.pi * p) * 0.12 + bp(noise(n), 3000, 8000) * np.sin(np.pi * p) * 0.06
def crickets(dur):
    """a night outside: soft chirp trains from a few crickets, panned"""
    n = int(dur * SR); x = np.zeros((n, 2))
    for c, (fr, pan, per) in enumerate(((4300, -0.6, 0.9), (4700, 0.5, 1.15), (3900, 0.1, 1.4))):
        t = rng.uniform(0, per)
        while t < dur - 0.2:
            for j in range(3):
                m = int(0.03 * SR); i = int((t + j * 0.045) * SR)
                if i + m >= n: break
                s = sine(fr, m) * np.sin(np.pi * np.arange(m) / m) * 0.12
                x[i:i + m, 0] += s * np.cos((pan + 1) * np.pi / 4); x[i:i + m, 1] += s * np.sin((pan + 1) * np.pi / 4)
            t += per * rng.uniform(0.85, 1.15)
    return x

fx, music = Bus2(), Bus2()
f = lambda fr: fr / FPS
sfx = {k: load(f"public/{k}.ogg") for k in ("typing", "send", "receive", "notification", "success", "snap")}

# 1 · old chat: a faint cursor tick, send / receive
for fr in range(0, VO["ask"]["at"], 12): fx.put(tick2(1800, 0.3), f(fr), 0.15)
fx.put(sfx["send"], f(VO["ask"]["at"] + 4), 0.35)
fx.put(sfx["receive"], f(VO["ask"]["at"] + 26), 0.35)
# 2 · the job: typing the prompt, chips popping, the send, the charge (cut dead before the burst)
ty0, ty1 = Sx["hand"] + 8, Sx["send"] - 4
typ = sfx["typing"]; t = f(ty0)
while t < f(ty1): fx.put(typ[: int(0.9 * SR)], t, 0.35, 0.1); t += 0.85
for i, a in enumerate((14, 32, 50, 66)): fx.put(pop(600 + i * 120), f(Sx["hand"] + a), 0.35, (-0.4, 0.4, -0.4, 0.4)[i])
fx.put(sfx["send"], f(Sx["send"]), 0.5); fx.put(swish(0.5, 900, 9000), f(Sx["send"]), 0.5)
fx.put(riser(f(Sx["name"] - Sx["send"]) - 0.12), f(Sx["send"] + 2), 0.6)
for i in range(4): fx.put(pop(500 + i * 90), f(Sx["send"] + 8 + i * 3), 0.25)   # chips sucked into the spark
# 3 · the burst
fx.put(shimmer(), f(Sx["name"]), 0.85)
# 4 · what it does
for i in range(5): fx.put(tick2(2200 + i * 160, 1.0), f(Sx["plans"] + 8 + i * 7), 0.55, -0.2 + i * 0.1)
t = f(Sx["codes"] + 4)
while t < f(Sx["codes"] + 32): fx.put(typ[int(0.2 * SR): int(0.7 * SR)], t, 0.4, 0.15); t += 0.42
fx.put(sfx["success"], f(Sx["codes"] + 34), 0.45)
fx.put(shutter(), f(Sx["sees"] + 2), 0.8); fx.put(scan(f(22)), f(Sx["sees"] + 4), 0.8)
for i in range(5): fx.put(tick2(1500 + i * 220, 0.8), f(Sx["sees"] + 14 + i * 4), 0.4, -0.3 + i * 0.15)
for i in range(7): fx.put(sfx["snap"], f(Sx["builds"] + 4 + i * 5), 0.35, -0.3 + i * 0.1)
for k_ in ("plans", "codes", "sees", "builds", "sleep"): fx.put(swish(0.35, 1200, 8000), f(Sx[k_] - 4), 0.3)
# 5 · while you sleep: crickets, a twinkle, the pings
cr = crickets(f(Sx["end"] - Sx["sleep"]) + 0.5); i0 = int(f(Sx["sleep"]) * SR)
fade = np.minimum(1, np.minimum(np.arange(len(cr)) / (0.6 * SR), (len(cr) - np.arange(len(cr))) / (0.6 * SR)))[:, None]
fx.L[i0:i0 + len(cr)] += cr[:, 0] * fade[:, 0]; fx.R[i0:i0 + len(cr)] += cr[:, 1] * fade[:, 0]
for i in range(4): fx.put(sfx["notification"], f(Sx["sleep"] + 34 + i * 14), 0.35, 0.15)
fx.put(reverb(bell(93, 0.3, 0.8), 1.4, 0.4), f(Sx["sleep"] + 6), 0.12)
# 6 · the end: the mark returns, a soft bell under "Just hand it over."
fx.put(shimmer(3.5), f(Sx["end"] + 4), 0.7)
fx.put(reverb(bell(81, 0.5, 1.4), 2.0, 0.4), f(VO["over"]["at"]), 0.2)

# ───────────────────────── music: a pad from the start, the groove on the burst, out at night, the chord at the end
CHORDS = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 52, 55, 59, 62], 36), ([55, 59, 62, 64, 69], 43)]
G0, G1, G2 = f(Sx["name"]), f(Sx["sleep"]), f(Sx["end"])
padb, keysb, bassb, drums = Bus2(), Bus2(), Bus2(), Bus2()
t, bar = 0.0, 0
while t < DUR:
    ch, root = CHORDS[bar % 4]
    padb.put(pad(ch, BAR + 0.4), t, 0.5)
    if G0 <= t < G1:
        for s in (2, 6, 11, 14): keysb.put(keys([m + 12 * (s == 11) for m in ch[1:4]], 0.9), t + s * STEP, 0.4, pan=0.15 if s % 2 else -0.15)
        for s in (0, 3, 6, 10, 14): bassb.put(bass(root - 12, STEP * 1.6), t + s * STEP, 0.35)
        for s in range(16):
            dt = t + s * STEP
            if s % 4 == 0: drums.put(kick(), dt, 0.5)
            if s in (4, 12): drums.put(clap(), dt, 0.25)
            drums.put(shaker(), dt + (STEP * 0.12 if s % 2 else 0), 0.18 if s % 2 else 0.1, pan=-0.35)
    t += BAR; bar += 1
# the groove starts on the burst, so shift the bars to begin there
def shifted(b, t0):
    x = b.st(); k = int(t0 * SR) % int(BAR * SR); return np.roll(x, k, axis=0)
groove = shifted(drums, G0) * 0.9 + shifted(bassb, G0) * 0.8 + shifted(keysb, G0) * 0.7
tt = np.arange(N) / SR
gate = np.clip((tt - G0) / 0.05, 0, 1) * np.clip((G1 + 0.3 - tt) / 0.6, 0, 1)
groove *= gate[:, None]
pd = padb.st() * (0.55 + 0.45 * np.clip((tt - G0) / 0.5, 0, 1))[:, None]
mus = groove + pd
# duck the music under the voice
vo = load("vo/vo.wav")[:N]; vo = np.pad(vo, (0, max(0, N - len(vo))))
envv = lp(np.abs(vo), 8); envv /= envv.max() + 1e-9
duck = 1 - 0.55 * np.clip(envv * 4, 0, 1)
mus *= duck[:, None]

def master(x, rms_db):
    x = np.stack([hp(x[:, 0], 35), hp(x[:, 1], 35)], 1)
    x = np.tanh(x * 0.9); x *= 10 ** (rms_db / 20) / np.sqrt((x ** 2).mean())
    pk = np.abs(x).max(); x *= min(1, 10 ** (-1.5 / 20) / pk)
    fd = int(0.8 * SR); x[-fd:] *= np.linspace(1, 0, fd)[:, None]; return x
voice = np.stack([vo, vo], 1) * 1.15
full = master(mus * 0.5 + fx.st() * 0.8 + voice, -16)
nomusic = master(fx.st() * 0.8 + voice, -17)
for name, x in (("public/sound.wav", full), ("public/sound-nomusic.wav", nomusic)):
    wavfile.write(name, SR, (x * 32767).astype(np.int16)); print(name, f"{len(x)/SR:.2f}s rms {20*np.log10(np.sqrt((x**2).mean())):.1f} dB")
