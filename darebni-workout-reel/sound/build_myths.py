"""Voices, timing and lip-sync for MythsCartoon.jsx ("Creatine: Facts vs Myths", Karim vs Sami).
Each line is spoken by a Microsoft neural voice via edge-tts (through the agent proxy): Karim = en-US-BrianNeural
(faster, a touch higher), Sami = en-US-AndrewNeural (calm). The script below is the user's, lightly trimmed for speech;
the reps line says "14 percent more" (than placebo) because that is what Rawson & Volek 2003 reported.
Outputs public/myths/<id>.mp3 (gitignored) and src/myths.json: per-line start frame, duration, caption chunks,
keyword marks (frames) and a per-frame mouth-open envelope for lip sync.
  python3 sound/build_myths.py"""
import json, os, re, subprocess
import numpy as np
FPS = 30
VOICE = {"K": ("en-US-BrianNeural", "+24%", "+6Hz"), "S": ("en-US-AndrewNeural", "+16%", "+0Hz")}
# scene, speaker, expression, camera, text, marks (keyword -> name), insert
SCRIPT = [
 ("hook", "K", "panic", "K", "Bro, I'm never touching creatine again!", {}, None),
 ("hook", "S", "smirk", "S", "What happened? Did it break your PR?", {}, None),
 ("hook", "K", "panic", "freeze", "Worse! I heard it makes you bald, damages your kidneys, and makes you gain weight!", {"bald": "bald", "kidneys": "kidney", "weight!": "weight"}, "claims"),
 ("hook", "S", "laugh", "S", "Bro, who gave you your science degree? TikTok?", {"degree": "degree"}, "degree"),
 ("m1", "K", "confused", "K", "Okay, but does it actually make you stronger?", {}, None),
 ("m1", "S", "explain", "two", "Absolutely. A review of 22 studies: strength went up 20 percent with creatine, versus 12 percent with placebo.", {"22": "studies", "20": "bars"}, "strength"),
 ("m1", "S", "explain", "two", "And reps at the same weight improved 14 percent more.", {"14": "reps"}, "reps"),
 ("m1", "K", "shock", "K", "So you're telling me my supplements aren't just expensive flavored water?", {"water": "water"}, "shaker"),
 ("m2", "K", "suspicious", "K", "Fine. But it destroys your kidneys, right?", {}, None),
 ("m2", "S", "explain", "two", "Not in healthy people. The International Society of Sports Nutrition found it safe and well tolerated, even long term.", {"International": "issn"}, "kidneys"),
 ("m2", "K", "happy", "K", "So my kidneys can relax?", {"relax": "relax"}, "beach"),
 ("m2", "S", "calm", "S", "If you're healthy, generally yes. Got a medical condition? Ask your doctor.", {"medical": "doctor"}, "doctor"),
 ("m3", "K", "worried", "K", "What about going bald?", {}, None),
 ("m3", "S", "explain", "two", "That myth comes from one small 2009 rugby study that found higher DHT.", {"2009": "paper"}, "paper"),
 ("m3", "S", "smirk", "two", "But here's the catch. It never measured hair loss. And higher DHT doesn't mean you're going bald.", {"never": "stamp"}, "paper"),
 ("m3", "K", "shock", "K", "So creatine isn't secretly a barber?", {"barber": "barber"}, "barber"),
 ("m4", "K", "smug", "K", "Okay, tell me something I don't know.", {}, None),
 ("m4", "S", "excited", "two", "It might even help your brain! In a 2024 study, one high dose partly improved thinking on no sleep.", {"brain": "brain", "2024": "study"}, "brain"),
 ("m4", "K", "shock", "K", "Wait. So it works for my brain AND my muscles?", {"muscles": "flex"}, "brain"),
 ("m4", "S", "calm", "S", "Interesting, right? But that was a high experimental dose, not your daily scoop.", {"experimental": "warn"}, "brainwarn"),
 ("m5", "K", "confused", "K", "Last question. Why did I gain weight on creatine?", {"weight": "scale"}, "scale"),
 ("m5", "S", "explain", "two", "It pulls water into your muscles. Water, not body fat.", {"water": "water", "fat": "fat"}, "cell"),
 ("m5", "K", "happy", "K", "So the scale went up, but I'm not fatter?", {}, "cell"),
 ("m5", "S", "smirk", "S", "Exactly.", {}, "cell"),
 ("take", "K", "happy", "K", "Okay, I'm convinced. How much should I take?", {}, None),
 ("take", "S", "explain", "two", "A common daily dose is three to five grams of creatine monohydrate. No magic tricks. No cycling.", {"three": "scoop", "magic": "nomagic"}, "scoop"),
 ("take", "K", "smug", "K", "So, where do I buy it?", {}, "scoop"),
 ("take", "S", "laugh", "S", "First, learn to read scientific studies.", {}, None),
 ("take", "B", "happy", "two", "Train smart. Stay informed!", {}, None),
]
HOLDS = {2: ("K", "Karim", "Believes everything he hears at the gym"), 3: ("S", "Sami", "Actually reads the studies")}
HOLD_LEN = 46
TITLES = {"m1": ("Myth #1", "It doesn't work?"), "m2": ("Myth #2", "It wrecks your kidneys"), "m3": ("Myth #3", "It makes you bald"),
          "m4": ("Surprise", "Your brain?"), "m5": ("Myth #4", "It makes you fat"), "take": ("The takeaway", "How much?")}
TITLE_LEN, GAP, LEAD, END_LEN = 30, 4, 10, 100
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
    paths = [f"public/myths/l{i:02d}{s}.mp3" for s in (("K", "S") if spk == "B" else (spk,))]
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
json.dump({"FPS": FPS, "lines": lines, "scenes": scenes, "END": END, "DURATION": END + END_LEN}, open("src/myths.json", "w"))
print("total", END + END_LEN, "frames =", round((END + END_LEN) / FPS, 1), "s")
