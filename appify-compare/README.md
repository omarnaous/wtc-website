# Appify vs subscription builder (comparison)

17.3 s, 30 fps, 100 BPM. Feed 4:5 (1080x1350) and Reel 9:16 (1080x1920). A scoreboard: every row knocks the
subscription builder down and lights Appify up, 8/8, then the end card (own it, pay once, $360, CTA).

```
npm install
python3 <skill>/scripts/sound.py sound/cues.json public/sound.wav
node render.mjs            # out/Feed.mp4, out/Reel.mp4
```

- Rows, price, CTA, URL: `src/Root.jsx`. Beat timings: `src/timing.js`. Sound: `sound/cues.json`.
