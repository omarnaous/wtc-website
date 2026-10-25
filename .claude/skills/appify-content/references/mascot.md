# Dev, the Appify mascot

Dev is a friendly developer: black swept hair, beard, octagonal silver glasses, purple Appify T-shirt with the white
"appify" wordmark, holding a dark laptop with a purple spark, black trousers, white sneakers. He appears in almost
every Appify piece: the end card of reels, thumbnails, carousel CTAs, and talking explainers.

## The rig: `assets/mascot/Dev.jsx`
```jsx
import { Dev } from "./Dev.jsx";
<Dev width={340} tilt={-3} bob={0} point={0} wave={0} waveAng={0} thumbs={0}
     brow={16} lid={0.05} smile={1} look={-8} open={0} shock={0} happy={1} wink={0} />
```
- SVG, `viewBox="90 50 420 830"`, height = width × 830/420. Pure function of props → animate per frame.
- Body: `point` (right arm points up), `wave` + `waveAng` (waving), `thumbs` (thumbs up). Don't combine point and
  thumbs at full value (arm glitch): multiply thumbs by (1 − point).
- Head: `brow` (0–26 raise), `lid` (0 open … 1 closed; blink = 1 for 2–3 frames), `smile` (0–1), `look`
  (pupils −10…10 px), `open` (mouth 0–1, drive it from the voice envelope), `shock` (0–1 surprised O),
  `happy` (^^ eyes), `wink`. `tilt` (head degrees), `bob` (vertical bounce px).
- Default arms are "hands in front" holding the laptop; hands sit at Dev coords (204,712) and (396,712).

## Props (draw in Dev coordinates over the hands-in-front pose)
Pattern: a wrapper with `<Dev>` underneath and an `<svg viewBox="90 50 420 830">` overlay on top; draw the prop,
then redraw the two hand circles (r 24, skin `#E3AE86`, ink stroke 8) on top so he "holds" it.
- `DevBags.jsx`: two shopping bags (UV with a yellow spark / "$360"). Follies version used orange "FDM" bags.
- `RingBox.jsx`: an open ring box with a pear-cut stone (jewelry concept).
- `DevNotebook.snippet.jsx`: an open scribbled notebook (the "stock in a notebook" pain).
- Ideas that fit: phone, tablet, receipt, shopping cart, megaphone, trophy, coffee, keys, a client's product.

## Poses that worked
- End card: Dev at the right third, `thumbs={1}` or holding a prop, `happy={1}`, gentle `bob` (sin) and blink.
- Pointing at a screen/note: `point={1}`, `look={-10}`, `brow={20}`.
- Worried/pain slide: holding the notebook, `smile={0}`, `open={0.35}`, `brow={26}`.
- Hook surprise: `shock={0.7}` + `brow` up for 6–10 frames, then back to a smile.
- Talking: `open` from the mouth envelope (smooth with neighbours), small head tilt + bob while talking.

## Dev's voice (talking reels)
- `assets/tools/bts_vo2.py`: Kokoro TTS voice **`am_puck`**, speed ~1.08, re-intoned with Praat PSOLA (melody per
  passage: "arch" for hooks, "fall" for statements), a small room reverb. Writes a WAV plus JSON with word timings
  and a per-frame mouth envelope that drives `open`.
- Needs the Kokoro model files (`kokoro-v1.0.onnx`, `voices-v1.0.bin`), `kokoro_onnx`, `parselmouth`, `soundfile`.
- Write the script as **2–3 flowing passages joined with commas** (no full stops between lines), relaxed pace,
  conversational and interactive ("Wait, did you see…", "but nope, I'm not giving you the whole thing…",
  "just comment PROMPT and I'll DM you…"). Hook in the first line, CTA keyword at the end, and offer Appify's
  service ("if you need motion graphics for your brand, we can help you out too").
- Captions on screen match the spoken words, with a few emojis.
