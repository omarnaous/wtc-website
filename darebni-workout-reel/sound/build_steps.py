"""Voices for the 10,000-steps cartoon (StepsToon.jsx), the creatine-story engine (build_myths60.py): edge-tts Multilingual neural voices (Brian = Karim, Andrew = Sam),
Each line is spoken by a Microsoft neural voice via edge-tts (through the agent proxy): Karim = en-US-BrianNeural
(faster, a touch higher), Sami = en-US-AndrewNeural (calm). The script below is the user's, lightly trimmed for speech;
facts: the manpo-kei pedometer (1965, the name means 10,000-step meter; the kanji 万 looks like a walking man) and
Ding et al., Lancet Public Health 2025 (57 studies: 7,000 vs 2,000 steps/day, 47% lower all-cause mortality; 10,000 only a little more).
Outputs public/myths/<id>.mp3 (gitignored) and src/myths.json: per-line start frame, duration, caption chunks,
keyword marks (frames) and a per-frame mouth-open envelope for lip sync.
  python3 sound/build_myths.py"""
import json, os, re, subprocess
import numpy as np
FPS = 30
VOICE = {"K": ("en-US-BrianMultilingualNeural", "+14%", "+3Hz"), "S": ("en-US-AndrewMultilingualNeural", "+11%", "-2Hz")}
# 45 s cut of the user's script: hook, three myths, the proof, the dose, the sign-off. Conversational wording.
SCRIPT = [
 ("hook", "K", "panic", "K", "Midnight! 9,800 steps! No 10,000, today doesn't count!", {"9,800": "count", "10,000": "goal"}, "midnight"),
 ("hook", "S", "laugh", "S", "Bro. Who said you need 10,000?", {}, "midnight"),
 ("hook", "K", "excited", "K", "Everybody! It's science!", {}, None),
 ("origin", "S", "explain", "two", "Nope. It came from a 1965 Japanese pedometer called manpo-kei. Literally: ten thousand step meter.", {"1965": "year", "manpo": "box", "ten thousand": "meaning"}, "origin"),
 ("origin", "S", "smirk", "two", "They picked it because it sounded good. And the symbol looks like a man walking!", {"symbol": "kanji", "walking": "walker"}, "origin"),
 ("origin", "K", "shock", "K", "So my whole life is a marketing slogan?!", {}, "origin"),
 ("science", "S", "explain", "two", "Pretty much. 57 studies, 2025: 7,000 steps a day, linked to 47 percent lower risk of death than 2,000.", {"57": "studies", "7,000": "seven", "47": "drop"}, "curve"),
 ("science", "K", "confused", "K", "And 10,000?", {"10,000": "ten"}, "curve"),
 ("science", "S", "calm", "two", "A little better. But most of the benefit is there by 7,000.", {"most": "flat"}, "curve"),
 ("end", "K", "happy", "K", "So I can go to bed?", {}, "bed"),
 ("end", "S", "laugh", "S", "Go to bed. Sleep builds muscle too.", {"Sleep": "zzz"}, "bed"),
 ("finale", "B", "happy", "two", "Walk smart. Train smarter!", {}, None),
 ("finale", "K", "excited", "K", "Follow for more science and workouts!", {"Follow": "follow"}, None),
 ("finale", "S", "happy", "two", "And download Darebni AI.", {"download": "download"}, None),
]
TITLES = {"origin": ("Flashback", "Japan, 1965"), "science": ("The science", "What the studies say")}
HOLDS = {}
HOLD_LEN = 0
TITLE_LEN, GAP, LEAD, END_LEN = 24, 3, 10, 40
env = dict(os.environ, SSL_CERT_FILE="/root/.ccr/ca-bundle.crt")

def tts(spk, text, path):
    v, rate, pitch = VOICE[spk]
    clean = re.sub(r"[^\w\s.,!?'%-]", "", text)
    if os.path.exists(path) and os.path.getsize(path) > 1000: return
    for _ in range(6):
        r = subprocess.run(["edge-tts", "--proxy", os.environ["HTTPS_PROXY"], "--voice", v, f"--rate={rate}", f"--pitch={pitch}", "--text", clean, "--write-media", path], env=env, capture_output=True, text=True)
        if r.returncode == 0 and os.path.getsize(path) > 1000: return
    raise SystemExit(f"no audio: {text}")

