#!/usr/bin/env bash
# Verify rendered videos: streams, size, fps, duration, loudness, and a 10/50/90% frame sheet.
# usage: verify.sh [--loop] out/*.mp4
set -euo pipefail
LOOP=0; [[ "${1:-}" == "--loop" ]] && { LOOP=1; shift; }
DIR="$(cd "$(dirname "$0")" && pwd)"
for f in "$@"; do
  echo "== $f"
  ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,channels -show_entries format=duration -of compact "$f"
  if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f" | grep -q audio; then
    ffmpeg -hide_banner -nostats -i "$f" -vn -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume" | sed 's/.*\] /  /'
  else
    echo "  !! no audio stream"
  fi
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  tmp=$(mktemp -d)
  for p in 10 50 90; do
    t=$(python3 -c "print($dur*$p/100)")
    ffmpeg -v error -y -ss "$t" -i "$f" -frames:v 1 "$tmp/frame-f$p.png"
  done
  python3 "$DIR/contact_sheet.py" "$tmp" "${f%.*}-check.png" --cols 3 --width 360 >/dev/null && echo "  frames: ${f%.*}-check.png"
  if [[ $LOOP == 1 ]]; then
    ffmpeg -v error -y -i "$f" -frames:v 1 "$tmp/first.png"
    ffmpeg -v error -y -sseof -0.04 -i "$f" -frames:v 1 "$tmp/last.png"
    python3 - "$tmp/first.png" "$tmp/last.png" <<'PY'
import sys
from PIL import Image, ImageChops, ImageStat
a, b = (Image.open(p).convert("RGB") for p in sys.argv[1:3])
diff = sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3
print(f"  loop seam: mean pixel diff first vs last = {diff:.2f}/255 " + ("(seamless)" if diff < 6 else "(visible jump: check periodic motion)"))
PY
  fi
  rm -rf "$tmp"
done
