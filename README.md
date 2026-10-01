# WTC — Watch Trade Chronicles

**Live shop (Cloudflare Workers) → <https://wtc-website.follies.workers.dev>**
**Dashboard → <https://wtc-website.follies.workers.dev/admin>**
**Frozen design preview (GitHub Pages) → <https://omarnaous.github.io/wtc-website/>**

Storefront and dashboard for an independent OMEGA × Swatch (Bioceramic
MoonSwatch) reseller in Beirut. The shop runs on Cloudflare Workers and reads
everything — catalogue, stock, prices, every line of copy — out of D1. The
dashboard at `/admin` is where all of that is edited.

Customers can order: bag, checkout, and a receipt page. Payment is cash on
delivery — there is no card gateway wired up, which is the one thing standing
between this and taking money online.

## Running it

```bash
nvm use            # Node 22 — vinext needs ≥ 22
npm install
npm run db:migrate # first run only: create the tables in the local database
npm run dev
```

Then open <http://localhost:3000>, and <http://localhost:3000/admin> to set up
the dashboard. The first account you create owns the shop.

| Script | |
| --- | --- |
| `npm run dev` | The shop on :3000, in the same runtime Cloudflare uses |
| `npm run dev:next` | Plain `next dev` on :3001 — no bindings, so no dashboard |
| `npm run build` | Production build for Workers |
| `npm run preview` | Run the built Worker locally against the local database |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run deploy:pages` | Static export to GitHub Pages (the frozen preview) |
| `npm run db:migrate` | Apply migrations to the local database |
| `npm run db:migrate:remote` | Apply migrations to the live database |
| `npm run types` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |

## The dashboard

`/admin`. First visit asks you to create the owner account; after that it is a
sign-in page, and `/admin/setup` closes for good.

**Claiming a live shop.** `/admin/setup` hands ownership to whoever opens it
first, which is fine on a laptop and not fine on a public URL. On Cloudflare it
is held behind a secret:

```bash
wrangler secret put SETUP_TOKEN     # any long random string
```

Setup then only opens at `/admin/setup?token=…`. Locally the secret is unset
and setup stays open, because there is nobody else on localhost to race. The
token is checked again inside the action, so it cannot be skipped by posting
the form directly. Delete the secret once the owner account exists.

| | |
| --- | --- |
| **Home** | Revenue, orders, average order, stock value, the last 30 days against the 30 before, recent orders, what is running low |
| **Orders** | Every order, filterable. Open one to change status, mark it paid, add a note, or read its timeline |
| **Analytics** | 7/30/90/365 days — revenue by day, where orders come from, best-selling watches and straps |
| **Watches** | The catalogue. Name, copy, price, stock, photography, colours, which collection and series, bestseller rank — and which straps the Strap Studio offers on it |
| **Straps** | The strap catalogue, and which watches each one is fitted to |
| **Collections** | The houses on the homepage: name, blurb, tile colour, the watch on the tile |
| **Inventory** | One editable sheet for every watch and strap. Count the shelf, type the numbers, save once |
| **Sections** | 117 fields across 14 sections — every block of the website and the words in it, down to the search placeholder, the empty-results line, the breadcrumbs, the checkout form and the receipt |
| **Policies** | Shipping, returns, warranty, privacy, and any page you add |
| **Images** | Everything an image field can point at |
| **Settings** | Brand, contact, socials, delivery charges, and the catalogue re-import |
| **Team** | Who can sign in, what they can reach, and a log of who changed what |

**Roles.** `owner` can do everything including removing other owners; `admin`
is the same minus that; `staff` sees orders, inventory and the figures, and
nothing else. There is always at least one active owner — the dashboard
refuses the change that would leave none.

**Invites** are one-time links, valid for seven days. The person who accepts
chooses their own password, so nobody sends a password over WhatsApp.

## Checkout

The bag lives in `localStorage` and holds **references and quantities only** —
no names and no prices. Everything a customer sees is priced by the server
against D1: `/api/cart` for the bag and the checkout summary, and again inside
the `placeOrder` action before a row is written. An edited `localStorage`
entry, a stale tab, or a hand-rolled POST cannot set a price, exceed stock, or
buy something that has been archived; quantities are clamped and unknown
references are dropped.

A website order lands as **pending**, on the `website` channel, cash on
delivery, unpaid — exactly the same shape as one recorded by hand, so it flows
through the same dashboard screens and the same stock ledger.

**Pending reserves stock.** Stock here is single digits and often a single
piece, so two people checking out the last Moonphase a minute apart should not
both be told yes. The reservation lifts when the order is cancelled, and turns
into a real deduction when it ships.

The receipt lives at `/order/<uuid>`. There are no customer accounts: the id is
a random UUID, so the URL *is* the credential, and order numbers cannot be
walked. Both `/checkout` and `/order/*` are `noindex`.

Delivery is a flat fee with an optional free-over threshold, under Settings →
Delivery.

### Taking payment online

`placeOrder` is the single place an order is created, and it already computes
the authoritative total. A gateway (Areeba, Whish Money, or Stripe if the
business ever bills outside Lebanon) slots in between the total and the write:
create the intent, redirect, and set `payment_status` on the callback. The
`payment_method` and `payment_status` columns are already there.

### How the site and the shop stay in step

`src/lib/store/` is the only thing that reads the catalogue, and every reader
falls back to the files in `src/data/` when a row is missing. That is what
makes three things work at once:

- With an empty database the site renders exactly the design that shipped.
- The GitHub Pages export, which has no binding at all, still builds.
- Anything edited in the dashboard wins the moment it is saved.

**Stock drives the badge.** With tracking on for a watch, `in stock` /
`low stock` / `sold out` follows the number on the shelf; nobody has to
remember to flip it. Orders move stock on their own: pending, confirmed and
packed reserve it, shipped and delivered take it off the shelf, cancelled and
refunded put it back. Each order records which of those three states its stock
is in, so a status change can never double-count.

**Section copy** is declared once in `src/lib/content/schema.ts` — the fields
a section has, and the copy it falls back to. The dashboard renders its forms
from that list and the storefront reads the same defaults, so adding a new
editable field is a line there rather than a new form.

## Running and deploying

The app runs on **Cloudflare Workers** via [vinext](https://github.com/cloudflare/vinext),
Cloudflare's Vite-based Next.js runtime.

**vinext needs Node ≥ 22.** `.nvmrc` pins the project to 22; run `nvm use`
first. Node 20 fails with a `node:fs/promises` glob error.

`next.config.ts` serves both targets: `STATIC_EXPORT=1` (set by
`scripts/deploy-pages.sh`) produces the Pages export under a basePath, and
anything else builds the normal app for Workers.

`vite.config.ts` aliases `sharp` to `empty-stub.js` — sharp is a native module
used only by the build scripts and must never enter the Worker bundle.

Pages that read D1 carry `export const dynamic = "force-dynamic"`. vinext
classifies routes by static analysis, so that has to be a literal: a value
re-exported from another module reads as "unknown" in the build report.

### Cloudflare resources

| Binding | Resource |
| --- | --- |
| `ASSETS` | Static assets from `dist/client` |
| `DB` | D1 database `wtc-store` (`cc3b36de…23db`, WEUR — the closest region to Beirut) |
| `MEDIA` | **Not bound yet.** R2 is not enabled on the account |

Schema lives in `migrations/`. A new environment needs
`npm run db:migrate:remote` before the dashboard will open — it says so
itself rather than failing, if you forget.

**Image uploads are off** until R2 is enabled in the Cloudflare dashboard
(Storage → R2 → enable, which needs a payment method even for the free tier).
Once it is: `wrangler r2 bucket create wtc-media`, add an `r2_buckets` entry
binding it as `MEDIA` to `wrangler.jsonc`, redeploy. The upload endpoint and
the library screen are already written and switch on by themselves. Until
then the image picker browses everything in `public/` and any image field
takes a URL.

## Deploying to GitHub Pages

The static export is the **frozen design preview**, not the shop — it has no
database, so it renders the files in `src/data/` with placeholder prices and
no dashboard.

```bash
npm run deploy:pages   # build + push to gh-pages; live in ~1 minute
```

`scripts/deploy-pages.sh` moves `src/app/admin` and `src/app/api` aside for
the build (`output: export` prerenders every route, and the dashboard reads
cookies on every request), builds with `NEXT_PUBLIC_BASE_PATH=/wtc-website`,
adds `.nojekyll`, and force-pushes. It restores the directories on any exit,
including a failed build.

Three things to know about it:

- **The repo is public.** GitHub Pages needs that on a free plan.
- **It carries `noindex, nofollow`** while prices are placeholders. Sections →
  Search & sharing turns indexing on for the live shop.
- **Moving to a custom domain?** Clear `NEXT_PUBLIC_BASE_PATH` and add a
  `CNAME` file.

## What is here

| Route | |
| --- | --- |
| `/` | Hero film, bestsellers rail, collection tiles, scroll-scrubbed reel, Strap Studio, Instagram |
| `/products` | Full catalogue — `?collection=omega-swatch` or `?family=classics` preselects a filter |
| `/products/[slug]` | Product detail, gallery, specs, and a per-product Strap Studio |
| `/policies/[slug]` | Shipping, returns, warranty, privacy |
| `/checkout` | The order form |
| `/order/[id]` | The receipt — the customer's only link to their order |
| `/admin/**` | The dashboard |
| `/api/cart` | Prices a bag against D1. The browser never sets a price |
| `/api/media/[...key]` | Uploaded images, served from R2 |

## How the pieces work

**The hero film** is a Remotion composition (`src/remotion/`) played in the
browser by `@remotion/player`. It is not a video file — it is drawn every
frame from the product PNGs, so it is a few kilobytes of code rather than a
several-megabyte MP4. Which watches drift past is the cast set in Sections →
Hero, passed in as input props. The Player is handed the hero box's own pixel
dimensions, so the film lays itself out from `useVideoConfig()` and fills any
aspect ratio exactly instead of being cropped. Every motion is periodic over
`HERO.durationInFrames`, so the loop has no visible seam.

**The scroll reel** (`src/components/sections/ScrollReel.tsx`) is a second
Remotion composition with no clock behind it — the page seeks it frame by
frame from scroll position, so scrolling *is* the timeline and scrubbing back
up runs it backwards. It walks the whole catalogue, so a watch added in the
dashboard appears in it.

**The Strap Studio** (`src/components/strap/`) runs on real photography. Which
straps a watch offers is a `product_straps` row, edited per watch, and the
pictures are R2 objects like everything else. Where a strap was photographed
fitted to that specific watch the pairing names that shot; otherwise the
strap's own photograph stands in. There is no shipped photo set behind this —
a watch with nothing fitted to it hides the studio rather than borrowing
another watch's straps.

The try-on frames are built by `scripts/recut-strap-photos.mjs`, from the
Wristbuddys originals cached in `.cache/wristbuddys/` and Swatch's front
packshots. Cutting a white strap or a white case off white studio paper frame
by frame does not work — it leaves slabs of backdrop beside the strap and eats
the crown — so it does not try. Every frame in a set is the same watch, so the
script registers each frame onto one anchor (scale and offset, matched on the
dial), takes the outline from the dark-strap frames where the cut is reliable,
restores pale cases from Swatch's own alpha (Wristbuddys build on Swatch's
render, hands frozen at the same time), drops the grey shadows that only read
as shadow on white paper, and fades the strap out where the frame cuts it off.
The output goes to R2 under `products/strap-photos-v2/`; a new prefix rather
than an overwrite, because `/api/media` tells browsers to keep every image for
a year.

`scripts/cutout-photo.mjs` is what lifts a watch off a real background when a
new one is shot in-house, and `scripts/lib/cutout.mjs` is the machinery under
both. The hard case is a white strap: it is within a few RGB units of studio
paper, so a flood fill walks straight into it. Three things hold it back — the
weave (paper is mathematically flat, rubber is not), a running median down each
edge of the strap that closes any bite the fill still managed to take, and the
same edges carried across the rows the case occupies, where the fill can
otherwise squeeze in beside a lug.

**Colour** on the cards is a palette stored per watch — the case flank, bezel
ring, dial, counters and strap, sampled from its photography and editable in
the dashboard.

## Before this goes live

- **Stock and the phone number.** Every watch is seeded with nothing on hand
  and tracking **off**, so nothing falsely reads "Sold out" — no stock figure
  was invented. Set the real counts under Inventory and switch tracking on
  there. The phone number is still `+961 00 000 000`: the WhatsApp and `tel:`
  links go nowhere until Settings → Contact is filled in.
- **Prices are Joseph's own** ($60–75 for the MoonSwatches, $95 for the Royal
  Pop), well under the references' retail. Worth being deliberate about how
  the pieces are described, since the specs on the MoonSwatches say "Plastic"
  where Swatch says Bioceramic.
- **Online payment.** Checkout works, but it is cash on delivery — no card
  gateway is wired up. See *Taking payment online* above for where one goes.
- **Instagram.** The grid is six reels held in the `instagram_feed` settings
  row with their thumbnails in R2. It came from a scrape of the profile and
  does not refresh itself, so it will go stale — wire it to the Graph API when
  there is an access token.
- **vinext is 1.0.0-beta.** It builds, deploys and runs cleanly here, but it
  is pre-release software under a client-facing site. `@opennextjs/cloudflare`
  is the mature fallback if it ever bites.
- **Remotion licence.** Free for individuals and companies of up to three
  people; larger teams need a company licence. See <https://remotion.dev/license>.
- **Image rights — the sharpest open item.** The 91 watch packshots are
  Swatch's own product photography, and the Strap Studio's 206 try-on frames
  and their swatches are Wristbuddys' — a competing strap retailer. Deleting them from `public/` changed nothing
  about that: they are now R2 objects served from the live shop, which is more
  exposure, not less. Using a competitor's product photography on a storefront
  is a real legal risk, not a formality. Either license the images or reshoot
  them; `scripts/cutout-photo.mjs` handles in-house shots, and the three
  Mission to Mars photographs already in the shop went through it.

## Stack

Next.js 15 (App Router) on vinext · React 19 · TypeScript · Tailwind CSS v4 ·
Cloudflare Workers + D1 · Remotion + `@remotion/player` · Framer Motion ·
sharp (build-time sampling)
