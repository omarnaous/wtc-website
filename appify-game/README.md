# Earshot reel: "This is not a video game. It's a website."

Edit of the Earshot site screen recording (`source/game.mp4`) into a silent 15 s Reel + Feed cut. The fox runs through four
worlds while a game HUD counts them ("World 1/4" ... "4/4", so people stay for the last one), then a spark cut to a
"LEVEL COMPLETE" end card: Animated websites from $500, DM "ANIMATED WEBSITE", Dev with a gamepad (`src/Gamer.jsx`) doing a victory jump.

Extract the frames first (not committed): `mkdir -p public/rec && ffmpeg -i source/game.mp4 -q:v 2 public/rec/%04d.jpg`
Then `node render.mjs Reel,Feed` and strip the empty audio track: `ffmpeg -i out/Reel.mp4 -c:v copy -an out/Appify-Earshot-NotAGame-Reel.mp4`.
Thumbnails: `node render.mjs CoverReel,CoverFeed 0` -> `covers/`. World timing: `src/timing.js`.
