# Shopify Killer reel

30 s, 1080×1920, 120 BPM. Dev (the Appify mascot) narrates bottom-left with lip-sync and karaoke captions.

```
npm install
python3 vo/vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # voice-over (Kokoro am_michael) -> vo/vo.wav + src/vo.json
python3 <skill>/scripts/sound.py sound/cues.json sound/sfx.wav   # music + foley
python3 vo/mix.py                                                 # ducks music under the voice -> public/sound.wav
node render.mjs                                                   # out/ShopifyKiller.mp4
```

- Script lines and their scene timings: `vo/vo.py` (`LINES`). Captions come from the same list.
- Offer numbers, product name, CTA, URL: `src/Root.jsx`.
- Dev rig (hair, tee, expressions, pointing): `src/Dev.jsx`; moods and pointing moments: `src/Presenter.jsx`.
- Kokoro models: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
