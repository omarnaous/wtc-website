-- The Instagram grid on the homepage.
--
-- It was read from src/data/instagram.json, a file baked into each build, so a
-- refreshed grid needed a redeploy. It now lives here with everything else the
-- shop shows; the catalogue import copies the file in, and `npm run instagram`
-- / `instagram:import` keep refreshing that file as the source for the import.
-- The thumbnails themselves are in R2 under instagram/.
CREATE TABLE instagram_posts (
  id         TEXT PRIMARY KEY,
  image      TEXT NOT NULL,
  permalink  TEXT NOT NULL,
  caption    TEXT NOT NULL DEFAULT '',
  is_video   INTEGER NOT NULL DEFAULT 0,
  position   INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
