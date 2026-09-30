-- Customer reviews.
--
-- A table rather than a list field on the content section: reviews get added
-- one at a time by whoever is on the phone, need to be hidden individually
-- when a customer asks, and carry a rating that the section averages. A JSON
-- blob would make all three awkward.
--
-- Deliberately seeded with nothing. These are statements attributed to real
-- people; inventing them to fill the section would put words in the mouths of
-- customers who never said them. The storefront hides the section until there
-- is at least one published review.

CREATE TABLE reviews (
  id          TEXT PRIMARY KEY,
  author      TEXT NOT NULL,
  -- "Beirut", "Achrafieh" — optional, shown under the name.
  location    TEXT NOT NULL DEFAULT '',
  rating      INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  body        TEXT NOT NULL,
  -- The watch it is about, when it is about one. Kept as a plain slug so a
  -- review survives the product being archived.
  product_slug TEXT,
  -- Where it came from, for your own reference; not shown on the site.
  source      TEXT NOT NULL DEFAULT 'instagram'
              CHECK (source IN ('instagram','whatsapp','google','in-person','website')),
  status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  -- Lower shows first. Ties fall back to the date.
  position    INTEGER NOT NULL DEFAULT 0,
  -- When the customer said it, not when it was typed in here.
  reviewed_on TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reviews_status ON reviews(status, position);
