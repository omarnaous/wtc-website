-- WTC's own price list, replacing the placeholder resale figures.
--
-- The catalogue import never overwrites a price once a row exists (so edits
-- made in the dashboard survive a re-import), which means a database that was
-- imported before this list arrived would go on showing the placeholders.
-- This brings those rows into line. On a database that has not been imported
-- yet, every statement matches nothing and the import writes the same values.
--
-- The was-prices were set against the placeholders and would now read as a
-- 90% discount, so they go. Three monthly Moonshine Gold Earthphase references
-- are not on WTC's list; they are archived rather than deleted, so any order
-- that points at them still resolves.

UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-sun';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-mercury';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-venus';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-on-earth';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-moon';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-mars';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-jupiter';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-saturn';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-uranus';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-neptune';
UPDATE products SET price = 60, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-pluto';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-moonphase-full-moon';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-moonphase-new-moon';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-super-blue-moonphase';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-on-earth-lava';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-on-earth-polar-lights';
UPDATE products SET price = 70, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-on-earth-desert';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-earthphase';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'moonswatch-1965';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-pink-moonphase';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-earthphase-moonshine-gold-august';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-earthphase-moonshine-gold-december';
UPDATE products SET price = 75, compare_at = NULL, updated_at = datetime('now') WHERE slug = 'mission-to-the-moon-1969';

UPDATE products SET name = 'Mission to Earthphase — Moonshine Gold', short_name = 'Earthphase Gold',
  updated_at = datetime('now')
  WHERE slug = 'mission-to-earthphase-moonshine-gold-august';
UPDATE products SET name = 'Mission to Earthphase — Moonshine Gold, Cold Moon', short_name = 'Earthphase Cold Moon',
  updated_at = datetime('now')
  WHERE slug = 'mission-to-earthphase-moonshine-gold-december';

UPDATE products SET status = 'archived', updated_at = datetime('now')
  WHERE slug IN (
    'mission-to-earthphase-moonshine-gold-september',
    'mission-to-earthphase-moonshine-gold-october',
    'mission-to-earthphase-moonshine-gold-november'
  );

-- The AP × Swatch tile was a placeholder; it now fronts the Royal Pop.
UPDATE collections
  SET blurb = 'Royal Pop — the Royal Oak as a Bioceramic pocket watch, in eight colours.',
      hero_slug = 'royal-pop-blaue-acht'
  WHERE id = 'ap-swatch';
