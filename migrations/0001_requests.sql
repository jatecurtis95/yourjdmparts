-- Part requests.
--
-- Applied to the production database (yourjdmparts-requests) on 2026-08-11.
-- Kept here so the schema is in version control rather than only in the
-- dashboard, and so a fresh copy of this site can be stood up from the repo.
--
-- To apply to a local dev database:
--   npx wrangler d1 execute yourjdmparts-requests --local --file migrations/0001_requests.sql
--
-- The `payload` column holds the entire submission as JSON. The flat columns
-- beside it exist so the dashboard console is skimmable without unpacking
-- JSON by hand — they are a convenience view, not the record. If the two ever
-- disagree, `payload` is what actually arrived.

CREATE TABLE IF NOT EXISTS requests (
  -- Customer-facing code, e.g. YJP-K4M2PT. Not sequential: a customer
  -- reading "request 4" down the phone learns how few there have been.
  reference TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,

  -- 0 until someone has quoted it. The open-work query filters on this.
  handled INTEGER NOT NULL DEFAULT 0,
  -- Whether REQUEST_WEBHOOK also took it. Storage and notification are
  -- independent, so this records which routes actually worked.
  forwarded INTEGER NOT NULL DEFAULT 0,

  name TEXT,
  business TEXT,
  email TEXT,
  phone TEXT,
  state TEXT,
  postcode TEXT,
  heard_from TEXT,
  -- Consent to contact beyond this request only. Contact about the request
  -- itself needs no permission and is not recorded as consent.
  marketing_consent INTEGER NOT NULL DEFAULT 0,

  vehicle_summary TEXT,
  parts_summary TEXT,
  urgency TEXT,
  budget TEXT,
  photo_count INTEGER NOT NULL DEFAULT 0,

  payload TEXT NOT NULL
);

-- The query that matters daily: what is still waiting, newest first.
CREATE INDEX IF NOT EXISTS requests_open ON requests (handled, received_at DESC);
CREATE INDEX IF NOT EXISTS requests_received ON requests (received_at DESC);
