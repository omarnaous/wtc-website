# POV: websites in 2026 (Firnlight reel)

Real recordings of the Firnlight site (github.com/omarnaous/firnlight), edited into a 20 s Reel + Feed cut.

Re-record the footage (not committed, ~120 MB):
1. In the firnlight repo: `npm install && npx vite --port 5173`
2. Here: `npm i playwright-core` (any folder), then
   `node scripts/record.mjs m public/rec/m 600` and `node scripts/record.mjs d public/rec/d 300`

Then `python3 sound/build_cues.py && python3 <skill>/scripts/sound.py sound/cues.json public/sound.wav` and `node render.mjs`.
Edit timing, scroll keyframes and chip labels in `src/timing.js`.
