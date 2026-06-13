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

-- Language split
SELECT lang, count(*) AS guesses FROM guesses GROUP BY lang;
