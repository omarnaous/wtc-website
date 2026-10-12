#!/usr/bin/env python3
"""Synthesize a motion-graphics soundtrack from a cue list.

usage:
  sound.py cues.json out.wav            mix cues into a 48 kHz stereo WAV (normalized to -1 dBFS)
  sound.py --grid --bpm 120 --fps 30 --bars 4 [--offset 0]
                                        print beat frames, for locking cuts/words to the beat

Cue types: tick riser impact chime whoosh pad glint drone kick snare hat beat
           printer coin register rip glitch click pop typing cash cash_count blip sweep,
           viral-reel hits: vine_boom scratch bass_drop stamp buzz sting, drinks: clink pour, editorial cuts: swish slap,
           money: coin_drop coins cash_riffle; charts: graph_tick graph_rise counter,
           and a music bed for voice-overs: lofi (start/end, bpm, lp, drums/keys/bass).
           tape lo-fi bed: lofi_tape (FM Rhodes, swung boom-bap, wow/flutter, side-chain, lp_auto, tape stop),
           cinematic cuts: swoosh (doppler pass-by), reverse_swell (into a cut), thump (soft sub landing).
           house (tech-house bed with sections: intro/gap/drop/break/outro), sample (a real audio file, e.g. CC0 uisfx).
Every cue takes "frame" (or "start"/"end" in frames), optional "gain" (default 0.5) and "pan" (-1..1).
Requires numpy and scipy (pip install numpy scipy).
"""
import json, sys, argparse
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000

