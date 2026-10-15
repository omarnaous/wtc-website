---
name: apple-motion-graphics
description: Apple-grade motion graphics built in code (Remotion). Use when the brief says Apple, Apple-style, "like an Apple ad", Apple keynote or WWDC look, Mac or iPhone launch film, the MacBook notch, macOS/iOS UI animation, "premium and minimal like Apple", or asks for one of the Claude Motion effects (button to player, search to results, chart morph, spring stack, magnetic dock, masked or elastic type, glass focus, particle logo...). Covers three formats: a Mac notch launch film, a single 8-second looping UI effect, and an Apple-style product/keynote ad. Writes the 8-part motion brief first, uses only real words and numbers, and renders verified MP4s with sound. Separate from the motion-graphics skill (that one is loud and punchy; this one is quiet, physical and precise).
---

# Apple motion graphics

Turn a product and a facts list into Apple-grade motion: critically damped springs, motion worked out from the start of the film, one caption per scene, translucent materials, tight type, sparse sound. Everything is drawn in code, no screen recordings, no stock UI.

What makes it look like Apple is restraint. Fewer things move, each one moves physically, nothing overshoots unless it was thrown, and every word on screen is true.

## Files

| Path | What it is |
|---|---|
| `references/rules.md` | **Read first.** The Apple rules translated to Remotion: springs, `chain`, type, materials, captions, sound, the final check |
| `references/apple-design.md` | Emil Kowalski's apple-design skill (Apple's WWDC design talks), for depth |
| `references/launch-film.md` | Charlie Hills' Mac notch launch-film workflow |
| `references/brief.md` | The 8-part Claude Motion brief (motion-prompt-writer), with the Apple-style default palette |
| `references/effects.md` | The 16 effects as build recipes on one 8 s clock |
| `references/effects-workflow.md` | How to pick and run an effect, and judge it |
| `assets/apple.jsx` | The kit: `appleConfig`, `aspring`, `chain`, `useFonts`/`fonts`, `type`, `Caption`, `Wallpaper`, `MenuBar`, `Notch`, `Glass`, `Lines`, `Hello`/`HELLO_D` |
| `assets/fonts/` | Inter 400–700 (OFL), the stand-in for SF Pro |
| `assets/template/` | Starter project: `Film` (1920×1080 notch film), `FilmReel` (9:16), `Loop` (1080×1080, effect 01, seamless) |
| `scripts/` | `scaffold.sh`, `sound.py`, `contact_sheet.py`, `verify.sh` |
| `LICENSES.md` | MIT and OFL notices for the sources |

## Workflow

### 1. Intake: the facts first

Ask in one batch (four questions or fewer), only for what is missing, then wait:

1. **Product name and its one line**, word for word.
2. **The facts list**: every feature, number and requirement that may appear. Nothing else goes on screen.
3. **The moment(s)**: for a film, 6 to 8 scenes, each one feature plus one short caption; for an effect, one change (before and after).
4. **Brand and size**: hex codes, font, logo file (look for them in the workspace first, never guess a hex code). No brand → the Apple-style default from `references/brief.md` (light `#F5F5F7`, blue `#0A84FF`, Inter, tight tracking), labelled "Apple-style default, replace with your brand".

A reference film or frames (in `ref/`) set the look only. Never copy its words, product or icons.

### 2. Pick the format

- **(a) Mac notch launch film**: menu bar, the black notch growing into widgets scene by scene, a gradient wallpaper and one caption per scene, opening on "hello", closing on the resting notch with the product line. Follow `references/launch-film.md`. Default 1920×1080, 30 fps, ~2.5 s a scene.
- **(b) One motion effect**: pick from the 16 in `references/effects.md` (or the closest fit to the moment). 8 s seamless loop: move 0–2.2 s, hold to 6.6 s with one small thing still alive, return by 8.0 s. Hero fills 60–70% of the frame, hero word or number ≥ 120 px, labels ≥ 34 px, ≤ 5 words.
- **(c) Apple-style product or keynote ad**: big type on black or `#F5F5F7`, the product as the only hero, slow camera, one claim per beat. Use the rules and kit; borrow the film's scene rhythm.

### 3. Write the brief (internally, or hand it over if asked)

Fill the 8 parts from `references/brief.md`: The bar, Format, The one rule, Look, Motion, Never, Before you finish, The scene. If the user only wants a prompt for Claude Motion, output that brief in one code block and stop there. Otherwise it is your spec for the build.

### 4. Scaffold and build

```bash
bash <skill-dir>/scripts/scaffold.sh <project-dir>   # template + src/apple.jsx + Inter in public/ + npm install + sound
```

- Put real words in the props in `src/Root.jsx`; put scene starts, notch sizes and effect phases in `src/timing.js` (picture and sound read the same numbers).
- `Film.jsx` and `Loop.jsx` are starters. Rewrite the scenes for the brief; keep the kit pieces.
- Springs: `aspring(f, at, ratio, response)`, ratio 1 by default, ~0.8 only after a throw. Any value that changes target more than once goes through `chain(f, keys)` so it never jumps at a scene boundary.
- Widgets add no claims: placeholder copy is `Lines`. Any UI word not in the facts list (a button label, a clock time) gets listed back to the user for approval.
- `MenuBar glyph={false}` unless the piece is about a real Mac; never use Apple's logo or trademarks as if the piece were official. Label it spec or inspired work unless the client is Apple.
- Remotion rules: everything from `useCurrentFrame()`, no CSS transitions or `Math.random`, fonts loaded with `useFonts(fonts)`.

### 5. Sound

Causal, harmonious, sparse. Every cue has a visible cause on the same frame, tonal cues sit in one key, nothing sharp:

```bash
python3 <skill-dir>/scripts/sound.py sound/film.json public/film.wav
```

Use `pad`, `drone`, `click` (freq ~600), soft `chime` (440–880), quiet `whoosh`; `"lowpass": 6000` and `"peak_db": -3`. Loops get `"loop": true`. No impacts, risers, glitches or beat drops. Also render a no-sound version when the user will add music in-app.

### 6. Review stills, then render and verify

```bash
node render.mjs Film 20,60,95,170,240,320          # one frame mid-scene + one while each spring still moves
python3 <skill-dir>/scripts/contact_sheet.py out/ out/sheet.png
node render.mjs Film
bash <skill-dir>/scripts/verify.sh out/Film.mp4     # add --loop for effects: first and last frame must match
```

Judge every still as a design director, then again at 200 px wide. Fix what is generic, cheap, too small or empty. Compare against the reference scene by scene if there is one.

### 7. The Apple check (before delivering)

- Would a stranger believe it is a real Mac or iPhone screen for the first second?
- Is every word on screen from the facts list, or approved?
- Any overshoot without a throw? Any value that jumps between scenes?
- Any sound without a cause, or a cause without its sound?
- Does the loop's last frame match its first (effects)?
- Is there anything on screen you can't defend? Remove it.

### 8. Deliver

Send the MP4s. Reply in short: a timeline table (seconds, what you see, what you hear), what to change and where (props in `Root.jsx`, frames in `timing.js`, cues in `sound/*.json`), and honest flags (placeholders, assumed brand, spec work, stills checked rather than playback).
