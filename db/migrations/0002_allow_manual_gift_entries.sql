-- Allow gifts to be entered manually without a product link, and store
-- uploaded, optimized JPEG images directly in D1.
CREATE TABLE gifts_new (
  id TEXT PRIMARY KEY NOT NULL,
  birthday_id TEXT NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 180),
  url TEXT NOT NULL CHECK (url = '' OR url GLOB 'http://*' OR url GLOB 'https://*'),
  image_url TEXT CHECK (
    image_url IS NULL
    OR image_url GLOB 'http://*'
    OR image_url GLOB 'https://*'
    OR image_url GLOB 'data:image/jpeg;base64,*'
  ),
  price_text TEXT,
  retailer TEXT NOT NULL CHECK (retailer IN ('skroutz','jumbo','other')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  claimed_at TEXT,
  claimed_by_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO gifts_new (
  id, birthday_id, title, url, image_url, price_text, retailer,
  sort_order, claimed_at, claimed_by_email, created_at, updated_at
)
SELECT
  id, birthday_id, title, url, image_url, price_text, retailer,
  sort_order, claimed_at, claimed_by_email, created_at, updated_at
FROM gifts;

DROP TABLE gifts;
ALTER TABLE gifts_new RENAME TO gifts;
CREATE INDEX gifts_birthday_sort_idx ON gifts (birthday_id, sort_order, id);
