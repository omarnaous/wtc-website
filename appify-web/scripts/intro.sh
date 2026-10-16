#!/usr/bin/env bash
# The hero intro, made to fit its 16:9 screen exactly so it stays sharp on every display.
#   bash scripts/intro.sh <video> [poster-second]   (poster-second: which moment becomes the poster, default 0)
# A 16:9 source is scaled as is; any other shape is shown whole, centred on a blurred, darkened copy of itself.
# Output (public/media/):
#   intro.mp4       the full video with sound (tap for sound), 1920x1080 when the source has the detail, else 1280x720
#   intro-loop.mp4  the first 10 s, muted, same size: what the screen plays before the tap
#   intro.webp      the poster (the frame at poster-second)
set -euo pipefail
src="${1:?usage: bash scripts/intro.sh <video> [poster-second]}"
at="${2:-0}"
out=public/media
read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$src" | tr x ' ')
# 1080p when the source has that much detail once fitted into 16:9 (at least 1920 wide or 1080 tall), else 720p
{ [ "$w" -ge 1920 ] || [ "$h" -ge 1080 ]; } && H=1080 || H=720
fit() { # $1 = output height
  local H=$1 W=$(( $1 * 16 / 9 ))
  echo "[0:v]split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},boxblur=28:2,eq=brightness=-0.12:saturation=1.15[bg];[b]scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p[v]"
}
ffmpeg -v error -y -i "$src" -filter_complex "$(fit $H)" -map "[v]" -map 0:a? -c:v libx264 -preset slow -crf 22 -profile:v high -g 60 \
  -c:a aac -b:a 160k -movflags +faststart "$out/intro.mp4"
ffmpeg -v error -y -i "$src" -t 10 -an -filter_complex "$(fit $H)" -map "[v]" -c:v libx264 -preset slow -crf 26 -profile:v high -g 60 \
  -movflags +faststart "$out/intro-loop.mp4"
ffmpeg -v error -y -ss "$at" -i "$out/intro.mp4" -frames:v 1 -c:v libwebp -quality 82 "$out/intro.webp"
for f in intro.mp4 intro-loop.mp4 intro.webp; do printf "%-16s %s  %5s KB\n" "$f" "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$out/$f")" "$(du -k "$out/$f" | cut -f1)"; done
