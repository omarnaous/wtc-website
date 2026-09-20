# Data

## Where it came from

| File | Source |
| --- | --- |
| `products.ts` | 26 references from [swatch.com/en-en/bioceramic-moonswatch-collection.html](https://www.swatch.com/en-en/bioceramic-moonswatch-collection.html) — names and official Swatch references |
| `straps.ts` | 37 references from [the MoonSwatch strap listing](https://www.swatch.com/en-en/accessories/watch-straps/moonswatch-straps/) |
| `palettes.json` | Generated — colours sampled from the product photography by `scripts/extract-palettes.mjs` |
| `site.ts` | The client's Instagram profile, [@watchtradechronicles](https://www.instagram.com/watchtradechronicles) |
| `public/products/**` | Official OMEGA × Swatch packshots from `static.swatch.com` |

## ⚠️ Placeholder data — replace before launch

Swatch does not publish MoonSwatch prices online (the collection is
boutique-only, one watch per person per day), so nothing below could be
scraped. These are stand-ins so the UI has realistic numbers to lay out:

1. **`site.contact.phone` and `site.contact.whatsapp`** — currently
   `+961 00 000 000`. The WhatsApp button and every `tel:` link are wired to
   this, so they do nothing until it is set.
2. **`price` and `compareAt` on every product** — plausible Beirut resale
   figures, not WTC's actual pricing.
3. **`price` on every strap** — $58 Velcro, $45 rubber, applied flat.
4. **`availability`** — hand-assigned. Real stock belongs in the backend.
5. **`bestsellerRank`** — the ten on the homepage rail. Currently picked from
   what the Instagram grid features most; swap for real sales data.
6. **`site.contact.email`** — a guess at the domain.

`description` and `tagline` are written copy, checked against the sampled
colours (the photography is the authority on colourway — Mission on Earth has
a green case, Mars has a white dial). Edit freely, but keep colour claims
honest if you change a product's palette.

## Re-sampling colours

The vector watch in the Strap Studio is drawn from `palettes.json`, not from
the photographs, so it can animate a strap change. To regenerate after adding
product images:

```bash
npm run palette
```

The script finds the case edge on each packshot and walks inward, so it reads
the true Bioceramic flank colour rather than the bezel next to it. Check the
output against a few photos after adding references.

## Adding a product

1. Drop `SKU_sa200.png`, `SKU_sa300.png`, `SKU_sa000.png` into
   `public/products/watches/` (the CDN pattern is
   `https://static.swatch.com/images/product/SKU/sa200/SKU_sa200_er003m.png`).
2. Add a seed object to `seeds` in `products.ts`.
3. Run `npm run palette`.
