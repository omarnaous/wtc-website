# The Balloon: "You just watched a balloon for 7 seconds."

17 s attention reel. A glossy UV balloon with the appify logo is pumped up, pump by pump, toward a needle while a camera
HUD counts the frames to impact. It pops at exactly 7.0 s (frame 210) into a confetti blast in brand colours, then
"You just watched a balloon for 7 seconds." / "That's what motion does to attention." A confetti spark lands as the
i-dot of the wordmark: "Imagine it on your brand." / DM "MOTION".

- Timing (pumps, pop, beats): `src/timing.js`.
- Sound (synthesized, locked to the same frames): `python3 sound/build.py`, then loudness:
  `ffmpeg -i public/sound.wav -af "acompressor=threshold=-24dB:ratio=3:attack=5:release=120,loudnorm=I=-15:TP=-1.5:LRA=11" out/l.wav && mv out/l.wav public/sound.wav`
- Render: `node render.mjs Reel,Feed`; thumbnails `node render.mjs CoverReel,CoverFeed 0` -> `covers/`.
