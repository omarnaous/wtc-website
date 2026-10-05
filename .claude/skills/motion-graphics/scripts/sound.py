#!/usr/bin/env python3
"""Synthesize a motion-graphics soundtrack from a cue list.

usage:
  sound.py cues.json out.wav            mix cues into a 48 kHz stereo WAV (normalized to -1 dBFS)
  sound.py --grid --bpm 120 --fps 30 --bars 4 [--offset 0]
                                        print beat frames, for locking cuts/words to the beat

Cue types: tick riser impact chime whoosh pad glint drone kick snare hat beat
           printer coin register rip glitch click pop typing cash cash_count blip sweep,
           and viral-reel hits: vine_boom scratch bass_drop stamp buzz.
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
        else: sig = {"tick": tick, "impact": impact, "chime": chime, "glint": glint, "kick": kick, "snare": snare, "hat": hat,
                   "coin": coin, "register": register, "glitch": glitch, "click": click, "pop": pop,
                   "cash": cash, "blip": blip, "vine_boom": vine_boom, "scratch": scratch, "bass_drop": bass_drop,
                   "stamp": stamp, "buzz": buzz}[typ](c, q)
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
