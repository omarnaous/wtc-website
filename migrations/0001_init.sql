-- WTC storefront — initial schema.
--
-- Everything the storefront renders and everything the shop records lives
-- here. The site falls back to the files in src/data/ when a row is missing,
-- so an empty database still renders the design (and the GitHub Pages static
-- export, which has no binding at all, keeps working unchanged).

-- ─── Staff accounts ────────────────────────────────────────────────────────

CREATE TABLE admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  -- PBKDF2-SHA256. salt and hash are both base64url; iterations is stored so
  -- the cost can be raised later without locking anyone out.
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iter INTEGER NOT NULL DEFAULT 210000,
  -- owner: everything, including removing other owners.
  -- admin: everything except deleting owners.
  -- staff: orders and inventory only.
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','admin','staff')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE admin_sessions (
  -- SHA-256 of the cookie value; the raw token is never stored.
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  user_agent TEXT
);
CREATE INDEX idx_sessions_user ON admin_sessions(user_id);

CREATE TABLE admin_invites (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','admin','staff')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  accepted_at TEXT
);

-- Who changed what. With several people in the dashboard this is the only way
-- to answer "who dropped the price on Mercury".
CREATE TABLE audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name  TEXT,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  summary    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ─── Catalogue ─────────────────────────────────────────────────────────────

CREATE TABLE collections (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  blurb    TEXT NOT NULL DEFAULT '',
  hero_slug TEXT,
  accent   TEXT NOT NULL DEFAULT '#c9a227',
  position INTEGER NOT NULL DEFAULT 0,
  status   TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  slug            TEXT PRIMARY KEY,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  short_name      TEXT NOT NULL DEFAULT '',
  collection_id   TEXT NOT NULL DEFAULT 'omega-swatch',
  family          TEXT NOT NULL DEFAULT 'classics',
  family_label    TEXT NOT NULL DEFAULT '',
  year            INTEGER NOT NULL DEFAULT 2022,
  price           REAL NOT NULL DEFAULT 0,
  compare_at      REAL,
  -- Derived from inventory when tracking is on; set by hand otherwise.
  availability    TEXT NOT NULL DEFAULT 'in-stock'
                  CHECK (availability IN ('in-stock','low-stock','pre-order','sold-out')),
  colorway        TEXT NOT NULL DEFAULT '',
  color_group     TEXT NOT NULL DEFAULT 'grey',
  strap_type      TEXT NOT NULL DEFAULT 'velcro' CHECK (strap_type IN ('velcro','rubber')),
  stock_strap_sku TEXT,
  bestseller_rank INTEGER,
  tagline         TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  image_front     TEXT NOT NULL DEFAULT '',
  image_angle     TEXT NOT NULL DEFAULT '',
  image_side      TEXT NOT NULL DEFAULT '',
  -- {case,bezel,dial,subdial,strap} — drives the tints across the site.
  palette         TEXT NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','draft','archived')),
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_bestseller ON products(bestseller_rank);

CREATE TABLE inventory (
  product_slug TEXT PRIMARY KEY REFERENCES products(slug) ON DELETE CASCADE,
  on_hand      INTEGER NOT NULL DEFAULT 0,
  -- Held by orders that are placed but not yet fulfilled.
  reserved     INTEGER NOT NULL DEFAULT 0,
  low_stock_at INTEGER NOT NULL DEFAULT 2,
  -- Off for pre-order pieces, where availability is set by hand.
  track        INTEGER NOT NULL DEFAULT 1,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE straps (
  sku          TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'rubber' CHECK (type IN ('velcro','rubber')),
  colorway     TEXT NOT NULL DEFAULT '',
  color_group  TEXT NOT NULL DEFAULT 'grey',
  price        REAL NOT NULL DEFAULT 0,
  image        TEXT NOT NULL DEFAULT '',
  primary_color   TEXT NOT NULL DEFAULT '#888888',
  secondary_color TEXT NOT NULL DEFAULT '#888888',
  paired_with  TEXT,
  on_hand      INTEGER NOT NULL DEFAULT 0,
  low_stock_at INTEGER NOT NULL DEFAULT 2,
  track        INTEGER NOT NULL DEFAULT 1,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  position     INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_straps_status ON straps(status);

-- Which straps the strap studio offers on a given watch, in what order, and
-- at what price if it differs from the strap's own.
CREATE TABLE product_straps (
  product_slug   TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  strap_sku      TEXT NOT NULL REFERENCES straps(sku) ON DELETE CASCADE,
  position       INTEGER NOT NULL DEFAULT 0,
  is_default     INTEGER NOT NULL DEFAULT 0,
  price_override REAL,
  -- Photograph of this strap fitted to this watch, when one exists.
  photo          TEXT,
  chip           TEXT,
  PRIMARY KEY (product_slug, strap_sku)
);
CREATE INDEX idx_product_straps_product ON product_straps(product_slug);

-- ─── Editable site content ─────────────────────────────────────────────────

-- One row per section of the website. `data` is a JSON object whose shape is
-- declared in src/lib/content/schema.ts, which is also what renders the form.
CREATE TABLE content_sections (
  key        TEXT PRIMARY KEY,
  data       TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);

CREATE TABLE policies (
  slug     TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  summary  TEXT NOT NULL DEFAULT '',
  -- JSON array of paragraphs.
  body     TEXT NOT NULL DEFAULT '[]',
  position INTEGER NOT NULL DEFAULT 0,
  status   TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Brand, contact, socials, stats. JSON value per key.
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Uploaded images, stored in R2 and served back through /api/media.
CREATE TABLE media (
  id           TEXT PRIMARY KEY,
  key          TEXT NOT NULL UNIQUE,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL DEFAULT 0,
  width        INTEGER,
  height       INTEGER,
  alt          TEXT NOT NULL DEFAULT '',
  uploaded_by  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_created ON media(created_at DESC);

-- ─── Orders ────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id             TEXT PRIMARY KEY,
  -- Human reference, WTC-1001 upwards.
  number         INTEGER NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','packed','shipped','delivered','cancelled','refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
                 CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_method TEXT NOT NULL DEFAULT 'cash-on-delivery',
  customer_name  TEXT NOT NULL DEFAULT '',
  phone          TEXT NOT NULL DEFAULT '',
  email          TEXT,
  address_line   TEXT NOT NULL DEFAULT '',
  city           TEXT NOT NULL DEFAULT '',
  area           TEXT NOT NULL DEFAULT '',
  country        TEXT NOT NULL DEFAULT 'Lebanon',
  subtotal       REAL NOT NULL DEFAULT 0,
  shipping       REAL NOT NULL DEFAULT 0,
  discount       REAL NOT NULL DEFAULT 0,
  total          REAL NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'USD',
  -- instagram / whatsapp / website / walk-in
  channel        TEXT NOT NULL DEFAULT 'website',
  note           TEXT NOT NULL DEFAULT '',
  -- Set when stock has been taken off the shelf for this order, so an order
  -- can't double-decrement on a second status change.
  stock_applied  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL DEFAULT 'watch' CHECK (kind IN ('watch','strap')),
  -- Kept as plain columns rather than joins: an order must still read
  -- correctly after the product is renamed, repriced or archived.
  ref        TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL DEFAULT '',
  image      TEXT NOT NULL DEFAULT '',
  unit_price REAL NOT NULL DEFAULT 0,
  qty        INTEGER NOT NULL DEFAULT 1,
  position   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'note',
  message    TEXT NOT NULL DEFAULT '',
  actor      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_order_events_order ON order_events(order_id, created_at DESC);
