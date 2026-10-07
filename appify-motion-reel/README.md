# Motion graphics showcase reel (WTC launch film)

~40 s, 1080x1920, 30 fps, on the same graph paper as the Subscription Killer post. One continuous voice-over leads:
(`public/wtc.mp4`, 25 s 16:9) plays in full in a screen frame while labels name each technique; Dev narrates
and closes on the offer (DM "Motion" for a free sample). Built on the Subscription Killer rig (Dev, captions, voice).

```
npm install
ffmpeg -i public/wtc.mp4 -vn -ac 2 -ar 48000 sound/wtc.wav          # the film's soundtrack becomes the music bed
python3 vo/vo.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>     # voice-over -> vo/vo.wav + src/vo.json
python3 sound/build_cues.py                                          # sound cues on the voice anchors
python3 <skill>/scripts/sound.py sound/cues.json sound/sfx.wav     # reel sounds (hook, turn, labels, conversion, CTA)
python3 vo/mix.py                                                   # film audio + sounds + voice -> public/sound.wav
node render.mjs                                                     # out/MotionShowcase.mp4
```

- Timeline, technique labels (film clock): `src/timing.js`. Lines and their frames: `vo/vo.py` (`LINES`).
- Client name, CTA keyword, URL: `src/Root.jsx`. Dev's gestures: `src/Presenter.jsx`.
- The data beat uses Wyzowl State of Video Marketing 2026 figures (85% / 83%), source shown on screen: `DATA` in `src/timing.js`.
- Sound: same palette as Subscription Killer (lo-fi bed + hits); the film is muted (`FILM_GAIN` in `vo/mix.py`).
