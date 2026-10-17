-- Booking requests can be sent on WhatsApp to Appify's number; the admin (/admin) keeps a log of failed sign-ins
-- to slow down password guessing.
UPDATE settings SET value = '96178803034' WHERE key = 'whatsapp';
CREATE TABLE IF NOT EXISTS admin_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS admin_attempts_ip_time ON admin_attempts (ip_hash, created_at);
