-- product_straps was only indexed by watch. Looking pairings up by strap —
-- the dashboard's "fitted to" counts, and what the storefront used to do for
-- every strap on every page — scanned the whole table each time.
CREATE INDEX IF NOT EXISTS idx_product_straps_strap ON product_straps(strap_sku);
