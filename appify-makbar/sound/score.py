"""MAK BAR commercial soundtrack: a 120 BPM tech-house bed (the skill's `house`, sectioned to the edit) under sport
foley locked to the cuts: electric crackle and thunder cracks on every bolt, dumbbell clanks / a battle-rope slam on the
gym cuts, padel ball hits and sneaker squeaks on the court cuts, the gym bag and the wrapper in the quiet beat, a charge-up
and zap on each bar's numbers, the wrapper tear and the bite crunch, and a final strike + slam on the wordmark.
    python3 sound/score.py        ->  public/sound.wav  +  public/sound-nomusic.wav   (reads src/timing.js)"""
import re, json, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SKILL = "/root/.claude/skills/motion-graphics/scripts/sound.py"
SR = 48000
T = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", T).group(1))
FPS, DUR, STRIKE, LOGO = g("FPS"), g("DURATION"), g("STRIKE"), g("LOGO")
CH = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", re.search(r"export const CH = \{([^}]+)\}", T).group(1))}
CLIPS = [(int(a), int(b), s) for a, b, s in re.findall(r"\[(\d+), (\d+), \"(\w+)\", [\d.]+, [\d.]+\]", T)]
BARS = [int(a) for a in re.findall(r"\{ at: (\d+),", T)]
SMASH = int(re.search(r"SMASH = \[(\d+),", T).group(1))

# ── music bed from the skill (sections follow the edit) ─────────────────────────────────────────────
spec = {"fps": FPS, "duration": DUR / FPS, "seed": 4, "peak_db": -1, "cues": [{"type": "house", "start": 0, "end": DUR, "gain": 1.0,
        "sections": [[0, "intro"], [CH["train"], "drop"], [CH["quiet"], "gap"], [CH["product"], "drop"], [CH["munch"], "break"], [CH["end"], "drop"], [DUR - 30, "outro"]],
        "lp_auto": [[0, 600], [CH["train"] - 2, 900], [CH["train"], 16000], [CH["munch"], 16000], [CH["munch"] + 2, 2400], [CH["end"] - 2, 2400], [CH["end"], 16000]]}]}
json.dump(spec, open("sound/bed.json", "w"), indent=1)
subprocess.run([sys.executable, SKILL, "sound/bed.json", "sound/bed.wav"], check=True)
sr, bed = wavfile.read("sound/bed.wav"); bed = bed.astype(float) / 32768

