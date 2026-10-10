# Appify portfolio

A motion-first portfolio site for Appify: React + Vite, with the Appify logo reveal running live in the
browser (`@remotion/player`, the same composition as the rendered video) and Dev, the mascot, as a live
SVG rig that waves, talks, blinks and follows the cursor.

## Sections
1. **Intro**: the logo reveal plays once per session, then the curtain lifts (skippable; skipped for reduced-motion users).
2. **Hero**: "Ideas, appified." with Dev and the services orbiting him.
3. **Motion graphics**: the featured client film, then a filmstrip of Appify originals that slides sideways as you scroll (swipe on phones). Click any clip to watch it with sound.
4. **Websites & mobile apps**: case studies (Watch Trade Chronicles; Darebni AI is a "coming soon" card until its screens are added).
5. **The brand / Meet Dev**: the mark animates in; buttons make Dev wave, point, laugh, jump.
6. **Contact**: an appointment box (day, time, services, notes) that opens WhatsApp with the booking request written out. Nothing is stored.

## Before launch
- **WhatsApp number**: `src/config.js` → `CONTACT.whatsapp` (digits only, e.g. `9613123456`). Until then the form shows a placeholder warning.
- **Darebni AI**: add screenshots to `public/media/` and fill in the entry in `src/work.js` (`shots`, `features`, `stack`, remove `soon`).

## Edit content
- Portfolio entries: `src/work.js`. Only real work: client projects name the client; Appify promos are tagged "Appify original".
- New video: `bash scripts/encode.sh path/to/video.mp4 my-video` then add it to `MOTION` in `src/work.js`.
- Booking days/times: `BOOKING` in `src/config.js`.
- Dev's lines: `LINES` in `src/components/Hero.jsx`, and the Meet Dev / Contact sections.

## Run & deploy
```
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/ is a static site: Netlify, Vercel or Cloudflare Pages (publish dir: dist)
```

Remotion is free for individuals and companies of up to 3 people; larger teams need a company license
(https://remotion.pro/license).