def _sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")
def lp(x, f, o=2): return sosfilt(_sos("lowpass", f, o), x)
def hp(x, f, o=2): return sosfilt(_sos("highpass", f, o), x)
def bp(x, lo, hi, o=2): return sosfilt(_sos("bandpass", [lo, min(hi, SR / 2 - 100)], o), x)
def decay(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def osc(freq, n):  # freq: scalar or per-sample array
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def snap(freq, q):
    """In loop mode, round a frequency to whole cycles per loop so it is periodic."""
    P = q.get("_period")
    return max(1, round(freq * P)) / P if P else freq
def lp_loop(x, f, q):
    """Low-pass; in loop mode filter circularly so the start continues the end."""
    if not q.get("_period"): return lp(x, f)
    return lp(np.concatenate([x, x]), f)[len(x):]

class Ctx:
    def __init__(self, seed): self.rng = np.random.default_rng(seed)
    def noise(self, n): return self.rng.standard_normal(n)
    def reverb(self, x, secs=2.0, wet=0.35):
        n = int(secs * SR)
        ir = lp(self.noise(n) * np.exp(-np.arange(n) / (secs / 6.5 * SR)), 7000)
        ir /= np.sqrt((ir ** 2).sum())
        return x * (1 - wet) + fftconvolve(x, ir)[: len(x)] * wet * 3

# ── cue generators: return mono float arrays ──────────────────────────────
def tick(c, q):
    n = int(0.5 * SR); t = np.arange(n) / SR; f = q.get("freq", 3520)
    return c.reverb((np.sin(2*np.pi*f*t)*0.6 + np.sin(2*np.pi*f*1.5*t)*0.3) * decay(n, 0.05), 1.4, 0.5)

def riser(c, q, fps):
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    nz = c.noise(n)
    bands = [(200, 500), (400, 1000), (800, 2000), (1600, 4000), (3200, 8000), (6000, 14000)]
    layers = [bp(nz, lo, hi) for lo, hi in bands]
    pos = p ** 1.6 * (len(bands) - 1)
    swept = sum(L * np.clip(1 - np.abs(pos - i), 0, 1) for i, L in enumerate(layers))
    base = q.get("freq", 110)
    tone = osc(base * 2 ** (2.2 * p ** 1.6), n) + 0.4 * osc(base * 1.5 * 2 ** (2.2 * p ** 1.6), n)
    out = (swept * 0.6 + tone * 0.3) * p ** 2.4
    k = int(0.008 * SR); out[-k:] *= np.linspace(1, 0, k)
    return out

def impact(c, q):
    n = int(2.6 * SR); t = np.arange(n) / SR
    sub = osc(38 + 110 * np.exp(-t / 0.045), n) * decay(n, 0.55)
    punch = osc(180 + 240 * np.exp(-t / 0.012), n) * decay(n, 0.07)
    crack = hp(c.noise(n), 2500) * decay(n, 0.012)
    boom = lp(c.noise(n), 260, 4) * decay(n, 0.5) * 2.2
    body = np.tanh((sub * 1.2 + punch * 0.7 + crack * 0.5 + boom * 0.5) * 1.6)
    air = hp(c.noise(n), 6000) * decay(n, 0.35) * 0.12
    return c.reverb(body + air, 2.6, 0.32)

def chime(c, q):
    n = int(2.4 * SR); t = np.arange(n) / SR; f = q.get("freq", 1760)
    s = (np.sin(2*np.pi*f*t) + 0.55*np.sin(2*np.pi*f*1.498*t) + 0.25*np.sin(2*np.pi*f*2*t + .5)) * decay(n, 0.45)
    return c.reverb(s * np.minimum(1, t / 0.002), 2.4, 0.45)

def whoosh(c, q, fps):
    dur = (q["end"] - q["start"]) / fps if "end" in q else q.get("dur", 0.9)
    n = int(dur * SR); t = np.linspace(0, 1, n)
    return c.reverb(bp(c.noise(n), 900, 5000) * np.sin(np.pi * t) ** 2, 1.5, 0.4)

def glint(c, q):
    n = int(1.6 * SR); t = np.arange(n) / SR; f = q.get("freq", 2349)
    s = (np.sin(2*np.pi*f*t)*0.5 + np.sin(2*np.pi*f*1.335*t)*0.3) * decay(n, 0.4) * np.minimum(1, t / 0.03)
    return c.reverb(s, 2.0, 0.6)

def pad(c, q, fps, total):
    start = q.get("start", 0); end = q.get("end", total * fps)
    n = int((end - start) / fps * SR); t = np.arange(n) / SR
    chord = [snap(fr, q) for fr in q.get("chord", [110, 164.8, 220, 277.2, 329.6])]
    s = sum(np.sin(2*np.pi*fr*t + i) * (0.5 / (1 + i * 0.4)) for i, fr in enumerate(chord))
    s = lp_loop(s, 1800, q) * (1 + 0.15 * np.sin(2*np.pi*snap(0.25, q)*t))
    if not q.get("_period"):
        fin = min(n, int(q.get("fade_in", 1.2) * SR)); s[:fin] *= np.linspace(0, 1, fin)
    return s

def drone(c, q, fps, total):
    start = q.get("start", 0); end = q.get("end", total * fps)
    n = int((end - start) / fps * SR); t = np.arange(n) / SR; f = q.get("freq", 55)
    period = (end - start) / fps  # LFOs complete whole cycles, so the drone loops
    s = osc(snap(f, q), n) * 0.6 + osc(snap(f * 2.003, q), n) * 0.25 + osc(snap(f * 3.01, q), n) * 0.1
    s += lp_loop(c.noise(n), 400, q) * 0.3
    s *= 0.75 + 0.25 * np.sin(2*np.pi*t/period)
    w = 0.5 + 0.5 * np.sin(2*np.pi*2*t/period)  # filter opens and closes twice per loop
    return lp_loop(s, 600, q) * (1 - w) + lp_loop(s, 1600, q) * w

def kick(c, q):
    n = int(0.6 * SR); t = np.arange(n) / SR
    return np.tanh(osc(45 + 140 * np.exp(-t / 0.03), n) * decay(n, 0.18) * 2 + hp(c.noise(n), 3000) * decay(n, 0.004) * 0.4)

def snare(c, q):
    n = int(0.5 * SR); t = np.arange(n) / SR
    return c.reverb(bp(c.noise(n), 1200, 9000) * decay(n, 0.09) * 0.9 + osc(190, n) * decay(n, 0.05) * 0.5, 0.9, 0.25)

def hat(c, q):
    n = int(0.15 * SR)
    return hp(c.noise(n), 7000) * decay(n, 0.025) * 0.6


def printer(c, q, fps):
    """Dot-matrix receipt printer: rapid needle clicks in line-sized bursts + motor hum."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); t = np.arange(n) / SR
    out = lp(osc(118, n) * 0.25 + c.noise(n) * 0.05, 400) * 0.5
    hit = bp(c.noise(int(0.006 * SR)), 1800, 6000) * decay(int(0.006 * SR), 0.0015)
    rate = q.get("rate", 70); line = q.get("line", 0.22)
    for k in range(int(n / SR * rate)):
        ts = k / rate + c.rng.uniform(-0.002, 0.002)
        if (ts % line) > line * 0.8: continue  # gap between printed lines
        i = int(ts * SR)
        if i + len(hit) < n: out[i:i + len(hit)] += hit * c.rng.uniform(0.6, 1.0)
    return out

def coin(c, q):
    """Metallic coin ping; raise "freq" for a rising sequence."""
    n = int(0.6 * SR); t = np.arange(n) / SR; f = q.get("freq", 2400)
    s = sum(np.sin(2 * np.pi * f * m * t) * a * decay(n, d) for m, a, d in [(1, .6, .25), (2.76, .3, .12), (5.4, .15, .06)])
    return s * np.minimum(1, t / 0.0008) + hp(c.noise(n), 5000) * decay(n, 0.003) * 0.3

def register(c, q):
    """Cash register: mechanical clack, then a bright 'ching' and a coin rattle."""
    n = int(1.4 * SR); t = np.arange(n) / SR
    clack = lp(c.noise(n), 1500) * decay(n, 0.02) * 1.2
    ching = np.zeros(n); d = int(0.07 * SR)
    for f, a in [(3136, .55), (4186, .4), (5274, .2)]:
        ching[d:] += np.sin(2 * np.pi * f * t[:n - d]) * a * decay(n - d, 0.5)
    rattle = np.zeros(n)
    for k in range(6):
        i = d + int(c.rng.uniform(0.05, 0.35) * SR); m = int(0.08 * SR)
        rattle[i:i + m] += np.sin(2 * np.pi * c.rng.uniform(2500, 4500) * np.arange(m) / SR) * decay(m, 0.02) * 0.25
    return c.reverb(clack + ching + rattle, 1.2, 0.25)

def rip(c, q, fps):
    """Paper tearing: crackle bursts that thicken, band-passed noise body."""
    dur = (q["end"] - q["start"]) / fps if "end" in q else q.get("dur", 0.55)
    n = int(dur * SR); p = np.linspace(0, 1, n)
    body = bp(c.noise(n), 700, 6000) * (np.sin(np.pi * p) ** 0.6) * 0.5
    crk = np.zeros(n)
    for _ in range(int(dur * 260)):
        i = int(c.rng.uniform(0, 1) ** 0.7 * (n - 300)); crk[i:i + 300] += hp(c.noise(300), 2000) * decay(300, 0.0012) * c.rng.uniform(0.3, 1)
    return body + crk

def glitch(c, q):
    """Digital stutter: stepped square tones and crushed noise."""
    n = int(q.get("dur", 0.3) * SR); out = np.zeros(n); seg = int(0.03 * SR)
    for i in range(0, n, seg):
        m = min(seg, n - i); f = c.rng.choice([180, 360, 720, 1440, 2880])
        tone = np.sign(np.sin(2 * np.pi * f * np.arange(m) / SR)) * 0.35
        out[i:i + m] = tone if c.rng.random() > 0.35 else np.round(c.noise(m) * 3) / 6
    return lp(out, 9000)

def click(c, q):
    """UI tap."""
    n = int(0.05 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * q.get("freq", 1400) * t) * decay(n, 0.006) * 0.8 + hp(c.noise(n), 4000) * decay(n, 0.001) * 0.4

def pop(c, q):
    """Bubbly UI pop: fast downward sine sweep."""
    n = int(0.09 * SR); t = np.arange(n) / SR
    return osc(300 + 900 * np.exp(-t / 0.012), n) * decay(n, 0.03)

def typing(c, q, fps):
    """Keyboard typing between start and end frames."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); out = np.zeros(n); t = 0.0
    while t < n / SR - 0.05:
        k = click(c, {"freq": c.rng.uniform(900, 1700)}) * c.rng.uniform(0.5, 1)
        i = int(t * SR); out[i:i + len(k)] += k[: n - i]; t += c.rng.uniform(0.045, 0.11)
    return out

def cash(c, q):
    """Banknote snap: a crisp paper flick with a soft body thump. No bell, no ring."""
    n = int(0.16 * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for d, a in [(0.0, 1.0), (0.028, 0.55)]:
        i = int(d * SR); m = int(0.06 * SR)
        out[i:i + m] += bp(c.noise(m), 900, 5200) * decay(m, 0.012) * a
    return out + lp(c.noise(n), 220) * decay(n, 0.02) * 0.6

def cash_count(c, q, fps):
    """Bills being counted/flicked between start and end frames."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); out = np.zeros(n); t = 0.0
    rate = q.get("rate", 16)
    while t < n / SR - 0.03:
        m = int(0.03 * SR); i = int(t * SR)
        out[i:i + m] += (bp(c.noise(m), 1200, 6000) * decay(m, 0.006) * c.rng.uniform(0.5, 1.0))[: n - i]
        t += 1 / rate * c.rng.uniform(0.8, 1.2)
    return out

def blip(c, q):
    """Soft data blip (a bar or point appearing on a chart): rounded sine pluck, raise "freq" to step up."""
    n = int(0.14 * SR); t = np.arange(n) / SR; f = q.get("freq", 520)
    s = osc(f * (1 + 0.04 * np.exp(-t / 0.01)), n) + osc(2 * f, n) * 0.18
    return lp(s * np.minimum(1, t / 0.002) * decay(n, 0.035), 3000)

def sweep(c, q, fps):
    """Line drawing across a chart: a soft tone gliding from "f0" to "f1" with a little air."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    f = q.get("f0", 260) * (q.get("f1", 780) / q.get("f0", 260)) ** p
    env = np.minimum(1, p / 0.15) * np.minimum(1, (1 - p) / 0.12)
    return (osc(f, n) * 0.7 + bp(c.noise(n), 800, 3000) * 0.08) * env

def vine_boom(c, q):
    """The viral 'vine boom': a deep, saturated sub thump with a pitch drop and a short room tail. Punchlines only."""
    n = int(1.3 * SR); t = np.arange(n) / SR
    f = 46 + 50 * np.exp(-t / 0.07)
    body = np.tanh(osc(f, n) * 3.2) * decay(n, 0.32)
    knock = lp(c.noise(n), 900) * decay(n, 0.012) * 0.9
    return c.reverb(lp(body + knock, 2500), 1.0, 0.18)

def scratch(c, q):
    """Record scratch (the viral 'wait, what?' moment): a rough tone dragged back and forth."""
    strokes = [(0.0, 0.09, 260, 1100), (0.11, 0.08, 1000, 180), (0.21, 0.12, 300, 1400)]
    n = int(0.36 * SR); out = np.zeros(n)
    for st, du, f0, f1 in strokes:
        m = int(du * SR); i = int(st * SR); tt = np.linspace(0, 1, m)
        f = f0 + (f1 - f0) * (np.sin(tt * np.pi / 2) ** 1.5)
        ph = np.cumsum(f) / SR
        saw = 2 * (ph - np.floor(ph + 0.5))
        grit = hp(c.noise(m), 1500) * 0.35
        env = np.sin(np.pi * tt) ** 0.6
        out[i:i + m] += (lp(saw, 3800) * 0.6 + grit) * env
    return out

def bass_drop(c, q):
    """808 slide for a big reveal: sub sliding down, saturated, with a click on the front."""
    n = int(q.get("dur", 1.4) * SR); t = np.arange(n) / SR
    f = 38 + 120 * np.exp(-t / 0.18)
    sub = np.tanh(osc(f, n) * 2.4) * decay(n, 0.6)
    return lp(sub, 1800) + hp(c.noise(n), 3000) * decay(n, 0.004) * 0.5

def stamp(c, q):
    """Rubber stamp / seal hitting paper: low thud plus a short slap."""
    n = int(0.35 * SR); t = np.arange(n) / SR
    thud = osc(72 * (1 + 0.6 * np.exp(-t / 0.02)), n) * decay(n, 0.09)
    slap = bp(c.noise(n), 700, 2600) * decay(n, 0.018) * 0.8
    return thud + slap

def buzz(c, q):
    """'Wrong answer' buzzer: two detuned low square tones. For a price getting crossed out."""
    n = int(q.get("dur", 0.38) * SR); t = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * 146 * t)) + np.sign(np.sin(2 * np.pi * 153 * t))
    env = np.minimum(1, t / 0.005) * np.minimum(1, (n / SR - t) / 0.04)
    return lp(sq * 0.4, 1600) * env

