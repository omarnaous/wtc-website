# Logos for clients (the No Planz process)

1. **One idea first.** Turn the name and the product into one visual metaphor. No Planz (a social app for
   spontaneous meetups): "the z is a route, not a letter: people (dots) joined by one unplanned zig-zag".
2. **Wordmark from a free (OFL) display font, as outlines.** Fetch fonts through npm `@fontsource/<name>` (GitHub
   raw is blocked by the proxy); convert glyphs to SVG paths with `assets/tools/wordmark.py` (fontTools), then
   replace one letter with the custom symbol so word and icon share geometry. Unbounded 800 worked well for a bold,
   playful social brand.
3. **Palette**: one dark (night), one light (paper), 2–3 accents with meaning (each dot a different person).
4. **Explore 2–3 options on one board** and pick with a reason (No Planz: a three-person route inside a chat
   bubble read "social" fastest; the wordmark z kept the three people).
5. **When he says "more X"** (e.g. "more social connections"): change the concept, not just the colours: more
   people, a network, a chat bubble, and an animation where a crowd connects.
6. **Deliverables** (`export_svg.mjs` + `svg2png.mjs`): wordmark light/dark/on-colour SVG + transparent PNG (2400
   wide), the symbol, app icons (rounded) in 3 colourways + a **square store icon** (the stores round the corners),
   a brand board, and an animated logo reveal (Square, Reel, Wide, ~5.5 s, with sound and a held end frame).
7. **Reveal story**: the symbol's idea plays out (dots wander with no plan → connect into a network → three find
   each other → the route draws → hit with ring + burst → it slides into the wordmark → tagline). Flag the
   placeholder tagline and that you did not check trademarks.
