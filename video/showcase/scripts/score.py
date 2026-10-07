"""Soundtrack for the Appify showcase Reel (15 s): soft deep house + UI foley.
Reuses the instruments and foley from ../launch/scripts/score.py.
    python3 scripts/score.py public/sound.wav
"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, "../../launch/scripts/score.py")).read().split("# ───────────────────────── arrangement")[0]
exec(src)

DUR = 15.0; N = int(DUR * SR)
fol = Bus()
# ── lo-fi bed from the motion-graphics skill (sound.py): EP chords, round bass, swung drums, vinyl
import importlib.util
spec = importlib.util.spec_from_file_location("mgsound", os.path.join(here, "../../launch/scripts/sound.py"))
mg = importlib.util.module_from_spec(spec); spec.loader.exec_module(mg)
c = mg.Ctx(11)
full = mg.lofi(c, {"start": 0, "end": 450, "bpm": 90, "lp": 5200, "drums": 1.0, "keys": 1.0, "bass": 1.0}, 30)
muff = mg.lofi(mg.Ctx(11), {"start": 0, "end": 450, "bpm": 90, "lp": 900, "drums": 1.0, "keys": 1.0, "bass": 1.0}, 30)
nobeat = mg.lofi(mg.Ctx(11), {"start": 0, "end": 450, "bpm": 90, "lp": 5200, "drums": 0.0, "keys": 1.0, "bass": 0.6}, 30)
n = min(len(full), N); tt = np.arange(n) / SR
k_open = np.interp(tt, [0, f(60), f(76), 99], [0, 0, 1, 1])            # muffled on the hero, opens as the page moves
k_drop = np.interp(tt, [0, f(370), f(376), f(392), f(398), 99], [0, 0, 1, 1, 0, 0])  # drums out under the end-card hit
bed = muff[:n] * (1 - k_open) + full[:n] * k_open
bed = bed * (1 - k_drop) + nobeat[:n] * k_drop
groove = np.zeros((N, 2)); groove[:n, 0] = bed; groove[:n, 1] = np.roll(bed, int(0.012 * SR))  # a touch of width

def pop():
    n = int(0.09 * SR); t_ = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(300 + 700 * np.exp(-t_ / 0.012)) / SR) * env(n, 0.03)

# captions: a soft pop per line, a glint when the highlight sweeps
from_lines = [(-12, 2), (74, 2), (168, 2), (248, 2), (328, 2)]
for fr, n in from_lines:
    for i in range(n):
        at = f(fr + i * 6)
        if at >= 0: fol.put(pop(), at, 0.35, pan=-0.2 + i * 0.4)
    fol.put(reverb(bell(88, 0.25, 0.5), 1.0, 0.4), max(0, f(fr + 15)), 0.12, pan=0.3)
# scrolls: a soft swish each time the page moves
for a, b in ((66, 84), (160, 178), (240, 258), (320, 338)):
    fol.put(air(f(b) - f(a) + 0.15, 1.1), f(a), 0.55)
    fol.put(tick(3000, 0.6), f(b), 0.2)
# clicks
for h in (92, 104, 116, 128, 140, 150): fol.put(pop(), f(h), 0.3, pan=0.2); fol.put(air(0.25, 0.7), f(h), 0.3, pan=-0.3)  # hover a mission
fol.put(ratchet(f(234) - f(190), 26, 10), f(190), 0.35, pan=0.2)   # dragging the orbit
fol.put(reverb(bell(76, 0.4, 1.2), 1.6, 0.4), f(204), 0.16)        # the count lands
for s_ in (266, 280, 294, 306): fol.put(mouse(), f(s_), 0.5, pan=0.15); fol.put(velcro(0.22), f(s_) + 0.01, 0.5, pan=0.25)
fol.put(mouse(), f(362), 0.7, pan=0.15); fol.put(ping(2637), f(364), 0.14, pan=0.25)
# end card
fol.put(air(0.7, 1.2), f(370), 0.5)
fol.put(clack(), f(382), 0.8)
for i, m in enumerate((72, 79, 84)): fol.put(reverb(bell(m, 0.45, 1.4), 2.0, 0.4), f(381) + i * 0.08, 0.2, pan=(-0.3, 0, 0.3)[i])
for i in range(3): fol.put(pop(), f(398 + i * 4), 0.3, pan=-0.3 + i * 0.3)
fol.put(mouse(), f(412), 0.4); fol.put(reverb(bell(91, 0.3, 0.7), 1.2, 0.4), f(413), 0.12)

mix = groove * 1.0 + fol.st()[:N] * 0.8
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(0.8 * SR); mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]
mix = np.tanh(mix * 0.9)
mix *= 10 ** (-17 / 20) / np.sqrt((mix ** 2).mean())
pk = np.abs(mix).max()
if pk > 10 ** (-1 / 20): mix *= 10 ** (-1 / 20) / pk
out = sys.argv[1] if len(sys.argv) > 1 else "public/sound.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f"wrote {out}: {DUR}s rms {20*np.log10(np.sqrt((mix**2).mean())):.1f} dB")
