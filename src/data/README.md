# src/data

Two files, and neither of them is the catalogue.

| File | What it is |
| --- | --- |
| `types.ts` | The shapes the whole app passes around — `Product`, `Strap`, `Collection`, `Palette` and the small unions beside them. Types only; nothing ships from here. |
| `site.ts` | The floor under the brand, contact and social settings. Every one of these is a `settings` row in D1, and the row wins. This is only what the shop would say if the table were empty. |

## Where the data actually lives

Everything the shop renders comes out of Cloudflare:

| | Where |
| --- | --- |
| Watches, straps, which straps fit which watch | D1 — `products`, `straps`, `product_straps` |
| Stock | D1 — `inventory`, one row per watch |
| Collections, section copy, policies, settings | D1 — `collections`, `content_sections`, `policies`, `settings` |
| Every photograph | R2 (`wtc-media`), served through `/api/media/<key>`, listed in D1's `media` table |
| The Instagram grid | D1 — the `instagram_feed` settings row, images in R2 under `instagram/` |

Nothing is read from `public/` any more. That folder holds `_headers` and
nothing else: the bundled packshots, the strap photography, the logo and the
Instagram thumbnails all moved into R2.

## What used to be here, and why it went

This directory used to hold the catalogue itself — 26 watches with placeholder
prices, 37 straps, a generated palette per reference, an image manifest, a
thumbnail map and 206 strap photographs. The shop read those files when D1 had
no rows, and the dashboard had a button that loaded them in.

Both were removed once the catalogue became something Joseph keeps:

- A **fallback** meant deleting every product left the old 26 on the site,
  served from a file nobody was editing. An empty catalogue now means an empty
  shop, which is the only honest answer.
- The **import button** would have overwritten real prices ($60–95) with the
  placeholders ($465–760) and pointed every image at a file that no longer
  exists.

The Strap Studio's try-on photography — 206 frames of each strap fitted to its
watch, and a swatch crop of each — is Wristbuddys' work. It is no longer in the
repository but it is in R2 — the frames under `products/strap-photos-v3/`
(re-cut by `scripts/recut-strap-photos.mjs`), the swatches under
`products/strap-photos/<set>/chips/` — and every `product_straps` row names its
frame (`photo`) and swatch (`chip`). A pairing
with no frame falls back to the strap's own photograph, which loses the try-on
effect — keep `photo` filled.

## Still a placeholder

`site.ts` carries `contact.phone` as `+961 00 000 000` and `whatsapp` as
`96100000000`. **These are deliberate placeholders and must not be invented.**
They are also now written into the `contact` settings row verbatim, so they are
editable in the dashboard under Settings — replace them there with the real
number.

`social.tiktok` is `#` for the same reason.
