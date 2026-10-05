# Shopify Killer reel

~32 s, 1080×1920. The voice leads: scenes, captions, Dev's gestures and the sound design all follow the voice-over. Dev (the Appify mascot) narrates bottom-left with lip-sync and karaoke captions.

```
npm install
pip install kokoro-onnx praat-parselmouth
python3 vo/vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # voice-over (Kokoro am_puck, re-intonated per phrase) -> vo/vo.wav + src/vo.json
python3 sound/retime.py                                           # sound design (cues.base.json) moved onto the voice timing -> sound/cues.json
python3 <skill>/scripts/sound.py sound/cues.json sound/sfx.wav   # music + foley
python3 vo/mix.py                                                 # ducks music under the voice -> public/sound.wav
node render.mjs                                                   # out/ShopifyKiller.mp4
```

- Script and delivery (pace, pitch, melody per sentence; pauses; each scene's lead and minimum length): `vo/vo.py` (`SCRIPT`). Captions come from the same list, and scene starts are computed from the voice.
- Offer numbers, product name, CTA, URL: `src/Root.jsx`.
- Dev rig (hair, tee, expressions, pointing): `src/Dev.jsx`; moods and pointing moments: `src/Presenter.jsx`.
- Kokoro models: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