# ── foley ──────────────────────────────────────────────────────────────────────────────────────────
N = int(DUR / FPS * SR) + SR
L, R = np.zeros(N), np.zeros(N)
rng = np.random.default_rng(9)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)
def put(sig, frame, gain=1.0, pan=0.0):
    i = int(frame / FPS * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414; R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(f, n): f = np.broadcast_to(f, (n,)).astype(float); return np.sin(2 * np.pi * np.cumsum(f) / SR)
noise = lambda n: rng.standard_normal(n)
sec = lambda s: int(s * SR)
def verb(x, secs=1.2, wet=0.3):
    n = sec(secs); ir = filt(noise(n), "lowpass", 5000) * np.exp(-np.arange(n) / (secs / 5 * SR)); ir /= np.sqrt((ir ** 2).sum())
    y = np.convolve(x, ir); out = np.zeros(len(y)); out[: len(x)] += x * (1 - wet); return out + y * wet

def crackle(dur, rate=180):
    """Electric crackle building up before a strike."""
    n = sec(dur); x = np.zeros(n)
    for i in rng.integers(0, n - 400, int(rate * dur)):
        m = int(rng.uniform(0.0005, 0.004) * SR); x[i:i + m] += noise(m) * rng.uniform(0.3, 1.0)
    x = filt(x, "highpass", 1500) * np.linspace(0.3, 1, n) ** 2
    return x + tone(np.full(n, 100.0), n) * 0.05 * np.linspace(0, 1, n)
def strike(big=1.0):
    """A lightning strike: a hard crack, a crackling tail, a falling zap and a rolling thunder boom."""
    n = sec(2.2); x = np.zeros(n)
    x[: sec(0.6)] += filt(noise(sec(0.6)), "highpass", 2000) * env(sec(0.6), 0.0002, 0.008) * 2.0
    cr = np.zeros(sec(0.5))
    for i in rng.integers(0, len(cr) - 300, 160): m = int(rng.uniform(0.0005, 0.003) * SR); cr[i:i + m] += noise(m)
    x[: len(cr)] += filt(cr, "bandpass", [1200, 9000]) * np.exp(-np.arange(len(cr)) / SR / 0.14) * 0.9
    m = sec(0.12); x[:m] += tone(np.linspace(3200, 300, m), m) * env(m, 0.001, 0.05) * 0.35
    boom = filt(noise(n), "lowpass", 160) * env(n, 0.01, 0.55 * big) * 3 + tone(np.linspace(60, 32, n), n) * env(n, 0.004, 0.4 * big)
    return verb(x + boom * 0.9 * big, 1.6, 0.25)
def clank(pitch=1.0):
    """Dumbbell plates knocking: inharmonic metal partials, a dull body."""
    n = sec(0.8); x = sum(tone(np.full(n, f * pitch), n) * a * env(n, 0.0005, d) for f, a, d in ((380, 1, 0.18), (910, 0.6, 0.1), (1630, 0.45, 0.06), (2480, 0.3, 0.04), (3900, 0.15, 0.02)))
    return verb((x * 0.5 + filt(noise(n), "bandpass", [300, 2500]) * env(n, 0.0005, 0.01) * 0.8), 0.9, 0.2)
def rope():
    """A battle rope slamming the floor."""
    n = sec(0.5); return tone(np.linspace(110, 45, n), n) * env(n, 0.002, 0.08) * 1.1 + filt(noise(n), "bandpass", [400, 3000]) * env(n, 0.001, 0.03) * 0.9
def thwock(k=1.0):
    """A padel ball off the racket: a hollow pop with a short resonant body."""
    n = sec(0.35); f0 = 1050 * k
    return verb(filt(noise(n), "bandpass", [500, 3200]) * env(n, 0.0003, 0.012) * 1.4 + tone(np.full(n, f0), n) * env(n, 0.0005, 0.022) * 0.6 + tone(np.full(n, f0 * 0.48), n) * env(n, 0.001, 0.04) * 0.4, 0.8, 0.22)
def squeak():
    """Sneaker on the court."""
    n = sec(0.18); t = np.arange(n) / SR
    return tone(2300 + 500 * np.sin(2 * np.pi * 9 * t) + 1200 * t, n) * np.sin(np.pi * t / t[-1]) ** 2 * 0.25
def rustle(dur):
    """Fabric of the gym bag, a zip."""
    n = sec(dur); return filt(noise(n), "bandpass", [600, 5000]) * (0.4 + 0.6 * np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 3.5))) * np.sin(np.pi * np.arange(n) / n) * 0.3
def crinkle(dur, rate=900):
    n = sec(dur); x = np.zeros(n)
    for i in rng.integers(0, n - 300, int(rate * dur)):
        m = int(rng.uniform(0.0006, 0.004) * SR); x[i:i + m] += noise(m) * np.exp(-np.arange(m) / (m / 3)) * min(3, rng.pareto(2.2) + 0.2)
    return filt(x, "bandpass", [1800, 11000]) * np.sin(np.pi * np.arange(n) / n) ** 0.5
def tear():
    n = sec(0.35); t = np.arange(n) / SR
    return filt(noise(n), "bandpass", [900, 7000]) * (1 + 0.8 * np.sin(2 * np.pi * 60 * t)) * np.sin(np.pi * t / t[-1]) * 0.6
def crunch(dur=0.32):
    """A bite of a coated bar: a crisp snap, crunchy fragments, a soft thud."""
    n = sec(dur); x = np.zeros(n)
    x[: sec(0.02)] += filt(noise(sec(0.02)), "highpass", 2500) * env(sec(0.02), 0.0002, 0.004) * 2
    for i in rng.integers(0, int(n * 0.7), 70): m = int(rng.uniform(0.001, 0.006) * SR); x[i:i + m] += noise(m) * rng.uniform(0.2, 1)
    x = filt(x, "bandpass", [900, 7000]) * np.exp(-np.arange(n) / SR / 0.12)
    return x + tone(np.full(n, 140.0), n) * env(n, 0.003, 0.04) * 0.4
def charge(frames):
    """Charging up as the number counts: a rising tone with buzz and ticks."""
    n = sec(frames / FPS); p = np.linspace(0, 1, n)
    x = tone(220 * 2 ** (p * 2.6), n) * 0.25 + filt(noise(n), "bandpass", [2000, 7000]) * p ** 2 * 0.15
    x *= (1 + 0.5 * np.sign(np.sin(2 * np.pi * 30 * np.arange(n) / SR))) * p
    return x
