-- Replayable metrics queries for the `guesses` table (D1: stockguessr-metrics).
-- Run one with:  wrangler d1 execute stockguessr-metrics --remote --command "<paste>"
-- Or all of them: wrangler d1 execute stockguessr-metrics --remote --file scripts/metrics-queries.sql
-- (under rtk:  rtk proxy npx -y wrangler d1 execute stockguessr-metrics --remote --command "...")

-- Total guesses ever (the headline number: how many times Validate was clicked)
SELECT count(*) AS total_guesses FROM guesses;

-- Guesses today (UTC)
SELECT count(*) AS today FROM guesses WHERE date(ts) = date('now');

-- Guesses per day, most recent first
SELECT date(ts) AS day, count(*) AS guesses
FROM guesses GROUP BY day ORDER BY day DESC LIMIT 30;

-- Split by market
SELECT market, count(*) AS guesses FROM guesses GROUP BY market ORDER BY guesses DESC;

-- Daily Challenge vs training modes
SELECT CASE WHEN mode = 'daily' THEN 'daily' ELSE 'training' END AS kind,
       count(*) AS guesses
FROM guesses GROUP BY kind;

-- Training breakdown by difficulty
SELECT mode, count(*) AS guesses FROM guesses
WHERE mode <> 'daily' GROUP BY mode ORDER BY guesses DESC;

-- Company-guess accuracy overall and per question level
SELECT level,
       count(*) AS guesses,
       round(100.0 * avg(ok_company), 1) AS pct_correct
FROM guesses GROUP BY level ORDER BY level;

-- Plays vs wins per difficulty (a win = company right AND, when guessed, timeframe right)
SELECT mode,
       count(*)                                                  AS played,
       sum(CASE WHEN ok_company = 1 AND ok_tf IS NOT 0 THEN 1 ELSE 0 END) AS won
FROM guesses GROUP BY mode ORDER BY played DESC;

-- Language split
SELECT lang, count(*) AS guesses FROM guesses GROUP BY lang;


-- ─────────── share-button events (table: events) ───────────

-- Total share-button clicks, by button (detail IS NULL = the initial click)
SELECT name, count(*) AS clicks
FROM events WHERE name LIKE 'share_%' AND detail IS NULL
GROUP BY name ORDER BY clicks DESC;

-- Share clicks broken down by outcome (shared / shared_text / copied / downloaded / longpress)
SELECT name, detail, count(*) AS n
FROM events WHERE name LIKE 'share_%' AND detail IS NOT NULL
GROUP BY name, detail ORDER BY name, n DESC;

-- Share clicks per day, most recent first
SELECT date(ts) AS day, count(*) AS share_clicks
FROM events WHERE name LIKE 'share_%' AND detail IS NULL
GROUP BY day ORDER BY day DESC LIMIT 30;


-- ─────────── sponsor clicks (for ad reporting) ───────────

-- Total sponsor clicks
SELECT count(*) AS sponsor_clicks FROM events WHERE name = 'sponsor_click';

-- Sponsor clicks per day, most recent first
SELECT date(ts) AS day, count(*) AS sponsor_clicks
FROM events WHERE name = 'sponsor_click'
GROUP BY day ORDER BY day DESC LIMIT 30;

-- Sponsor clicks by market and language
SELECT market, lang, count(*) AS clicks
FROM events WHERE name = 'sponsor_click'
GROUP BY market, lang ORDER BY clicks DESC;

-- Sponsor clicks by score band (q0=0-24% … q3=75-100%) — do good/bad scorers convert?
SELECT detail AS score_band, count(*) AS clicks
FROM events WHERE name = 'sponsor_click'
GROUP BY detail ORDER BY score_band;
