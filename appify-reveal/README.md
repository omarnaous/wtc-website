# Appify logo reveal

8-second Remotion logo reveal with synthesized sound design.

```
npm install
python3 sound.py      # regenerates public/reveal.wav (needs numpy + scipy)
npm run studio        # preview and scrub in Remotion Studio
npm run render        # writes out/appify-reveal-feed-4x5.mp4 and out/appify-reveal-reel-9x16.mp4
```

- Beat timings live in `src/timing.js`; `sound.py` uses the same frames for its cues.
- The URL under the logo is the `url` prop in `src/Root.jsx`.
- `render.mjs` uses Playwright's headless Chromium at `/opt/pw-browsers/...`; set `CHROME=/path/to/chrome`
  or delete `browserExecutable` to let Remotion download its own.
