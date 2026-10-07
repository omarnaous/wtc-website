"""Mix: the WTC film's own soundtrack (from T.show) + reel sounds + voice-over, music ducked under the voice
-> public/sound.wav"""
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
import json
A = json.load(open("src/vo.json"))["anchors"]
SHOW, CONV = A["show"] / 30, A["conv"] / 30          # film starts / gets cut for the conversion beat
sfx, sr = sf.read("sound/sfx.wav")
film, fsr = sf.read("sound/wtc.wav")
if fsr != sr: film = resample_poly(film, sr, fsr)
bed = np.zeros_like(sfx); i = int(SHOW * sr); bed[i:i + len(film)] = film[: len(bed) - i]
c, fo = int(CONV * sr), int(0.35 * sr); bed[c:c + fo] *= np.linspace(1, 0, fo)[:, None]; bed[c + fo:] = 0  # fade the film out at the cut
vo, vsr = sf.read("vo/vo.wav")
vo = resample_poly(vo, sr, vsr)[: len(sfx)]; vo = np.pad(vo, (0, len(sfx) - len(vo)))
env = uniform_filter1d(np.abs(vo), int(0.25 * sr))
lvl = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
film_duck = 1 - 0.7 * lvl                              # the film's music dips ~-10 dB under the voice
sfx_duck = 1 - 0.5 * lvl
mix = bed * film_duck[:, None] * 0.55 + sfx * sfx_duck[:, None] * 0.5 + np.stack([vo, vo], 1) * 1.25
mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.8) / np.tanh(1.8); mix *= 10 ** (-1 / 20)
sf.write("public/sound.wav", mix, sr, subtype="PCM_16")
print("mixed", round(len(mix) / sr, 2), "s")