def sting(c, q):
    """Dramatic 'dun dun DUNNN' (meme zoom): three brass-like stabs with timpani, the last one held with a
    tremolo. "step" = seconds between stabs (default 0.27), "hold" = length of the last one."""
    step, hold = q.get("step", 0.27), q.get("hold", 1.1)
    chords = [(146.8, 174.6, 220.0), (146.8, 174.6, 220.0), (138.6, 164.8, 196.0, 233.1)]  # Dm, Dm, C#dim7
    n = int((2 * step + hold + 0.8) * SR); out = np.zeros(n)
    for k, ch in enumerate(chords):
        dur = hold if k == 2 else step * 0.85; m = int(dur * SR); t = np.arange(m) / SR
        env = np.minimum(1, t / 0.012) * (np.exp(-t / 0.5) if k < 2 else (1 - t / dur) ** 0.6)
        if k == 2: env = env * (1 + 0.25 * np.sin(2 * np.pi * 7 * t))
        tone = np.zeros(m)
        for f in ch:
            for d in (0.997, 1.003):
                ph = f * d * t; tone += 2 * (ph - np.floor(ph + 0.5))
        bright = lp(tone, 900) * 0.6 + lp(tone, 2600) * 0.4 * np.exp(-t / 0.08)   # brass: the filter opens on the attack
        mt = int(0.6 * SR); tt = np.arange(mt) / SR
        timp = np.sin(2 * np.pi * np.cumsum(70 * (1 + 0.3 * np.exp(-tt / 0.04))) / SR) * np.exp(-tt / (0.35 if k < 2 else 0.6))
        i = int(k * step * SR)
        out[i:i + m] += np.tanh(bright * env * 0.5) * (1.0 if k < 2 else 1.15)
        out[i:i + mt] += timp * 0.9
    return c.reverb(out, 1.2, 0.2)

def clink(c, q):
    """Ice cube into a glass: a few bright inharmonic partials with fast decay, a tiny thud. "pitch" scales it."""
    k = q.get("pitch", 1.0); n = int(0.6 * SR); t = np.arange(n) / SR
    parts = [(2350, 1.0, 0.09), (3720, 0.6, 0.06), (5210, 0.45, 0.04), (1480, 0.5, 0.12), (6980, 0.25, 0.025)]
    out = sum(a * np.sin(2 * np.pi * fr * k * t + i) * np.exp(-t / d) for i, (fr, a, d) in enumerate(parts))
    thud = lp(c.noise(n), 600) * decay(n, 0.02) * 0.8
    return c.reverb((out * 0.5 + thud) * np.minimum(1, t / 0.0008), 0.8, 0.15)

def pour(c, q, fps):
    """Liquid pouring: band-passed noise that fills up (the pitch of the cavity rises as it fills), with gurgles."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    base = c.noise(n)
    lo = bp(base, 300, 1400) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * p * n / SR))
    hi = bp(base, 1800, 5200) * 0.35
    glug = np.sin(2 * np.pi * np.cumsum(220 + 380 * p + 60 * np.sin(2 * np.pi * 9 * np.arange(n) / SR)) / SR) * 0.08
    env = np.minimum(1, p / 0.06) * np.minimum(1, (1 - p) / 0.12)
    return (lo + hi + glug) * env

def slap(c, q):
    """A card or print slapped down on a table: a papery crack, a soft thump of the table, a short room."""
    n = int(0.32 * SR); t = np.arange(n) / SR
    crack = bp(c.noise(n), 2200, 9000) * decay(n, 0.006) * 0.7
    body = lp(c.noise(n), 2400) * decay(n, 0.022)
    thump = osc(70 + 50 * np.exp(-t / 0.015), n) * decay(n, 0.05) * 0.9
    return c.reverb((crack + body + thump) * np.minimum(1, t / 0.0005), 0.5, 0.12)

def swish(c, q, fps):
    """Paper swish (start/end): a card flying through the air: band-passed air that rises, with a 35 Hz paper flutter."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    air = bp(c.noise(n), 900, 6500)
    flutter = 1 + 0.35 * np.sin(2 * np.pi * 35 * np.arange(n) / SR)
    env = (p ** 1.6) * np.minimum(1, (1 - p) / 0.08)
    return air * flutter * env

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def _hz(name):  # "A3" -> 220.0
    return 440 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)
