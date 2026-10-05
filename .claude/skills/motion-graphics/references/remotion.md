# Remotion notes and gotchas

Pinned in the template: `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer`, `@remotion/paths` (all the same 4.0.x version; mismatched versions break the render). Add `@remotion/three` + `three` + `@react-three/fiber` only when you need real 3D, at the same Remotion version.

## Core API

```jsx
import { AbsoluteFill, Sequence, Series, Audio, Img, staticFile, interpolate, spring, Easing, random, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";

const f = useCurrentFrame();                // frame inside the current Sequence
const { width, height, fps, durationInFrames } = useVideoConfig();
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const x = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
const s = spring({ frame: f - 30, fps, config: { damping: 12, stiffness: 200 } });   // 0 -> 1 (overshoots)
const r = random(`seed-${i}`);              // deterministic 0..1
```

- `<Sequence from={30} durationInFrames={60}>` shifts frame 0 for its children. `<Series>` with `<Series.Sequence durationInFrames>` chains scenes.
- `<Audio src={staticFile("sound.wav")} />` (file in `public/`). Volume can be a function of frame.
- `@remotion/paths`: `getLength(d)`, `getPointAtLength(d, len)` for following SVG paths; `evolvePath(progress, d)` for draw-on strokes. Or `pathLength="1"` with `strokeDasharray="1"` and `strokeDashoffset={1 - p}`.

## Gotchas (each one has cost real time)

- **Clamped interpolations hold their first value backwards in time.** `interpolate(f - hit, [0, 1, 8], [0.9, 0.7, 0], clamp)` is 0.9 for every frame *before* the hit, which washes out the whole build-up. Gate one-shot effects: `f < hit ? 0 : interpolate(...)`.
- **Fonts**: load with `new FontFace(name, url(staticFile(...)))` inside `delayRender`/`continueRender`, or text renders in a fallback face on some frames. Don't depend on Google Fonts at render time; the renderer may have no network.
- **No `Math.random`, `Date.now`, CSS transitions, `@keyframes` or `setTimeout`**: the renderer captures frames out of order and in parallel. Everything must be a pure function of the frame.
- **SVG ids must be unique** per component instance (gradients, clipPaths, filters), or one instance's defs leak into another's.
- `spring()` with a negative frame returns 0: fine for "not started yet", but remember it overshoots above 1 when mapping to scale.
- Large `feGaussianBlur` / `backdrop-filter` / `box-shadow` on every frame slow rendering a lot. Prefer radial gradients for glows.
- `mix-blend-mode: screen` needs a dark backdrop to read as light; on light backgrounds use `multiply` for the inverse effect.
- Render at the final size. Scaling a 1080 composition up to 4K softens strokes.

## render.mjs (template)

`node render.mjs` renders every composition in `Root.jsx` to `out/<id>.mp4`. `node render.mjs Id1,Id2` limits to some. `node render.mjs Id 0,40,84` renders those frames as PNG stills. It looks for a browser in `$CHROME`, then Playwright's headless shell under `/opt/pw-browsers`, and otherwise lets Remotion download its own Chrome Headless Shell.

Encoding defaults: H.264, `crf: 16`, `yuv420p`, AAC 320 kbps. That suits Instagram, TikTok and YouTube.
