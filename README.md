# STOCKGUESSR

Ten charts. No names. Trust the line.

A web game: you're shown a real stock chart (green/red line on black) and must guess
which S&P 500 company it is and over what timeframe (1D, 3D, 1M, 3M, 1Y, 5Y, all time).

## Run

Static files only — serve the folder and open it:

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Difficulty

Each game is 10 rounds. The game difficulty sets the mix of question levels:

| Game      | easy q | medium q | hard q |
|-----------|--------|----------|--------|
| Easy      | 7      | 3        | 0      |
| Medium    | 2      | 6        | 2      |
| Hard      | 1      | 4        | 5      |
| Very Hard | 0      | 2        | 8      |

Question levels: **easy** = top-20 company, price axis visible, 100 pts ·
**medium** = top-50, no axis, 150 pts · **hard** = any of the 500, no axis, 200 pts.
Correct timeframe is +50 pts on any level.

## Data

Real prices from Yahoo Finance, baked into static JSON (`data/stocks/*.json`,
~2 MB total) so the game needs no backend or API keys. To refresh:

```bash
node scripts/build-companies.mjs   # rebuild ranked company list from tmp/constituents.csv
node scripts/fetch-data.mjs        # re-fetch prices (resumable; delete data/stocks/ first for a full refresh)
```
