"""Sound for SleepTips.jsx: a real music bed ("Serene View", Mixkit, Chillout, 78 BPM, unused by other projects) from
its loudest bar, ducked to ~6% whenever the voice-over talks (30% in the gaps) (public/sleepvo.wav, sound/build_sleep_vo.py);
whooshes on every scene change and tip card; a low thump (synthesised) under the big numbers. Timings from src/sleep_vo.json.
Writes public/sleeptips-bed.wav (gitignored), sound/sleeptips.json, sound/sleeptips-sfx.json.
  python3 sound/build_sleeptips_cues.py && python3 <motion-graphics>/scripts/sound.py sound/sleeptips.json public/sleeptips.wav"""
import json, os, re, subprocess, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LIBTOOL = f"{ROOT}/.claude/skills/appify-content/assets/tools/sound_library.py"
LIB = f"{ROOT}/sound-library"
V = json.load(open("src/sleep_vo.json")); S, M = V["scenes"], V["marks"]
SWAP = int(re.search(r"OUTRO_SWAP = (\d+)", open("src/Main.jsx").read()).group(1))
DUR = V["duration"]
MUSIC = "m443"
WH = ["s1492", "s1491", "s1489", "s787", "s1485", "s1493"]
m = {x["id"]: x for x in json.load(open(f"{LIB}/catalog.json"))["music"]}[MUSIC]
sr = 2000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{LIB}/{m['file']}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32) ** 2
bar = 4 * 60 / m["bpm"]; t, best, at = m["first_beat"], -1, 0
while t + DUR / 30 < len(x) / sr - 1:
    e = x[int(t * sr):int((t + DUR / 30) * sr)].mean()
    if e > best: best, at = e, t
    t += bar
subprocess.run([sys.executable, LIBTOOL, "bed", MUSIC, "public/sleeptips-bed.wav", "--dur", f"{DUR / 30:.3f}", "--gain", "0.9", "--start", f"{at:.3f}"], capture_output=True, text=True, check=True)
print("bed:", m["title"], f"from {at:.2f} s, {DUR} frames")
smp = lambda f, frame, g, pan=0.0: {"type": "sample", "file": f, "frame": round(frame), "gain": g, "pan": pan}
sfx = lambda i: f"{LIB}/sfx/{i}.mp3"
thump = lambda frame, g=0.5: {"type": "thump", "frame": round(frame), "gain": g}
# duck the bed under the voice: follow the voice track's loudness (smoothed, with a little look-ahead) so the music sits at
# about 6% while someone is talking and comes back up to 30% in the gaps
import scipy.io.wavfile as wf
def duck_bed(bed, voice, lo=0.06, hi=0.3):
    sr, b = wf.read(bed); b = b.astype(np.float32) / 32768
    vsr, v = wf.read(voice); v = v.astype(np.float32) / 32768
    if v.ndim > 1: v = v.mean(1)
    hop = vsr // 100; n = len(v) // hop
    e = np.sqrt((v[:n * hop].reshape(n, hop) ** 2).mean(1))
    act = (e > 0.02).astype(np.float32)
    act = np.convolve(act, np.ones(40), "same") > 0                     # hold 0.2 s either side of each word
    g = np.where(act, lo, hi).astype(np.float32)
    g = np.convolve(g, np.ones(15) / 15, "same")                        # 150 ms fades
    t = np.arange(len(b)) / sr; gi = np.interp(t, np.arange(n) / 100, g, right=hi)
    wf.write(bed, sr, (np.clip(b * (gi[:, None] if b.ndim > 1 else gi), -1, 1) * 32767).astype(np.int16))
duck_bed("public/sleeptips-bed.wav", "public/sleepvo.wav")
music = [smp(os.path.abspath("public/sleeptips-bed.wav"), 0, 1.0)]
voice = [smp(os.path.abspath("public/sleepvo.wav"), 0, 1.0)]
moves = [S["night"]["start"], S["cut"]["start"], S["tips"]["start"], M["TIP1"] - 18, M["TIP2"] - 18, S["bridge"]["start"]]
fx = [smp(sfx(WH[k % len(WH)]), a - 5, 0.22, (-0.25, 0.25)[k % 2]) for k, a in enumerate(moves)]
fx += [thump(M["FIVE"] + 4, 0.4), thump(M["P18"] - 3, 0.42), thump(M["CORT"] - 3, 0.3), thump(M["TEST"] - 3, 0.3), thump(M["FAT"] - 3, 0.32), thump(M["MUS"] - 3, 0.32)]
fx += [smp(sfx("s1489"), S["outro"]["start"] - 9, 0.28), smp(sfx("s1491"), S["outro"]["start"] + SWAP - 7, 0.24)]
for mus, path in ((True, "sound/sleeptips.json"), (False, "sound/sleeptips-sfx.json")):
    spec = {"fps": 30, "duration": DUR / 30, "seed": 31, "fade_out": 1.2, "peak_db": -2, "cues": (music if mus else []) + voice + fx}
    json.dump(spec, open(path, "w"), indent=1); print(path, len(spec["cues"]), "cues")
used = json.load(open(f"{LIB}/used.json"))
used["darebni-sleep-tips"] = {"music": [MUSIC], "sfx": sorted(set(WH))}
json.dump(used, open(f"{LIB}/used.json", "w"), indent=1)
