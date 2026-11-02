"""Cut each commercial shot (src/commercial-shots.json) out of the exercise library (public/lib/t<n>.mp4) and wipe the
source's brand lettering off the shorts and mats, frame by frame (tools/logo_clean.py). Writes public/lib/clean/<slot>.mp4.
  python3 tools/clean_shots.py [slot ...]"""
import json, os, subprocess, sys
import cv2
sys.path.insert(0, os.path.dirname(__file__))
from logo_clean import clean
os.makedirs("public/lib/clean", exist_ok=True)
only = set(sys.argv[1:])
for s in json.load(open("src/commercial-shots.json")):
    if only and s["slot"] not in only: continue
    secs = s["dur"] / 30 * s.get("rate", 1) + 0.3
    cap = cv2.VideoCapture(f"public/lib/t{s['n']}.mp4"); cap.set(cv2.CAP_PROP_POS_MSEC, s["s"] * 1000)
    w, h = int(cap.get(3)), int(cap.get(4))
    out = f"public/lib/clean/{s['slot']}.mp4"
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", "30", "-i", "-",
                           "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for _ in range(round(secs * 30)):
        ok, fr = cap.read()
        if not ok: break
        ff.stdin.write(clean(fr)[0].tobytes())
    ff.stdin.close(); ff.wait(); print(s["slot"], out)