def zap():
    n = sec(0.3); return tone(np.linspace(2600, 500, n), n) * env(n, 0.001, 0.06) * 0.35 + filt(noise(n), "highpass", 3000) * env(n, 0.0003, 0.01) * 0.8
def tick(f=2200):
    n = sec(0.05); return (tone(np.full(n, f), n) * env(n, 0.0005, 0.012) + filt(noise(n), "highpass", 4000) * env(n, 0.0003, 0.002)) * 0.5
def slam():
    n = sec(1.2); return verb(tone(np.linspace(120, 38, n), n) * env(n, 0.003, 0.3) * 1.2 + filt(noise(n), "highpass", 1200) * env(n, 0.0005, 0.03) * 0.8, 1.6, 0.3)

# hook
put(crackle(STRIKE / FPS + 0.05), 0, 0.5)
put(strike(1.0), STRIKE, 0.85)
put(thwock(1.0), 20, 0.5, 0.2)                       # the serve lands under "THE JOURNEY."
# train: a clank (or the rope) on every cut
gym = [c for c in CLIPS if CH["train"] <= c[0] < CH["court"]]
for k, (a, n, s) in enumerate(gym):
    if n == 30: put(rope(), a, 0.75); put(rope(), a + 12, 0.55)
    else: put(clank(0.85 + 0.07 * (k % 4)), a, 0.5, (-0.3, 0.3)[k % 2])
# court: a strike in, a ball hit + squeak on every cut, the smash, the freeze
put(strike(0.7), CH["court"], 0.7)
court = [c for c in CLIPS if CH["court"] <= c[0] < CH["quiet"]]
for k, (a, n, s) in enumerate(court):
    put(thwock(0.9 + 0.08 * k), a + 2, 0.6, (-0.25, 0.25)[k % 2]); put(squeak(), a + 6, 0.5, (0.4, -0.4)[k % 2])
put(thwock(0.8), SMASH, 0.8); put(slam(), SMASH, 0.6)
# quiet: the bag, the wrapper
put(rustle(0.8), CH["quiet"] + 2, 0.6, -0.2)
put(crinkle(0.5, 700), CH["quiet"] + 16, 0.35, 0.2)
# product: a strike in, then each bar charges up and lands with a zap; chips tick in
put(strike(0.8), CH["product"], 0.75)
for a in BARS:
    put(charge(18), a + 4, 0.5)
    put(zap(), a + 22, 0.7); put(slam(), a + 22, 0.35)
    for i in range(2): put(tick(1800 + 400 * i), a + 24 + i * 6, 0.5, 0.2 - 0.4 * i)
# munch: strike, tear, crunch, chew
put(strike(0.6), CH["munch"], 0.6)
put(tear(), CH["munch"] + 2, 0.7)
put(crinkle(0.4, 900), CH["munch"] + 6, 0.35)
put(crunch(), CH["munch"] + 17, 0.9)
put(crunch(0.22), CH["munch"] + 31, 0.5); put(crunch(0.22), CH["munch"] + 47, 0.45)
# end: crackle, the last strike, the wordmark slam, "MUNCH BETTER." stamp
put(crackle(0.25, 260), LOGO - 10, 0.45)
put(strike(1.2), LOGO - 2, 0.9)
put(slam(), LOGO, 0.8)
put(slam() * 0.6, LOGO + 14, 0.5)
put(zap(), LOGO + 14, 0.4)

fol = np.stack([L, R], 1)[: int(DUR / FPS * SR)]
bed = bed[: len(fol)]
if len(bed) < len(fol): bed = np.pad(bed, ((0, len(fol) - len(bed)), (0, 0)))
def master(x, rms_db):
    x = np.tanh(x * 0.9); x *= 10 ** (rms_db / 20) / np.sqrt((x ** 2).mean())
    pk = np.abs(x).max(); x *= min(1, 10 ** (-1.5 / 20) / pk)
    fade = sec(0.6); x[-fade:] *= np.linspace(1, 0, fade)[:, None]; return x
full = master(bed * 0.55 + fol * 0.9, -15)
nomusic = master(fol, -18)
for name, x in (("public/sound.wav", full), ("public/sound-nomusic.wav", nomusic)):
    wavfile.write(name, SR, (x * 32767).astype(np.int16)); print(name, f"rms {20*np.log10(np.sqrt((x**2).mean())):.1f} dB")
