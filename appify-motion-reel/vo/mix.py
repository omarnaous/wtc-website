"""Mix: the WTC film's own soundtrack (from T.show) + reel sounds + voice-over, music ducked under the voice
-> public/sound.wav"""
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
import json
A = json.load(open("src/vo.json"))["anchors"]
SHOW, CONV = A["show"] / 30, A["conv"] / 30          # film starts / gets cut for the conversion beat
sfx, sr = sf.read("sound/sfx.wav")
CUT = A.get("cut", [[0, 25]])
src, fsr = sf.read("sound/wtc.wav")              # the film's soundtrack at real speed, with the same cut as the picture
xf = int(0.12 * fsr); parts = [src[int(a * fsr):int(b * fsr)] for a, b in CUT]
film = parts[0]
for p in parts[1:]:                              # 120 ms crossfade across the cut so there's no click
    ramp = np.linspace(0, 1, xf)[:, None]
    film = np.concatenate([film[:-xf], film[-xf:] * (1 - ramp) + p[:xf] * ramp, p[xf:]])
if fsr != sr: film = resample_poly(film, sr, fsr)
bed = np.zeros_like(sfx); i = int(SHOW * sr); bed[i:i + len(film)] = film[: len(bed) - i]
c, fo = int(CONV * sr), int(0.35 * sr); bed[c:c + fo] *= np.linspace(1, 0, fo)[:, None]; bed[c + fo:] = 0  # fade the film out at the cut
vo, vsr = sf.read("vo/vo.wav")
vo = resample_poly(vo, sr, vsr)[: len(sfx)]; vo = np.pad(vo, (0, len(sfx) - len(vo)))
env = uniform_filter1d(np.abs(vo), int(0.25 * sr))
lvl = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
film_duck = 1 - 0.84 * lvl                             # full level in the silences (the sound is part of the product), ~-16 dB under the voice
sfx_duck = 1 - 0.6 * lvl                               # the bed sits ~-8 dB under the voice, as in Subscription Killer
FILM_GAIN = 1.25                                        # the film's soundtrack plays under the voice (lo-fi bed only before and after it)
mix = bed * film_duck[:, None] * FILM_GAIN + sfx * sfx_duck[:, None] * 0.45 + np.stack([vo, vo], 1) * 1.25
mix = mix / np.abs(mix).max(); mix = np.tanh(mix * 1.8) / np.tanh(1.8); mix *= 10 ** (-4 / 20)   # 4 dB headroom: the film's transients overshoot ~3 dB in the AAC encode
sf.write("public/sound.wav", mix, sr, subtype="PCM_16")
print("mixed", round(len(mix) / sr, 2), "s")
