# Technical gotchas (save the hours)

## Remotion
- Projects in `wtc-website/` symlink `node_modules` → `../appify-balloon/node_modules` (Remotion 4.0.532) instead
  of reinstalling. `render.mjs`: `node render.mjs` (all), `node render.mjs A,B` (comma list, not spaces),
  `node render.mjs A 0,40,84` (PNG stills), `FRAMES=240-520 MUTED=1`.
- A video inside a scene must sit in `<Sequence from={sceneStart}>` or it plays from the global start (and goes
  black after its length).
- Three.js textures: preload the Image before the canvas mounts. Do per-frame mutations during render, not in
  `useLayoutEffect` state. Set `visible = true` explicitly after hide checks.
- Mask reveals clip accents (É, À): pad the line (`paddingTop .3em` + negative margin).
- No CSS transitions/keyframes; everything from `useCurrentFrame()`. `random(seed)` only.
- Large wide canvases for carousels: render each slide as its own 1080×1350 composition that draws its slice of
  the shared geometry (offset by −1080 × slide).

## Capture and media
- Headless shell has no H.264: serve WebM, spoof `canPlayType`, answer Range requests with 206.
- Reload after warming lazy images so one-shot reveal animations still play.
- Routed browser (`routed.mjs`) for external pages behind the agent proxy; run with
  `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
- Cut-outs: `rembg` with `isnet-general-use` + alpha matting.
- Rasterize SVG → PNG with Playwright `screenshot({ omitBackground: true })` (no cairosvg installed).

## Sound
- `sound.py` cue type names: tick, riser, impact, chime, whoosh, swoosh, swish, thump, pop, blip, click, glint,
  pad, sample, house, lofi_tape… Regex parsing timing files: match `\bNAME = (\d+)` (multi-const lines).
- Always keep tonal cues in the bed's key; peak −3 dBFS; render an effects-only mix.

## Git and files
- Work on the session branch, commit every finished change, push with retries. Commit messages end with the
  session's attribution lines; no model names in commits.
- The repo is public: keep client licensed fonts, hero films, lookbook photos, site captures and renders out of
  git (`.gitignore` the folders; exports go in `exports/<project>/`, also ignored).
- Never `rm` a bare `$VAR` path: use `"${VAR:?}"/…`. Never `pkill -f`.
- Never commit `.admin-password.txt` or `.dev.vars`.
