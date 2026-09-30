-- The wording on a collection tile.
--
-- A collection with nothing in it was drawn as "Coming soon", and the words
-- were in the component. That is two decisions taken away from whoever runs
-- the shop: what the badge says, and whether a collection counts as upcoming
-- at all — an empty one may simply be empty, and a full one may still be a
-- pre-launch you want teased rather than opened.
--
-- `state` keeps the old behaviour as its default: auto means empty reads as
-- upcoming, exactly as before.
--
-- The monogram replaces a hard-coded "AP" that was drawn on any tile without a
-- photograph, whatever the collection.
ALTER TABLE collections ADD COLUMN badge TEXT NOT NULL DEFAULT '';
ALTER TABLE collections ADD COLUMN monogram TEXT NOT NULL DEFAULT '';
ALTER TABLE collections ADD COLUMN state TEXT NOT NULL DEFAULT 'auto'
  CHECK (state IN ('auto', 'upcoming', 'open'));
