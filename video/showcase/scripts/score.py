"""Soundtrack for the Appify showcase Reel (15 s): soft deep house + UI foley.
Reuses the instruments and foley from ../launch/scripts/score.py.
    python3 scripts/score.py public/sound.wav
"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, "../../launch/scripts/score.py")).read().split("# ───────────────────────── arrangement")[0]
exec(src)

DUR = 15.0; N = int(DUR * SR)
music, fol = Bus(), Bus()
drums, keysb, bassb, padb = Bus(), Bus(), Bus(), Bus()
CHORDS = [([57, 60, 64, 67, 71], 45), ([53, 57, 60, 64, 67], 41), ([48, 52, 55, 59, 62], 36), ([55, 59, 62, 64, 69], 43)]
END = DUR - 0.1
t, bar = 0.0, 0
while t < END - 1e-6:
    ch, root = CHORDS[bar % 4]
    padb.put(pad(ch, BAR + 0.4), t, 0.55)
    for s in (2, 6, 11, 14):
        st = t + s * STEP
        if st < END: keysb.put(keys([m + 12 * (s == 11) for m in ch[1:4]], 0.9), st, 0.5, pan=0.15 if s % 2 else -0.15)
    for s in (0, 3, 6, 10, 14):
        bt = t + s * STEP
        if bt < END and bar >= 1: bassb.put(bass(root - 12 + (12 if s == 10 else 0), STEP * 1.6), bt, 0.42)
    for s in range(16):
        dt = t + s * STEP
        if dt >= END: break
        if bar >= 1 and s % 4 == 0: drums.put(kick(), dt, 0.6)
        if bar >= 1 and s in (4, 12): drums.put(clap(), dt, 0.3)
        if s % 4 == 2: drums.put(hat(True), dt, 0.25, pan=0.3)
        drums.put(shaker(), dt + (STEP * 0.12 if s % 2 else 0), 0.2 if s % 2 else 0.1, pan=-0.35)
    t += BAR; bar += 1
groove = drums.st() * 0.9 + bassb.st() * 0.9 + keysb.st() * 0.8 + padb.st() * 0.9
# end card: drums drop for one beat, then back for the logo
tt = np.arange(N) / SR
g = np.interp(tt, [0, f(370), f(372), f(380), f(382), 99], [1, 1, 0.35, 0.35, 1, 1])[:, None]
groove = groove * g

def pop():
    n = int(0.09 * SR); t_ = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(300 + 700 * np.exp(-t_ / 0.012)) / SR) * env(n, 0.03)

# captions: a soft pop per line, a glint when the highlight sweeps
from_lines = [(-12, 2), (74, 2), (166, 2), (246, 2), (326, 2)]
for fr, n in from_lines:
    for i in range(n):
        at = f(fr + i * 6)
        if at >= 0: fol.put(pop(), at, 0.35, pan=-0.2 + i * 0.4)
    fol.put(reverb(bell(88, 0.25, 0.5), 1.0, 0.4), max(0, f(fr + 15)), 0.12, pan=0.3)
# scrolls: a soft swish each time the page moves
for a, b in ((66, 86), (160, 178), (240, 258), (320, 338)):
    fol.put(air(f(b) - f(a) + 0.15, 1.1), f(a), 0.55)
    fol.put(tick(3000, 0.6), f(b), 0.2)
# clicks
fol.put(air(f(158) - f(88), 0.7), f(88), 0.45, pan=-0.2)   # the rail runs sideways
fol.put(air(0.9, 0.9), f(168), 0.4); fol.put(reverb(bell(76, 0.4, 1.2), 1.6, 0.4), f(176), 0.16)  # the dial opens
for c in (360,): fol.put(mouse(), f(c), 0.7, pan=0.15)
fol.put(ping(2637), f(362), 0.14, pan=0.25)
for s in (262, 278, 292, 306):
    fol.put(mouse(), f(s), 0.5, pan=0.15); fol.put(velcro(0.22), f(s) + 0.01, 0.55, pan=0.25)
# end card
fol.put(air(0.7, 1.2), f(368), 0.5)
fol.put(clack(), f(380), 0.8)
for i, m in enumerate((72, 79, 84)): fol.put(reverb(bell(m, 0.45, 1.4), 2.0, 0.4), f(381) + i * 0.08, 0.2, pan=(-0.3, 0, 0.3)[i])
for i in range(3): fol.put(pop(), f(398 + i * 4), 0.3, pan=-0.3 + i * 0.3)
fol.put(mouse(), f(412), 0.4); fol.put(reverb(bell(91, 0.3, 0.7), 1.2, 0.4), f(413), 0.12)

mix = groove * 0.6 + fol.st()[:N] * 0.9
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(0.8 * SR); mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]
mix = np.tanh(mix * 0.9)
mix *= 10 ** (-17 / 20) / np.sqrt((mix ** 2).mean())
pk = np.abs(mix).max()
if pk > 10 ** (-1 / 20): mix *= 10 ** (-1 / 20) / pk
out = sys.argv[1] if len(sys.argv) > 1 else "public/sound.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f"wrote {out}: {DUR}s rms {20*np.log10(np.sqrt((mix**2).mean())):.1f} dB")
