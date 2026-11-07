"""Voice-over and timing for WaterTips.jsx. Each line is spoken by a Microsoft neural voice via edge-tts (through the agent
proxy; en-US-AndrewMultilingualNeural), trimmed, then transcribed with faster-whisper for word times so the kinetic type
lands on the spoken word. Scenes run back to back, each starting on the 120 BPM beat grid (15 frames) and lasting as long
as its lines need (with a floor so the motion can play). Writes public/watervo/<id>.wav (gitignored), public/watervo.wav
(the voice track) and src/water_vo.json: every scene start, keyword marks (frames) and the total duration, which
WaterTips.jsx and sound/build_watertips_cues.py both read.
  python3 sound/build_water_vo.py"""
import json, os, re, subprocess
import numpy as np, scipy.io.wavfile as wf
FPS, SR, BEAT = 30, 24000, 15
VOICE, RATE, PITCH = "en-US-AndrewMultilingualNeural", "+18%", "+0Hz"
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
# (scene, id, text, {mark: (word, nth occurrence)}); "Darreb-nee" is spelled for the voice (dar-REB-nee), it shows as Darebni on screen
SCRIPT = [
 ("hook", "h1", "The cheapest pre-workout?", {"T1": ("cheapest", 0), "T2": ("pre", 0)}),
 ("hook", "h2", "Water.", {"LAND": ("water", 0)}),
 ("drop", "d1", "Sweat off just two percent of your body weight, and your lifts start to drop.", {"PCT": ("two|2", 0), "BODY": ("body", 0), "HIT": ("lifts", 0)}),
 ("drop", "d2", "For an eighty kilo lifter, that's just one point six kilos.", {"CHIP": ("eighty|80", 0)}),
 ("stats", "s1", "A meta-analysis found dehydrated lifters lose five and a half percent strength, eight percent of their reps, and almost six percent power.",
  {"R0": ("five|5", 0), "R1": ("eight|8", 0), "R2": ("six|6", 0)}),
 ("bench", "b1", "That's a hundred kilo bench turning into ninety-four and a half.", {"B100": ("hundred|100", 0), "B945": ("ninety|94", 0)}),
 ("bench", "b2", "Same effort. Just less water.", {"BSAME": ("same", 0)}),
 ("daily", "y1", "So how much do you need?", {"Q": ("how", 0)}),
 ("daily", "y2", "About three point seven liters a day for men, and two point seven for women, from drinks and food.", {"MEN": ("three|3", 0), "WOMEN": ("two|2", 0), "FOOD": ("drinks", 0)}),
 ("daily", "y3", "Plus whatever you sweat out in training.", {"SWEAT": ("sweat", 0)}),
 ("tips", "t0", "Fix it in three steps.", {"FIX": ("fix", 0)}),
 ("tips", "t1", "One. Five to seven milliliters per kilo, four hours before you train.", {"TIP0": ("one|1", 0), "HOURS": ("hours", 0)}),
 ("tips", "t2", "Two. Check your pee. Pale yellow, you're ready. Dark? Drink more.", {"TIP1": ("two|2", 0), "PALE": ("pale", 0), "DARK": ("dark", 0)}),
 ("tips", "t3", "Three. Weigh in before and after, and drink one and a half liters per kilo lost.", {"TIP2": ("three|3", 0), "DRINK": ("drink", 0)}),
 ("bridge", "e1", "Water fuels the set.", {"BR1": ("water", 0)}),
 ("bridge", "e2", "Darreb-nee AI plans it.", {"BR2": ("plans", 0)}),
 ("outro", "o1", "Want a plan built for you? Try Darreb-nee AI, free for seven days.", {}),
]
FLOOR = {"hook": 105, "drop": 150, "stats": 165, "bench": 105, "daily": 150, "tips": 300, "bridge": 75}
LEAD = {"hook": 2, "drop": 14, "stats": 10, "bench": 6, "daily": 8, "tips": 6, "bridge": 4}
GAP, TAIL = 3, 12
env = dict(os.environ, SSL_CERT_FILE="/root/.ccr/ca-bundle.crt")

def tts(text, path):
    if os.path.exists(path) and os.path.getsize(path) > 1000: return
    for _ in range(6):
        r = subprocess.run(["edge-tts", "--proxy", os.environ["HTTPS_PROXY"], "--voice", VOICE, f"--rate={RATE}", f"--pitch={PITCH}", "--text", text, "--write-media", path], env=env, capture_output=True, text=True)
        if r.returncode == 0 and os.path.getsize(path) > 1000: return
    raise SystemExit(f"no audio: {text}")

def load(path):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,volume=1.1",
                                      "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    loud = np.where(np.abs(x) > 0.012)[0]
    return x[max(0, loud[0] - int(0.02 * SR)):min(len(x), loud[-1] + int(0.1 * SR))].copy()

from faster_whisper import WhisperModel
model = WhisperModel("small", compute_type="int8")
snap = lambda t: int(np.ceil(t / BEAT) * BEAT)
lines, marks, scenes = [], {}, {}
t, cur = 0, None
for scene, lid, text, mk in SCRIPT:
    mp3 = f"public/watervo/{lid}.mp3"; tts(text, mp3); x = load(mp3)
    wf.write(mp3.replace(".mp3", ".wav"), SR, (x * 32767).astype(np.int16))
    if scene != cur:
        if cur: scenes[cur]["end"] = t
        start = 0 if cur is None else snap(max(t, scenes[cur]["start"] + FLOOR[cur]))
        if cur: scenes[cur]["end"] = start
        scenes[scene] = {"start": start}; cur = scene
        t = start + (LEAD.get(scene, 12) if scene != "outro" else 14)
    at = t; n = int(round(len(x) / SR * FPS))
    a16 = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
    segs, _ = model.transcribe(a16, word_timestamps=True, language="en")
    words = [(re.sub(r"[^a-z0-9]", "", w.word.lower()), w.start) for s in segs for w in s.words]
    for name, (word, nth) in mk.items():
        hits = [st for w, st in words if w and any(w.startswith(o) for o in word.split("|"))]
        if len(hits) <= nth: raise SystemExit(f"{lid}: no '{word}' in {words}")
        marks[name] = at + int(round(hits[nth] * FPS))
    lines.append({"id": lid, "scene": scene, "start": at, "len": n, "text": text})
    t = at + n + GAP
scenes["outro"]["end"] = scenes["outro"]["start"] + END_LEN
dur = scenes["outro"]["end"]
assert lines[-1]["start"] + lines[-1]["len"] < dur - 20, "outro line too long"
mix = np.zeros(int(dur / FPS * SR) + SR, np.float32)
for L in lines:
    sr, y = wf.read(f"public/watervo/{L['id']}.wav"); y = y.astype(np.float32) / 32767
    a = int(L["start"] / FPS * SR); mix[a:a + len(y)] += y
mix = mix[:int(dur / FPS * SR)]
wf.write("public/watervo.wav", SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
json.dump({"scenes": scenes, "marks": marks, "lines": lines, "duration": dur}, open("src/water_vo.json", "w"), indent=1)
for k, v in scenes.items(): print(f"{k:7s} {v['start']:5d}-{v['end']:5d} ({(v['end'] - v['start']) / 30:.1f} s)")
print("marks:", marks); print("duration", dur, f"{dur / 30:.1f} s")
