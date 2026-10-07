# Motion graphics showcase reel (WTC launch film)

33 s, 1080x1920, 30 fps. A plain product photo gets scrolled past, then the WTC launch film
(`public/wtc.mp4`, 25 s 16:9) plays in full in a screen frame while labels name each technique; Dev narrates
and closes on the offer (DM "Motion" for a free sample). Built on the Subscription Killer rig (Dev, captions, voice).

```
npm install
ffmpeg -i public/wtc.mp4 -vn -ac 2 -ar 48000 sound/wtc.wav          # the film's soundtrack becomes the music bed
python3 vo/vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>     # voice-over -> vo/vo.wav + src/vo.json
python3 <skill>/scripts/sound.py sound/cues.json sound/sfx.wav     # reel sounds (hook, turn, labels, CTA)
python3 vo/mix.py                                                   # film audio + sounds + voice -> public/sound.wav
node render.mjs                                                     # out/MotionShowcase.mp4
```

- Timeline, technique labels (film clock): `src/timing.js`. Lines and their frames: `vo/vo.py` (`LINES`).
- Client name, CTA keyword, URL: `src/Root.jsx`. Dev's gestures: `src/Presenter.jsx`.
