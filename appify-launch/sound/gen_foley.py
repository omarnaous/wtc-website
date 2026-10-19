"""Foley the bundled cues don't cover, synthesized and locked to src/timing.js:
roll.wav: steel wheels on the track, a low rumble that rises in pitch and level as the phone speeds up (RIDE -> LAUNCH).
roar.wav: the thrusters, from IGNITE: a crackling rocket roar, full at LAUNCH, thinning to a hover hiss after CLOSE.
    python3 sound/gen_foley.py  ->  sound/sfx/roll.wav, sound/sfx/roar.wav"""
import re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
FPS, RIDE, IGNITE, LAUNCH, CLOSE, END = (g(k) for k in ["FPS", "RIDE", "IGNITE", "LAUNCH", "CLOSE", "END"])
rng = np.random.default_rng(5)
filt = lambda x, kind, f, o=2: sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)
sec = lambda fr: int(fr / FPS * SR)
def write(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    wavfile.write(f"sound/sfx/{name}.wav", SR, (x * 32767).astype(np.int16))

# roll: brown-ish noise through a resonant band that climbs, plus rail clacks that come faster
n = sec(LAUNCH - RIDE + 4); t = np.arange(n) / n
speed = t ** 1.6
base = np.cumsum(rng.standard_normal(n)); base -= filt(base, "lowpass", 8)
roll = np.zeros(n)
for b in range(0, n, 2048):                                      # moving band-pass, 90 Hz -> 600 Hz
    f0 = 90 + 510 * speed[b]; seg = slice(b, b + 2048)
    roll[seg] = filt(base[max(0, b - 4096):b + 2048], "bandpass", [f0 * 0.6, f0 * 1.8])[-len(roll[seg]):]
roll *= 0.25 + 0.75 * speed
k, clacks = 0.0, np.zeros(n)
while k < n:
    m = int(0.05 * SR); i = int(k)
    c = filt(rng.standard_normal(m), "bandpass", [1500, 6000]) * np.exp(-np.arange(m) / SR / 0.006)
    clacks[i:i + m] += c[: n - i] * 0.5
    k += SR * np.interp(k / n, [0, 1], [0.42, 0.07])
write("roll", roll + clacks * 0.6)

# roar: low rumble + mid roar + crackle, with an envelope from the beat sheet
n = sec(END + 30 - IGNITE); fr = IGNITE + np.arange(n) / SR * FPS
env = np.interp(fr, [IGNITE, IGNITE + 4, LAUNCH - 2, LAUNCH + 2, CLOSE - 30, CLOSE, END, END + 30], [0, 0.55, 0.7, 1, 0.85, 0.35, 0.18, 0])
w = rng.standard_normal(n)
low = filt(np.cumsum(w) - filt(np.cumsum(w), "lowpass", 10), "lowpass", 160, 4)
mid = filt(w, "bandpass", [250, 2200])
crk = rng.standard_normal(n) * (rng.random(n) < 0.004)
crk = filt(crk, "highpass", 1800) * 6
hiss = filt(w, "highpass", 3500) * 0.25
flutter = 1 + 0.25 * np.sin(2 * np.pi * 13 * np.arange(n) / SR) * rng.random()
write("roar", (low / (np.abs(low).max() + 1e-9) * 1.2 + mid / (np.abs(mid).max() + 1e-9) * 0.7 + crk * 0.3 + hiss) * env * flutter)
print("wrote sound/sfx/roll.wav, sound/sfx/roar.wav")
