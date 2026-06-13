-- One row per UI event we care about (currently share-button clicks). No PII.
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY,
  ts      TEXT    NOT NULL DEFAULT (datetime('now')),  -- UTC
  name    TEXT,                                         -- share_native | share_copy | share_x
  detail  TEXT,                                         -- outcome: shared | shared_text | copied | downloaded | longpress | failed | NULL
  market  TEXT,                                         -- sp500 | cac40 | eurostoxx50
  mode    TEXT,                                         -- easy|medium|hard|veryhard | daily
  lang    TEXT                                          -- en | fr
);

CREATE INDEX IF NOT EXISTS idx_events_ts   ON events (ts);
CREATE INDEX IF NOT EXISTS idx_events_name ON events (name);
