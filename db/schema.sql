-- Divvy votes (reference only — the Pages Functions auto-create this table on first
-- request, so you don't need to run this). Signed up/down votes: one row per (idea, voter),
-- val = +1 (up) or -1 (down); an idea's net score is SUM(val) and can go negative.
CREATE TABLE IF NOT EXISTS vote_rows (
  slug  TEXT    NOT NULL,
  voter TEXT    NOT NULL,   -- anonymous per-browser id (divvy_uid cookie)
  val   INTEGER NOT NULL,   -- +1 or -1
  PRIMARY KEY (slug, voter)
);
