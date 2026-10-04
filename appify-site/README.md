# Appify Studio site

React + Vite + Remotion. Four scenes: Hero, Work, Motion, Contact.

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/ for Netlify
```

## Deploy (Netlify)
- Build command: `npm run build`, publish directory: `dist`.
- The demo booking form uses Netlify Forms (form name `demo-booking`). After the first deploy,
  turn on email notifications in Netlify > Forms so requests reach your inbox.

## Edit content
- Projects: `src/projects.js`. The four entries are concept work. Replace them with real
  client projects as they ship and set `concept: false`.
- Each project preview is a Remotion composition in `src/remotion/`.
- Showreel chapters: `src/remotion/Reel.jsx` (`CHAPTERS`).
- Brand geometry (logo paths): `src/brand.js`.

## Remotion license
Remotion is free for individuals and companies with up to 3 employees. Larger teams need a
company license: https://remotion.pro/license
