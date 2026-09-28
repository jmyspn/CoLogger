-- CoLogger database schema. Safe to run against an empty database, and safe
-- to run twice (every statement is IF NOT EXISTS).
--
--   users ──< sessions
--   users ──< collections ──< items
--
-- Ownership flows downwards: an item belongs to one collection, a collection
-- belongs to one user. Deleting a user removes their sessions and collections;
-- deleting a collection removes its items (ON DELETE CASCADE), so nothing is
-- ever left pointing at a parent that no longer exists.
--
-- This file is the only definition of the data model. The API's repos/ files
-- translate these snake_case columns into the camelCase objects the React
-- client uses.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  email         TEXT        NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails are compared case-insensitively, so the uniqueness rule is too.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- One row per logged-in browser. The browser holds a random token; the
-- database stores only its SHA-256 hash, so a leaked copy of this table cannot
-- be replayed as a login. Logout deletes the row, which really ends the session.
CREATE TABLE IF NOT EXISTS sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS collections (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        TEXT        NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  description TEXT        NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One user cannot have two collections called "Watches" (or "watches").
CREATE UNIQUE INDEX IF NOT EXISTS collections_user_name_idx
  ON collections (user_id, lower(name));

CREATE TABLE IF NOT EXISTS items (
  id              SERIAL PRIMARY KEY,
  collection_id   INTEGER       NOT NULL REFERENCES collections (id) ON DELETE CASCADE,
  name            TEXT          NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  -- A small image, resized in the browser, stored as a data URL
  -- (data:image/jpeg;base64,...). README "Images" explains why.
  image           TEXT          NOT NULL DEFAULT '',
  estimated_value NUMERIC(12,2) CHECK (estimated_value >= 0),
  currency        TEXT          NOT NULL DEFAULT 'PHP'
                  CHECK (currency IN ('PHP', 'USD', 'EUR', 'JPY', 'GBP')),
  purchase_price  NUMERIC(12,2) CHECK (purchase_price >= 0),
  acquired_date   DATE,
  acquired_from   TEXT          NOT NULL DEFAULT '' CHECK (length(acquired_from) <= 120),
  condition       TEXT          NOT NULL DEFAULT ''
                  CHECK (condition IN ('', 'New', 'Like New', 'Good', 'Fair', 'Poor')),
  notes           TEXT          NOT NULL DEFAULT '' CHECK (length(notes) <= 2000),
  is_favorite     BOOLEAN       NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_collection_id_idx ON items (collection_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at DESC);
