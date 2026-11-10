"""Voice-over and timing for CaffeineTips.jsx. Each line is spoken by a Microsoft neural voice via edge-tts (through the agent
proxy; en-US-AndrewMultilingualNeural), trimmed, then transcribed with faster-whisper for word times so the kinetic type
lands on the spoken word. Scenes run back to back, each starting on the 120 BPM beat grid (15 frames) and lasting as long
as its lines need (with a floor so the motion can play). Writes public/cafvo/<id>.wav (gitignored), public/cafvo.wav
(the voice track) and src/caf_vo.json: every scene start, keyword marks (frames) and the total duration, which
CaffeineTips.jsx and sound/build_caffeinetips_cues.py both read.
  python3 sound/build_caf_vo.py"""
import json, os, re, subprocess
import numpy as np, scipy.io.wavfile as wf
FPS, SR, BEAT = 30, 24000, 15
VOICE, RATE, PITCH = "en-US-AndrewMultilingualNeural", "+18%", "+0Hz"
END_LEN = int(re.search(r"END_LEN = (\d+)", open("src/timing.js").read()).group(1))
# (scene, id, text, {mark: (word, nth occurrence)}); "Darreb-nee" is spelled for the voice (dar-REB-nee), it shows as Darebni on screen
SCRIPT = [
 ("hook", "h1", "Your pre-workout is mostly one thing.", {"T1": ("your", 0), "ONE": ("one", 0)}),
 ("hook", "h2", "Caffeine. Here's how to use it right.", {"CAF": ("caffeine", 0)}),
 ("works", "w1", "Does it work? A meta-analysis says yes. A small but real boost in strength and power.", {"YES": ("yes", 0), "STR": ("strength", 0), "POW": ("power", 0)}),
 ("dose", "d1", "The research dose: three to six milligrams per kilo, about sixty minutes before you train.", {"MGKG": ("three|3", 0), "MIN": ("sixty|60", 0)}),
 ("dose", "d2", "For an eighty kilo lifter, the low end is about two coffees.", {"KG80": ("eighty|80", 0), "CUPS": ("two|2", 0)}),
 ("dose", "d3", "And more isn't better. Around nine milligrams per kilo brings side effects, with no extra gains.", {"MORE": ("more", 0), "NINE": ("nine|9", 0)}),
 ("limit", "l1", "Daily ceiling for healthy adults: four hundred milligrams. Pregnant? Two hundred.", {"L400": ("milligrams", 0), "PREG": ("pregnant", 0)}),
 ("sleep", "z1", "The catch is sleep. Have your coffee at least nine hours before bed.", {"CATCH": ("catch", 0), "COFFEE9": ("nine|9", 0)}),
 ("sleep", "z2", "A pre-workout scoop? About thirteen.", {"PRE13": ("thirteen|13", 0)}),
 ("health", "x1", "The good news: three to four cups a day is linked to a lower risk of early death.", {"CUPS34": ("three|3", 0), "RISK": ("lower", 0)}),
 ("health", "x2", "Linked, not proven.", {"LINKED": ("linked", 0)}),
 ("bridge", "e1", "Caffeine fuels the session.", {"BR1": ("fuels", 0)}),
 ("bridge", "e2", "Darreb-nee AI plans it.", {"BR2": ("plans", 0)}),
 ("outro", "o1", "Want a plan built for you? Try Darreb-nee AI, free for seven days.", {}),
]
FLOOR = {"hook": 105, "works": 120, "dose": 240, "limit": 120, "sleep": 150, "health": 135, "bridge": 75}
LEAD = {"hook": 2, "works": 8, "dose": 8, "limit": 8, "sleep": 8, "health": 8, "bridge": 4}
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
    mp3 = f"public/cafvo/{lid}.mp3"; tts(text, mp3); x = load(mp3)
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
    sr, y = wf.read(f"public/cafvo/{L['id']}.wav"); y = y.astype(np.float32) / 32767
    a = int(L["start"] / FPS * SR); mix[a:a + len(y)] += y
mix = mix[:int(dur / FPS * SR)]
wf.write("public/cafvo.wav", SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
json.dump({"scenes": scenes, "marks": marks, "lines": lines, "duration": dur}, open("src/caf_vo.json", "w"), indent=1)
for k, v in scenes.items(): print(f"{k:7s} {v['start']:5d}-{v['end']:5d} ({(v['end'] - v['start']) / 30:.1f} s)")
print("marks:", marks); print("duration", dur, f"{dur / 30:.1f} s")
