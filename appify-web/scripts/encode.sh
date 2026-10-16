#!/usr/bin/env bash
# Re-encodes portfolio videos for the web: H.264, fast start, ~1-4 MB, plus a poster JPG and a WebP.
#   bash scripts/encode.sh <source.mp4> <slug> [poster-second] [width]
set -euo pipefail
src="$1"; slug="$2"; t="${3:-1.5}"; w="${4:-720}"
out="public/media"; mkdir -p "$out"
ffmpeg -v error -y -i "$src" -vf "scale=${w}:-2:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 -movflags +faststart "$out/$slug.mp4"
ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 -vf "scale=${w}:-2:flags=lanczos" -q:v 4 "$out/$slug.jpg"
ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 -vf "scale=${w}:-2:flags=lanczos" -c:v libwebp -quality 72 "$out/$slug.webp"
bash "$(dirname "$0")/previews.sh" "$out/$slug.mp4"
printf "%-22s %6s KB  %s\n" "$slug" "$(du -k "$out/$slug.mp4" | cut -f1)" "$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$out/$slug.mp4")"
