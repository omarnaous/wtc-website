"""Voice over music + foley, the bed ducked under the voice -> public/sound.wav"""
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
sfx, sr = sf.read("sound/sfx.wav")
vo, vsr = sf.read("vo/vo.wav"); vo = resample_poly(vo, sr, vsr)[: len(sfx)]; vo = np.pad(vo, (0, len(sfx) - len(vo)))
env = uniform_filter1d(np.abs(vo), int(0.2 * sr)); lvl = np.clip(env / (np.percentile(env, 97) + 1e-9), 0, 1)
mix = sfx * (1 - 0.55 * lvl)[:, None] * 0.6 + np.stack([vo, vo], 1) * 1.1
mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.6) / np.tanh(1.6); mix *= 10 ** (-2.5 / 20)
sf.write("public/sound.wav", mix, sr, subtype="PCM_16"); print("mixed", round(len(mix) / sr, 2), "s")
