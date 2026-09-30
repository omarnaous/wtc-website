-- Specification rows, per watch.
--
-- The table under the buy buttons was one list shared by the whole catalogue,
-- so every watch claimed the same case, movement and battery. True enough for
-- most of the MoonSwatch line and wrong for the ones anyone asks about — the
-- Moonshine Gold references, the 1965, anything with a different caseback.
--
-- Empty means "use the shared rows" from Sections → Product page, so the 26
-- watches already there keep the specification they had.
ALTER TABLE products ADD COLUMN specs TEXT NOT NULL DEFAULT '[]';
