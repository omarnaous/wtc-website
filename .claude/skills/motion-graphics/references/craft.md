# Motion craft

Contents: timing & easing · the impact recipe · kinetic typography · seamless loops · 3D depth · data stories · transitions · texture & finish · showreel structure

## Timing and easing

- Work in frames at 30 fps (1 s = 30 frames). A beat is usually 6-18 frames; a hold 30-90.
- **Anticipation → action → settle.** Before a big move, a small move the other way or a pause (4-10 frames). After it, overshoot and settle with a spring.
- **Ease out for entrances, ease in for exits.** `Easing.bezier(0.16, 1, 0.3, 1)` (fast out, long settle) for things arriving; `Easing.bezier(0.55, 0, 1, 0.45)` for things leaving or being sucked away; `Easing.inOut(Easing.cubic)` for travel.
- **Springs** for anything physical: `spring({frame: f - start, fps, config: {damping, stiffness, mass}})`. Damping 7-9 = bouncy pop, 11-14 = confident slam with one overshoot, 18+ = smooth settle.
- **Stagger** letters by 1-2 frames, words by 3-6, cards by 6-10. Stagger turns a block into a wave.
- **Offset properties.** Position, scale, opacity and blur arriving on slightly different frames reads as richer than one combined tween.
- **Motion blur cheaply**: for 2-5 frames of very fast movement, add CSS `blur()` proportional to speed, and stretch along the direction of travel (scaleY 1.5-2 on a fast fall, then squash 0.6/1.4 on landing).

## The impact recipe (the "satisfying hit")

Stack these on the same frame. Each alone is weak; together they read as weight.
1. **Silence first**: 3-6 frames of nothing just before (picture dims, sound cuts dead).
2. **Scale slam**: element enters at 1.3-1.6× and springs to 1 (damping ~11, stiffness ~200), blurred for the first 4-5 frames.
3. **Flash**: full-frame white at 0.8 opacity for 1 frame, gone by frame 5. Gate it so it is exactly 0 before the hit (clamped interpolations hold their first value backwards in time).
4. **Camera shake**: offset the whole scene by `random()` noise with amplitude ~20 px decaying as `exp(-t/4.5)`.
5. **Chromatic split**: render the element 3× in pure R/G/B with `mix-blend-mode: screen`, offset ±12-16 px, converging over ~12 frames.
6. **Shockwave ring(s)** from the impact point, eased out over ~30 frames, stroke thinning as it grows.
7. **Particle burst**: 60-120 streaks with drag (`dist = v·τ·(1 - e^(-t/τ))`), a little gravity, fading over 18-50 frames; mix line streaks with a few brand shapes.
8. **Anamorphic streak**: a thin horizontal light line through the hit point, scaleX 0.1 → 1.6, gone in ~25 frames.
9. **Background bloom**: the radial glow behind the subject spikes then settles to a higher resting level than before.
10. **Sound**: `impact` cue on the exact frame (sub drop + punch + crack + boom tail).

A second, smaller hit 0.6-1.2 s later (a detail landing, like a dot onto an i) is what makes it feel designed rather than stock.

## Kinetic typography

- Lock words to a **beat grid** (`sound.py --grid --bpm N`). At 120 BPM a beat is 15 frames at 30 fps; key words land on downbeats, filler words on off-beats or grouped.
- One idea per screen. 1-4 words at a time; scale the important word up (2-3× the others) and change color, weight or treatment for it.
- Vary the entrance per word type: slam (scale), slide-in with mask, rotate-in letters, typewriter, split-flap, stretch. Don't use the same entrance three times in a row.
- Use hard cuts between full-frame color fields on downbeats for energy; keep the type position consistent between cuts so the eye isn't hunting.
- Vertical (9:16): stack words, very large (120-260 px), centered in the middle 60% of height.
- Quote pieces end on the attribution, held, smaller and quieter.

## Seamless loops

- Make every motion **periodic in the loop length D**: `Math.sin((frame / D) * 2π * k + phase)` with integer k. Rotations: `(frame / D) * 360 * k` degrees. Then frame D equals frame 0 by construction.
- Avoid one-shot entrances in a loop. If something must appear, make it appear and disappear inside the loop.
- Particles in loops: positions as `(seedOffset + frame / D * k) % 1` along a path.
- Verify with `verify.sh --loop`, which compares the last frame against frame 0 (render D frames, frames 0..D-1, so frame D wraps to 0).

## 3D depth without a 3D engine

- CSS 3D: a parent with `perspective: 1200-2000px`, children with `transform: translate3d(...) rotateX/Y(...)` and `transformStyle: "preserve-3d"`. Good for cards, phones and tilted type.
- For real geometry (morphing solids, orbiting shapes, lighting): `@remotion/three` with `<ThreeCanvas>` and react-three-fiber. Use frame-driven rotation, never `useFrame` clocks. MeshPhysicalMaterial with clearcoat, plus a rim light and fog, reads premium. Morph by interpolating vertex positions or `morphTargetInfluences` from the frame.
- Depth cues: scale with distance, blur and dim the far layers, parallax speed by depth.

## Data stories

- **Draw to scale.** One scale for marks, ticks and labels; labels name values the chart actually reaches. Use the user's numbers exactly.
- **Make the change felt, not just shown.** For accelerating data (e.g. population milestones), give each interval screen time proportional to its real duration at first, then compress: the eye feels the speed-up when gaps that took 123 years flash past in a second. A ticking year counter plus a counter for the value, and a sound cue per milestone that gets faster, sell it.
- Highlight the punchline value (color, scale, hold) and put the takeaway in words at the end.
- Label illustrative numbers as "sample data". Cite the source line small at the end when the user gave one.

## Transitions

Match cuts (a shape in scene A becomes a shape in scene B), mask wipes along the direction of motion, whip pans (fast translate + blur), zoom-throughs (scale into a letter's counter or a dot), color-field hard cuts on a beat. Plain crossfades are the weakest choice; use them only for calm moods.

## Texture and finish

- Background: never flat. Radial glow behind the subject, a faint grid or noise, and a vignette.
- Film grain: SVG `feTurbulence` with `seed={frame % 60}`, overlay at 5-8% opacity.
- Light: a specular sheen sweeping across a logo once during the hold (clip a skewed gradient to the letter paths).
- Restraint: one accent color, one display face, one mono or utility face for labels and timecodes.

## Showreel structure (10-20 s)

Open cold on the strongest frame within 0.5 s (it's the thumbnail and the scroll-stopper). Then 4-6 contrasting chapters of 2-3 s (type, 3D, data, UI or product, particles, logo), each with its own color field and technique, joined by match cuts on the beat. Keep one through-line (a shape, color or character that travels between chapters) and end on the maker's logo plus a call to action.
