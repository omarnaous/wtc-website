# appify-web: www.appify-lb.com

The Appify studio site. Server-rendered on **Cloudflare Pages Functions** (full HTML for SEO, no framework),
content in **Cloudflare D1**, static files and videos on Pages. A small vanilla JS layer adds the motion:
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
Pages cache HTML for up to 10 minutes at the edge, so edits show within that window.

## Run and deploy
```
npm install
npm run db:local && npm run dev      # http://localhost:8788
npm run db:remote                    # apply new migrations to the live database
npm run deploy                       # wrangler pages deploy public --project-name appify
```
New video: `bash scripts/encode.sh <source.mp4> <slug> [poster-second] [width]`, then add a row to `motion` or `projects`.

## Domain
Pages project `appify` (https://appify-32m.pages.dev). To serve it on www.appify-lb.com: Pages > appify > Custom domains >
add `www.appify-lb.com`, then at Namecheap add a CNAME `www` -> `appify-32m.pages.dev`. Then set `SITE_URL` in
`wrangler.jsonc` to `https://www.appify-lb.com` and `NOINDEX_HOST` to `pages.dev`, and redeploy.

## Stage 2: admin panel (planned)
`/admin` behind Cloudflare Access (Zero Trust, free up to 50 users): CRUD for projects, motion, FAQs and services,
booking inbox with status (`new / contacted / won / lost`), media uploads to an R2 bucket (enable R2 in the dashboard
first), and a "publish" that bumps `settings.content_version`.
