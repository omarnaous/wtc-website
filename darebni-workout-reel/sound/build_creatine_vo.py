"""Voice-over for CreatineVO.jsx: one line per scene, spoken by Microsoft's neural voice en-US-AndrewNeural via edge-tts
(through the agent proxy), then the scene timing is derived from the line lengths and written to src/creatine-vo.json so
picture and voice can't drift. Writes public/vo/<scene>.mp3 (gitignored).
  python3 sound/build_creatine_vo.py"""
import json, os, subprocess
VOICE, RATE = "en-US-AndrewNeural", "+10%"
LINES = [
 ("HOOK",  "Karim and Sami. Same gym, same plan. Only Karim takes creatine."),
 ("W1",    "Week one, Karim is up a kilo and a half. Not fat. Water, pulled into his muscles."),
 ("STR",   "Weeks later? Across twenty-two studies, creatine lifters gained twenty percent strength. Without it, twelve. Plus more reps."),
 ("HAIR",  "Sami's excuse: it makes you bald. That's one small study. It never even measured hair."),
 ("BRAIN", "Exam night, no sleep? In a 2024 study, one dose helped memory and thinking."),
 ("FIN",   "Three to five grams a day. Every day."),
 ("END",   "Creatine helps. Your plan does the work. Darebni AI."),
]
env = dict(os.environ, SSL_CERT_FILE="/root/.ccr/ca-bundle.crt")
FPS, LEAD, GAP = 30, 6, 10          # the voice starts 8 frames into a scene; 16 frames of air after it
MIN = {"FIN": 110, "END": 120}       # the jar pop and the end card need their own time
t, out = 0, {"FPS": FPS, "lines": []}
for key, text in LINES:
    path = f"public/vo/{key.lower()}.mp3"
    if not os.path.exists(path) or os.path.getsize(path) < 1000:
        for attempt in range(5):   # the service sometimes returns no audio; retry
            r = subprocess.run(["edge-tts", "--proxy", os.environ["HTTPS_PROXY"], "--voice", VOICE, f"--rate={RATE}", "--text", text, "--write-media", path], env=env, capture_output=True, text=True)
            if r.returncode == 0 and os.path.getsize(path) > 1000: break
            print("retry", key, r.stderr.strip().splitlines()[-1:] if r.stderr else "")
        else:
            raise SystemExit(f"no audio for {key}")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    n = max(MIN.get(key, 0), LEAD + round(dur * FPS) + GAP)
    out[key] = t; out["lines"].append({"key": key, "at": t + LEAD, "file": path.replace("public/", ""), "dur": round(dur, 2), "text": text})
    print(f"{key:6s} {t:5d}  {dur:5.2f}s  {text}")
    t += n
out["DURATION"] = t
json.dump(out, open("src/creatine-vo.json", "w"), indent=1)
print("total", t, "frames =", round(t / FPS, 1), "s")
