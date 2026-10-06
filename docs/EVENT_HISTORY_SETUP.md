# Historical company events

## US E and EPS results

The market API uses Alpha Vantage's `EARNINGS` endpoint for US listings. It takes `reportedDate` as the E marker date, and keeps reported and estimated EPS from the same quarter record. The free API key is limited to 25 requests per day. Results are cached for 24 hours in `.cache/earnings/`, keyed by a one-way hash of the API key and ticker, so restart does not repeat calls in a local checkout. The key and cache never leave the server. Requests are coalesced and a failed request is not retried hourly.

Get a free API key from https://www.alphavantage.co/support/#api-key and set it in `.env.local`:

```env
ALPHA_VANTAGE_API_KEY=your_key_here
```

Restart the local server after saving. On Vercel, set the same server-only variable under Settings → Environment Variables, then redeploy. Do not use a `NEXT_PUBLIC_` variable or commit the key. A Vercel instance cache is temporary and may be isolated across instances; Alpha Vantage enforces the account-wide daily quota.

## Thai E

Thai symbols first use the SET company-announcements search endpoint, filtered by exact ticker and `Financial Performance`, within its rolling five-year search window. If SET blocks the request or returns no results, the integration reads year-filtered official issuer archives: the PTT investor-relations newsroom for PTT, and the common `{ticker}.listedcompany.com` investor-news format for issuers that use it. SCB also keeps its verified SCBX history as a fallback. Events use publication dates from announcement cards, never quarter-end dates. PTT.BK and PTG.BK issuer archives returned historical events in local smoke checks; SCB.BK returned its verified SCBX history. This does not prove that every Thai company uses or exposes the common archive format.

## D and display

D keeps Yahoo's chart ex-dividend events and calendar fallback. Events are merged by kind and local exchange date; an E and D on the same date remain separate. The chart displays all returned events that fall within the selected timeframe. A provider's `available` status confirms records were returned; it does not promise every past event for every security.

## Verification — 2026-10-07

Parser coverage includes Alpha Vantage quarterly earnings dates/EPS, SET announcement dates and official issuer archive cards, exact ticker matching, duplicate days, ignored financial-statement and management-discussion notices, invalid payloads, and safe source links. Authenticated Alpha Vantage requests were not tested because no key is configured. SET returned HTTP 403 here; the issuer archive fallback was smoke-tested for PTT.BK (20 official E dates within five years), PTG.BK (20 official E dates), and SCB.BK (17 verified releases). Universal Thai coverage is not guaranteed when SET or a company archive does not return usable rows.

## Sources

- Alpha Vantage earnings: https://www.alphavantage.co/documentation/#earnings
- Alpha Vantage free request limit: https://www.alphavantage.co/support/
- SET company announcement search behavior: https://github.com/lumduan/settfex/blob/main/docs/settfex/services/set/news.md
- SCBX SET announcements: https://investor.scbx.com/en/newsroom/set-announcements
