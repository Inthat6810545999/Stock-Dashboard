# Market After Hours

English US stock dashboard matching the approved midnight navy and cream design.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by the server (currently http://127.0.0.1:5173).

## Features

- Desktop viewport layout: all dashboard panels visible at widths of at least 1000px and heights of at least 650px. Smaller screens use a stacked accessible layout.
- Yahoo Finance stock search and watchlist additions/removals, up to 24 stocks; four cards per page. Watchlist is saved only in this browser's local storage.
- Yahoo WebSocket streaming prices for the selected stock and watchlist. The quote label distinguishes regular, pre-market and after-hours sessions. Regular-session charts receive regular-session ticks only.
- Stream reconnect with exponential backoff and 15-second subscription heartbeat. Snapshot fallback every 60 seconds. The badge shows LIVE STREAM only for the selected stock when its latest quote is under 30 seconds old; otherwise it shows waiting or reconnection status. Source timestamps remain visible. Exchange coverage and delay depend on Yahoo; streaming is not a guarantee of every exchange trade.
- Historical price and volume, trailing and forward P/E, analyst mean target, and quarter-ended actual/estimated EPS.
- Volume relative to average indicates trading activity, not a buy/sell ratio or direct measure of demand.
- Publisher news excerpts and original links. These are source-provided descriptions, not AI-generated article summaries.

## Data behavior

Yahoo Finance requests run on the server via yahoo-finance2 and the chart endpoint. This is an unofficial integration and may be throttled or unavailable. No API key is needed for the currently working connection. No credentials are stored in the browser.

Quotes and charts cache for 55 seconds; fundamentals/news for 5 minutes; searches for 5 minutes. Missing fields are left unavailable. Target revision dates are not invented. EPS periods show the actual quarter-end month because companies use different fiscal calendars.

The empty loading state contains no fabricated prices. Failures show an error while preserving already loaded data and its timestamp.

## Checks

- `npx tsc --noEmit`
- `npm run build`
- API checks cover Yahoo search, new symbols, prices, valuation, EPS and historical ranges.

## Artwork

`public/collage-header.png` was generated using built-in imagegen. Prompt: midnight navy grainy background, clear left 60%, cream engraved moon, horse postage stamp, blue compass star and silver disco fragment at right; antique paper collage with no text or interface.

Streaming decoder and merge regression checks: `node --experimental-strip-types tests/quote-stream.test.mjs`. The schema follows https://github.com/ranaroussi/yfinance/blob/main/yfinance/pricing.proto and the subscription protocol follows its live.py.

### Supply chain explorer

The Supply chain menu replaces the main dashboard with a curated relationship map, keeping the selected stock and watchlist. Click a node to inspect its source, explore that company's connections or add its US listing to the watchlist. Groups with more than four connections have page controls. Animations can be paused and honor reduced-motion preferences.

`lib/supply-chain.ts` contains 27 directional public-disclosure relationships, with a shared company catalog. Sources and publication dates are attached to every edge; this is selective, manually reviewed coverage rather than a live or exhaustive supplier feed. Unknown symbols show an explicit unmapped state. International listings are identified and cannot be added to the US watchlist. Logo images use company-domain favicons, with Financial Modeling Prep images for other symbols and a text fallback on errors.

The price chart also supports 5Y history and displays a non-annualized price return for the selected period, excluding dividends.

### Detailed AI ecosystem

The AI ecosystem view expands the map to 13 layers and 43 companies, with linked stage descriptions, outputs, capacity watchpoints and primary sources. This industry flow diagram is distinct from the individually sourced Company links view; stage membership does not assert a direct supply contract. Company tickers identify US, international and private entities, and only US listings can enter the watchlist.

Controls: drag the background to pan, use zoom buttons or +/- keys, use arrow keys to pan while the map is focused, and press 0 or Fit to reset. Guided journey highlights the layers in sequence; flow animation has a separate pause button. Reduced-motion preferences disable decorative animation. Sources are curated as of 2 October 2026, not a live supply-data feed.

Validate graph coverage with `node --experimental-strip-types tests/ai-supply-chain.test.mjs`.

## Market-wide Must watch scans

`npm run scan:market` scans both markets; append `-- --market=us` or `-- --market=th` for one market. Node 22 is required. No provider credentials are used.

- **US universe:** both official Nasdaq Trader symbol directories, excluding test symbols, ETFs, NextShares, funds, preferred shares, warrants, rights, notes, bonds and units. US exchange-listed equities and ADRs are included; OTC is **not** included. Share-class periods are normalized to Yahoo's hyphen convention.
- **Thailand universe:** all alphabet/numeric directory links discovered from Thailand SEC's listed-company page, retaining SET/mai-classified rows. This replaces the former 48-company sample. The SET Excel endpoint was inaccessible during implementation; SEC is an independent official directory source.
- **Scan:** every directory symbol is considered. Bulk quotes reject stocks already outside positive P/E / forward-P/E ≤25. Remaining symbols receive a fundamentals request for revenue growth ≥10% YoY. The any-size ranking has no market-cap requirement; the other requires USD/THB 1 billion. Each is sorted by quarterly revenue-growth percentage divided by forward P/E. The score can favor one-off rebounds and is not PEG, a fair-value estimate, or a sector-adjusted valuation.
- **Coverage:** counts distinguish eligible, excluded, missing required fields and failed requests. Completion means every directory symbol was processed, not that Yahoo supplies all fields for every stock. No data-completeness or global/OTC coverage claim is made.
- **Persistence:** checked-in `data/must-watch-{us,th}.json` snapshots survive server restarts. API reads snapshots instead of running thousands of requests from the browser. Failed directory discovery never replaces the previous snapshot. During rescans, the previous completed ranking remains available with progress. An initial in-progress scan is explicitly provisional. Over 25% failed requests fails the job instead of publishing a completed snapshot. Checkpoints under ignored `.cache/market-scan/` allow same-day resume; provider failures are retried. Remove a leftover `.lock` only after confirming no scanner process is running.
- **Updates:** `.github/workflows/market-scan.yml` starts daily at 22:30 UTC / 05:30 ICT, with a manual trigger, a 90-minute limit and no overlapping runs. It commits completed Must watch snapshots and refreshes up to 20 Alpha Vantage US earnings histories per day into `data/alpha-earnings-us.json`. Add the Alpha key as a GitHub Actions repository secret named `ALPHA_VANTAGE_API_KEY`; four slots refresh the main dashboard symbols daily, while the remaining slots rotate through the Nasdaq Trader US directory. **The schedule is not active until this workflow is pushed to the GitHub default branch, the key is stored as a repository Actions secret, and Actions with write permissions is enabled.** An existing Vercel Git integration deploys each committed snapshot. GitHub scheduling may be delayed. No deployment or Git push is performed by the local scan command.
- **UI refresh:** reads the newest deployed snapshot every 60 seconds and polls displayed-stock prices every 60 seconds. Ratios and ranks remain the daily snapshot values. It displays source quote times and marks snapshots older than 36 hours stale.

Checks: `node tests/market-universe.test.mjs`, `node --experimental-strip-types tests/must-watch.test.mjs`, `npx tsc --noEmit`, `npm run build`.

### Top 10 annual price gainers

The first Must watch section ranks positive one-calendar-year price returns across the same full directory, independently of P/E, revenue growth and market cap. The daily scanner fetches daily Yahoo `close` history for every equity (not `adjclose`, so no dividend reinvestment), compares the latest available price with the last available trading day on or before its year-ago date (maximum 7-day holiday gap), and rejects symbols lacking a full year or a latest price within 7 days. IPOs with shorter histories are not annualized. Cards show both comparison prices and trading dates; returns and endpoint prices remain aligned to the scan, rather than mixing a live quote with yesterday's ranking. Growth-card quotes still refresh every 60 seconds. `priceScan` reports independent annual-history coverage and failures, and `priceGainers` contains up to 10 positive returns. Corporate actions and data errors can affect provider history.

Annual scans use bounded six-request concurrency, retries, 20-second timeouts and persisted per-symbol checkpoints. They run in the existing daily workflow. Validation: `node --experimental-strip-types tests/price-gainers.test.mjs` and `node scripts/market-scan/check.mjs`.
