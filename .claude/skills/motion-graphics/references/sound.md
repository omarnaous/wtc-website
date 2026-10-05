# Sound design

`scripts/sound.py cues.json out.wav` mixes synthesized cues into a 48 kHz stereo WAV, soft-clips and normalizes to -1 dBFS. Everything is generated from noise and oscillators, so it is royalty-free.

## cues.json

```json
{
  "fps": 30, "duration": 8.0, "seed": 7,
  "cues": [
    { "type": "tick",   "frame": 10, "gain": 0.18 },
    { "type": "riser",  "start": 21, "end": 80, "gain": 0.6 },
    { "type": "impact", "frame": 84, "gain": 0.95 },
    { "type": "chime",  "frame": 112, "gain": 0.22, "pan": 0.25 },
    { "type": "whoosh", "frame": 126, "gain": 0.1 },
    { "type": "pad",    "start": 84, "gain": 0.07, "chord": [110, 164.8, 220, 277.2, 329.6] },
    { "type": "glint",  "frame": 170, "gain": 0.06 },
    { "type": "beat",   "start": 0, "end": 360, "bpm": 120, "pattern": "four-on-floor", "gain": 0.5 }
  ]
}
```

Cue types and when to use them:
| type | sound | use for |
|---|---|---|
| `tick` | short glassy click | something small appearing, a spark, a cursor |
| `riser` | swept noise + gliding tone, cut dead at `end` | tension before a hit (end it 3-6 frames before the hit) |
| `impact` | sub drop + punch + crack + reverb boom | the main hit / logo landing |
| `chime` | bright bell with long shimmer | a detail landing, a reveal, success |
| `whoosh` | airy band-passed swell | text sliding in, transitions, camera moves |
| `pad` | soft chord bed (`chord` in Hz), fades in | under holds and end frames |
| `glint` | faint high sparkle | sheens, highlights |
| `drone` | low evolving bed | loops, dark openings, 3D scenes |
| `kick` / `snare` / `hat` | single drum hits | accenting individual words or cuts |
| `beat` | full pattern at `bpm` (`four-on-floor`, `half-time`, `trap`) | kinetic type, showreels, data stories |

## Levels

Impact around 0.9-1.0, riser 0.5-0.6, beat 0.4-0.6, chime 0.2, whoosh 0.1, pad 0.05-0.08, glint 0.05. The mix is normalized after summing, so these are relative. Pan small details (±0.2-0.5) and keep hits centered.

## Beat grid

`python3 sound.py --grid --bpm 120 --fps 30 --bars 6` prints the frame of every beat. Put word or cut changes on those frames (store them in `timing.js`). 120 BPM = 15 frames per beat at 30 fps, which is comfortable for word-per-beat kinetic type. Use 100 BPM (18 frames) for calmer lines and 140 BPM (12.86 frames, round per beat) for frantic ones.

## Loops

For seamless loops set `"loop": true` at the top level. `sound.py` then snaps pad and drone frequencies to whole cycles per loop, filters noise circularly, and wraps anything that rings past the end back onto the start, so the audio is periodic by construction. Use `drone`/`pad` spanning the whole duration plus hits placed on the beat grid.
