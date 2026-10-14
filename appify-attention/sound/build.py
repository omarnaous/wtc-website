"""Foley + score for "The Press", synthesized from scratch and locked to src/timing.js and src/drops.json.
The press hums only while it moves (the stalls are silent), a heartbeat creeps in, the jelly squeaks under load,
a wet splat on the pop, one drip per drop that lands, a quiet beat, then a soft pad under the text and a chime when
the spark lands as the i-dot.   python3 sound/build.py  ->  public/sound.wav"""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
FPS, DUR = g("FPS"), g("DURATION")
CONTACT, IMPACT, LINE1, LINE2, END, LAND = (g(k) for k in ["CONTACT", "IMPACT", "LINE1", "LINE2", "END", "LAND"])
press = [(int(eval(a.replace("CONTACT", str(CONTACT)).replace("IMPACT", str(IMPACT)))), int(b))
         for a, b in re.findall(r"\[([A-Z0-9 +]+), (\d+)\]", re.search(r"PRESS = \[(.*)\];", src).group(1))]
STOPS = [int(x) for x in re.search(r"STOPS = \[([^\]]+)\]", src).group(1).split(",")]
DROPS = json.load(open("src/drops.json"))["drops"]

N = int(DUR / FPS * SR) + SR
L, Rch = np.zeros(N), np.zeros(N)
rng = np.random.default_rng(7)
t_of = lambda frame: frame / FPS
def filt(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)
def put(sig, at_frame, gain=1.0, pan=0.0):
    i = int(t_of(at_frame) * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    Rch[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414
def env(n, a, d):  # attack/decay in seconds
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(freq, n, phase=0):
    f = np.broadcast_to(freq, (n,)).astype(float)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)
noise = lambda n: rng.standard_normal(n)
A = lambda note: 440 * 2 ** (note / 12)   # semitones from A4

# 1 · room tone (very low) through the press shot
n = int(t_of(END + 20) * SR); room = filt(noise(n), "lowpass", 300) * 0.05
room *= np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.6 * SR)); put(room, 0)

# 2 · hydraulic motor: amplitude follows the press speed, pitch creeps up; silent in the stalls
fr = np.arange(0, IMPACT + 1)
ys = np.interp(fr, [p[0] for p in press], [p[1] for p in press])
speed = np.abs(np.gradient(ys)); speed = speed / speed[: CONTACT].max()
n = int(t_of(IMPACT) * SR); ts = np.arange(n) / SR
amp = np.interp(ts * FPS, fr, np.minimum(1.4, speed))
amp = filt(amp, "lowpass", 8)
base = 52 + 14 * ts / ts[-1]
hum = sum(tone(base * h, n) / h for h in range(1, 9)) * 0.5
whine = filt(noise(n), "bandpass", [380, 900]) * 0.5 + tone(base * 7.5, n) * 0.08
motor = filt(hum, "lowpass", 900) * 0.6 + whine
put(motor * amp * 0.6, 0)

# 3 · servo clunks where it stalls, and on contact
def clunk(n=int(0.35 * SR)):
    k = filt(noise(n), "lowpass", 700) * env(n, 0.001, 0.04)
    ring = (tone(A(-8), n) * 0.5 + tone(A(7), n) * 0.25) * env(n, 0.001, 0.12)
    return k * 1.4 + ring * 0.4
for s in STOPS: put(clunk(), s, 0.5)
put(clunk(), CONTACT, 0.55)

# 4 · heartbeat from frame 110, faster and louder toward the pop
def beat(n=int(0.25 * SR)):
    return tone(np.linspace(62, 42, n), n) * env(n, 0.004, 0.07)
f, k = 110, 0
while f < IMPACT - 4:
    gain = 0.4 + 0.6 * (f - 110) / (IMPACT - 110)
    put(beat(), f, gain); put(beat(), f + 5, gain * 0.7)
    f += int(round(np.interp(f, [110, IMPACT], [26, 11])))

# 5 · second ticks of the counter, then three beeps when it turns red
for f in range(0, 180, 30): put(filt(noise(int(0.03 * SR)), "highpass", 2500) * env(int(0.03 * SR), 0.0005, 0.006), f, 0.25, 0.3)
for j, f in enumerate([180, 190, 200]):
    nn = int(0.09 * SR); put(tone(A(15 + j * 2), nn) * env(nn, 0.002, 0.03), f, 0.12, 0.2)

