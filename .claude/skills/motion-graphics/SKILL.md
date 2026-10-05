---
name: motion-graphics
description: "Design and render finished motion graphics videos (MP4 with sound) in code with Remotion. Use this whenever the user asks for any animated video or motion piece, even casually: logo reveals or intros/outros, showreels, kinetic typography or animated quotes/lyrics, seamless loops or animated backgrounds, 3D abstract loops, animated data stories, charts or infographics, product/app promos, Instagram Reels/Stories/TikTok/Shorts clips, YouTube intros, explainer animations, title cards, lower thirds, animated posters, or 'make it move'. Also use it to edit, re-time, re-brand or re-render an existing Remotion project. Do not use for static images, or for adding interactive animations to a website or app UI."
---

# Motion Graphics

Turn a short brief into a finished, rendered video: a creative treatment, a beat sheet, React/Remotion compositions, synthesized sound locked to the picture, a still-frame review, and verified MP4s in the right formats.

The user sees the result, not the code. What separates a showreel-grade piece from a template is **timing, contrast and one idea carried all the way through**, so most of the effort here goes into the treatment and the beat sheet before any code.

## Workflow

### 1. Read the brief, fill the gaps with defaults

Extract: subject, duration, aspect ratio, platform, text that must appear (exact spelling), brand (colors, logo, fonts), tone words ("punchy", "premium", "hypnotic"), sound, and the ending frame.

Don't stop to ask about things with a sensible default. State the assumption in one line and move on:
- No aspect given → infer from platform (see `references/formats.md`); "Instagram" alone → 4:5 feed **and** a 9:16 cut.
- No fps → 30. No sound mentioned → still design sound; motion pieces land harder with it.
- No brand → invent a tight palette (one ink, one paper, one accent) and a type pairing that fits the subject.
- A brand exists in the workspace (logo SVG, `brand.js`, tokens, earlier projects) → use it exactly. Grep for it before inventing anything.

Ask only when the answer changes the whole piece (e.g. two contradicting brands, or facts/figures you'd have to make up).

### 2. Write the treatment and beat sheet (in your head or a comment, not a long chat message)

- **The one idea.** One sentence: what carries the piece from first frame to last? (e.g. "the spark ignites, draws the logo, leaves before the hit, and returns as the i-dot"). Every effect should serve it.
- **Beat sheet** in frames at the chosen fps: anticipation → action → settle, with a deliberate quiet beat before every big hit. Put the frame constants in `src/timing.js`; picture and sound both read from it so they can never drift.
- **Hierarchy.** One loud moment per 3-5 seconds; everything around it is quieter.
- **The end frame** is a designed still (it becomes the thumbnail and the loop point). Hold it at least 1.5 s for logos and CTAs.

Read `references/craft.md` for timing, easing, the impact recipe, kinetic-type rules, loop math, 3D and data-story techniques. Read `references/prompt-patterns.md` for how to interpret common brief types (showreel, logo reveal, kinetic type, seamless loop, data story).

### 3. Scaffold the project

```bash
bash <skill-dir>/scripts/scaffold.sh <project-dir>     # copies assets/template, installs pinned Remotion
```

The template has `src/index.js`, `src/Root.jsx` (one `<Composition>` per format), `src/timing.js`, `src/Main.jsx` (a starter scene with font loading and helpers), `render.mjs` (renders MP4s or still frames) and `sound/cues.example.json`. Copy brand files into `src/` and fonts into `public/` (load fonts with `FontFace` + `delayRender`, as the template does; never rely on system or Google fonts at render time).

Remotion API notes and the gotchas that cost real time are in `references/remotion.md`. Read it before writing compositions.

### 4. Build the compositions

- Write each scene as a component; sequence with `<Series>` / `<Sequence>`.
- Drive everything from `useCurrentFrame()`: `interpolate` with explicit clamping, `spring` for physical moves, `random(seed)` for deterministic particles. No `Math.random`, no CSS transitions or `@keyframes` (they don't render frame-accurately).
- Lay out with `useVideoConfig()` width/height so one component renders every aspect ratio. Keep text inside the platform safe zones.
- Use the brand's real geometry (SVG paths) for logos. Never approximate a logo with a font.

### 5. Sound

Generate the soundtrack from the same beat sheet with `scripts/sound.py` (numpy + scipy; royalty-free, built from scratch):

```bash
python3 <skill-dir>/scripts/sound.py sound/cues.json public/sound.wav
```

Cue types: `tick`, `riser`, `impact`, `chime`, `whoosh`, `pad`, `kick`, `snare`, `hat`, `glint`, `drone`, plus `beat` for a whole drum pattern at a BPM. Each cue takes a `frame` (or `start`/`end`), `gain` and `pan`. Read `references/sound.md` for mixing levels and the beat-grid helper (kinetic type "on the beat" means word changes land on the grid frames printed by `sound.py --grid`).

Mount it with `<Audio src={staticFile("sound.wav")} />` in every composition. If the user supplies music, use theirs and cut the beat sheet to its beats instead.

### 6. Review stills before rendering video

```bash
node render.mjs <CompositionId> 12,40,83,84,86,110,239   # renders PNG stills into out/
python3 <skill-dir>/scripts/contact_sheet.py out/ out/sheet.png
```

Pick frames around every beat (just before, on, and after each hit) plus the first and last frame. Look at the sheet and fix what's wrong: clipped text, washed-out frames, things visible before they should be, elements off the safe zone, an end frame that isn't composed. Expect at least one round of fixes. This is far cheaper than finding problems in a full render.

### 7. Render and verify

```bash
node render.mjs                         # every composition -> out/*.mp4 (h264, crf 16, AAC 320k)
bash <skill-dir>/scripts/verify.sh out/*.mp4
```

`verify.sh` checks streams (video + audio), duration, resolution, fps and loudness, and extracts frames at 10/50/90% into a sheet. For loops it compares the first and last frames (pass `--loop`). Fix and re-render until it passes.

### 8. Deliver

Send the MP4s (and the end-frame PNG if useful). In the reply, keep it short:
- What happens, as a timeline table with seconds (beats and what you hear).
- The one idea, in one line.
- What to change and where (props in `Root.jsx`, constants in `timing.js`, cues in `cues.json`).
- Honest flags: placeholder or sample data, anything you assumed (brand, URL, facts), anything you couldn't verify (you checked stills, not playback).

If the work lives in a git repo, commit the project source (not `node_modules/` or `out/`).

## Quality bar

Before delivering, check the piece against these. Each one is a common failure:

- **Contrast in time.** Is there a quiet beat before the biggest moment? Without one, the hit doesn't feel like a hit.
- **Nothing static for more than about 1 s** except the final hold, which still breathes (slow push-in, glow, drift).
- **Every motion has easing and follow-through.** Nothing starts or stops linearly unless that's the point (tickers, counters, mechanical moves).
- **Text is readable**: on screen long enough to read twice (roughly 0.3 s per short word, minimum 0.6 s per line), large enough on a phone, inside safe zones.
- **Facts are real.** Use the user's numbers exactly; label anything illustrative as sample data. Never invent clients, stats or quotes and present them as real.
- **Sound and picture agree.** Every visual hit has a sound, and every sound has a visual cause.
- **The end frame works as a still** (thumbnail, loop point, last impression).
