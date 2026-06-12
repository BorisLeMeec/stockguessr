# STOCKGUESSR

Ten charts. No names. Trust the line. — https://stockguessr.fr

A web game: you're shown a real stock chart (green/red line on black) and must guess
which company it is — and on hard modes, over what timeframe (1D, 3D, 1M, 3M, 1Y, 5Y, all time).
Three markets: S&P 500, CAC 40, EURO STOXX 50. English & French.

## Run

Static files only — serve the folder and open it:

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Game rules

Each game is 1/5/10/20 rounds at a chosen difficulty. Question levels: **easy** =
top-20 company by market cap, price axis + clue card visible, 100 pts · **medium** =
top 50, 150 pts · **hard** = whole market, 200 pts. Game difficulty sets the mix of
question levels. On Easy/Medium games you browse timeframes freely and only guess the
company; on Hard/Very Hard the chart is frozen and the timeframe is +50 pts to guess.

## Data

Real prices and market caps from Yahoo Finance, baked into static JSON
(`data/<market>/…`) so the game needs no backend or API keys. A GitHub Action
refreshes everything daily at 06:00 UTC and redeploys. Manual refresh:

```bash
node scripts/fetch-data.mjs sp500      # also: cac40, eurostoxx50 (resumable)
node scripts/fetch-caps.mjs            # live caps, re-ranks all lists
```

Deployed on Cloudflare Pages; every push to `main` auto-deploys.

See `CLAUDE.md` for architecture details.
