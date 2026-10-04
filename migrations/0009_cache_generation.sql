-- One number that goes up whenever anything the shop shows is written.
--
-- The storefront keeps its catalogue reads in Cloudflare's shared cache under
-- this number (src/lib/store/memo.ts). Reading it is one row; the catalogue
-- behind it is thousands. Bumping it from triggers rather than from the app
-- means every write counts — the dashboard, an order taking stock, a review
-- sent from the site, or SQL run by hand — so an edit shows within seconds
-- and nothing has to remember to clear a cache.
CREATE TABLE IF NOT EXISTS cache_gen (
  id  INTEGER PRIMARY KEY CHECK (id = 1),
  gen INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO cache_gen (id, gen) VALUES (1, 0);

CREATE TRIGGER IF NOT EXISTS gen_products_i AFTER INSERT ON products BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_products_u AFTER UPDATE ON products BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_products_d AFTER DELETE ON products BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_inventory_i AFTER INSERT ON inventory BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_inventory_u AFTER UPDATE ON inventory BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_inventory_d AFTER DELETE ON inventory BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_straps_i AFTER INSERT ON straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_straps_u AFTER UPDATE ON straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_straps_d AFTER DELETE ON straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_product_straps_i AFTER INSERT ON product_straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_product_straps_u AFTER UPDATE ON product_straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_product_straps_d AFTER DELETE ON product_straps BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_collections_i AFTER INSERT ON collections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_collections_u AFTER UPDATE ON collections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_collections_d AFTER DELETE ON collections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_content_sections_i AFTER INSERT ON content_sections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_content_sections_u AFTER UPDATE ON content_sections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_content_sections_d AFTER DELETE ON content_sections BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_policies_i AFTER INSERT ON policies BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_policies_u AFTER UPDATE ON policies BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_policies_d AFTER DELETE ON policies BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_settings_i AFTER INSERT ON settings BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_settings_u AFTER UPDATE ON settings BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_settings_d AFTER DELETE ON settings BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS gen_reviews_i AFTER INSERT ON reviews BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_reviews_u AFTER UPDATE ON reviews BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
CREATE TRIGGER IF NOT EXISTS gen_reviews_d AFTER DELETE ON reviews BEGIN UPDATE cache_gen SET gen = gen + 1 WHERE id = 1; END;
