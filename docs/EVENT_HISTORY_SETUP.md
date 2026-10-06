# Historical company events

## US E and EPS results

The market API uses Alpha Vantage's `EARNINGS` endpoint for US listings. It takes `reportedDate` as the E marker date, and keeps reported and estimated EPS from the same quarter record. The free API key is limited to 25 requests per day. In local development, results are cached for 24 hours when the runtime supports disk access, with an isolate-memory fallback.

Get a free API key from https://www.alphavantage.co/support/#api-key and set it in `.env.local`:

```env
ALPHA_VANTAGE_API_KEY=your_key_here
```

Restart the local server after saving. For daily collection and persistence, also add the key as a GitHub repository Actions secret named `ALPHA_VANTAGE_API_KEY` under Settings → Secrets and variables → Actions. Do not commit the key. The scheduled workflow reads this secret, fetches up to 20 US tickers each day, retains five years of E dates/EPS in `data/alpha-earnings-us.json`, and commits the snapshot. Four common dashboard symbols (NVDA, AAPL, MSFT, TSLA) are refreshed daily; the remaining slots rotate through the Nasdaq Trader US equity directory. Because of the free daily quota, a full pass through thousands of tickers takes many months. OTC stocks are outside that directory.

The workflow also needs to be merged to the GitHub production/default branch, with Actions enabled and repository contents write permission. Each committed snapshot triggers the connected Vercel Git deployment, bundling the latest saved history. Vercel reads this snapshot in production; it does not call Alpha Vantage per page request. Setting the key in Vercel is not required for the scheduled collector, though it may remain there. The Actions secret is separate from Vercel Environment Variables.

## Thai E

The daily collector uses SET's official Investor Alert News API, which serves a market-wide feed for SET and mai with three months of historical alerts. It keeps operating-results and financial-result templates (including codes 24, 66, A9, and Forms 45-1/2/3), maps each filing to every issuer symbol attached to it, and accumulates five years of publication dates in `data/alpha-earnings-th.json`. SET describes this service as free for interested users, after registration and creation of an API key in SMART Marketplace: https://www.set.or.th/app/online-data/news-alert . The technical spec documents the all-market alert feed, its `publishDate`, `symbol`, `templateCodes`, and deleted-news IDs: https://media.set.or.th/set/Documents/2023/Nov/10_1_Investor_Alert_News_Data_Specification.pdf .

Add the key as a GitHub Actions repository secret named `SET_INVESTOR_ALERT_API_KEY` under Settings → Secrets and variables → Actions. The scheduled workflow fetches once per day and removes deleted filings. The key is separate from Alpha Vantage and Vercel settings. Once the workflow is active, the latest committed Thai snapshot is bundled into each Vercel deployment. It accumulates history from activation onward; the service only provides a three-month initial lookback. Until this API key is set, the app uses its existing SET search and official issuer archive fallbacks (verified for PTT.BK, PTG.BK, and SCB.BK); issuer archive structures vary. This design should cover SET/mai result alerts broadly, but coverage cannot be called complete until the feed is authenticated and checked against real listed-company filings. Thai announcements generally do not include analyst estimates, so dates may have no beat/miss EPS comparison.

## D and display

D keeps Yahoo's chart ex-dividend events and calendar fallback. Events are merged by kind and local exchange date; an E and D on the same date remain separate. The chart displays all returned events that fall within the selected timeframe. A provider's `available` status confirms records were returned; it does not promise every past event for every security.

## Verification — 2026-10-07

The SET Investor Alert parser and daily collector are in the workflow but have not been exercised against the live feed because a SET API key is not configured. Alpha Vantage was authenticated locally for NVDA (110 historical E dates returned by provider). The daily collection starts after the workflow is on the default branch and both Actions secrets are set. The existing SET search endpoint returned HTTP 403 here; issuer fallbacks were smoke-tested for PTT.BK (20 official E dates within five years), PTG.BK (20 official E dates), and SCB.BK (17 verified releases). Broad Thai coverage depends on the SET API credential and matching the live feed against issuer disclosures.

## Sources

- Alpha Vantage earnings: https://www.alphavantage.co/documentation/#earnings
- Alpha Vantage free request limit: https://www.alphavantage.co/support/
- SET company announcement search behavior: https://github.com/lumduan/settfex/blob/main/docs/settfex/services/set/news.md
- SET Investor Alert API service: https://www.set.or.th/app/online-data/news-alert
- SET Investor Alert API specification: https://media.set.or.th/set/Documents/2023/Nov/10_1_Investor_Alert_News_Data_Specification.pdf
- SCBX SET announcements: https://investor.scbx.com/en/newsroom/set-announcements
