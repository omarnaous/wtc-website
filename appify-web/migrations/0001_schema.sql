-- Appify site schema. Every content table has sort + published so the stage-2 admin panel can edit,
-- reorder and hide rows without a deploy. Media columns hold paths under /media (or R2 keys later).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('website','app')),
  title TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','concept','in-development')),
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
  stack TEXT NOT NULL DEFAULT '[]',        -- JSON array of strings
  live_url TEXT,
  video TEXT,
  poster TEXT,
  aspect TEXT NOT NULL DEFAULT '4/5',
  seo_title TEXT,
  seo_description TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS motion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT 'Appify',
  kind TEXT NOT NULL DEFAULT 'reel' CHECK (kind IN ('reel','ad','brand','client')),
  summary TEXT NOT NULL DEFAULT '',
  video TEXT NOT NULL,
  poster TEXT,
  aspect TEXT NOT NULL DEFAULT '9/16',
  duration INTEGER NOT NULL DEFAULT 0,    -- seconds
  upload_date TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'general',   -- general | websites | apps | motion | ads
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  h1 TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  intro TEXT NOT NULL,
  points TEXT NOT NULL DEFAULT '[]',       -- JSON array of {title, text}
  related TEXT NOT NULL DEFAULT 'websites',-- which work to show: websites | apps | motion
  faq_topic TEXT NOT NULL DEFAULT 'general',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  services TEXT NOT NULL DEFAULT '[]',
  day TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','whatsapp')),
  status TEXT NOT NULL DEFAULT 'new',      -- new | contacted | won | lost (admin, stage 2)
  ip_hash TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS bookings_ip_time ON bookings (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS projects_list ON projects (published, kind, sort);
CREATE INDEX IF NOT EXISTS motion_list ON motion (published, sort);
