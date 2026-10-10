#!/usr/bin/env bash
# Add a video to the portfolio: web-sized MP4 (fast start) + a poster frame in public/media/.
#   bash scripts/encode.sh <input.mp4> <name> [width=720] [poster-second=2]
# Then add an entry for it in src/work.js (MOTION).
set -euo pipefail
IN=$1; NAME=$2; W=${3:-720}; AT=${4:-2}
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i "$IN" -vf "scale=$W:-2" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "public/media/$NAME.mp4"
ffmpeg -y -v error -ss "$AT" -i "public/media/$NAME.mp4" -frames:v 1 -q:v 4 "public/media/$NAME.jpg"
echo "public/media/$NAME.mp4 ($(du -h "public/media/$NAME.mp4" | cut -f1)) + .jpg"