LOFI_PROG = [  # (bass root, chord voicing) - one per bar; warm minor-key loop, no lead melody
    ("A1", ["G3", "C4", "E4", "B4"]),   # Am9
    ("F1", ["A3", "C4", "E4", "G4"]),   # Fmaj9
    ("C2", ["G3", "B3", "E4", "A4"]),   # Cmaj7(6)
    ("G1", ["F3", "B3", "D4", "A4"]),   # G9
]

def lofi(c, q, fps):
    """Lo-fi hip-hop groove for voice-overs: electric-piano chords, round bass, soft swung drums,
    vinyl crackle. "bpm" (default 92), "lp" (overall low-pass in Hz; ~900 for a muffled intro),
    "drums"/"keys"/"bass" gains (0..1), "bar0" to start mid-progression."""
    bpm = q.get("bpm", 92); beat = 60 / bpm; bar = 4 * beat
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); out = np.zeros(n + SR)
    def put(sig, t, g):
        i = int(t * SR)
        if 0 <= i < len(out): m = min(len(sig), len(out) - i); out[i:i + m] += sig[:m] * g
    def ep(f, dur):  # electric piano: sine + soft bell partial + tremolo, slow decay
        m = int(dur * SR); t = np.arange(m) / SR
        s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.25)
        return s * np.minimum(1, t / 0.008) * np.exp(-t / 1.1) * (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t))
    def bassnote(f, dur):
        m = int(dur * SR); t = np.arange(m) / SR
        return np.tanh(np.sin(2 * np.pi * f * t) * 1.6) * np.minimum(1, t / 0.006) * np.exp(-t / 0.6)
    mk = int(0.45 * SR); tk = np.arange(mk) / SR
    kick = np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-tk / 0.03)) / SR) * np.exp(-tk / 0.16)
    ms = int(0.22 * SR); ts = np.arange(ms) / SR
    snare = bp(c.noise(ms), 900, 5000) * np.exp(-ts / 0.05) * 0.7 + np.sin(2 * np.pi * 190 * ts) * np.exp(-ts / 0.03) * 0.5
    mh = int(0.05 * SR)
    hat = hp(c.noise(mh), 7000) * np.exp(-np.arange(mh) / SR / 0.012)
    gd, gk, gb = q.get("drums", 1.0), q.get("keys", 1.0), q.get("bass", 1.0)
    swing = 0.6
    k, t = q.get("bar0", 0), 0.0
    while t < n / SR:
        root, chord = LOFI_PROG[k % len(LOFI_PROG)]
        for j, nt in enumerate(chord):  # slightly strummed chord, re-struck on beat 3
            put(ep(_hz(nt), bar), t + j * 0.012, 0.16 * gk)
            put(ep(_hz(nt), bar / 2), t + 2 * beat + 0.03 + j * 0.01, 0.07 * gk)
        for off, d in [(0, 1.5), (1.5, 1.0), (2.5, 1.5)]:  # bass on 1, the and of 2, and 3
            put(bassnote(_hz(root) * 2, d * beat), t + off * beat, 0.32 * gb)
        for b in range(4):
            tb = t + b * beat
            if b in (0, 2): put(kick, tb, 0.55 * gd)
            if b == 1 and k % 2: put(kick, tb + beat * swing, 0.3 * gd)  # ghost kick every other bar
            if b in (1, 3): put(snare, tb, 0.32 * gd)
            put(hat, tb, 0.10 * gd); put(hat, tb + beat * swing, 0.06 * gd)
        t += bar; k += 1
    out = out[:n]
    crackle = np.zeros(n)
    for i in c.rng.integers(0, n, int(n / SR * 9)): crackle[i] = c.rng.uniform(-1, 1)
    out += lp(crackle, 5000) * 0.25 + lp(c.noise(n), 3000) * 0.004
    out = lp(out, q.get("lp", 5200))
    fi, fo = int(0.25 * SR), int(0.6 * SR)  # short fades so sections join smoothly
    out[:fi] *= np.linspace(0, 1, fi); out[-fo:] *= np.linspace(1, 0, fo)
    return out

