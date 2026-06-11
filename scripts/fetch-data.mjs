// Fetches real price history from Yahoo Finance for every company in
// data/companies.json and precomputes the 7 timeframe series the game uses.
// Resumable: skips tickers that already have a JSON file in data/stocks/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const MARKET = process.argv[2] || 'sp500'; // sp500 | cac40
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const OUT = new URL(`../data/${MARKET}/stocks/`, import.meta.url);
mkdirSync(OUT, { recursive: true });

const companies = JSON.parse(readFileSync(new URL(`../data/${MARKET}/companies.json`, import.meta.url), 'utf8'));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function yahoo(ticker, params) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?${params}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 429) { await sleep(5000 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error('no result');
    const ts = result.timestamp ?? [];
    const close = result.indicators?.quote?.[0]?.close ?? [];
    const pts = [];
    for (let i = 0; i < ts.length; i++) {
      if (close[i] != null) pts.push([ts[i], +close[i].toFixed(4)]);
    }
    return pts;
  }
  throw new Error('rate limited');
}

// Evenly downsample to at most n points, always keeping first and last.
function downsample(pts, n) {
  if (pts.length <= n) return pts;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pts[Math.round(i * (pts.length - 1) / (n - 1))]);
  return out;
}

const closes = pts => pts.map(p => p[1]);
const dayKey = ts => new Date(ts * 1000).toISOString().slice(0, 10);

function lastDays(intraday, nDays) {
  const days = [...new Set(intraday.map(p => dayKey(p[0])))];
  const keep = new Set(days.slice(-nDays));
  return intraday.filter(p => keep.has(dayKey(p[0])));
}

async function fetchTicker(t) {
  const intraday = await yahoo(t, 'range=5d&interval=15m');
  await sleep(300);
  const daily = await yahoo(t, 'range=max&interval=1d');

  const year = pts => new Date(pts[0][0] * 1000).getFullYear();
  const series = {
    '1D': closes(lastDays(intraday, 1)),
    '3D': closes(downsample(lastDays(intraday, 3), 80)),
    '1M': closes(daily.slice(-22)),
    '3M': closes(daily.slice(-66)),
    '1Y': closes(downsample(daily.slice(-252), 120)),
    '5Y': closes(downsample(daily.slice(-1260), 120)),
    'ALL': closes(downsample(daily, 150)),
  };
  return { since: year(daily), series };
}

let ok = 0, failed = [];
for (const { t } of companies) {
  const file = new URL(`${t}.json`, OUT);
  if (existsSync(file)) { ok++; continue; }
  try {
    const data = await fetchTicker(t);
    // sanity: every timeframe needs enough points to draw a line
    if (Object.values(data.series).some(s => s.length < 8)) throw new Error('too few points');
    writeFileSync(file, JSON.stringify(data));
    ok++;
    if (ok % 25 === 0) console.log(`${ok}/${companies.length}`);
  } catch (e) {
    failed.push(t);
    console.error(`FAIL ${t}: ${e.message}`);
  }
  await sleep(350);
}
console.log(`Done: ${ok} ok, ${failed.length} failed${failed.length ? ': ' + failed.join(',') : ''}`);

// Manifest of tickers that actually have data — the game only quizzes these.
const have = companies.filter(c => existsSync(new URL(`${c.t}.json`, OUT))).map(c => c.t);
writeFileSync(new URL(`../data/${MARKET}/available.json`, import.meta.url), JSON.stringify(have));
console.log(`Manifest: ${have.length} tickers available`);
