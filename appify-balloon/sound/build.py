"""Sound for "The Balloon", synthesized from scratch and locked to src/timing.js.
Tension: an air pump on every pump frame with a rubber stretch that climbs in pitch, a heartbeat that speeds up, the
counter beeping in the red, a riser cut dead two frames before the pop (the quiet beat). Release (the dopamine hit):
a sharp pop, a sub boom, a bright A-major chord stab, a glitter arpeggio and confetti rustle, then a light 120 BPM
groove under the text and a chime when the confetti spark lands as the i-dot.
    python3 sound/build.py  ->  public/sound.wav"""
import re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
FPS, DUR = g("FPS"), g("DURATION")
POP, LINE1, LINE2, END, LAND = (g(k) for k in ["POP", "LINE1", "LINE2", "END", "LAND"])
PUMPS = [int(x) for x in re.search(r"PUMPS = \[([^\]]+)\]", src).group(1).split(",")]

N = int(DUR / FPS * SR) + SR
L, R = np.zeros(N), np.zeros(N)
rng = np.random.default_rng(11)
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
def saw(freq, n, harm=14):
    return sum(tone(np.asarray(freq) * h, n) / h for h in range(1, harm))
noise = lambda n: rng.standard_normal(n)
A = lambda st: 440 * 2 ** (st / 12)        # semitones from A4
sec = lambda s: int(s * SR)

# ── tension ───────────────────────────────────────────────────────────────────────────────────────
n = sec(POP / FPS); room = filt(noise(n), "lowpass", 250) * 0.04 * np.minimum(1, np.arange(n) / sec(0.5)); put(room, 0)
penta = [-12, -9, -7, -5, -2, 0, 3, 5, 7, 10, 12, 15]          # A minor pentatonic, climbing with every pump
for j, p in enumerate(PUMPS):
    nn = sec(0.32)
    air = filt(noise(nn), "bandpass", [700, 4000]) * np.sin(np.pi * np.minimum(1, np.arange(nn) / nn)) ** 1.5
    put(air, p, 0.6, -0.15)
    st = sec(0.28); f0 = A(penta[j] - 5)
    stretch = tone(np.linspace(f0 * 0.94, f0, st) * (1 + 0.012 * np.sin(np.arange(st) / SR * 2 * np.pi * 14)), st)
    put(stretch * env(st, 0.02, 0.12), p + 1, 0.3 + 0.02 * j, 0.15)
f = 104
while f < POP - 6:                                             # heartbeat, faster and louder
    gn = 0.35 + 0.65 * (f - 104) / (POP - 104)
    for d, k in [(0, 1), (5, 0.7)]:
        nn = sec(0.22); put(tone(np.linspace(64, 42, nn), nn) * env(nn, 0.004, 0.07), f + d, gn * k)
    f += int(round(np.interp(f, [104, POP], [24, 10])))
for f in range(0, 180, 30):                                    # counter ticks, then beeps in the red
    nn = sec(0.03); put(filt(noise(nn), "highpass", 2500) * env(nn, 0.0005, 0.006), f, 0.22, 0.3)
for j, f in enumerate([180, 188, 195, 201, 205]):
    nn = sec(0.08); put(tone(A(15 + j), nn) * env(nn, 0.002, 0.025), f, 0.1, 0.2)
n = sec((POP - 2 - 150) / FPS); ts = np.arange(n) / SR       # riser, cut dead 2 frames before the pop
riser = filt(noise(n), "bandpass", [500, 5000]) * (ts / ts[-1]) ** 2 + tone(np.linspace(A(-12), A(0), n), n) * 0.25 * (ts / ts[-1]) ** 2
put(riser, 150, 0.22)
n = sec(26 / FPS); ts = np.arange(n) / SR                      # latex squealing under the strain
put(tone(np.linspace(900, 1300, n) + 40 * np.sin(2 * np.pi * 9 * ts), n) * (ts / ts[-1]) ** 2 * 0.5, POP - 2 - 26, 0.12)