# ── tape lo-fi + cinematic transitions ─────────────────────────────────────────────────────────────
def _auto_filter(x, freqs, kind="lowpass", block=256, order=2):
    """Time-varying Butterworth filter: freqs is one cutoff (or [lo, hi]) per block; filter state carries across blocks."""
    y = np.zeros_like(x); zi = None
    for b in range(0, len(x), block):
        f = freqs[min(b // block, len(freqs) - 1)]
        sos = butter(order, f, kind, fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y[b:b + block], zi = sosfilt(sos, x[b:b + block], zi=zi)
    return y

def _curve(points, n, start_frame, fps, block=256):
    """[[frame, value], ...] (absolute frames) -> one value per block, linearly interpolated."""
    fr = start_frame + np.arange(0, n, block) / SR * fps
    xs, ys = zip(*points)
    return np.interp(fr, xs, ys)

LOFI_TAPE_PROG = [  # ii-V-I-VI in C: Dm9, G13, Cmaj9, A7(b13). (bass root, voicing)
    ("D2", ["F3", "A3", "C4", "E4"]),
    ("G2", ["F3", "B3", "E4", "A4"]),
    ("C2", ["E3", "G3", "B3", "D4"]),
    ("A2", ["G3", "C#4", "F4", "B4"]),
]
LOFI_TAPE_LEAD = [  # (beat offset, beats, note) for every other bar: a lazy pentatonic answer phrase
    [(1.5, 0.5, "A4"), (2.0, 0.5, "C5"), (2.58, 1.3, "D5")],
    [(0.5, 0.5, "E5"), (1.08, 0.5, "D5"), (1.58, 2.0, "A4")],
]

def lofi_tape(c, q, fps):
    """Tape lo-fi hip-hop bed: FM Rhodes chords (ii-V-I-VI), round sub bass, swung boom-bap drums with a
    dusty bit-crush, a sparse pentatonic lead, vinyl crackle + hiss, wow/flutter, kick side-chain.
    "bpm" (80), "bar0", gains "keys"/"bass"/"drums"/"lead" (0..1), "lp" (Hz) or "lp_auto" [[frame, Hz], ...]
    (absolute frames, e.g. a muffled intro that opens on the first cut), "stop" [frame_a, frame_b]: a tape stop
    (pitch and speed fall to zero, then silence), "duck" side-chain depth (0.3)."""
    bpm = q.get("bpm", 80); beat = 60 / bpm; bar = 4 * beat
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); pad_n = n + 2 * SR
    keys = np.zeros(pad_n); bass = np.zeros(pad_n); drums = np.zeros(pad_n); lead = np.zeros(pad_n)
    def put(buf, sig, t, g):
        i = int(t * SR)
        if 0 <= i < pad_n: m = min(len(sig), pad_n - i); buf[i:i + m] += sig[:m] * g
    def rhodes(f, dur, vel=1.0):
        m = int((dur + 0.25) * SR); t = np.arange(m) / SR
        idx = (1.6 * vel) * np.exp(-t / 0.3) + 0.22
        car = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
        tine = 0.06 * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t / 0.04)
        env = np.minimum(1, t / 0.004) * np.exp(-t / 1.8) * np.clip((dur + 0.25 - t) / 0.25, 0, 1)
        return np.tanh(1.3 * (car + tine) * env * vel) * (1 + 0.08 * np.sin(2 * np.pi * 4.2 * t))
    def sub(f, dur):
        m = int(dur * SR); t = np.arange(m) / SR
        s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)
        return np.tanh(1.4 * s) * np.minimum(1, t / 0.008) * np.exp(-t / 0.9) * np.clip((dur - t) / 0.04, 0, 1)
    def flute(f, dur):
        m = int((dur + 0.15) * SR); t = np.arange(m) / SR
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3)
        s = osc(f * vib, m) + 0.12 * osc(2 * f * vib, m)
        breath = bp(c.noise(m), f * 0.8, min(f * 3, 9000)) * 0.08
        env = np.minimum(1, t / 0.06) * np.clip((dur + 0.15 - t) / 0.15, 0, 1)
        return lp((s + breath) * env, 3200)
    mk = int(0.5 * SR); tk = np.arange(mk) / SR
    kick = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(56 + 95 * np.exp(-tk / 0.035)) / SR) * np.exp(-tk / 0.22))
    kick += lp(c.noise(mk), 3000) * np.exp(-tk / 0.003) * 0.4
    kick = lp(kick, 2600)
    ms = int(0.35 * SR); ts = np.arange(ms) / SR
    snare = (bp(c.noise(ms), 1100, 6500) * np.exp(-ts / 0.09) * 0.8
             + (np.sin(2 * np.pi * 185 * ts) + 0.5 * np.sin(2 * np.pi * 330 * ts)) * np.exp(-ts / 0.05) * 0.6)
    snare = c.reverb(snare, 0.6, 0.2)
    mh = int(0.09 * SR); th = np.arange(mh) / SR
    hat_c = hp(c.noise(mh), 6500) * np.exp(-th / 0.018)
    hat_o = hp(c.noise(int(0.3 * SR)), 6000) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.11)
    gk, gb, gd, gl = q.get("keys", 1.0), q.get("bass", 1.0), q.get("drums", 1.0), q.get("lead", 1.0)
    sw = 0.08 * beat * 4 / 3   # swung offbeat 8ths land ~60/40
    s16 = beat / 4
    kicks = []
    k, t = q.get("bar0", 0), 0.0
    while t < n / SR + bar:
        root, chord = LOFI_TAPE_PROG[k % 4]
        v = 0.9 + 0.1 * c.rng.random()
        for j, nt in enumerate(chord):   # lazy strum on 1, a softer push on the swung "and" of 2
            put(keys, rhodes(_hz(nt), 1.6 * beat, v), t + j * 0.016, 0.19 * gk)
            put(keys, rhodes(_hz(nt), 2.2 * beat, 0.7 * v), t + 1.5 * beat + sw + j * 0.012, 0.11 * gk)
        put(bass, sub(_hz(root), 1.4 * beat), t, 0.42 * gb)
        put(bass, sub(_hz(root), 0.45 * beat), t + 2.5 * beat + sw, 0.32 * gb)
        put(bass, sub(_hz(root) * 1.5, 0.9 * beat), t + 3 * beat, 0.3 * gb)
        for step in range(16):
            ts_ = t + step * s16 + (sw if step % 4 == 2 else 0) + (sw * 0.5 if step % 2 else 0)
            if step in (0, 10) or (step == 7 and k % 2): put(drums, kick, ts_, (0.85 if step != 7 else 0.5) * gd); kicks.append(ts_)
            if step in (4, 12): put(drums, snare, ts_ + 0.012, 0.5 * gd)
            if step == 15 and k % 4 == 3: put(drums, snare, ts_, 0.16 * gd)          # ghost into the turnaround
            if step % 2 == 0: put(drums, hat_o if (step == 14 and k % 2) else hat_c, ts_, (0.16 if step % 4 else 0.22) * gd * (0.85 + 0.3 * c.rng.random()))
        if k % 2 == 1:
            for off, d, nt in LOFI_TAPE_LEAD[(k // 2) % 2]: put(lead, flute(_hz(nt), d * beat), t + off * beat, 0.15 * gl)
        t += bar; k += 1
    # side-chain the music to the kick, dusty-crush the drums
    tt = np.arange(pad_n) / SR; duck = np.ones(pad_n); dd = q.get("duck", 0.3)
    for tk_ in kicks:
        i = int(tk_ * SR)
        if i < pad_n: m = min(int(0.4 * SR), pad_n - i); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - dd * np.exp(-np.arange(m) / SR / 0.13))
    drums = 0.7 * drums + 0.3 * np.round(drums * 64) / 64
    lead = c.reverb(lead, 2.2, 0.35)
    keys = c.reverb(keys, 1.6, 0.18)
    mix = hp((keys + bass + lead) * duck + 0.55 * lp(drums, 8500), 35)
    # wow & flutter + optional tape stop, as a time-warped read of the mix
    wow = 0.0016 * (1 + np.sin(2 * np.pi * 0.55 * tt)) + 0.00025 * np.sin(2 * np.pi * 6.3 * tt)
    pos = tt - wow
    if "stop" in q:
        a = (q["stop"][0] - q["start"]) / fps; b = (q["stop"][1] - q["start"]) / fps; L_ = b - a
        x = np.clip(tt - a, 0, L_)
        warped = a + x - x ** 2 / (2 * L_)            # speed falls linearly from 1 to 0
        pos = np.where(tt < a, pos, warped)
    out = np.interp(pos * SR, np.arange(pad_n), mix)[:n]
    if "stop" in q:
        bi = int((q["stop"][1] - q["start"]) / fps * SR)
        if bi < n: out[bi:] = 0
        ai = int((q["stop"][0] - q["start"]) / fps * SR)
        if ai < bi <= n: out[ai:bi] *= np.linspace(1, 0.2, bi - ai)
    crackle = np.zeros(n)
    for i in c.rng.integers(0, n, int(n / SR * 14)): crackle[i] = c.rng.uniform(-1, 1) * (3 if c.rng.random() < 0.05 else 1)
    out += hp(lp(crackle, 6000), 400) * 0.22 + lp(c.noise(n), 4500) * 0.005
    if "lp_auto" in q: out = _auto_filter(out, _curve(q["lp_auto"], n, q["start"], fps))
    else: out = lp(out, q.get("lp", 7000))
    fi, fo = int(0.03 * SR), int(0.5 * SR)
    out[:fi] *= np.linspace(0, 1, fi)
    if "stop" not in q: out[-fo:] *= np.linspace(1, 0, fo)
    return out

def swoosh(c, q, fps):
    """Cinematic pass-by (start/end): air through a resonant band that rises as it approaches and drops as it
    passes (doppler), with a little low body at the pass. "peak" (0..1, default 0.6) is where it passes,
    "f" the pass frequency (default 2600 Hz) - vary it per cut so a run of transitions doesn't repeat."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    pk = q.get("peak", 0.6); f = q.get("f", 2600)
    prog = np.where(p < pk, (p / pk) ** 2, 1 - 0.65 * (np.maximum(0, p - pk) / (1 - pk)) ** 0.7)
    blocks = prog[::256]
    centre = 350 + (f - 350) * blocks
    band = [[max(60, c_ * 0.55), min(SR / 2 - 200, c_ * 1.6)] for c_ in centre]
    air = _auto_filter(c.noise(n), band, "bandpass")
    env = np.where(p < pk, (p / pk) ** 2.2, np.exp(-(p - pk) / (1 - pk) * 3.2))
    body = osc(90 * np.exp(-np.maximum(0, p - pk) * 3), n) * np.exp(-np.abs(p - pk) * 9) * 0.35
    return c.reverb((air + body) * env, 0.9, 0.22)

def reverse_swell(c, q, fps):
    """A reversed cymbal + Rhodes-chord tail that swells INTO the cut (start/end; it ends hard on "end").
    "notes": chord note names (default Cmaj9) so it can sit in the key of the bed."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); L_ = int(2.2 * SR); t = np.arange(L_) / SR
    cym = bp(c.noise(L_), 3500, 14000) * np.exp(-t / 0.7) * 0.5
    ch = sum(np.sin(2 * np.pi * _hz(nt) * t + 0.8 * np.sin(2 * np.pi * _hz(nt) * t) * np.exp(-t / 0.3)) for nt in q.get("notes", ["E3", "G3", "B3", "D4"]))
    tail = c.reverb((cym + 0.18 * ch * np.exp(-t / 1.1)) * np.minimum(1, t / 0.003), 2.0, 0.6)
    rev = tail[::-1][-n:] if n < L_ else np.concatenate([np.zeros(n - L_), tail[::-1]])
    rev = rev * np.linspace(0, 1, len(rev)) ** 1.5
    rev[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    return rev

def thump(c, q):
    """Soft sub landing for a cut: a round 55 Hz tap, no click. Sits under music without competing with the kick."""
    n = int(0.45 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(q.get("freq", 55) + 40 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.16)
    return lp(np.tanh(1.5 * s) * np.minimum(1, t / 0.004), 400)

# ── house bed + real samples ────────────────────────────────────────────────────────────────────────
def _saw(f, n, harm=28, phase=0.0):
    """Band-limited saw by additive synthesis (no aliasing)."""
    t = np.arange(n) / SR; out = np.zeros(n); K = int(min(harm, (SR / 2 - 500) / max(f, 1)))
    for k in range(1, K + 1): out += np.sin(2 * np.pi * k * f * t + phase * k) / k
    return out * 0.6

HOUSE_PROG = [("A2", ["A3", "C4", "E4", "G4"]), ("F2", ["F3", "A3", "C4", "E4"]), ("C2", ["G3", "C4", "E4", "G4"]), ("G2", ["G3", "B3", "D4", "E4"])]
HOUSE_MIX = {   # layer gains per section
    "intro": {"pad": 1.0, "hat": 0.45, "kick": 0, "clap": 0, "bass": 0, "stab": 0, "ohat": 0},
    "gap":   {"pad": 0.25, "hat": 0, "kick": 0, "clap": 0, "bass": 0, "stab": 0, "ohat": 0},
    "drop":  {"pad": 0.3, "hat": 1.0, "kick": 1.0, "clap": 1.0, "bass": 1.0, "stab": 1.0, "ohat": 1.0},
    "break": {"pad": 1.0, "hat": 0.3, "kick": 0, "clap": 0, "bass": 0.55, "stab": 0.45, "ohat": 0},
    "outro": {"pad": 0.6, "hat": 0.7, "kick": 0.85, "clap": 0.6, "bass": 0.8, "stab": 0.6, "ohat": 0.5},
}
def house(c, q, fps):
    """Tech-house bed built from what that genre is actually made of: 909-style kick, clap, closed/open hats,
    offbeat saw bass, sidechained supersaw stabs and a pad. "sections": [[frame, name], ...] (absolute frames; names in
    HOUSE_MIX: intro, gap, drop, break, outro) switch layers in and out; "lp_auto" [[frame, Hz], ...]; "bpm" (120)."""
    bpm = q.get("bpm", 120); beat = 60 / bpm; s16 = beat / 4; bar = 4 * beat
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); N = n + SR
    L = {k: np.zeros(N) for k in ["pad", "hat", "kick", "clap", "bass", "stab", "ohat"]}
    def put(k, sig, t, g):
        i = int(t * SR)
        if 0 <= i < N: m = min(len(sig), N - i); L[k][i:i + m] += sig[:m] * g
    mk = int(0.42 * SR); tk = np.arange(mk) / SR
    kick = np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-tk / 0.028)) / SR) * np.exp(-tk / 0.2))
    kick += bp(c.noise(mk), 1500, 6000) * np.exp(-tk / 0.004) * 0.35
    mc = int(0.4 * SR); tc = np.arange(mc) / SR; clap = np.zeros(mc)
    for d in (0, 0.011, 0.022): i = int(d * SR); clap[i:] += bp(c.noise(mc - i), 900, 3200) * np.exp(-np.arange(mc - i) / SR / (0.012 if d < 0.02 else 0.12))
    clap = c.reverb(clap * 0.8, 0.9, 0.25)
    mh = int(0.05 * SR); hat = hp(c.noise(mh), 8000) * np.exp(-np.arange(mh) / SR / 0.011)
    mo = int(0.26 * SR); ohat = hp(c.noise(mo), 7000) * np.exp(-np.arange(mo) / SR / 0.08)
    def stab(chord, dur=0.2):
        m = int((dur + 0.15) * SR); t = np.arange(m) / SR
        sig = sum(_saw(_hz(nt) * d, m, 24, ph) for nt in chord for d, ph in ((1, 0), (1.006, 1.3), (0.994, 2.1)))
        sig = _auto_filter(sig, list(700 + 4200 * np.exp(-np.arange(0, m, 256) / SR / 0.07)))
        return sig * np.minimum(1, t / 0.003) * np.exp(-t / 0.16)
    def bassn(f, dur=0.22):
        m = int(dur * SR); t = np.arange(m) / SR
        sig = _auto_filter(_saw(f, m, 20) + 0.6 * np.sin(2 * np.pi * f * t), list(300 + 1400 * np.exp(-np.arange(0, m, 256) / SR / 0.05)))
        return np.tanh(1.6 * sig) * np.minimum(1, t / 0.004) * np.clip((dur - t) / 0.03, 0, 1)
    def padc(chord, dur):
        m = int(dur * SR); t = np.arange(m) / SR
        sig = sum(_saw(_hz(nt) * d, m, 12, ph) for nt in chord for d, ph in ((1, 0), (1.004, 0.7), (0.996, 1.9)))
        return lp(sig, 1500) * np.minimum(1, t / 0.25) * np.clip((dur - t) / 0.2, 0, 1)
    k, t = 0, 0.0
    stabs = [stab(ch) for _, ch in HOUSE_PROG]; basses = [bassn(_hz(r)) for r, _ in HOUSE_PROG]
    while t < n / SR + bar:
        r, ch = HOUSE_PROG[k % 4]
        put("pad", padc(ch, bar + 0.25), t, 0.07)
        for st in range(16):
            ts = t + st * s16 + (0.012 if st % 2 else 0)
            if st % 4 == 0: put("kick", kick, ts, 0.45)
            if st in (4, 12): put("clap", clap, ts, 0.75)
            put("hat", hat, ts, (0.34 if st % 2 == 0 else 0.2) * (0.85 + 0.3 * c.rng.random()))
            if st % 4 == 2: put("ohat", ohat, ts, 0.25); put("bass", basses[k % 4], ts, 0.34)
            if st in (2, 6, 11, 14): put("stab", stabs[k % 4], ts, 0.2)
        t += bar; k += 1
    # section envelopes per layer (25 ms crossfades), then sidechain the tonal layers to the kick
    secs = sorted(q.get("sections", [[q["start"], "drop"]]))
    tt = q["start"] + np.arange(N) / SR * fps
    idx = np.searchsorted([s_[0] for s_ in secs], tt, side="right") - 1
    names = [secs[max(0, i)][1] for i in idx]
    duck = np.ones(N); kd = L["kick"]
    env = np.abs(kd); env = lp(env, 30); env /= env.max() + 1e-9
    duck = 1 - 0.55 * np.clip(env * 1.6, 0, 1)
    out = np.zeros(N); sm = int(0.025 * SR)
    for name in L:
        g = np.array([HOUSE_MIX[nm][name] for nm in names], float)
        g = np.convolve(g, np.ones(sm) / sm, mode="same")
        sig = L[name] * g
        if name in ("pad", "bass", "stab"): sig = sig * duck
        out += sig
    out = hp(out, 30)[:n]
    if "lp_auto" in q: out = _auto_filter(out, _curve(q["lp_auto"], n, q["start"], fps))
    fo = int(0.4 * SR); out[-fo:] *= np.linspace(1, 0, fo)
    return np.tanh(out * 1.2) / 1.2

