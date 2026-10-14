# NAÏADE reel (animated website 04): "Your jewelry costs thousands. / Does your website show it?"

Edit of the NAÏADE site screen recording (`source/jewelry.mp4`) into a silent 20 s 9:16 Reel (the user adds trending
audio in-app), same template as Valmora / Earshot. A HUD chip walks through the pieces (Piece 0/3 → 3/3 → the whole set,
$38,200) so people stay to the end; a punch-in on each piece. Then a spark cut to the end card: "Websites that look this
expensive / from $500", DM "ANIMATED WEBSITE", Dev holding a ring box (`src/RingBox.jsx`).
NAÏADE is a concept brand (the site's own footer: pieces, prices and imagery are fictional); the end card says so.

Extract the frames first (not committed): `mkdir -p public/rec && ffmpeg -t 17.2 -i source/jewelry.mp4 -q:v 2 public/rec/%04d.jpg`
Then `node render.mjs Reel` and strip the empty audio track: `ffmpeg -i out/Reel.mp4 -c:v copy -an out/Appify-NAIADE-Website-Reel.mp4`.
Thumbnail: `node render.mjs CoverReel 0` -> `covers/`. Piece timing: `src/timing.js`.
All overlays sit in Instagram's safe area (`Safe` in `src/Main.jsx`): tall phones crop ~100 px off each side, the buttons cover the right edge and the caption the bottom.
