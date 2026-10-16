"""Match loudness across the four Stories (they play back to back): scale each mix to the same RMS,
music mixes to -18.5 dB and effects-only mixes to -22.5 dB, never letting a peak pass -1 dBFS.
  python3 sound/level.py public/*.wav"""
import sys, numpy as np
from scipy.io import wavfile
for path in sys.argv[1:]:
    sr, x = wavfile.read(path); f = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 1.0)
    target = -22.5 if path.endswith("-sfx.wav") else -18.5
    rms = 20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-12)
    g = 10 ** ((target - rms) / 20); g = min(g, 10 ** (-1 / 20) / (np.max(np.abs(f)) + 1e-12))
    y = f * g
    wavfile.write(path, sr, (np.clip(y, -1, 1) * 32767).astype(np.int16) if x.dtype == np.int16 else y.astype(x.dtype))
    print(f"{path}: rms {rms:.1f} -> {20*np.log10(np.sqrt(np.mean(y**2))):.1f} dB, peak {20*np.log10(np.max(np.abs(y))):.1f} dBFS")
