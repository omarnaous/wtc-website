"""Dev's voice over the bed and effects, the bed ducked under the voice (as in the Subscription Killer reel).
  python3 sound/bts_mix.py [bts-v2]:  sound/<name>.wav + vo/<name>.wav -> public/<name>.wav (and -sfx)"""
import sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
NAME = sys.argv[1] if len(sys.argv) > 1 else "bts"     # V2: bts-v2
vo, vsr = sf.read(f"vo/{NAME}.wav")
for src, out in ((f"sound/{NAME}.wav", f"public/{NAME}.wav"), (f"sound/{NAME}-sfx.wav", f"public/{NAME}-sfx.wav")):
    sfx, sr = sf.read(src)
    v = resample_poly(vo, sr, vsr)[: len(sfx)]; v = np.pad(v, (0, len(sfx) - len(v)))
    env = uniform_filter1d(np.abs(v), int(0.25 * sr))
    duck = 1 - 0.6 * np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
    mix = sfx * duck[:, None] * 0.55 + np.stack([v, v], 1) * 1.25
    mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.8) / np.tanh(1.8); mix *= 10 ** (-1.5 / 20)
    sf.write(out, mix, sr, subtype="PCM_16"); print("mixed", out, round(len(mix) / sr, 2), "s")
