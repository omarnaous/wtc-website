# Oddball reel: "POV: this is not a movie"

Edit of the Oddball site screen recording (`source/oddball.mp4`) into a 21 s Reel + Feed cut with a Dev end card.

Extract the frames first (not committed): `mkdir -p public/rec && ffmpeg -i source/oddball.mp4 -q:v 3 public/rec/%04d.jpg`
Then `python3 sound/build_cues.py && python3 <skill>/scripts/sound.py sound/cues.json public/sound.wav && node render.mjs`.
Section timing, captions and chip labels: `src/timing.js`.
