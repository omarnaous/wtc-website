# WTC — Watch Trade Chronicles

**Live preview → <https://omarnaous.github.io/wtc-website/>**

Front end for an independent OMEGA × Swatch (Bioceramic MoonSwatch) reseller
in Beirut. Static for now: the catalogue, filtering and Strap Studio all run
in the browser, with no backend and no checkout.

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build && npm start   # production
npm run palette              # re-sample product colours from the photography
```

## Deploying

The site is a static export served from the `gh-pages` branch of this repo.

```bash
npm run deploy        # build + push to gh-pages; live in ~1 minute
```

`scripts/deploy-pages.sh` builds with `NEXT_PUBLIC_BASE_PATH=/wtc-website`
(the repo name — it is the URL prefix on a GitHub project page), stages the
export, adds `.nojekyll` so Pages does not strip the `_next` directory, and
force-pushes. There is no Actions workflow because publishing one needs a
token with the `workflow` scope.

Three things to know while this is a client preview:

- **The repo is public.** GitHub Pages needs that on a free plan. Deleting
  the repo takes the site down immediately.
- **It carries `noindex, nofollow`** (`robots` in `src/app/layout.tsx`), so
  search engines skip it. Remove that when real prices go live.
- **Moving to a custom domain?** Clear `NEXT_PUBLIC_BASE_PATH` (a domain
  serves from the root, not `/wtc-website`) and add a `CNAME` file.

## What is here

| Route | |
| --- | --- |
| `/` | Hero film, bestsellers rail, filtered catalogue, Strap Studio, Instagram |
| `/products` | Full catalogue — `?family=classics` preselects a collection |
| `/products/[slug]` | Product detail, gallery, specs, and a per-product Strap Studio |
| `/policies/[slug]` | Authenticity, shipping, returns, warranty, privacy |

## How the pieces work

**The hero film** is a Remotion composition (`src/remotion/`) played in the
browser by `@remotion/player`. It is not a video file — it is drawn every
frame from the product PNGs, so it is a few kilobytes of code rather than a
several-megabyte MP4, and the watch on screen is changed by editing an array.
The Player is handed the hero box's own pixel dimensions, so the film lays
itself out from `useVideoConfig()` and fills any aspect ratio exactly instead
of being cropped. Every motion is periodic over `HERO.durationInFrames`, so
the loop has no visible seam.

**The Strap Studio** (`src/components/strap/`) cannot use photography — the
straps are photographed flat and separately from the watches, so there is no
image of "this watch on that strap". Instead `WatchSvg.tsx` draws the watch as
vectors from the product's sampled palette, with the two strap halves as
independent layers. Swapping a strap animates the old halves out and the new
ones in on a spring, while the head stays put and takes a short recoil.

**Colour** comes from the real packshots. `scripts/extract-palettes.mjs`
samples the case flank, bezel ring, dial, counters and strap out of each
1080×1080 photo into `src/data/palettes.json`. That is why the vector Mission
to Mars has a red case with a white dial, and Mission on Earth is green.

## Before this goes live

Read `src/data/README.md` — **prices, stock and the phone number are
placeholders**. The WhatsApp and `tel:` links do nothing until
`site.contact` is filled in.

Other open items:

- **Checkout.** "Add to bag" is inert. There is no cart, no state, no
  payment. `src/lib/filters.ts` and the data layer are shaped so a backend can
  drop in behind them.
- **Instagram.** `InstagramStrip` links to the profile and shows product
  photography rather than mocked-up posts. Wire it to the Instagram Basic
  Display API to pull the real grid.
- **Remotion licence.** Remotion is free for individuals and for companies of
  up to three people; larger teams need a company licence. See
  <https://remotion.dev/license>.
- **Image rights.** The packshots are Swatch's. Fine for a demo, worth
  confirming for production, or reshoot in-house.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Remotion + `@remotion/player` · Framer Motion · sharp (build-time sampling)
