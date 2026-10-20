"""A runway bed for "Follies — the boutique": 120 BPM deep/minimal house in A minor (Am9 | Fmaj9), built from scratch.
Deep sine kick, rim-clap on 2 and 4 in a dark room reverb, offbeat sub, ticking shaker, filtered chord stabs into a
dotted-8th ping-pong delay, an airy pad, and a glassy FM-bell arp over the website. Sections follow src/shop-timing.js:
the groove is in from frame 0 (the lookbook rush), a one-beat gap before the flash into the site, the bell arp joins
on the site, a break under the end card (pad, stabs, bells), the pulse coming back softly under the CTA, then a fade.
The effects (shop-sfx.wav, from sound/shop_cues.py) are mixed on top, so the cuts keep their sounds.
  python3 sound/runway.py public/shop-sfx.wav public/shop.wav"""
import re, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR, FPS, BPM = 48000, 30, 120
src = open("src/shop-timing.js").read()
n = lambda k: int(re.search(rf"\b{k} = (\d+)", src).group(1))
DUR, SITE, END, FEAT0 = n("DURATION"), n("SITE"), n("END"), n("FEAT0")
T = DUR / FPS; N = int(T * SR); BEAT = 60 / BPM; S16 = BEAT / 4
fr = lambda f: f / FPS                                                     # frame -> seconds
rng = np.random.default_rng(7)
sos = lambda kind, f, o=2: butter(o, f, kind, fs=SR, output="sos")
lp = lambda x, f, o=2: sosfilt(sos("lowpass", f, o), x)
hp = lambda x, f, o=2: sosfilt(sos("highpass", f, o), x)
bp = lambda x, a, b, o=2: sosfilt(sos("bandpass", [a, b], o), x)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def saw(f, n, ph=0.0):
    t = np.arange(n) / SR; return 2 * ((f * t + ph) % 1) - 1
