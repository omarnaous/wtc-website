#!/usr/bin/env bash
# Light card previews: the first 8 s, no audio, short side 540 px, CRF 30 -> public/media/p/<name>.mp4.
# Cards autoplay these muted; the player and case pages use the full video in public/media/.
#   bash scripts/previews.sh [video.mp4 ...]     (default: every public/media/*.mp4)
set -euo pipefail
mkdir -p public/media/p
files=("$@"); [ ${#files[@]} -eq 0 ] && files=(public/media/*.mp4)
for f in "${files[@]}"; do
  out="public/media/p/$(basename "$f")"
  ffmpeg -v error -y -i "$f" -t 8 -an -vf "scale='if(lt(iw,ih),540,-2)':'if(lt(iw,ih),-2,540)':flags=lanczos,fps=30" \
    -c:v libx264 -preset slow -crf 30 -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart "$out"
  printf "%-28s %5s KB -> %4s KB\n" "$(basename "$f")" "$(du -k "$f" | cut -f1)" "$(du -k "$out" | cut -f1)"
done
