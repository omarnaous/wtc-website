# MAK BAR spec commercial: "MUNCH BETTER."

20 s, 9:16 (Reel) + 4:5 (Feed), 30 fps. **Spec work: unofficial, not affiliated with MAK BAR.**
All footage and photos are MAK BAR's own, from their Instagram @wearemakbar (`source/instagram-posts.json`):
`public/footage/padel.mp4` (reel Dd_mSJ9OkEA), `public/footage/gym.mp4` (reel DdUNTqpB1IH), `public/ig/smash.jpg`.
The wordmark is traced from the end card of their reel (`src/logo.js`). Every number is from their own product cards:
PRO Cookies 'n' Cream 18g protein, no added sugar, almonds · pea protein · dates; Almond Crunch 11g protein, 164
calories, white chocolate coated; Chocolate Chip 10g protein, 164 calories, chocolate coated. Copy lines are their
captions/pack ("Fueling the journey", "PT energy. Lagree precision.", "BELIEVE.", "MUNCH BETTER", #beoneofus).

One idea: the ⚡ on every bar is the editor — bolts strike each chapter in, the montage cuts on the beat, the product
chapter charges up each bar's numbers, the last bolt strikes the wordmark.

| Time | Picture | Sound |
|---|---|---|
| 0–0.3 s | black | electric crackle |
| 0.3–1.5 s | bolt strikes → padel serve, "FUEL THE JOURNEY." | thunder crack, ball hit, house intro (muffled) |
| 1.5–5.5 s | gym montage on the beat, REP counter: "PT ENERGY." / "LAGREE PRECISION." | the drop, dumbbell clanks, rope slams |
| 5.5–9 s | bolt → padel cuts, slow-mo smash, their smash photo frozen: "BELIEVE." | ball hits, sneaker squeaks, slam |
| 9–10 s | the bar comes out of the gym bag: "FUEL UP." | music drops out, bag rustle, wrapper |
| 10–15.5 s | bolt → 3 bars, each charging up its real numbers + chips | drop, charge-up + zap per bar |
| 15.5–17.5 s | unwrap, the bite: "MUNCH" / "BETTER." | wrapper tear, crunch |
| 17.5–20 s | last bolt strikes the MAK BAR wordmark: "MUNCH BETTER." @wearemakbar · #beoneofus | strike, slam |

- Edit (clips, source seconds, speed), chapters, bar numbers: `src/timing.js`. Scenes: `src/Main.jsx`.
- Sound: `python3 sound/score.py` (house bed via the motion-graphics skill + foley) → `public/sound.wav`, `public/sound-nomusic.wav`.
- Render: `node render.mjs Reel,Feed`.
