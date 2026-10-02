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
