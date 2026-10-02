CREATE TABLE IF NOT EXISTS birthdays (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  child_name TEXT NOT NULL CHECK (length(child_name) BETWEEN 1 AND 80),
  birthday_date TEXT NOT NULL,
  party_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  invitation_text TEXT NOT NULL DEFAULT '',
  location_text TEXT NOT NULL DEFAULT '',
  maps_url TEXT,
  phone TEXT,
  child_image_url TEXT,
  admin_secret TEXT NOT NULL UNIQUE CHECK (length(admin_secret) >= 32),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY NOT NULL,
  birthday_id TEXT NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 180),
  url TEXT NOT NULL CHECK (url GLOB 'http://*' OR url GLOB 'https://*'),
  image_url TEXT CHECK (image_url IS NULL OR image_url GLOB 'http://*' OR image_url GLOB 'https://*'),
  price_text TEXT,
  retailer TEXT NOT NULL CHECK (retailer IN ('skroutz','jumbo','other')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  claimed_at TEXT,
  claimed_by_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS gifts_birthday_sort_idx ON gifts (birthday_id, sort_order, id);
