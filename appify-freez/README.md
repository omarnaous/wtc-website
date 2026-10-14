# Freez Mix spec ad (raw 16:9): "Choose your mix"

15 s, 1920x1080, made to sit inside the browser-window frame later (Day 2 of "making ads for Lebanese brands").
**Spec work: unofficial, not affiliated with Kassatly / Freez.** All product art (13 flavours x husband & wife bottles,
hero bottle-with-fruit shots, logo, halftone graphic) is Freez's own, scraped from freezmix.com (`source/flavors.json`);
bottles were upscaled 3x (Lanczos + sharpen) from the site's 130x506 PNGs.

| Time | Picture | Sound |
|---|---|---|
| 0.2 s | cap pops, fizz plume | pop + fizz |
| 0.3–2 s | FREEZ Mix logo lands, "Choose your mix." | impact, word pops, muffled house intro |
| 2–6 s | Lemon & Mint, Pineapple & Coconut, Pomegranate (hero shots), Blue Hawaii | the drop; a swoosh into each colour flood |
| 6–10.5 s | 9 more flavours, one per beat, bottle pairs clinking | clink on each pair |
| 10.5–11.5 s | white, counter 1 → 13 "flavors." | music drops out, ticks, riser |
| 11.5–15 s | all 26 bottles slam into a line-up: "Better together." → logo + "Choose your mix, choose your flavor!" | impact + clinks, house, chime |

- Timing: `src/timing.js`; flavour order/colours: `src/flavors.js`.
- Sound: `python3 sound/cues.py && python3 <skill>/scripts/sound.py sound/cues.json public/sound.wav` (and `cues-nomusic.json`).
- Render: `node render.mjs Wide`.
