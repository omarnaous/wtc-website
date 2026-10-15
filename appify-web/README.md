# appify-web: www.appify-lb.com

The Appify studio site. Server-rendered on a **Cloudflare Worker** (full HTML for SEO, no framework),
content in **Cloudflare D1**, static files and videos on **Workers static assets** (`public/`). A small vanilla JS layer adds the motion:
live Dev mascot (blinks, follows the cursor, talks, does tricks on tap), word-by-word headlines, scroll reveals,
tilt cards, hover-play videos, a video player, filters, and the booking flow.

## Sections and pages
- `/`: hero with Dev, services, websites (filterable, watch / live link / case study), mobile apps, motion graphics
  and content ads (scrollable reel row, tap for sound), spotlight statement, booking, FAQ.
- `/work/<slug>`: a case study per website. `/services/<slug>`: four SEO landing pages (web design, mobile apps,
  motion graphics, Meta ads), each with its own FAQ.
- `/sitemap.xml` (with video and image entries), `/robots.txt`, JSON-LD (ProfessionalService, WebSite, FAQPage,
  VideoObject, CreativeWork, Service, BreadcrumbList), Open Graph image, canonical URLs.
- `POST /api/bookings`: saves the request in D1 (`bookings` table, rate-limited, honeypot), then opens WhatsApp or
  email with the request written out.

## Content (D1)
Tables: `settings`, `projects` (websites + apps), `motion`, `faqs`, `services`, `bookings`. Every content table has
`sort` and `published`, ready for the stage-2 admin panel. Starting content: `scripts/seed.py` -> `migrations/0002_seed.sql`.

Quick edits without an admin panel:
```
npx wrangler d1 execute appify-db --remote --command "UPDATE settings SET value='9613123456' WHERE key='whatsapp'"
npx wrangler d1 execute appify-db --remote --command "UPDATE projects SET live_url='https://…' WHERE slug='oddball'"
npx wrangler d1 execute appify-db --remote --command "SELECT * FROM bookings ORDER BY id DESC LIMIT 20"
```
Pages are cached at the edge for up to 10 minutes on the custom domain (the Cache API does nothing on `*.workers.dev`), so edits show within that window.

## Code
- `src/index.js`: the Worker entry. Static files in `public/` are served before it runs (with `public/_headers`);
  it handles the rest: `POST /api/bookings` (`src/routes/bookings.js`) and every page (`src/routes/page.js`, which
  renders with `src/lib/`). It also redirects the bare domain to `SITE_URL` and adds security headers.
- `wrangler.jsonc`: Worker `appify`, assets, D1 binding, `SITE_URL`, and the two custom domains.

## Run and deploy
```
npm install
npx wrangler login                   # once
npm run db:local && npm run dev      # http://localhost:8788
npm run db:remote                    # apply new migrations to the live database
npm run deploy                       # wrangler deploy
```
New video: `bash scripts/encode.sh <source.mp4> <slug> [poster-second] [width]`, then add a row to `motion` or `projects`.
Workers static assets take files up to 25 MiB each.

## Domain
`appify-lb.com` must be an active zone in the same Cloudflare account (add the site in Cloudflare, then switch the
nameservers at Namecheap to the two Cloudflare gives you). `npm run deploy` then attaches `www.appify-lb.com` and
`appify-lb.com` to the Worker and creates their DNS records (`routes` in `wrangler.jsonc`). The bare domain 301s to
www. The `*.workers.dev` address stays up as a preview and is served with `x-robots-tag: noindex`.

## Stage 2: admin panel (planned)
`/admin` behind Cloudflare Access (Zero Trust, free up to 50 users): CRUD for projects, motion, FAQs and services,
booking inbox with status (`new / contacted / won / lost`), media uploads to an R2 bucket (enable R2 in the dashboard
first), and a "publish" that bumps `settings.content_version`.