# ── release ───────────────────────────────────────────────────────────────────────────────────────
nn = sec(0.6)
crack = filt(noise(nn), "highpass", 1200) * env(nn, 0.0003, 0.018)
body = filt(noise(nn), "bandpass", [150, 2500]) * env(nn, 0.0005, 0.05)
sub = tone(np.linspace(90, 38, nn), nn) * env(nn, 0.002, 0.28)
put(crack * 1.4 + body * 0.9 + sub * 1.2, POP, 1.0)
nn = sec(2.6); ts = np.arange(nn) / SR                         # chord stab: A major add9, filter opening
chord = [A(-24), A(-12), A(-8), A(-5), A(-1), A(0), A(4)]
stab = sum(saw(fq * (1 + 0.003 * k), nn, 10) for k, fq in enumerate(chord)) / len(chord)
cut = 900 + 6000 * np.exp(-ts / 0.6)
stab_f = np.zeros(nn)
for b in range(0, nn, 512):                                    # block-wise moving lowpass
    stab_f[b:b + 512] = filt(stab[max(0, b - 2048):b + 512], "lowpass", float(cut[b]))[-len(stab[b:b + 512]):]
put(stab_f * env(nn, 0.004, 0.9), POP + 1, 0.95)
gliss = [0, 4, 7, 11, 12, 16, 19, 23, 24, 28, 31, 35]          # glitter arpeggio up through A major
for j, st in enumerate(gliss):
    m = sec(0.5); put(tone(A(st), m) * env(m, 0.002, 0.18) + 0.3 * tone(A(st + 12), m) * env(m, 0.002, 0.1), POP + 2 + j * 1.5, 0.12, (j % 4 - 1.5) / 2.5)
n = sec(3.0); ts = np.arange(n) / SR                           # confetti rustle with little crackles
rustle = filt(noise(n), "bandpass", [2500, 9000]) * np.exp(-ts / 1.1)
cr = np.zeros(n); idx = rng.integers(0, n, 400); cr[idx] = rng.uniform(-1, 1, 400) * np.exp(-idx / SR / 1.2)
put(rustle * 0.25 + filt(cr, "highpass", 3000) * 0.8, POP + 1, 0.4)

# ── groove under the text (120 BPM, a beat = 15 frames), then the landing ─────────────────────────────
for b in range(LINE1, END + 30, 15):
    k = sec(0.3); put(tone(np.linspace(120, 45, k), k) * env(k, 0.002, 0.09), b, 0.5)                       # kick
    h = sec(0.05); put(filt(noise(h), "highpass", 7000) * env(h, 0.0005, 0.012), b + 7, 0.12, 0.25)          # hat
    if ((b - LINE1) // 15) % 2: c = sec(0.2); put(filt(noise(c), "bandpass", [900, 3500]) * env(c, 0.001, 0.05), b, 0.22)  # clap
bass_notes = [-36, -36, -40, -38]                              # A1 A1 F1 G1, one per bar of 60 frames
for j, b in enumerate(range(LINE1, END + 30, 60)):
    nn = sec(2.0); put(filt(saw(A(bass_notes[j % 4]), nn, 6), "lowpass", 400) * env(nn, 0.01, 0.8), b, 0.18)
for f in [LINE1, LINE1 + 10, LINE2, LINE2 + 8]:
    nn = sec(0.12); put(filt(noise(nn), "lowpass", 260) * env(nn, 0.001, 0.025) * 2, f, 0.55)
nn = sec(1.2); put(tone(np.linspace(A(12), A(7), nn), nn) * env(nn, 0.3, 0.3) * 0.0 + filt(noise(nn), "bandpass", [1500, 6000]) * np.sin(np.pi * np.arange(nn) / nn) ** 2 * 0.3, LAND - 30, 0.25)
nn = sec(2.6); chime = (tone(A(12), nn) + 0.6 * tone(A(16), nn) + 0.5 * tone(A(19), nn) + 0.3 * tone(A(24), nn)) * env(nn, 0.002, 0.8)
put(chime, LAND, 0.25)
nn = sec(0.3); put(tone(np.linspace(80, 45, nn), nn) * env(nn, 0.003, 0.1), LAND, 0.5)
n = sec((DUR - END) / FPS); ts = np.arange(n) / SR
pad = sum(tone(fq, n) for fq in [A(-24), A(-17), A(-12), A(-8), A(-5)]) * np.minimum(1, ts / 1.5)
put(filt(pad, "lowpass", 1600) * 0.035, END)

mix = np.stack([L, R], 1)[: int(DUR / FPS * SR)]
fade = sec(0.8); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix *= 10 ** (-3 / 20) / np.abs(mix).max()
wavfile.write("public/sound.wav", SR, (mix * 32767).astype(np.int16))
print("public/sound.wav", round(len(mix) / SR, 2), "s")