_SAMPLES = {}
def sample(c, q):
    """A real audio file (wav/mp3/ogg via ffmpeg), mono. "file" path, optional "rate" (pitch/speed, 1 = original),
    "trim" seconds to keep, "lp" Hz."""
    import subprocess
    key = q["file"]
    if key not in _SAMPLES:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", key, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
        _SAMPLES[key] = np.frombuffer(raw, np.float32).astype(float)
    x = _SAMPLES[key]
    r = q.get("rate", 1.0)
    if r != 1.0: x = np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x)
    if "trim" in q: x = x[: int(q["trim"] * SR)]
    if "lp" in q: x = lp(x, q["lp"])
    return x

def _clink(c, f, n_s=0.09, a=1.0):
    """One coin hit: inharmonic metal partials with a very short decay (a clink, not a bell)."""
    n = int(n_s * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * r * t + c.rng.uniform(0, 6)) * w * np.exp(-t / d)
            for r, w, d in [(1, .5, .03), (1.58, .35, .02), (2.31, .25, .012), (3.7, .15, .008)])
    return (s + hp(c.noise(n), 4000) * np.exp(-t / 0.002) * 0.5) * a

def coin_drop(c, q):
    """A coin dropped on a table: a few bounces closing up, then a short spin-out. "freq" ~1800-2600."""
    f = q.get("freq", 2100); n = int(0.75 * SR); out = np.zeros(n)
    t, gap, a = 0.0, 0.16, 1.0
    for _ in range(7):
        k = _clink(c, f * c.rng.uniform(0.97, 1.03), 0.08, a); i = int(t * SR)
        out[i:i + len(k)] += k[: n - i]; t += gap; gap *= 0.62; a *= 0.72
    return lp(out, 9000)

