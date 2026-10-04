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
