-- One row per "validate" click. No PII — just the guess context for aggregate metrics.
CREATE TABLE IF NOT EXISTS guesses (
  id         INTEGER PRIMARY KEY,
  ts         TEXT    NOT NULL DEFAULT (datetime('now')),  -- UTC
  market     TEXT,                                         -- sp500 | cac40 | eurostoxx50
  mode       TEXT,                                         -- easy|medium|hard|veryhard | daily
  daily_num  INTEGER,                                      -- daily puzzle number, else NULL
  level      INTEGER,                                      -- question level 0|1|2
  ok_company INTEGER,                                      -- 1 right, 0 wrong
  ok_tf      INTEGER,                                      -- 1 right, 0 wrong, NULL = not part of puzzle
  lang       TEXT                                          -- en | fr
);

CREATE INDEX IF NOT EXISTS idx_guesses_ts     ON guesses (ts);
CREATE INDEX IF NOT EXISTS idx_guesses_market ON guesses (market);
