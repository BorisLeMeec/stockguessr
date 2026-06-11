// Builds data/companies.json: ranked list of playable companies.
// Rank matters only for difficulty cutoffs (top 20 = easy pool, top 50 = medium pool),
// so the top 50 are hand-ordered by market cap and the rest keep CSV order.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const TOP50 = [
  'NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'AVGO', 'TSLA', 'BRK.B', 'JPM',
  'WMT', 'LLY', 'ORCL', 'V', 'MA', 'NFLX', 'XOM', 'COST', 'JNJ', 'HD',
  'PG', 'PLTR', 'BAC', 'ABBV', 'CVX', 'KO', 'GE', 'AMD', 'CSCO', 'TMUS',
  'WFC', 'CRM', 'PM', 'IBM', 'MS', 'UNH', 'ABT', 'GS', 'LIN', 'INTU',
  'MCD', 'AXP', 'RTX', 'DIS', 'CAT', 'NOW', 'MRK', 'T', 'PEP', 'UBER',
];

const csv = readFileSync(new URL('../tmp/constituents.csv', import.meta.url), 'utf8');
const rows = csv.trim().split('\n').slice(1).map(line => {
  // naive CSV parse handling quoted fields
  const fields = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { fields.push(cur); cur = ''; }
    else cur += ch;
  }
  fields.push(cur);
  return {
    symbol: fields[0],
    name: fields[1],
    sector: fields[2],
    founded: (fields[7]?.match(/\d{4}/) || [null])[0], // "1888 (as ...)" → 1888
  };
});

const bySymbol = new Map(rows.map(r => [r.symbol, r]));
const ranked = [];
for (const t of TOP50) {
  const r = bySymbol.get(t);
  if (r) { ranked.push(r); bySymbol.delete(t); }
}
ranked.push(...bySymbol.values());

const companies = ranked.map(r => ({
  t: r.symbol.replace('.', '-'), // Yahoo uses BRK-B style
  n: r.name,
  s: r.sector,
  f: r.founded ? +r.founded : null,
}));

mkdirSync(new URL('../data', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/companies.json', import.meta.url), JSON.stringify(companies));
console.log(`Wrote ${companies.length} companies`);
