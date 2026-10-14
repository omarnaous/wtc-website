# The Press: "You just watched a jelly star get crushed for 7 seconds."

17 s attention reel. A hydraulic press creeps down on a jelly Appify spark while a camera HUD counts the frames to
impact; it pops at exactly 7.0 s (frame 210). Then the text, then every drop flies home, the spark re-forms and lands
as the i-dot of the appify wordmark: "Motion that stops the scroll." / DM "MOTION".

- Timing (press keyframes, beats): `src/timing.js`. Droplets: `python3 sound/gen_drops.py` -> `src/drops.json`.
- Sound (synthesized foley, locked to the same frames and drops): `python3 sound/build.py` -> `public/sound.wav`.
- Render: `node render.mjs Reel,Feed`; thumbnails `node render.mjs CoverReel,CoverFeed 0` -> `covers/`.
