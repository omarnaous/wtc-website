# Valmora reel: "POV: this website looks like it cost $10,000 / ChatGPT could never do this."

Edit of the Valmora site screen recording (`source/classiccars.mp4`) into a silent 21 s Reel + Feed cut with a Dev end card
The cover comes off the car on the drop; on the pull-back ("websites that look like they cost $10,000") Dev screeches in
driving a cartoon classic spider (`src/Car.jsx`), and the punchline lands: "Looks like $10,000. Costs from $500.", DM "ANIMATED WEBSITE".

Extract the frames first (not committed): `mkdir -p public/rec && ffmpeg -t 24.2 -i source/classiccars.mp4 -q:v 2 public/rec/%04d.jpg`
Then `node render.mjs Reel,Feed` and strip the empty audio track: `ffmpeg -i out/Reel.mp4 -c:v copy -an out/Appify-Valmora-POV-2026-Reel.mp4`.
Thumbnails: `node render.mjs CoverReel,CoverFeed 0` -> `covers/`. Section timing and chip labels: `src/timing.js`.
Valmora is a concept marque (the site's own footer says the car, specs and imagery are illustrative).
