# Apple rules, translated to Remotion

Use this whenever the brief says **Apple, Apple-style, keynote, Mac/iPhone launch, "like an Apple ad", notch animation,
macOS/iOS UI film, WWDC look, premium/minimal like Apple**. It overrides the motion-graphics house style where they disagree
(Apple mode is quieter: fewer effects, no shake, no glitch, no confetti, no RGB split, no vine booms).

Sources merged here (full text kept alongside for depth):
- `apple-design.md`: Emil Kowalski's *apple-design* skill (Apple's WWDC talks, chiefly *Designing Fluid
  Interfaces* 2018, *The Details of UI Typography* 2020, *Designing Audio-Haptic Experiences*, *Principles of Great Design*).
- `launch-film.md`: Charlie Hills' *apple-launch-film* workflow (the Mac notch launch film, built in code).
Both are translated below from web/HTML to Remotion. The kit is `assets/apple.jsx` (+ Inter fonts in
`assets/fonts/`, OFL); copy both into the project.

## 1. Ask for (or extract) five things first

1. **Product name and its one line**, word for word.
2. **The facts list.** Every feature, number and requirement the film may show. *Nothing else goes on screen.*
3. **The scenes**, 6 to 8, each = one feature + one short caption ("Your voice lives here.").
4. **A reference** (optional): a real Apple film or frames of one. It sets the look only; never copy its words or product.
5. **Size and length.** Default 1920x1080 30 fps, ~2.5 s a scene (a 9:16 cut can be made from the same component).
Missing facts are asked for, never invented. Any UI word the facts didn't give you (button labels, a clock time, an app
name) is listed back to the user for approval. Widgets show placeholder grey lines (`Lines`), not made-up copy.

## 2. The Apple look

- **One idea, one caption per scene.** Short, declarative, centred. Tint the last word or two a lighter shade of the
  scene's colour (`Caption tintWords`). No sentence longer than ~6 words on screen.
- **Stage:** black, or a full-screen macOS gradient wallpaper per scene (`Wallpaper`: two soft blooms over a base), or a
  clean white/grey product stage. Lots of empty space; the subject owns the centre.
- **Type:** SF Pro is not bundleable; use **Inter** (`type(px)` helper). Tracking is size-specific: display −0.03 to
  −0.035em, headings −0.02em, body ~0, small text slightly positive. Leading tight on large type (1.02–1.08), looser on
  body (1.35–1.5). Build hierarchy from weight + size + leading together. Weights: 600 display, 500 UI, 400 body.
- **Materials:** translucent glass for floating UI (`Glass`: `backdropFilter: blur() saturate(180%)`, bright 1 px top
  edge, deep soft shadow; bigger surfaces = stronger blur and deeper shadow). Never stack light glass on light glass.
  Glass *materializes*: blur radius and scale animate in together, not a plain fade.
- **Colour:** one hue family per scene, deep base + two blooms; text white, accent = lighter tint of the wallpaper.
- **The Mac launch-film format** (Hills): a thin macOS menu bar (≤ 5 items, `MenuBar`), the black notch at the top
  centre (`Notch`) growing into Apple-style widgets one scene at a time, a gradient wallpaper per scene, one caption
  below the notch. Open: notch expanded on black with **"hello"** drawn in a white script line (`Hello` + `HELLO_D`).
  Close: black, the notch springs back to its resting shape, caption = product + its one line.
  Always *name* the notch in your own reasoning ("the black notch at the top centre of the screen"); don't draw a laptop.

## 3. Motion: behaviour, not animation

- **Springs, not tweens**, for everything that moves. Think in Apple's two parameters:
  - **damping ratio**: 1.0 = critically damped, no overshoot (**the default for everything**). ~0.8 = slight bounce,
    **only when the motion was thrown/flicked** (a card tossed in, a momentum move). Overshoot on a fade-in caption or a
    menu reads wrong.
  - **response** (seconds, not a duration): 0.3–0.4 for UI; 0.45–0.55 for big surfaces and captions.
  - Shipping values: move/reposition 1.0 / 0.4 · rotation 0.8 / 0.4 · drawer/sheet 0.8 / 0.3.
  - Remotion: `appleConfig(ratio, response)` → `{ mass: 1, stiffness: (2π/response)², damping: 4π·ratio/response }`;
    `aspring(f, at, ratio, response)` is the call. (1.0/0.4 ≈ stiffness 247, damping 31.)
