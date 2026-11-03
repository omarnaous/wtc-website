"""60 s cut (MythsMascot60.jsx; 45 s cut kept separately) of the creatine myths story (MythsMascot45.jsx): voices via edge-tts Multilingual neural voices (Brian = Karim, Andrew = Sami),
Each line is spoken by a Microsoft neural voice via edge-tts (through the agent proxy): Karim = en-US-BrianNeural
(faster, a touch higher), Sami = en-US-AndrewNeural (calm). The script below is the user's, lightly trimmed for speech;
the reps line says "14 percent more" (than placebo) because that is what Rawson & Volek 2003 reported.
Outputs public/myths/<id>.mp3 (gitignored) and src/myths.json: per-line start frame, duration, caption chunks,
keyword marks (frames) and a per-frame mouth-open envelope for lip sync.
  python3 sound/build_myths.py"""
import json, os, re, subprocess
import numpy as np
FPS = 30
VOICE = {"K": ("en-US-BrianMultilingualNeural", "+6%", "+3Hz"), "S": ("en-US-AndrewMultilingualNeural", "+2%", "-2Hz")}
# 45 s cut of the user's script: hook, three myths, the proof, the dose, the sign-off. Conversational wording.
SCRIPT = [
 ("hook", "K", "panic", "K", "Bro, I'm done with creatine! It makes you bald, wrecks your kidneys, and makes you fat!", {"bald": "bald", "kidneys": "kidney", "fat!": "weight"}, "claims"),
 ("hook", "S", "laugh", "S", "Haha, who told you that? TikTok?", {"TikTok": "degree"}, "degree"),
 ("m1", "S", "explain", "two", "The bald thing? One small 2009 study. It measured a hormone, never hair.", {"2009": "paper", "never": "stamp"}, "paper"),
 ("m1", "K", "shock", "K", "Wait, so creatine isn't secretly a barber?", {"barber": "barber"}, "barber"),
 ("m2", "S", "explain", "two", "Kidneys? In healthy people, experts found it safe, even long term.", {"experts": "issn"}, "kidneys"),
 ("m3", "K", "confused", "K", "Okay, but why did the scale go up?", {"scale": "scale"}, "scale"),
 ("m3", "S", "smirk", "two", "That's water in your muscles, bro. Not fat.", {"water": "water", "fat": "fat"}, "cell"),
 ("truth", "S", "explain", "two", "And it works. In 22 studies, strength went up 20 percent, versus 12 without it.", {"22": "studies", "20": "bars"}, "strength"),
 ("truth", "K", "excited", "K", "No way! How much do I take?", {}, None),
 ("truth", "S", "calm", "two", "Three to five grams a day. That's it.", {"Three": "scoop"}, "scoop"),
 ("truth", "S", "excited", "two", "Bonus: in a 2024 study, one high dose even helped people think on no sleep.", {"Bonus": "brain", "2024": "study"}, "brain"),
 ("verdict", "S", "explain", "two", "The pros: stronger lifts, more reps, and safe for healthy people.", {"stronger": "p1", "reps": "p2", "safe": "p3"}, "verdict"),
 ("verdict", "K", "suspicious", "K", "And the cons?", {}, "verdict"),
 ("verdict", "S", "calm", "two", "A bit of water weight, it can flag a blood test, and results vary.", {"water": "c1", "blood": "c2", "results": "c3"}, "verdict"),
 ("verdict", "B", "happy", "two", "Train smart. Stay informed!", {}, None),
 ("verdict", "K", "excited", "K", "Follow us for more tips, tricks and workouts!", {"Follow": "follow"}, None),
 ("verdict", "S", "happy", "two", "And download Darebni AI.", {"download": "download"}, None),
]
TITLES = {"m1": ("Myth #1", "It makes you bald"), "m2": ("Myth #2", "It wrecks your kidneys"), "m3": ("Myth #3", "It makes you fat")}
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
    paths = [f"public/myths60/l{i:02d}{s}.mp3" for s in (("K", "S") if spk == "B" else (spk,))]
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
json.dump({"FPS": FPS, "lines": lines, "scenes": scenes, "END": END, "DURATION": END + END_LEN}, open("src/myths60.json", "w"))
print("total", END + END_LEN, "frames =", round((END + END_LEN) / FPS, 1), "s")
