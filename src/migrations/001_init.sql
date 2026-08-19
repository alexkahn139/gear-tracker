CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gear_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN
                ('tent','sleep','cook','safety','clothing','navigation','other')),
  description TEXT,
  photo_url   TEXT,
  weight_g    INTEGER,
  qty_owned   INTEGER NOT NULL DEFAULT 1,
  condition   TEXT NOT NULL DEFAULT 'good'
              CHECK (condition IN ('new','good','worn','damaged','broken')),
  location    TEXT,
  serial_id   TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gear_loans (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  gear_item_id      INTEGER NOT NULL REFERENCES gear_items(id),
  borrower_id       INTEGER NOT NULL REFERENCES users(id),
  checked_out_at    TEXT NOT NULL DEFAULT (datetime('now')),
  due_date          TEXT,
  returned_at       TEXT,
  condition_on_return TEXT,
  notes             TEXT
);

CREATE TABLE IF NOT EXISTS trips (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  start_date  TEXT,
  end_date    TEXT,
  location    TEXT,
  notes       TEXT,
  share_token TEXT UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pack_list_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id      INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  gear_item_id INTEGER REFERENCES gear_items(id),
  ad_hoc_name  TEXT,
  qty_needed   INTEGER NOT NULL DEFAULT 1,
  qty_checked  INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gear_loans_item ON gear_loans (gear_item_id);
CREATE INDEX IF NOT EXISTS idx_gear_loans_borrower ON gear_loans (borrower_id);
CREATE INDEX IF NOT EXISTS idx_pack_list_items_trip ON pack_list_items (trip_id);
CREATE INDEX IF NOT EXISTS idx_pack_list_items_gear ON pack_list_items (gear_item_id);
