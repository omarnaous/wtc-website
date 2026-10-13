# Valmora reel: "POV: websites in 2026 / Claude could never do this."

Edit of the Valmora site screen recording (`source/classiccars.mp4`) into a silent 21 s Reel + Feed cut with a Dev end card
("Animated websites from $500", DM "ANIMATED WEBSITE"). One idea: the unveil. The cover comes off the car on the drop,
falls back over the site on the pull-back, and whips off the price on the end card.

Extract the frames first (not committed): `mkdir -p public/rec && ffmpeg -t 24.2 -i source/classiccars.mp4 -q:v 2 public/rec/%04d.jpg`
Then `node render.mjs Reel,Feed` and strip the empty audio track: `ffmpeg -i out/Reel.mp4 -c:v copy -an out/Appify-Valmora-POV-2026-Reel.mp4`.
Thumbnails: `node render.mjs CoverReel,CoverFeed 0` -> `covers/`. Section timing and chip labels: `src/timing.js`.
Valmora is a concept marque (the site's own footer says the car, specs and imagery are illustrative).