def pcm(path, sr=24000):
    """decode and trim the voice's leading/trailing silence (edge-tts pads ~0.1 s head, ~0.6 s tail); writes a .wav beside it"""
    import scipy.io.wavfile as wf
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,aecho=0.85:0.6:24|41:0.12|0.07,volume=1.1",
                                      "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    loud = np.where(np.abs(x) > 0.012)[0]
    a, b = max(0, loud[0] - int(0.03 * sr)), min(len(x), loud[-1] + int(0.12 * sr))
    x = x[a:b].copy()
    wf.write(path.replace(".mp3", ".wav"), sr, (x * 32767).astype(np.int16))
    return x, sr

def envelope(x, sr):
    hop = sr // FPS; n = len(x) // hop
    e = np.sqrt(np.add.reduceat(x[:n * hop] ** 2, np.arange(0, n * hop, hop)) / hop)
    e = e / (np.percentile(e, 95) + 1e-6)
    e = np.clip((e - 0.12) / 0.88, 0, 1)
    sm = np.convolve(e, [0.25, 0.5, 0.25], "same")
    return [round(float(v), 2) for v in sm]

def chunks(text, dur_f):
    words = text.split(); out, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 5 or re.search(r"[.!?,]$", w) and len(cur) >= 2:
            out.append(" ".join(cur)); cur = []
    if cur: out.append(" ".join(cur))
    weights = [len(c) + (6 if re.search(r"[.!?]$", c) else 2) for c in out]
    tot, t, res = sum(weights), 0, []
    for c, w in zip(out, weights):
        res.append({"t": round(t), "text": c}); t += dur_f * w / tot
    return res

lines, t, scene = [], 12, None
scenes = {}
for i, (sc, spk, expr, cam, text, marks, ins) in enumerate(SCRIPT):
    if sc != scene:
        if sc in TITLES: scenes[sc] = {"title": t, **dict(zip(("tag", "name"), TITLES[sc]))}; t += TITLE_LEN
        else: scenes[sc] = {"title": None}
        scenes[sc]["start"] = t; scene = sc
    paths = [f"public/steps/l{i:02d}{s}.mp3" for s in (("K", "S") if spk == "B" else (spk,))]
    for p, s in zip(paths, ("K", "S") if spk == "B" else (spk,)): tts(s, text, p)
    xs = [pcm(p) for p in paths]
    n = max(len(x) for x, _ in xs); sr = xs[0][1]
    mix = sum(np.pad(x, (0, n - len(x))) for x, _ in xs)
    dur = n / sr; dur_f = round(dur * FPS)
    mk = {}
    for kw, name in marks.items():
        j = text.find(kw)
        if j >= 0: mk[name] = round(dur_f * j / len(text))
    lines.append({"i": i, "scene": sc, "spk": spk, "expr": expr, "cam": cam, "text": text, "at": t, "dur": dur_f,
                  "files": [p.replace("public/", "").replace(".mp3", ".wav") for p in paths], "chunks": chunks(text, dur_f), "marks": mk, "insert": ins, "mouth": envelope(mix, sr)})
    print(f"{t:5d} {spk} {dur:5.2f}s {text}")
    t += dur_f + GAP
    if i in HOLDS:
        who, name, role = HOLDS[i]
        lines[-1]["hold"] = {"at": t - GAP + 2, "len": HOLD_LEN, "who": who, "name": name, "role": role}
        t += HOLD_LEN
for sc in scenes: scenes[sc]["end"] = None
keys = list(scenes)
for a, b in zip(keys, keys[1:]): scenes[a]["end"] = scenes[b]["title"] or scenes[b]["start"]
scenes[keys[-1]]["end"] = t
END = t + 6
json.dump({"FPS": FPS, "lines": lines, "scenes": scenes, "END": END, "DURATION": END + END_LEN}, open("src/steps.json", "w"))
print("total", END + END_LEN, "frames =", round((END + END_LEN) / FPS, 1), "s")
