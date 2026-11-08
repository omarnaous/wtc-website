"""Voice-over and timing for StepsTips.jsx. Each line is spoken by a Microsoft neural voice via edge-tts (through the agent
proxy; en-US-AndrewMultilingualNeural), trimmed, then transcribed with faster-whisper for word times so the kinetic type
lands on the spoken word. Scenes run back to back, each starting on the 120 BPM beat grid (15 frames) and lasting as long
as its lines need (with a floor so the motion can play). Writes public/stepsvo/<id>.wav (gitignored), public/stepsvo.wav
(the voice track) and src/steps_vo.json: every scene start, keyword marks (frames) and the total duration, which
StepsTips.jsx and sound/build_stepstips_cues.py both read.
  python3 sound/build_steps_vo.py"""
import json, os, re, subprocess
import numpy as np, scipy.io.wavfile as wf
FPS, SR, BEAT = 30, 24000, 15
VOICE, RATE, PITCH = "en-US-AndrewMultilingualNeural", "+18%", "+0Hz"
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
# (scene, id, text, {mark: (word, nth occurrence)}); "Darreb-nee" is spelled for the voice (dar-REB-nee), it shows as Darebni on screen
SCRIPT = [
 ("hook", "h1", "Ten thousand steps a day.", {"T1": ("ten|10", 0)}),
 ("hook", "h2", "Everyone's chasing it. But is it worth the hype?", {"CHASE": ("everyone", 0), "HYPE": ("hype", 0)}),
 ("origin", "o1", "The number came from a 1965 Japanese pedometer ad.", {"YEAR": ("1965|nineteen", 0), "AD": ("ad", 0)}),
 ("origin", "o2", "Marketing, not science.", {"MKT": ("marketing", 0)}),
 ("science", "s1", "The science? Seven thousand steps a day cut the risk of early death by 47 percent, versus two thousand.",
  {"SEVEN": ("seven|7", 0), "DEATH": ("47|forty", 0), "TWO": ("versus", 0)}),
 ("science", "s2", "Dementia risk, down 38 percent. Depression symptoms, down 22.", {"DEM": ("dementia", 0), "DEP": ("depression", 0)}),
 ("science", "s3", "Past seven thousand, most benefits level off.", {"LEVEL": ("level", 0)}),
 ("age", "a1", "Under 60? The sweet spot is eight to ten thousand.", {"UNDER": ("under", 0)}),
 ("age", "a2", "Over 60? Six to eight.", {"OVER": ("over", 0)}),
 ("tips", "t0", "Make it fit your life.", {"FIX": ("make", 0)}),
 ("tips", "t1", "One. Add a thousand steps a day, each week.", {"TIP0": ("one|1", 0)}),
 ("tips", "t2", "Two. Desk job? Walk two to five minutes every half hour. It lowers blood sugar after meals.", {"TIP1": ("two|2", 0), "SUGAR": ("lowers", 0)}),
 ("tips", "t3", "Three. Take calls on your feet, and use the stairs.", {"TIP2": ("three|3", 0)}),
 ("verdict", "v1", "Worth the hype? Yes. Magic number? No.", {"YES": ("yes", 0), "MAGIC": ("magic", 0)}),
 ("verdict", "v2", "Aim for seven thousand plus.", {"HIT": ("aim", 0)}),
 ("bridge", "e1", "You bring the steps.", {"BR1": ("bring", 0)}),
 ("bridge", "e2", "Darreb-nee AI plans the training.", {"BR2": ("plans", 0)}),
 ("outro", "x1", "Want a plan built for you? Try Darreb-nee AI, free for seven days.", {}),
]
FLOOR = {"hook": 105, "origin": 105, "science": 210, "age": 105, "tips": 270, "verdict": 90, "bridge": 75}
LEAD = {"hook": 2, "origin": 8, "science": 8, "age": 6, "tips": 6, "verdict": 6, "bridge": 4}
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
    mp3 = f"public/stepsvo/{lid}.mp3"; tts(text, mp3); x = load(mp3)
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
    sr, y = wf.read(f"public/stepsvo/{L['id']}.wav"); y = y.astype(np.float32) / 32767
    a = int(L["start"] / FPS * SR); mix[a:a + len(y)] += y
mix = mix[:int(dur / FPS * SR)]
wf.write("public/stepsvo.wav", SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
json.dump({"scenes": scenes, "marks": marks, "lines": lines, "duration": dur}, open("src/steps_vo.json", "w"), indent=1)
for k, v in scenes.items(): print(f"{k:7s} {v['start']:5d}-{v['end']:5d} ({(v['end'] - v['start']) / 30:.1f} s)")
print("marks:", marks); print("duration", dur, f"{dur / 30:.1f} s")
