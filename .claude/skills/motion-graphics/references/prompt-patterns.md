# Interpreting common briefs

Each pattern: what the brief really asks for, a default beat sheet, and what to watch.

## Showreel ("show what an incredible motion designer you are", 10-20 s)

The goal is range plus taste in a short time. Default 15 s at 30 fps (450 frames), 16:9 unless a platform says otherwise.
- 0-0.5 s cold open on a striking frame (a shape mid-explosion, giant type) with an impact.
- 5 chapters of ~2.5 s, each a different technique and color field: kinetic type on the beat, 3D geometry, data viz that draws itself, UI/product mockup flying in 3D, particles/liquid shape morph.
- One through-line object (e.g. a circle that becomes the dot, the planet, the chart point, the logo) carried by match cuts.
- End 2-3 s on the maker's logo/name with a CTA (site or handle). Use the user's brand if they have one.
- Sound: a 120-128 BPM beat, every cut on a downbeat, impacts on chapter changes.

## Logo reveal ("punchy and premium, satisfying hit when the logo lands", 6-10 s)

- Build-up (1.5-2.5 s): something meaningful to the brand assembles, traces or orbits; riser.
- Collapse + 3-6 frames of silence.
- Hit: the impact recipe in `craft.md`.
- Secondary beat 0.6-1.2 s later: a detail of the logo lands (dot, accent, icon) with a chime.
- Tagline / URL / services type in underneath, quieter. Hold ≥1.5 s on the finished lockup with a slow push-in and a sheen.
- If the logo is "just the wordmark", it is still the hero; build the motion from its own letters (outline trace, letter stagger, a letter's dot), not from unrelated shapes.
- If the brief names a brand that isn't the user's (a sample client), make it clearly fictional or confirm before using a real company's name, logo or domain.

## Kinetic typography of a quote ("every word should move on the beat", ~12 s, vertical)

- Pick BPM from duration and word count: words + ~4 beats of hold should fill the length. E.g. 13 words in 12 s → 120 BPM (24 beats): 1 word per beat for the first 13-16 beats, then hold the key phrase and the attribution.
- Split into 3-4 phrases; each phrase gets its own color field or layout; the key word ("future", "invent") gets the biggest treatment.
- Quotes: use the exact wording and attribute correctly (Alan Kay for "The best way to predict the future is to invent it."). End on the attribution.
- Beat pattern under it, word changes on beat frames from `sound.py --grid`, kick or snare accents on key words.

## Seamless 3D loop ("abstract geometric shapes that morph and orbit in depth, hypnotic", 10 s)

- Loop length D = duration × fps; every motion periodic in D (see `craft.md`).
- Real 3D with `@remotion/three`: 3-7 solids (icosahedron, torus, rounded box, sphere) orbiting at integer revolutions per loop, morphing between shapes with a periodic blend, soft studio lighting, a narrow palette, fog for depth, slow camera drift that also returns to start.
- Hypnotic means slow, smooth and continuous: no hard cuts, no impacts. Sound: `drone` + `pad` with `"loop": true`.
- Deliver the sizes the use needs (e.g. 1920×1080 for stream, 1080×1350 or 1080×1080 for the grid) and run `verify.sh --loop`.

## Data story ("make the speed-up feel dramatic", ~15 s vertical)

- Use the user's figures exactly (e.g. world population: 1B 1804, 2B 1927, 3B 1960, 4B 1974, 5B 1987, 6B 1999, 7B 2011, 8B 2022).
- Time is the story: a year counter running along a timeline whose screen time compresses as milestones get closer, with a counter for the value and a mark per milestone; the gaps (123 years → 33 → 14 → 13 → 12 → 12 → 11) shown as labels shrinking.
- Sound: a tick per year that accelerates into a continuous blur, an impact on each milestone getting faster, and silence before the final number.
- End on the takeaway in words plus the final figure, and a small source line if the user gave one.
