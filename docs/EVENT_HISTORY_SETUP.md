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

Thai symbols first use the SET company-announcements search endpoint, filtered by exact ticker and `Financial Performance`, within its rolling five-year search window. If SET blocks the request or returns no results, the integration reads year-filtered official issuer archives: the PTT investor-relations newsroom for PTT, and the common `{ticker}.listedcompany.com` investor-news format for issuers that use it. SCB also keeps its verified SCBX history as a fallback. Events use publication dates from announcement cards, never quarter-end dates. PTT.BK and PTG.BK issuer archives returned historical events in local smoke checks; SCB.BK returned its verified SCBX history. This does not prove that every Thai company uses or exposes the common archive format.

## D and display

D keeps Yahoo's chart ex-dividend events and calendar fallback. Events are merged by kind and local exchange date; an E and D on the same date remain separate. The chart displays all returned events that fall within the selected timeframe. A provider's `available` status confirms records were returned; it does not promise every past event for every security.

## Verification — 2026-10-07

Parser coverage includes Alpha Vantage quarterly earnings dates/EPS, SET announcement dates and official issuer archive cards, exact ticker matching, duplicate days, ignored financial-statement and management-discussion notices, invalid payloads, and safe source links. Alpha Vantage was authenticated locally for NVDA (110 historical E dates returned by provider). The daily GitHub collection is not active until the workflow and Actions secret are present on the default branch. SET returned HTTP 403 here; the issuer archive fallback was smoke-tested for PTT.BK (20 official E dates within five years), PTG.BK (20 official E dates), and SCB.BK (17 verified releases). Universal coverage is not guaranteed when a provider or company archive does not return usable rows.

## Sources

- Alpha Vantage earnings: https://www.alphavantage.co/documentation/#earnings
- Alpha Vantage free request limit: https://www.alphavantage.co/support/
- SET company announcement search behavior: https://github.com/lumduan/settfex/blob/main/docs/settfex/services/set/news.md
- SCBX SET announcements: https://investor.scbx.com/en/newsroom/set-announcements
