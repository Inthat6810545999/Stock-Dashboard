# Agreed UI requirements

Last updated: 2026-10-04 (Asia/Bangkok). These record the user's decisions, not speculative redesigns. New explicit requests override this document.

## Dashboard and theme
- Keep the navy / cream / muted gold journal theme and original moon header artwork.
- Stock brief, News brief and Valuation use the same navy surface as Earnings. The Liquid Glass experiment was rejected.
- Lower background must use different artwork from the header, in the same theme. Idle animation must stay subtle, honor Motion off and reduced motion.
- Keep original menu spacing. Labels: Dashboard, Watchlist, Must Watch, Supply Chain.
- Use consistent self-hosted typography across platforms (current Inter). Do not rely on Apple-only fonts for identical rendering.
- Rounded corners must remain consistent across browsers; avoid unsupported corner-shape effects.
- Header, banner and watchlist must not jump when changing pages. Center banner text inside its own area.

## Charts and cards
- Preserve the current overall price chart height. Do not enlarge the chart to fix Volume.
- Latest reference supersedes TradingView: Dime-style muted grey Volume (#92979e at 40% opacity), low histogram occupying up to 20% of drawable chart height; 1D alone uses 60% (3× the Dime baseline, per latest request). Keep outer chart height and price geometry unchanged. 1M has slim daily bars; denser ranges use near-contiguous bars. No up/down volume colors.
- Exactly seven chart timeframes in order: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y. API ranges and performance labels must match. YTD requests calendar year-to-date data, not a rolling year.
- Never use cumulative daily volume as a single interval bar. Preserve actual proportions; a one-pixel positive-bar visibility floor is acceptable. Zero volume stays zero.
- Keep axes, labels and volume inside the chart at every breakpoint. Never squash chart height to fit an impossible layout.
- Stock brief keeps its existing font size; wrap full supplied sentences onto additional lines instead of line-clamp ellipses. Compact layouts can scroll the description without hiding targets.
- Valuation must fit without its own scrollbar; Earnings may be narrower to make room.
- Watchlist logos vertically centered, sparklines visible on tablets, text/prices never overlap. Show whole cards at resting positions and horizontal scrolling for additional stocks.
- Thai dates/times use Asia/Bangkok (ICT), including news. Preserve US and Thai stock support.

## Supply chain and Must Watch
- Preserve original navy phase colors, icons and animated connecting lines.
- Desktop/tablet map fits and is centered. On phones, phases flow downward with arrows and upright text, retaining desktop relationships.
- Company navigation opens that company's dashboard.
- Must Watch replaces News in navigation. YoY price gainers is the first screen, followed by growth screens including one independent of company size.
- Keep screening methodology, coverage, snapshot and refresh details in the info dialog beside Refresh.
- Do not invent market averages, missing financial values or scanner coverage.

## Required responsive checks
For layout/chart changes, inspect actual rendered SVG bounds as well as containers, card text, axes, volume and page overflow. Exercise resizing in both directions and verify data-loaded states.

Desktop: 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440.
Tablet portrait/landscape: 768×1024 / 1024×768, 820×1180 / 1180×820, 834×1194 / 1194×834, 1024×1366 / 1366×1024. Include reduced available height with browser chrome (1180×690).
Phone portrait/landscape: 360×800 / 800×360, 375×667 / 667×375, 390×844 / 844×390, 430×932 / 932×430.

Viewport simulation is not physical-device or cross-engine testing. Report exactly what was tested; do not claim Safari, Android or Windows verification from one browser engine. Keep a dated audit report when changing responsive behavior.

## Corporate events and dividends
- Show clickable E (earnings announcements) and D (ex-dividend dates) on the chart when provider dates fall in its period. Do not show a Next E chip. Upcoming dividends may appear as Next D. Nearby E and D remain separate overlapping badges so neither kind is replaced by E/D text.
- Never substitute fiscal quarter ends for announcement dates. Current Yahoo calendar coverage does not provide a complete historical earnings-event series; disclose this limitation.
- Valuation shows annual dividend yield (%) and annual dividend rate per share in the quote currency, labeled indicated or trailing. Missing data is unavailable, not zero.
- Yield recalculates with current quotes. Company dividend/event data refreshes with the 60-second snapshot; do not describe corporate declarations as a real-time stream.

## Thai news
- Thai .BK news uses Thai Google News RSS search with the ticker and financial context, rather than relying on Yahoo relatedTickers coverage. Keep US news on its existing provider.
- Match whole ticker tokens (PTT must not match PTTGC), reject invalid links/dates, deduplicate headlines, and omit social-platform results. Display publisher, original link and Bangkok publication time.
- Poll every 60 seconds; label as aggregated news that may be delayed, never guaranteed real-time. Empty initial feeds must populate when a later refresh returns news.
- Thai All news links should open the corresponding Thai news search. Do not fabricate article summaries or scrape full publisher articles.

## Search and scrollbars
- Stock search scrolls vertically only; long names wrap without horizontal overflow.
- Scrollbars use thin rounded muted theme colors. Earnings Est. dates use the same text color as quarter labels.

## Watchlist editing
- Do not show remove crosses on the dashboard ticker cards. Show them only after Edit in the watchlist dialog; Done leaves edit mode. Keep at least one stock.
- Watchlist navigation opens the dialog on desktop and mobile. Closing it returns the active navigation tab to Dashboard and resets edit mode.

- Adding a new stock in search keeps the dialog, query and current page open so multiple stocks can be added. Selecting View for an existing stock opens its dashboard.

- Restore the compact desktop/tablet stock heading to a 46px logo and 26px ticker with company name visible. Do not shrink it to 28px/22px based on viewport height. Remove the quote-meta status row under the price at the user’s request.

- SCB.BK historical E markers use dated official SCBX earnings releases, with source links and date-only labels (no invented announcement time). Refresh new releases hourly with verified history as fallback. This coverage is specific to SCBX, not a claim of all-stock historical coverage.

- E/D badges are their original 22px size divided by 1.5 (14.667px; supersedes the half-size and one-third requests). Nearby events remain separate overlapping badges, never E/D text. E uses theme green only for actual EPS > estimate; equal/below is theme red. Missing EPS/consensus stays neutral. Match fiscal periods explicitly, never infer the earnings announcement date from a quarter end.

- Historical E and D integration must apply to every valid US/Thai ticker, not only a hardcoded company. EODHD is the additional server-side provider (`EODHD_API_KEY`); retain Yahoo/SCBX fallbacks. Expose missing credentials/provider failure separately from a confirmed empty response. Show every supplied event within the selected timeframe, deduplicate sources, and never claim universal data coverage without live verification. Setup and current activation limits: `docs/EVENT_HISTORY_SETUP.md`.