- **Work motion out from the start of the film** (Apple's "animate from the presentation value"). A value that changes
  target several times (the notch width, a card position) is ONE `chain(f, [[frame, target], ...])`: every new target
  springs from wherever the value is at that moment. Never a separate tween per scene; that jumps. If the notch reopens
  before it finished closing, it carries on from where it is.
- **Width and height on their own springs** (the notch opens soft, closes without overshoot): separate `chain`s.
- **Decompose 2-D moves** into independent x and y springs.
- **Spatial consistency:** enter and exit along the same path (in from the right → out to the right); things grow
  from their source (`transformOrigin` at the trigger: a widget unfolds out of the notch, a popover from its button).
  Reversible moves use mirrored easing (`easeIn` / `easeOut` pair in the kit).
- **Hint the direction:** in-between frames should point at the outcome (Control Center modules grow up and out).
- **Momentum:** a thrown element lands where its velocity projects it (`current + (v/1000)·d/(1−d)`, d ≈ 0.998), then a
  ratio-0.8 spring settles it. Hitting an edge rubber-bands (`overshoot·dim·0.55/(dim + 0.55·|overshoot|)`), never a hard stop.
- **Frame-level smoothness:** keep per-frame displacement small; very fast moves get a little motion blur/stretch
  rather than a hard streak. Only animate transform/opacity/filter.
- **Quiet camera:** slow push-ins (2–4 % over a scene), no shake, no punch-zooms, no flashes except one soft light bloom
  on the final mark. Cuts are rare; scenes hand over by cross-fading wallpapers while the notch/UI keeps moving.
- **Reduced-motion variant** (offer it): springs → short opacity cross-fades, no overshoot.

## 4. Sound: causality, harmony, utility

- **Causality:** a sound only where something visibly causes it (the notch snapping open, a toggle, a card landing, a
  keypress), and its character matches the physicality (soft UI tick for a notch, glassy chime for success).
- **Harmony:** sound fires on the **same frame** as its visual cause. Put both on the same timing constant.
- **Utility:** few sounds, only meaningful moments (open, commit, success, the final mark). Over-scoring trains people
  to ignore it. Apple-style beds are minimal: a soft piano/pad or a gentle pulse, often near-silence with UI foley;
  the final mark gets one clean chord. Use `click`, `tick`, `glint`, `chime`, `pad` cues (sound.md), or the real
  CC0 UI samples in `assets/sfx/` (press, toggle-on, success, notification) at low gain. No impacts/risers/booms.

## 5. Design foundations to reason with (WWDC 2026 *Principles of Great Design*)

Purpose (decide what not to show) · Agency · Responsibility (no claims you can't back) · Familiarity (real macOS/iOS
patterns, honoured physics) · Flexibility · **Simplicity, not minimalism** (strip the unnecessary, keep the context
that clarifies) · **Craft** (every spacing/timing value is deliberate and defensible; nothing jittery or misaligned) ·
Delight (the result of the other seven, not confetti on top). Decide the one emotion (calm, confident, excited) and
make every choice reinforce it.

## 6. Build + check (in the normal workflow)

1. Copy `assets/apple.jsx` into `src/`, the Inter woff2 files into `public/`, and load them with `useFonts(fonts)`.
2. Put scene starts, notch keys and caption frames in `timing.js`; picture and sound read the same constants.
3. Stills review: one frame mid-scene for every scene **plus** the frame where each spring is still moving. If a
   reference exists, compare side by side and fix what differs (Hills found an off-centre oversized "hello", a chunky
   progress bar that should have been thin ticks, a prompt jammed into the menu bar).
4. The Apple check before delivering:
   - Would a stranger believe it is a real Mac/iPhone screen for the first second?
   - Is every word on screen from the facts list (or approved)?
   - Any overshoot that wasn't caused by a throw? Any value that jumps at a scene boundary? (→ use `chain`.)
   - Any sound without a visible cause, or a cause without its sound on the same frame?
   - Is there anything on screen you can't defend? Remove it.
- It is a spec/inspired piece unless the user is Apple: don't use Apple's logo or trademarks as if it were official;
  the Apple glyph in `MenuBar` is the generic macOS UI element, keep the film's own product as the hero.
