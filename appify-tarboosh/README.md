# Tarboosh spec ad: "Every Lebanese kid knows this sound."

13 s portfolio piece, 3D (three.js via @remotion/three). **Spec work: unofficial concept, not affiliated with Gandour.**
The foil wrapper and print are an approximation drawn for this piece, not the real packaging or logo.

| Time | Picture | Sound |
|---|---|---|
| 0.0–2.5 s | Wrapped red-foil Tarboosh, "Every Lebanese kid knows this sound." | foil crinkle teaser |
| 1.1–3.9 s | 7 foil petals peel open one by one and tumble away | a crinkle + tear-off per petal |
| 4.1–5.5 s | Bare chocolate dome turns, a light glints across it | shimmer, a rising drone cut dead |
| 5.6 s | The shell cracks, the crack runs across the dome | chocolate snap, then near-silence |
| 6.3–8.9 s | It bursts in slow motion (0.3×), the marshmallow squishes and jiggles | slowed boom, wet squish, debris clinks |
| 8.9–9.9 s | VHS rewind back to the wrapped Tarboosh, "Some things never change." | tape rewind, tape stop |
| 10.6–13 s | World flips to Appify UV, product whips round: "Your ads should." / Spec ad by appify | impact, chord stab, 120 BPM groove |

- Timing: `src/timing.js` (`pt()` maps real frames to product time: slow motion and the rewind).
- 3D product: `src/Scene3D.jsx` (biscuit, marshmallow, chocolate shell + shards, foil petals, camera).
- Sound: `python3 sound/build.py`, then loudness:
  `ffmpeg -i public/sound.wav -af "acompressor=threshold=-24dB:ratio=3:attack=5:release=120,loudnorm=I=-15:TP=-1.5:LRA=11" -ar 48000 out/l.wav && mv out/l.wav public/sound.wav`
- Render: `node render.mjs Reel,Feed`; thumbnails `node render.mjs CoverReel,CoverFeed 0` -> `covers/`.
