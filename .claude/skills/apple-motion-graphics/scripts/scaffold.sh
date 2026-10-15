#!/usr/bin/env bash
# Create an Apple-style Remotion project: template + the kit (src/apple.jsx) + Inter (public/).
# usage: scaffold.sh <project-dir>
set -euo pipefail
DEST="${1:?usage: scaffold.sh <project-dir>}"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -e "$DEST/package.json" ]]; then echo "$DEST already has a package.json; not overwriting"; exit 1; fi
mkdir -p "$DEST"
cp -R "$SKILL/assets/template/." "$DEST/"
cp "$SKILL/assets/apple.jsx" "$DEST/src/apple.jsx"
mkdir -p "$DEST/public" && cp "$SKILL"/assets/fonts/*.woff2 "$DEST/public/"
cd "$DEST"
npm install --no-audit --no-fund --loglevel=error
python3 -c "import numpy, scipy, PIL" 2>/dev/null || pip install -q numpy scipy pillow 2>/dev/null || echo "note: install numpy scipy pillow for sound.py and contact sheets"
python3 "$SKILL/scripts/sound.py" sound/film.json public/film.wav >/dev/null
python3 "$SKILL/scripts/sound.py" sound/loop.json public/loop.wav >/dev/null
echo "scaffolded $DEST (compositions: Film 1920x1080, FilmReel 1080x1920, Loop 1080x1080 8 s)"
echo "next: put the facts list into src/Root.jsx props, scene frames in src/timing.js, then:"
echo "  python3 $SKILL/scripts/sound.py sound/film.json public/film.wav"
echo "  node render.mjs Film 20,60,100,180,260,330   # stills to review"
echo "  node render.mjs Film                          # MP4"
