"""Dev's voice over the bed and effects, the bed ducked under the voice (as in the Subscription Killer reel).
  sound/bts.wav + vo/bts.wav -> public/bts.wav ; sound/bts-sfx.wav + vo/bts.wav -> public/bts-sfx.wav"""
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
vo, vsr = sf.read("vo/bts.wav")
for src, out in (("sound/bts.wav", "public/bts.wav"), ("sound/bts-sfx.wav", "public/bts-sfx.wav")):
    sfx, sr = sf.read(src)
    v = resample_poly(vo, sr, vsr)[: len(sfx)]; v = np.pad(v, (0, len(sfx) - len(v)))
    env = uniform_filter1d(np.abs(v), int(0.25 * sr))
    duck = 1 - 0.6 * np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
    mix = sfx * duck[:, None] * 0.55 + np.stack([v, v], 1) * 1.25
    mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.8) / np.tanh(1.8); mix *= 10 ** (-1.5 / 20)
    sf.write(out, mix, sr, subtype="PCM_16"); print("mixed", out, round(len(mix) / sr, 2), "s")
