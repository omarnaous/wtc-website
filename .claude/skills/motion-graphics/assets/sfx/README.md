# Bundled UI sound effects (CC0)

From uisfx 0.4.0 (npm, https://github.com/romainsimon/uisfx). Audio is CC0-1.0 (public domain, commercial use OK),
see LICENSE-AUDIO. Use them with the `sample` cue: `{"type": "sample", "file": "<path>/send.ogg", "frame": 44, "gain": 0.6}`.

Picked for being in tune with A440 music:
- "minimal" pack (tuned to A440, +/-1 cent): send (A+B), receive (C+E), select (F), snap (C#), add-to-cart (F+C),
  open (E), checkout (D+A#), purchase (E+A), notification (F), toggle-on (E), progress-step (D#), level-up (E B G#),
  success (D+B), reward (B+E), achievement (F# D A)
- "organic" swipe.ogg (G/A)
- "mechanical" typing.ogg, press.ogg (noise-like clicks, no pitch)

Tonal cues must sit in the chord of the bar they land in: move them only by whole semitones with
`"rate": 2 ** (n / 12)`, never by a random rate. Do NOT use the uisfx "glass" pack under music: it is tuned
about +45 cents sharp (a quarter-tone off A440) and sounds like a broken piano against any chord.
