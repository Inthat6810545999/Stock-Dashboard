# Historical company events

The market API now requests EODHD historical earnings and dividends for every valid US/Thai symbol, with no stock allowlist. `NVDA` maps to `NVDA.US`, `BRK.B` to `BRK-B.US`, and `PTT.BK` stays `PTT.BK`.

## Activate

Set the server-only variable `EODHD_API_KEY` in `.env.local` and restart the local server. For production, add the same variable in Vercel Environment Variables and redeploy. Do not use a `NEXT_PUBLIC_` variable or commit the key.

The account must have access to the Fundamentals and Dividends endpoints. A free/demo key is not universal access. Provider exchange support does not guarantee earnings history for every listed instrument; verify the required Thai and US symbols with the account before purchasing a plan.

## Data behavior

- Earnings: `/api/v1.1/fundamentals/{symbol}?filter=Earnings::History`. Use `reportDate`, never the fiscal-period `date`, for E markers. Keep EPS actual and estimate together from the same provider.
- Dividends: `/api/div/{symbol}?fmt=json`. Use the ex-dividend `date`, never payment date, for D. Preserve the supplied dividend currency.
- Fetch the full supplied history once, cache for one hour, and filter to the chart's selected period. Concurrent calls share requests; provider failures retry after five minutes.
- Retain Yahoo events and the verified SCBX history if the extra provider is unavailable. Deduplicate matching event kind and market calendar day. E and D on the same day remain separate.
- `eventHistory` in `/api/market` distinguishes `available`, `empty`, `unavailable`, and `not-configured` for each extra feed. `available` means valid rows were returned, not complete coverage of all historical quarters.
- No demo key, estimated past dates, fabricated events, or fiscal-quarter-end substitutions are inserted.

## Verification — 2026-10-05

Parser and transport tests cover multiple historical reports, US/Thai symbol mapping, ex-date vs payment date, null EPS, malformed responses, duplicate sources, caching, concurrent requests, missing credentials and provider failure.

No EODHD key is configured in this checkout. Authenticated live US/Thai coverage remains unverified. Public trial requests returned HTTP 403 in this environment. This integration is implemented but is not activated; existing Yahoo/SCBX fallbacks continue to run.

## Provider documentation

- https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds
- https://eodhd.com/financial-apis/api-splits-dividends
- https://github.com/EodHistoricalData/eodhd-claude-skills/blob/main/skills/eodhd-api/references/general/stock-types-ticker-suffixes-guide.md

Local `/api/market?range=5Y` smoke checks passed for NVDA, PTT.BK, and SCB.BK. Each correctly reports EODHD `not-configured` while preserving existing data (respectively E/D counts 1/20, 1/10, 17/9). These counts are fallback coverage, not new-provider results. Fifteen automated tests and `npx next build` passed. No layout changes or new responsive-device claims are part of this provider integration.
