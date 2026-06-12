// Fetches live market caps from Yahoo (cookie+crumb flow), writes them into each
// market's companies.json as `c`, and re-sorts the list by cap so difficulty
// pools (top 20 / top 50) reflect reality.
import { readFileSync, writeFileSync } from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function getCrumb() {
  const r1 = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA }, redirect: 'manual' });
  const cookie = r1.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw new Error('no yahoo cookie');
  const r2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  const crumb = await r2.text();
  if (!crumb || crumb.length > 20) throw new Error('no crumb');
  return { cookie, crumb };
}

const { cookie, crumb } = await getCrumb();

async function caps(tickers) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(',')}&fields=marketCap&crumb=${encodeURIComponent(crumb)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, Cookie: cookie } });
  if (!r.ok) throw new Error(`quote HTTP ${r.status}`);
  const j = await r.json();
  return new Map((j.quoteResponse?.result || []).map(q => [q.symbol, q.marketCap]));
}

for (const market of ['sp500', 'cac40', 'eurostoxx50']) {
  const file = new URL(`../data/${market}/companies.json`, import.meta.url);
  const companies = JSON.parse(readFileSync(file, 'utf8'));
  const byCap = new Map();
  for (let i = 0; i < companies.length; i += 100) {
    const batch = companies.slice(i, i + 100).map(c => c.t);
    for (const [sym, cap] of await caps(batch)) byCap.set(sym, cap);
    await new Promise(r => setTimeout(r, 400));
  }
  let missing = 0;
  for (const c of companies) {
    c.c = byCap.get(c.t) ?? null;
    if (c.c == null) missing++;
  }
  companies.sort((a, b) => (b.c ?? 0) - (a.c ?? 0));
  writeFileSync(file, JSON.stringify(companies));
  console.log(`${market}: ${companies.length} companies, ${missing} without cap, top3: ${companies.slice(0, 3).map(c => c.t).join(',')}`);
}