def coins(c, q):
    """A handful of coins landing on a pile: a short burst of clinks. "count" (default 9), "dur" seconds."""
    dur = q.get("dur", 0.45); n = int((dur + 0.15) * SR); out = np.zeros(n)
    for _ in range(q.get("count", 9)):
        t = c.rng.uniform(0, 1) ** 1.8 * dur
        k = _clink(c, c.rng.uniform(1500, 2900), 0.07, c.rng.uniform(0.35, 1.0)); i = int(t * SR)
        out[i:i + len(k)] += k[: n - i]
    return lp(out, 9000) + lp(c.noise(n), 600) * np.exp(-np.arange(n) / SR / 0.05) * 0.3

def cash_riffle(c, q):
    """Bill-counter machine 'brrrt': fast paper flicks over a motor hum. "dur" seconds (default 0.55)."""
    dur = q.get("dur", 0.55); n = int(dur * SR); t = np.arange(n) / SR
    out = lp(np.sin(2 * np.pi * 95 * t) * 0.3 + c.noise(n) * 0.1, 500) * 0.5
    rate = q.get("rate", 42); m = int(0.018 * SR); k = 0.0
    while k < dur - 0.02:
        i = int(k * SR); out[i:i + m] += (bp(c.noise(m), 1500, 7000) * np.exp(-np.arange(m) / SR / 0.004))[: n - i] * c.rng.uniform(0.6, 1)
        k += 1 / rate
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.06)
    return out * env

def graph_tick(c, q):
    """Infographic tick for a bar/point appearing: short pitched click with a soft body. Step "freq" up per bar."""
    n = int(0.08 * SR); t = np.arange(n) / SR; f = q.get("freq", 800)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.018) + hp(c.noise(n), 3000) * np.exp(-t / 0.0015) * 0.4) * np.minimum(1, t / 0.001)

