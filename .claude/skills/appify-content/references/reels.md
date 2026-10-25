# Reels and motion graphics that worked

Build with the **motion-graphics** skill (Remotion 4.0.532, `timing.js`, `sound.py`, contact sheets, `verify.sh`).
1080×1920, 30 fps, 15–30 s. Always export: music mix, **NoMusic** (effects only, for trending audio), a light
encode (crf 23, faststart), and a cover PNG.

## Instagram safe zones (1080×1920)
- Keep every word, face, price, CTA and Dev inside **x 60–940, y 220–1500**.
  Top 220 px = status/top bar; right 140 px from y≈1000 = like/comment/share rail; bottom ~420 px = caption/audio.
- The feed preview crops to 4:5 (y ≈ 285–1635); the profile grid crops to 3:4 (y ≈ 240–1680). Check thumbnails
  against the grid crop.
- Review with a red overlay of those zones on the stills before rendering.

## Format A: concept-website reel (Oddball, NAÏADE jewelry, Tide Runs)
1. Hook (0–2 s), two lines, big Sora type, the second line in the accent colour: "Your jewelry costs thousands. /
   Does your website show it?" or "This is not a video game. / It's a website."
2. The site in a browser window (1052 px wide, macOS dots, URL pill) playing a real screen recording, a blurred copy
   behind it, a slow push-in with punch zooms on section changes.
3. A HUD chip walking through the content (Piece 1/3 … Set) so people stay.
4. End card: Appify wordmark + @appifylb, "Websites that look this expensive", the price, DM pill
   ("ANIMATED WEBSITE"), credit line "X · designed & built by Appify", **Dev holding a themed prop**.

## Format B: client website-launch reel (Follies "the boutique")
1. **POV hook on solid ink label boxes** ("POV: FDM launched / their new website"), above the heads, readable on
   any background; on screen ~4 s.
2. **Fast lookbook rush** at 120 BPM: cut-outs on colour fields every 8th note with a giant word behind; a
   triptych (front/side/back strips sliding in on the beat over the previous look); full-bleed photo punches;
   a white flash into the site.
3. **The site**: one continuous medium-fast desktop scroll of the homepage (not sub-pages), full desktop width,
   no crops, the real hero video playing, the site's own scroll-reveal animations visible, feature chips per
   section ("A cinematic film as the homepage", "The boutique, by collection"…).
4. **End card**: Dev holding the brand's bags, "Everything a boutique needs" checklist ticking in, a
   "No subscription · Pay once. Own it forever." block, DM pill, credit. All inside the safe zones.
   Example: `assets/examples/reel-website-launch.jsx`.

## Format C: talking Dev explainer ("how we made it")
Dev talks (voice in mascot.md) beside a chat/prompt UI where the prompt is partly blurred ("Comment PROMPT"),
clips of the finished reel, captions synced to words, CTA keyword at the end.

## Format D: 3D trend reel (Tesla Roadster launch → app launch)
Ride the trend with the brand's product: a phone running the app on a test track, thrusters, launch, landing burn,
end card over the landed shot. Three.js via @remotion/three; preload textures before the canvas mounts.

## Capturing a live website (do it this way)
`assets/tools/fscroll.mjs` (with `routed.mjs`): Playwright, 1440×900, one screenshot per reel frame.
- Warm lazy images in a first pass, then **reload** so one-shot reveal animations are still unplayed.
- Slow CSS transitions to the capture speed with CDP `Animation.setPlaybackRate`.
- Headless shell can't play H.264: transcode the hero to WebM, spoof `canPlayType`, serve it with **byte ranges**
  (status 206) or seeking fails, then pause + seek the video to each frame's time.
- Find the real hero video in the site's API/HTML, not the fallback file.
- Hold ~2.5 s on the hero, then ease one scroll to the footer; save `scroll.json` (y per frame, section tops) to
  time the chips.

## Sound
- `sound.py` cues: shutter `click` on every cut, `swoosh`/`thump` on strips, `riser` → `impact` + `glint` on hits,
  real UI samples (`add-to-cart.ogg`, `open.ogg`) on store actions, a `pop`/`tick` per checklist item, a `chime`
  on the CTA.
- Default bed: `house` 120 BPM. When he asks for **"professional"**: `assets/tools/runway.py` (minimal runway deep
  house, Am9/Fmaj9, side-chained, ping-pong stabs, FM bells) mixed with the effects track. Tune tonal cues to the
  key (A, C, E).
- Trending audio: research the current week (Buffer, Later, SocialBee, CreatorDB); recommend 2–4 with how each
  trend is used; warn that Business accounts only get commercially cleared tracks; give placement tips
  (song ~70 %, original ~30 %, align the first cuts).

## Thumbnails / covers (1080×1920, checked against the 3:4 grid crop)
Hook on bold label boxes at the top, the product/site in a tilted browser or phone, a cut-out stepping out of it,
a round sticker with the offer, Dev in the bottom corner. Appify pieces in Appify colours for grid consistency.