def place(buf, sig, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    a, b = max(0, i), min(len(buf), i + len(sig)); buf[a:b] += g * sig[a - i:b - i]

# sections (seconds) -> per-hit level for each part
GAP0, GAP1 = fr(SITE - 15), fr(SITE)
BRK, BACK = fr(END), fr(FEAT0 + 30)          # break under the end card, the soft pulse back under the CTA
def drums_on(t): return 0.0 if GAP0 <= t < GAP1 or BRK <= t < BACK else (0.55 if t >= BACK else 1.0)
CHORDS = [(45, [60, 64, 67, 71]), (41, [57, 60, 64, 67])]               # Am9 (A2 | C E G B), Fmaj9 (F2 | A C E G)
chord_at = lambda t: CHORDS[int(t // (4 * BEAT)) % 2]

kick = np.zeros(N); clap = np.zeros(N); hats = np.zeros(N); bass = np.zeros(N)
stabs = np.zeros(N); pad = np.zeros(N); bells = np.zeros(N); duck = np.ones(N)

# kick: 4 on the floor, deep and short; its envelope side-chains the pad, stabs and bass
kn = int(0.42 * SR); tk = np.arange(kn) / SR
kph = 2 * np.pi * np.cumsum(46 + 95 * np.exp(-tk / 0.028)) / SR
K = np.sin(kph) * np.exp(-tk / 0.26) + 0.25 * np.exp(-tk / 0.002) * rng.standard_normal(kn) * 0.3
K = np.tanh(1.6 * K) / np.tanh(1.6)
dk = 1 - 0.62 * np.exp(-np.arange(int(0.45 * SR)) / (0.11 * SR))
b = 0
while b * BEAT < T:
    t = b * BEAT; g = drums_on(t)
    if g: place(kick, K, t, g); i = int(t * SR); duck[i:i + len(dk)] = np.minimum(duck[i:i + len(dk)], 1 - (1 - dk[:max(0, min(len(dk), N - i))]) * g)
    b += 1
# rim-clap on 2 and 4: three micro hits of band-passed noise
cn = int(0.25 * SR); tc = np.arange(cn) / SR
CL = sum(np.roll(np.exp(-tc / 0.012), int(d * SR)) * (1 if d < 0.02 else 0.8) for d in (0, 0.009, 0.019)) + 0.5 * np.exp(-tc / 0.07)
CL = bp(rng.standard_normal(cn) * CL, 900, 4200) + 0.35 * np.sin(2 * np.pi * 1850 * tc) * np.exp(-tc / 0.01)
for b in range(int(T / BEAT) + 1):
    t = b * BEAT
    if b % 2 == 1 and drums_on(t): place(clap, CL, t, drums_on(t))
# hats: an open-ish hat on every offbeat, a ticking 16th shaker with an accent pattern
hn = int(0.12 * SR); th = np.arange(hn) / SR
OH = hp(rng.standard_normal(hn), 7500, 4) * np.exp(-th / 0.045)
SH = hp(rng.standard_normal(int(0.05 * SR)), 5200, 4) * np.exp(-np.arange(int(0.05 * SR)) / (0.014 * SR))
for s in range(int(T / S16) + 1):
    t = s * S16; g = drums_on(t) if t < BRK else (0.6 if t < BACK else 0.8)   # shaker keeps ticking in the break
    if s % 4 == 2 and drums_on(t): place(hats, OH, t, 0.55 * drums_on(t))
    if g: place(hats, SH, t + (0.012 if s % 2 else 0), g * (0.28, 0.12, 0.2, 0.12)[s % 4])
# offbeat sub bass on the chord root
for e in range(int(T / (BEAT / 2)) + 1):
    t = e * BEAT / 2
    if e % 2 == 1 and drums_on(t):
        root = chord_at(t)[0]; bn = int(0.22 * SR); tb = np.arange(bn) / SR
        env = np.minimum(1, tb / 0.004) * np.exp(-tb / 0.16)
        place(bass, (np.sin(2 * np.pi * hz(root) * tb) + 0.18 * np.sin(4 * np.pi * hz(root) * tb)) * env, t, drums_on(t))
# chord stabs (deep-house style): detuned saws through an enveloped low-pass, syncopated
STAB16 = [3, 6, 10, 14]
for bar in range(int(T / (4 * BEAT)) + 1):
    for s16 in STAB16:
        t = bar * 4 * BEAT + s16 * S16
        if t >= T or GAP0 <= t < GAP1: continue
        sn = int(0.5 * SR); ts = np.arange(sn) / SR
        sig = sum(saw(hz(m) * d, sn, rng.random()) for m in chord_at(t)[1] for d in (0.996, 1.004)) / 8
        cut = 500 + 2600 * np.exp(-ts / 0.07)
        y = np.zeros(sn); zi = np.zeros((1, 2))                           # time-varying low-pass, state carried across blocks
        for k in range(0, sn, 256):
            y[k:k + 256], zi = sosfilt(sos("lowpass", cut[k]), sig[k:k + 256], zi=zi)
        place(stabs, y * np.minimum(1, ts / 0.003) * np.exp(-ts / 0.2), t, 0.9 if t < BRK else 0.75)
# pad: the whole chord, slow attack, low-passed, breathing with the side-chain
for bar in range(int(T / (4 * BEAT)) + 1):
    t = bar * 4 * BEAT; pn = int(4 * BEAT * SR + 0.6 * SR); tp = np.arange(pn) / SR
    root, notes = chord_at(t)
    sig = sum(saw(hz(m + 12) * d, pn, rng.random()) for m in notes for d in (0.993, 1.0, 1.007)) / 12
    env = np.minimum(1, tp / 0.5) * np.minimum(1, np.maximum(0, (pn / SR - tp) / 0.6))
    place(pad, lp(sig, 1500, 2) * env, t, 0.5 if t < BRK else 0.8)
# glassy FM bells: a slow 8th-note arp over the site and the end card
ARP = [12, 7, 3, 10, 7, 14, 10, 3]                                          # over the root+24: 9th, 5th, m3/maj3, 7th
for e in range(int(fr(SITE + 36) / (BEAT / 2)), int(T / (BEAT / 2)) + 1):
    t = e * BEAT / 2; root, notes = chord_at(t)
    m = root + 24 + ARP[e % 8] + (1 if root == 41 and ARP[e % 8] == 3 else 0)   # Fmaj: major third
    bn_ = int(1.2 * SR); tb = np.arange(bn_) / SR; f0 = hz(m)
    sig = np.sin(2 * np.pi * f0 * tb + 2.2 * np.exp(-tb / 0.18) * np.sin(2 * np.pi * f0 * 3.5 * tb)) * np.exp(-tb / 0.45) * np.minimum(1, tb / 0.002)
    place(bells, sig, t, (0.5 if e % 2 == 0 else 0.32) * (1.0 if t < BRK else 1.15))

# ── mix: side-chain, delay, reverb, master ────────────────────────────────────────────────────────────────────
def pingpong(x, d=0.375, fb=0.38, cut=3500):
    L = np.zeros(N); R = np.zeros(N); D = int(d * SR); y = lp(x, cut)
    for k in range(1, 7):
        g = fb ** k
        if k * D >= N: break
        (L if k % 2 else R)[k * D:] += g * y[:N - k * D]
    return L, R
ir_n = int(2.4 * SR); ti = np.arange(ir_n) / SR
IR = [lp(rng.standard_normal(ir_n) * np.exp(-ti / 0.55), 5000) * (ti > 0.018) for _ in range(2)]
IR = [ir / np.sqrt((ir ** 2).sum()) for ir in IR]
def verb(x): return [fftconvolve(x, ir)[:N] for ir in IR]

pad *= duck; stabs *= duck; bass *= np.sqrt(duck)
dry = 0.9 * kick + 0.75 * bass + 0.42 * clap + 0.45 * hats
sL, sR = pingpong(0.5 * stabs); bL, bR = pingpong(0.4 * bells, 0.375, 0.42, 6000)
send = 0.35 * clap + 0.45 * stabs + 0.55 * pad + 0.45 * bells + 0.15 * hats
vL, vR = verb(send)
L = dry + 0.62 * stabs + 0.72 * pad + 0.46 * bells * 0.9 + 0.55 * (sL + bL) + 0.42 * vL
R = dry + 0.62 * stabs + 0.72 * pad + 0.46 * bells * 1.1 + 0.55 * (sR + bR) + 0.42 * vR
bed = np.stack([L, R], 1)
bed = np.stack([hp(bed[:, 0], 28), hp(bed[:, 1], 28)], 1)
fade = np.minimum(1, np.maximum(0, (T - np.arange(N) / SR) / 1.6))[:, None]
bed = bed * fade / np.abs(bed).max()

sr, sfx = wavfile.read(sys.argv[1]); sfx = sfx.astype(float) / (32768 if sfx.dtype == np.int16 else 1)
if sfx.ndim == 1: sfx = np.stack([sfx, sfx], 1)
sfx = sfx[:N] if len(sfx) >= N else np.pad(sfx, ((0, N - len(sfx)), (0, 0)))
mix = 0.62 * bed + 0.75 * sfx / np.abs(sfx).max()
mix = np.tanh(1.25 * mix) / np.tanh(1.25)                                   # gentle glue
mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
rms = 20 * np.log10(np.sqrt((mix ** 2).mean()))
print(f"wrote {sys.argv[2]}: {T:.2f}s, peak -1.5 dBFS, rms {rms:.1f} dB")