# 6 · the jelly under load: rubber squeak + creak, crescendo into the pop
n = int(t_of(IMPACT - CONTACT) * SR); ts = np.arange(n) / SR
sq = tone(np.linspace(720, 430, n) + 18 * np.sin(2 * np.pi * 13 * ts), n)
creak = filt(noise(n), "bandpass", [600, 2400]) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.linspace(18, 40, n) * ts)))
put((sq * 0.35 + creak * 0.25) * np.linspace(0.2, 1, n) ** 1.5, CONTACT, 0.5)

# 7 · the pop: wet splat, squelch, sub drop, crack
n = int(1.2 * SR); ts = np.arange(n) / SR
splat = filt(noise(n), "bandpass", [180, 4200]) * env(n, 0.001, 0.09)
squelch = filt(noise(n) * env(n, 0.002, 0.18), "bandpass", [300, 1100]) * (0.6 + 0.4 * np.sin(2 * np.pi * np.linspace(30, 6, n) * ts))
sub = tone(np.linspace(70, 32, n), n) * env(n, 0.002, 0.35)
crack = filt(noise(int(0.02 * SR)), "highpass", 3000)
put(splat * 0.9 + squelch * 0.7 + sub * 1.1, IMPACT, 1.0); put(crack, IMPACT, 0.4)
put(clunk(), IMPACT + 4, 0.7)                                 # the press slams the plate

# 8 · one drip per drop that lands, sized and panned by the drop
for d in DROPS:
    if d["land"] is None: continue
    nn = int(0.12 * SR); r = d["r"]
    f0 = np.interp(r, [8, 42], [1700, 650])
    plip = tone(np.linspace(f0, f0 * 0.55, nn), nn) * env(nn, 0.001, 0.03)
    put(plip, d["land"], 0.18 * np.interp(r, [8, 42], [0.6, 1.2]), float(np.clip((d["xl"] - 540) / 450, -0.8, 0.8)))

# 9 · text: soft thocks, a low boom on the "7", a quiet pad underneath (A minor add9)
def thock(n=int(0.12 * SR)): return filt(noise(n), "lowpass", 260) * env(n, 0.001, 0.025) * 2
for f in [LINE1, LINE1 + 8, LINE2, LINE2 + 8]: put(thock(), f, 0.6)
put(tone(np.linspace(80, 45, int(0.8 * SR)), int(0.8 * SR)) * env(int(0.8 * SR), 0.003, 0.3), LINE1 + 18, 0.6)
n = int(t_of(DUR - LINE1) * SR); ts = np.arange(n) / SR
chord = [A(-24), A(-17), A(-14), A(-10), A(-9)]                # A2 E3 G3 B3 C4
pad = sum(tone(fq * (1 + 0.002 * np.sin(2 * np.pi * 0.2 * ts + i)), n) for i, fq in enumerate(chord))
pad = filt(pad, "lowpass", 1400) * np.minimum(1, ts / 1.2) * np.minimum(1, (ts[-1] - ts) / 1.0)
put(pad * 0.04, LINE1)

# 10 · end: the drops get sucked home (reverse swell + rising plips), the spark pops back, whoosh, chime on the i-dot
n = int(t_of(28) * SR); ts = np.arange(n) / SR
swell = filt(noise(n), "bandpass", [400, 3000]) * (ts / ts[-1]) ** 2
put(swell * 0.35, END + 4)
penta = [0, 3, 5, 7, 10, 12, 15]
for j in range(9):
    nn = int(0.1 * SR); fq = A(penta[j % 7] - 2)
    put(tone(np.linspace(fq * 0.7, fq, nn), nn) * env(nn, 0.002, 0.04), END + 30 + j, 0.06, (j - 4) / 6)
nn = int(0.4 * SR); put(tone(np.linspace(180, 420, nn), nn) * env(nn, 0.003, 0.08), END + 32, 0.35)
n = int(t_of(16) * SR); ts = np.arange(n) / SR
put(filt(noise(n), "bandpass", [700, 5000]) * np.sin(np.pi * ts / ts[-1]) ** 2, LAND - 14, 0.18)
nn = int(2.5 * SR)
chime = (tone(A(12), nn) + 0.6 * tone(A(19), nn) + 0.3 * tone(A(24), nn)) * env(nn, 0.002, 0.7)
put(chime, LAND, 0.22); put(beat(), LAND, 0.5)

mix = np.stack([L, Rch], 1)[: int(DUR / FPS * SR)]
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-3 / 20) / np.abs(mix).max()
wavfile.write("public/sound.wav", SR, (mix * 32767).astype(np.int16))
print("public/sound.wav", round(len(mix) / SR, 2), "s")
