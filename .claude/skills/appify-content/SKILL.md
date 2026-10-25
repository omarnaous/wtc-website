---
name: appify-content
description: "Omar's playbook for Appify content: Instagram reels, carousels, thumbnails, captions, DMs, comment replies, motion graphics, logos and the Dev mascot. Use it for ANY content, marketing or motion-graphics task for Appify (appify-lb.com, @appifylb) or for Appify's clients (concept websites, launch reels, logos), and whenever the user mentions reels, carousels, thumbnails, captions, hooks, the mascot / Dev, a website showcase, an outreach DM, or 'make it more professional / higher conversion'. It holds his taste (what he liked and hated), Appify's brand and real prices, the mascot rig, the reel/carousel formats that worked, and ready tools. Use together with the motion-graphics skill for anything rendered."
---

# Appify content playbook

Everything learned from building Appify's reels, carousels, thumbnails, logos and outreach with Omar. Read the
reference that matches the task before starting; it is faster than rediscovering it.

| Task | Read |
|---|---|
| Anything (always) | `references/preferences.md`: how Omar works, what he loved, what he hated |
| Brand, prices, offers, proof, DM keywords | `references/brand.md` |
| The mascot (Dev): rig, props, poses, voice | `references/mascot.md` |
| Reels / motion graphics / website showcase reels | `references/reels.md` |
| Carousels (photo or motion) | `references/carousels.md` |
| Captions, DMs, outreach, comment replies, hooks | `references/copy.md` |
| Logos and brand identities for clients | `references/logo.md` |
| Technical gotchas (Remotion, capture, fonts, git) | `references/gotchas.md` |

## The ten rules that matter most

1. **Answer first, short.** Copy-ready text or the file, then one or two lines. No preamble, no coaching.
2. **Do exactly what he said.** When he dictates the message ("say we noticed bugs…"), write *his* message. Give a
   warning once, in one line, then comply. Never add points he didn't ask for (adding "SEO" got an angry reply).
3. **Real facts only.** Prices and plan contents come from `references/brand.md`. Never invent stats, clients,
   reviews or timelines. Label illustrative UI "Sample screens". Check numbers (e.g. "skip $1,400 in fees", not
   "save $1,400", when the client still pays $360).
4. **Premium, never basic.** His worst feedback: "basic and very cheap". Default to magazine-grade layouts, real
   photos/screens, bold type, fast motion, sound design.
5. **Brand consistency.** Appify pieces use Appify colours (ink/UV/iris/yellow), Sora + Geist + Geist Mono, the real
   wordmark SVG, and Dev. Client pieces use the client's own brand and assets.
6. **Pain-first, then proof, then offer, then a precise CTA** (DM keyword → call → exact price).
7. **Reels: hook in the first second, inside safe zones** (see reels.md), with a NoMusic cut for trending audio.
8. **Show real work.** Record the live site (frame-accurate scroll), use the brand's real photos and the real hero
   video (check what the site actually serves, not a fallback).
9. **Deliver files the way he asks** (separate photos, not a zip, when he says "photos only and not in a file"), one
   message with captions ready to paste.
10. **Commit and push** project source to the session branch; keep client fonts/photos/videos out of public repos.

## Tools in this skill (`assets/`)

- `brand.js`: Appify wordmark SVG paths (`WORDMARK.letters`, `WORDMARK.spark`, viewBox) and `sparkPath()`.
- `mascot/Dev.jsx`: the Dev SVG rig. `mascot/DevBags.jsx`, `RingBox.jsx`, `DevNotebook.snippet.jsx`: prop overlays.
- `tools/fscroll.mjs` + `routed.mjs`: frame-accurate recording of a live website scrolling, with its scroll-reveal
  animations and its hero video (served as WebM with byte ranges).
- `tools/runway.py`: the "professional" runway deep-house bed (120 BPM, A minor) mixed with an effects track.
- `tools/bts_vo2.py`: Dev's voice (Kokoro `am_puck` + Praat re-intonation + room), smooth passages, word timings.
- `tools/wordmark.py`, `export_svg.mjs`, `svg2png.mjs`: font → outlined wordmark, SVG logo files, transparent PNGs.
- `examples/`: working compositions to copy from: concept-website reel, website-launch reel (lookbook rush +
  live-site scroll + Dev end card), $360 motion carousel (shared canvas), mobile-app carousel (high conversion).

## Default workflow

1. Read preferences.md + the task's reference. Pull facts from brand.md.
2. Decide the one idea and the hook; write the beat sheet / slide list.
3. Build with the motion-graphics skill conventions (Remotion, `timing.js`, `sound.py`), reusing assets here.
4. Review stills on a contact sheet (and a safe-zone overlay for reels) before the full render.
5. Render, verify, export (music + NoMusic + light encode + cover), send the files, paste-ready caption.
6. Close with honest one-line flags (sample data, unverified claims, things he should confirm).
