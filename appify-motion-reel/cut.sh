#!/usr/bin/env bash
# Build and render one cut of the reel. The cuts share every scene; each has its own voice, timing and mix.
#   bash cut.sh <reel|ad30|ad15> build      voice + cues + mix -> cuts/<cut>/   (needs KOKORO=<kokoro model dir>)
#   bash cut.sh <cut> stills 10,200,...     PNG stills of that cut
#   bash cut.sh <cut> render                out/<Id>.mp4 + out/<Id>-ig.mp4 (Instagram/Meta encode)
# The reel is the default state of src/vo.json, vo/vo.wav and public/sound.wav; this restores it when done.
set -euo pipefail
cd "$(dirname "$0")"
CUT=$1; STEP=${2:-render}
SKILL=${SKILL:-/root/.claude/skills/motion-graphics/scripts}
D=cuts/$CUT
use() { cp "cuts/$1/vo.json" src/vo.json; cp "cuts/$1/vo.wav" vo/vo.wav; cp "cuts/$1/sound.wav" public/sound.wav; cp "cuts/$1/cues.json" sound/cues.json; }
[ -d cuts/reel ] || { mkdir -p cuts/reel; cp src/vo.json vo/vo.wav public/sound.wav sound/cues.json cuts/reel/; }   # snapshot the reel first
trap 'use reel' EXIT
if [ "$STEP" = build ]; then
  python3 vo/vo.py "${KOKORO:?set KOKORO to the kokoro model dir}" "$CUT"
  python3 sound/build_cues.py
  python3 "$SKILL/sound.py" sound/cues.json sound/sfx.wav
  python3 vo/mix.py
  mkdir -p "$D"; cp src/vo.json vo/vo.wav public/sound.wav sound/cues.json "$D/"
  exit
fi
use "$CUT"
ID=$(python3 -c "import json;print(json.load(open('src/vo.json')).get('id','MotionShowcase'))")
if [ "$STEP" = stills ]; then node render.mjs "$ID" "$3"; exit; fi
node render.mjs "$ID" > /dev/null
ffmpeg -y -v error -i "out/$ID.mp4" -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "out/$ID-ig.mp4"
echo "out/$ID-ig.mp4 $(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$ID-ig.mp4")s"