def graph_rise(c, q, fps):
    """Line graph drawing: a filtered tone rising with a tick train that speeds up. start/end, "f0"/"f1"."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); p = np.linspace(0, 1, n)
    f = q.get("f0", 300) * (q.get("f1", 1200) / q.get("f0", 300)) ** (p ** 1.3)
    tone = (osc(f, n) * 0.5 + osc(f * 1.5, n) * 0.15) * np.minimum(1, p / 0.1) * np.minimum(1, (1 - p) / 0.06)
    ticks = np.zeros(n); tt = 0.0
    while tt < n / SR:
        k = graph_tick(c, {"freq": float(f[min(n - 1, int(tt * SR))] * 2)}); i = int(tt * SR)
        ticks[i:i + len(k)] += k[: n - i] * 0.35; tt += 0.11 - 0.07 * (tt / (n / SR))
    return lp(tone, 4000) + ticks

def counter(c, q, fps):
    """Rolling number counter: quick ticks that slow down as the number settles. start/end."""
    n = max(1, int((q["end"] - q["start"]) / fps * SR)); out = np.zeros(n); tt = 0.0
    while tt < n / SR - 0.02:
        k = graph_tick(c, {"freq": 1300}); i = int(tt * SR); out[i:i + len(k)] += k[: n - i] * 0.6
        tt += 0.035 + 0.09 * (tt / (n / SR)) ** 2
    return out

PATTERNS = {  # per 16th-note step in a bar: k=kick s=snare h=hat
    "four-on-floor": ["kh", "", "h", "", "ksh", "", "h", "", "kh", "", "h", "", "ksh", "", "h", ""],
    "half-time":     ["kh", "", "h", "", "h", "", "h", "", "sh", "", "h", "", "h", "", "kh", "h"],
    "trap":          ["kh", "h", "h", "h", "h", "h", "kh", "h", "sh", "h", "h", "kh", "h", "h", "h", "h"],
}

def place(L, R, sig, at_s, gain, pan):
    i = int(at_s * SR)
    if i >= len(L) or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    n = min(len(sig), len(L) - i)
    l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:i+n] += sig[:n] * gain * l; R[i:i+n] += sig[:n] * gain * r

def render(spec, out):
    fps = spec.get("fps", 30); total = spec["duration"]; N = int(total * SR)
    loop = bool(spec.get("loop"))
    tail = int(3.0 * SR) if loop else 0  # loops: let sounds ring past the end, then wrap that onto the start
    c = Ctx(spec.get("seed", 7)); L = np.zeros(N + tail); R = np.zeros(N + tail)
    for q in spec["cues"]:
        if loop: q = {**q, "_period": total}
        typ = q["type"]; g = q.get("gain", 0.5); pan = q.get("pan", 0.0)
        at = q.get("frame", q.get("start", 0)) / fps
        if typ == "beat":
            bpm = q["bpm"]; step = 60 / bpm / 4; pat = PATTERNS[q.get("pattern", "four-on-floor")]
            t, k, end = q.get("start", 0) / fps, 0, q.get("end", total * fps) / fps
            hits = {"k": kick(c, q), "s": snare(c, q), "h": hat(c, q)}
            mix = {"k": 1.0, "s": 0.7, "h": q.get("hats", 0.35)}
            while t < end - 1e-6:
                for ch in pat[k % 16]:
                    place(L, R, hits[ch], t, g * mix[ch], pan + (0.25 if ch == "h" else 0))
                t += step; k += 1
            continue
        if typ == "riser": sig = riser(c, q, fps)
        elif typ == "whoosh": sig = whoosh(c, q, fps)
        elif typ == "pad": sig = pad(c, q, fps, total)
        elif typ == "drone": sig = drone(c, q, fps, total)
        elif typ == "printer": sig = printer(c, q, fps)
        elif typ == "rip": sig = rip(c, q, fps)
        elif typ == "typing": sig = typing(c, q, fps)
        elif typ == "cash_count": sig = cash_count(c, q, fps)
        elif typ == "sweep": sig = sweep(c, q, fps)
        elif typ == "lofi": sig = lofi(c, q, fps)
        elif typ == "graph_rise": sig = graph_rise(c, q, fps)
        elif typ == "counter": sig = counter(c, q, fps)
        elif typ == "pour": sig = pour(c, q, fps)
        elif typ == "swish": sig = swish(c, q, fps)
        elif typ == "lofi_tape": sig = lofi_tape(c, q, fps)
        elif typ == "house": sig = house(c, q, fps)
        elif typ == "sample": sig = sample(c, q)
        elif typ == "swoosh": sig = swoosh(c, q, fps)
        elif typ == "reverse_swell": sig = reverse_swell(c, q, fps)
        else: sig = {"tick": tick, "impact": impact, "chime": chime, "glint": glint, "kick": kick, "snare": snare, "hat": hat,
                   "coin": coin, "register": register, "glitch": glitch, "click": click, "pop": pop,
                   "cash": cash, "blip": blip, "vine_boom": vine_boom, "scratch": scratch, "bass_drop": bass_drop,
                   "stamp": stamp, "buzz": buzz, "sting": sting, "clink": clink, "slap": slap, "coin_drop": coin_drop, "coins": coins, "cash_riffle": cash_riffle,
                   "graph_tick": graph_tick, "thump": thump}[typ](c, q)
        place(L, R, sig, at, g, pan)
    st = np.stack([L, R], 1)
    if loop:  # periodic by construction: whatever rings past the end continues from the start
        st[:tail] += st[N:N + tail]
        st = st[:N]
    else:
        k = int(spec.get("fade_out", 0.7) * SR); st[-k:] *= (np.linspace(1, 0, k) ** 2)[:, None]
    if spec.get("lowpass"):  # warm the whole mix: roll off harsh highs
        st = np.stack([lp(st[:, 0], spec["lowpass"]), lp(st[:, 1], spec["lowpass"])], 1)
    st = np.tanh(st * 1.1)
    peak = np.abs(st).max() or 1
    st *= 10 ** (-1 / 20) / peak
    wavfile.write(out, SR, (st * 32767).astype(np.int16))
    rms = 20 * np.log10(np.sqrt((st ** 2).mean()) + 1e-12)
    print(f"wrote {out}: {total:.2f}s, peak -1.0 dBFS, rms {rms:.1f} dB, {len(spec['cues'])} cues")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cues", nargs="?"); ap.add_argument("out", nargs="?")
    ap.add_argument("--grid", action="store_true"); ap.add_argument("--bpm", type=float, default=120)
    ap.add_argument("--fps", type=float, default=30); ap.add_argument("--bars", type=int, default=4)
    ap.add_argument("--offset", type=int, default=0)
    a = ap.parse_args()
    if a.grid:
        per = a.fps * 60 / a.bpm
        frames = [round(a.offset + i * per) for i in range(a.bars * 4)]
        print(f"{a.bpm:g} BPM @ {a.fps:g} fps = {per:.2f} frames/beat")
        for b in range(a.bars): print(f"bar {b+1}: " + ", ".join(str(x) for x in frames[b*4:(b+1)*4]))
        print("export const BEATS = [" + ", ".join(map(str, frames)) + "];")
        sys.exit(0)
    if not (a.cues and a.out): ap.error("need cues.json and out.wav (or --grid)")
    render(json.load(open(a.cues)), a.out)
