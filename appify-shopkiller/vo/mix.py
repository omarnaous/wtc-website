"""Mix voice-over over the synthesized music/SFX with sidechain ducking -> public/sound.wav"""
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
sfx, sr = sf.read("sound/sfx.wav")
vo, vsr = sf.read("vo/vo.wav")
vo = resample_poly(vo, sr, vsr)[: len(sfx)]
vo = np.pad(vo, (0, len(sfx) - len(vo)))
env = uniform_filter1d(np.abs(vo), int(0.25 * sr))           # ~250 ms follower
duck = 1 - 0.45 * np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)   # up to -5 dB under the voice: hits still punch
mix = sfx * duck[:, None] * 0.55 + np.stack([vo, vo], 1) * 1.25  # voice forward, hits sit just under it
mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.8) / np.tanh(1.8); mix *= 10 ** (-1 / 20)  # gentle limiting for loudness
sf.write("public/sound.wav", mix, sr, subtype="PCM_16")
print("mixed", round(len(mix) / sr, 2), "s")
