#!/usr/bin/env bash
# Create a Remotion motion-graphics project from the skill template.
# usage: scaffold.sh <project-dir>
set -euo pipefail
DEST="${1:?usage: scaffold.sh <project-dir>}"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -e "$DEST/package.json" ]]; then echo "$DEST already has a package.json; not overwriting"; exit 1; fi
mkdir -p "$DEST"
cp -R "$SKILL/assets/template/." "$DEST/"
cd "$DEST"
npm install --no-audit --no-fund --loglevel=error
python3 -c "import numpy, scipy, PIL" 2>/dev/null || pip install -q numpy scipy pillow 2>/dev/null || echo "note: install numpy scipy pillow for sound.py and contact sheets"
echo "scaffolded $DEST"
echo "next: edit src/timing.js + src/Main.jsx, write sound/cues.json, then:"
echo "  python3 $SKILL/scripts/sound.py sound/cues.json public/sound.wav"
echo "  node render.mjs Feed 0,30,60     # stills to review (composition ids are in src/Root.jsx)"
echo "  node render.mjs                  # final MP4s"
