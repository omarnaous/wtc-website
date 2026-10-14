# Freez Mix spec film (raw 16:9): "Choose your mix, choose your flavor!"

22 s, 1920x1080, 30 fps, built to sit inside the browser-window frame later (Day 2 of "making ads for Lebanese brands").
**Spec work: unofficial, not affiliated with Kassatly / Freez.** Every image is Freez's own product art scraped from
freezmix.com (`source/flavors.json`): 13 flavours x husband & wife bottles (upscaled 3x from the site's 130x506 PNGs),
three bottle-with-fruit hero shots, the logo. All copy is theirs ("Choose your mix, choose your flavor!", "Better
together", "Husband & Wife", "Discover your favorite flavor in a bottle", 13 flavours).

One idea: everything is **poured in**. A liquid surface rises up the screen to bring in every scene and ends filling
the screen behind the logo. Built with the WTC launch film's techniques (motion-blurred entries, giant type behind the
product, an orbit with depth blur and a counter, a studio, a wall with a light sweep, a slammed mark).

| Time | Picture | Sound |
|---|---|---|
| 0–1 s | dark, bubbles rising | carbonation fizz, a few bubbles |
| 1.0 s | cap pops: burst + streak | crown cap pried off (clicks, hiss), the cap tinkling on the counter; groove enters muffled |
| 1.1–3 s | Lemon & Mint pours up the screen, hero bottle rises: "CHOOSE YOUR MIX, *choose your flavor.*" | glugging pour, bubbles on the words |
| 3–10 s | 12 more flavours poured in on the beat: giant word behind (MANGO, HAWAII…), hero shots / husband & wife pairs, 02/13… | groove opens; a liquid swish per flavour, a glass clink when each pair meets |
| 10–13 s | the 13 flavours orbit a counter 0 → 13 "flavors · one mix" | a bubble per number (in key), clink + bell on 13 |
| 13–16 s | HUSBAND & WIFE "BETTER *together.*": the pair clinks, then swaps flavour, swatches | glass clink, ice knocking on every swap |
| 16–18.5 s | the wall of 26 bottles, a light sweep: "DISCOVER YOUR FAVORITE *flavor in a bottle.*", dive in | bottles set down, air |
| 18.5–19 s | break | only the fizz, one drip |
| 19–22 s | the screen fills with Lemon & Mint, the FREEZ Mix logo slams in, "CHOOSE YOUR MIX, *choose your flavor!*", FREEZMIX.COM | three glass clinks + bells on the downbeat |

- Timing: `src/timing.js`; flavour order/colours/words: `src/flavors.js`; scenes: `src/Film.jsx`.
- Sound: `python3 sound/score.py public/sound.wav` and `python3 sound/score.py public/sound-nomusic.wav --nomusic`.
- Render: `node render.mjs Film`.
