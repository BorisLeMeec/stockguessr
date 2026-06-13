# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

STOCKGUESSR (https://stockguessr.fr) — a static web game: players see a real stock chart (green/red line, black background) and guess which company it is, and on hard modes also the timeframe. Two ways to play: **training** (pick difficulty/rounds, replay forever) and the **Daily Challenge** (same 5 charts for everyone, once per market per day, with buyable hints and a streak counter). Vanilla HTML/CSS/JS, **no build step, no backend, no framework, no login**. All market data is baked into static JSON and refreshed daily by a GitHub Action.

## Commands

```bash
# Run locally (any static server works; data is fetch()ed so file:// won't)
python3 -m http.server 8642        # → http://localhost:8642

# Data pipeline (Node 22, no npm deps)
node scripts/build-companies.mjs       # S&P 500 list from tmp/constituents.csv
node scripts/cac40.mjs                 # CAC 40 list (hand-curated in the script)
node scripts/eurostoxx50.mjs           # EURO STOXX 50 list (hand-curated)
node scripts/fetch-data.mjs <market>   # price history per ticker (resumable; delete data/<market>/stocks/ first for full refresh)
node scripts/fetch-caps.mjs            # live market caps for ALL markets + re-sorts lists by cap

# Deploy: ONLY ever by pushing to main — the GitHub Action deploys.
# NEVER run `wrangler pages deploy` yourself. Just commit + push and let CI handle it.
rtk git add -A && rtk git commit -m "msg" && rtk git push
# After CI runs, verify it actually landed (one deploy silently failed once) —
# use `rtk proxy curl` (plain curl is rewritten to `rtk curl`, which mangles the body):
rtk proxy curl -s "https://stockguessr.fr/?v=$RANDOM" | grep -c "<some new string>"
```

There is no test suite. Verification is done ad-hoc with Playwright: `npm i playwright --no-save` (browsers already cached in ~/Library/Caches/ms-playwright), drive a full game headlessly, then `rm -rf node_modules package.json package-lock.json` — never commit these.

## Architecture

Three frontend files: `index.html`, `style.css`, `app.js` (~700 lines, all logic). Plus `scripts/` (data pipeline) and `data/` (generated JSON, committed to git).

### Data layout — one folder per market

```
data/<market>/companies.json   # [{t: ticker, n: name, s: sector, f: founded year, c: market cap}] SORTED BY CAP DESC
data/<market>/available.json   # tickers that have a stocks/ file (the playable set)
data/<market>/stocks/<T>.json  # {since: year, series: {1D,3D,1M,3M,1Y,5Y,ALL: number[]}}
```

Markets: `sp500` (from constituents CSV), `cac40`, `eurostoxx50` (hand-curated in their scripts). The cap-desc sort matters: difficulty pools are "top N of the list".

**The S&P constituent list is a static snapshot** (`tmp/constituents.csv`, from github.com/datasets/s-and-p-500-companies). The daily refresh updates prices/caps for the *existing* list only — index membership changes require re-downloading the CSV and rerunning build-companies.

Data source is Yahoo Finance (no API key): `query1.finance.yahoo.com/v8/finance/chart/` for prices (intraday 5d/15m for 1D+3D, max/1d sliced for the rest), and `/v7/finance/quote` for caps — the quote endpoint needs the cookie+crumb dance (see fetch-caps.mjs). fetch-data rejects tickers where any timeframe has <8 points (e.g. fresh IPOs).

### Game model (app.js)

- `LEVEL[0..2]` = question levels: easy (top-20 pool, price axis shown, 100pts), medium (top-50, 150pts), hard (whole market, 200pts). +50 for a correct timeframe when guessed.
- `DIFFICULTY{easy,medium,hard,veryhard}` = training modes: a `mix` of question levels per 10 rounds (scaled to 1/5/10/20 rounds by largest-remainder in `levelsFor`), and `guessTf`. **Easy/medium: timeframe pills just switch the chart view ("browse freely") and only the company is guessed. Hard/veryhard: one frozen chart, timeframe is part of the guess.**
- Clue card (`#intel-card`): founded+sector rows show in easy games or on easy-level questions; CAP and country (STOXX 50 only, from the Yahoo ticker suffix via `TICKER_COUNTRY`) show up to medium (easy/medium games, or easy/medium-level questions in harder games). The card fades on hover/tap (`.peek`) so it doesn't hide the chart.
- Autocomplete is scoped to the current question's pool (top 20/50/all of the selected market).
- Chart is a hand-drawn canvas: per-segment green/red coloring, glow via shadowBlur, animated sweep on load.

### Daily Challenge

- 5 fixed rounds, `DAILY_LEVELS = [0,1,1,2,2]` (easy→hard ramp), `guessTf: true`, max 1050 pts. One attempt **per market** per day.
- **Determinism**: companies/timeframes are picked by hashing `date|market|round|ticker` (FNV-1a in `hash32`) and keeping the max — same puzzle for every player that day, independent of list order (caps re-sort daily). The date is the player's **local** date (Wordle-style). `dailyNumber()` counts days since `DAILY_EPOCH` (#1 = 2026-06-12).
- **Hints (daily only)**: a `// HINTS` row of à-la-carte pills, each round offering only what's hidden — TIMELINE (unlock free browsing; forfeits the +50 rather than deducting), then SECTOR / FOUNDED / CAP / PRICES(axis) / COUNTRY at `HINT_COST` (25) each, deducted from the round's earnings, floored at 0. `tfIsGuess()`/`chartAxis()` gate the per-round state. On mobile the pills are one swipeable line (`#hint-pills` overflow-x).
- **localStorage**: `sg_daily_<market>` = `{date, num, score, max}` (replay lock + card state); `sg_streak` = `{date, count}` — consecutive days with ≥1 daily, any market, shown as the 🔥 badge top-right of the daily card (from 1) and in share text/PNG (from 2). A streak dated yesterday still displays (the "don't lose it" nudge); older ones show nothing.
- Share text/image title becomes `DAILY #N` via `diffLabel()` checking `game.dailyNum`.

### i18n — transcreation, not translation

`STR = {en: {...}, fr: {...}}` at the top of app.js. Static HTML carries `data-i18n="key"`; `applyLang()` fills them (entries may be **functions of COMPANIES.length** — market-dependent strings like "All 503 tickers", so applyLang must run after loadMarket and re-run on market switch). Dynamic strings go through `t(key)`. Sector names from data files are English; `SECTOR_FR` maps them for French display. Language auto-detects from `navigator.language` (fr→fr), persists in localStorage `sg_lang`. The humour is rewritten per language ("Index funds. Please." → "Les ETF. S'il te plaît.") — keep that bar when adding strings. Brand elements stay English: STOCKGUESSR, timeframe pills, CAP, TIMELINE (the chosen French word for the timeframe concept — never "période"), DAILY/🔥.

### Menu layout

Menu order: global settings → daily card → TRAIN separator (`.zone-sep`) → rounds → training cards. Global settings (market+lang) are a single `.global-row` used on all sizes: top-right above the daily on desktop, one centered line with the `// MARKET` / `// LANG` labels stacked above their pills on mobile (≤700px, plus an extra squeeze at ≤359px so it fits a 320px screen without horizontal scroll). Rounds (`.rounds-row`, `#rounds-pills`) is one centered line between the TRAIN separator and the training grid on all sizes, with compact pills ≤700px. CSS gotcha: the ≤700px media block sits *earlier* in style.css than some base rules — use higher-specificity selectors (e.g. `#hint-pills`) for mobile overrides.

### Share pipeline

Score card PNG is drawn on a canvas in `buildShareImage()` (1080×1080, fonts via document.fonts.ready). Share flow: native share sheet with file (mobile) → text-only share retry (Android webviews that reject files) → clipboard `ClipboardItem` PNG (desktop) → download (Firefox) / long-press hint (mobile). Wordle-style emoji grid in `shareText()`. Don't add a download fallback on mobile — blob downloads are broken in Android webviews (learned the hard way). Results screen order: image → sponsor → share buttons → recap table.

### Sponsor slot

`SPONSOR` object in app.js + score-tiered copy in `STR[lang].sponsor` (`[minRatio, text]`, first match wins). Currently a Trade Republic referral (`refnocode.trade.re/ffxf9qx5`). `enabled: false` kills it. Link must keep `rel="sponsored"`; keep the capital-loss disclaimer (French regulator). **DOM class/ids are deliberately neutral (`tape-card`/`tape-msg`/`tape-cta`/`tape-fine`, not `sponsor-*`)** — ad-blocker cosmetic filters (EasyList/uBlock) hide anything containing `sponsor`/`ad`/`promo`/`banner`, which silently blanked the joke line for blocker users. Don't rename them back to ad-sounding words.

## Infrastructure

- **Hosting**: Cloudflare Pages, project `stockguessr`, account `8aa63153cec6dac52fa6cea3ad90bccd`, custom domain stockguessr.fr (CNAME @ → stockguessr.pages.dev; the zone's MX/TXT records are the owner's IONOS e-mail — never touch them).
- **CI**: `.github/workflows/deploy.yml` deploys on every push to main; `update-stocks.yml` refreshes all market data daily at 06:00 UTC (≈8am Paris, 9am in winter), with a sanity gate (≥450 sp500 / ≥35 cac40 / ≥45 eurostoxx50 tickers, else abort without committing). Both use the `CLOUDFLARE_API_TOKEN` repo secret. The cron commits as `stock-updater[bot]` — run `git pull` before local work.
- **Caching**: `_headers` sets `max-age=0, must-revalidate` on app.js/style.css/data so deploys reach clients immediately, and `immutable` 1-year on `/fonts/*`; the zone's Browser Cache TTL is set to "Respect Existing Headers" — don't break either half.
- **Analytics**: Cloudflare Web Analytics, "automatic setup" — the beacon is injected at the zone proxy level, **nothing in the repo**. Plain `curl` won't show it (injection skips non-browser UAs); verify with a browser User-Agent header.
- **Fonts are self-hosted** (`/fonts/*.woff2`, latin subset, `@font-face` at the top of style.css) — no Google Fonts, deliberately: GDPR (no visitor IPs to Google) + perf. Don't reintroduce third-party requests; the site currently makes zero.
- **OG/social**: og.png (menu screenshot, 1200×630) + full OG/Twitter tags in index.html. LinkedIn shows only og:title — that's why the tagline is in it. After changing previews, re-scrape via FB Sharing Debugger / LinkedIn Post Inspector.

## Environment quirks

- Shell commands are auto-prefixed with `rtk` (token filter). It corrupts some outputs: use `rtk proxy <cmd>` for wrangler and curl-with-headers; use Node `fs.readdirSync` instead of `ls` when output feeds a script.
- Wrangler is authenticated via the user's OAuth (`wrangler whoami` to check). It can manage the Pages project but **cannot edit zone settings or DNS** (dashboard-only, ask the user).
- `npx wrangler` direct fails under rtk; always `rtk proxy npx -y wrangler …`.

## Adding a market (the established pattern)

1. New `scripts/<market>.mjs` writing `data/<market>/companies.json` (`{t,n,s,f}`, Yahoo ticker format).
2. Add the market to the loop in `fetch-caps.mjs`; run it (sorts by cap, fills `c`).
3. `node scripts/fetch-data.mjs <market>`.
4. `MARKETS` registry in app.js (`dir`, `cur`, `label`) — everything else (pools, autocomplete, clues, shares) adapts automatically.
5. Market pills in **both** pickers in index.html; cap row currency is per-market.
6. Add fetch + sanity threshold to `update-stocks.yml`.
