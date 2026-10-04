# Responsive audit — 2026-10-04

Scope: Dashboard, loaded NVDA 1D chart, Volume and Stock brief. Browser: Codex in-app browser viewport simulation; not physical-device or Safari/Firefox testing. This does not certify every page or every possible resolution.

See `responsive-audit-2026-10-04.json` for all 23 viewport measurements. All measured sizes had no document horizontal overflow, chart inside its panel, SVG height matching rendered canvas, and volume bars within chart bounds. The data-loaded chart contained 391 volume bars. A collapsed Stock brief at 800×360 was found, fixed with an auto-height flex rule for short landscape screens, and rechecked at 38px high. Compact descriptions can scroll internally; phones wrap in natural document flow.

Visual check: final 1440×900 dashboard, full Stock brief sentences and green/red bottom volume bars. Volume remains linear; an unusually large opening-volume bar makes subsequent bars relatively short. Positive bars have a one-pixel display floor, zero values remain zero. Colors compare consecutive closing prices because the chart model does not include candle opens. API history uses interval volume; streaming daily cumulative volume is not substituted into interval bars. Live new buckets remain zero until the history refresh supplies interval data.

TypeScript and production build passed. Future changes should repeat relevant checks from UI_REQUIREMENTS.md and explicitly list any untested engines/devices.

## Taller Volume follow-up
User requested taller histogram bars from a TradingView reference. Increased maximum bar height from 26% (capped at 54px) to 45% of drawable chart height without changing price geometry or the outer chart. Rechecked all 23 viewports with loaded data: volume remained inside chart bounds and there was no document horizontal overflow. Measurements: `volume-height-audit-2026-10-04.json`. TypeScript and diff checks passed for this follow-up.

## Range-specific volume follow-up
Non-1D height reduced to 1.2× original baseline; 1D raised from 45% to 54%. Removed fixed 14px bar-width cap; widths now follow 80% of interval spacing. Edge bars clip at plot edges rather than shifting inward and overlapping their neighbours. Both 1D and 1M checked at 23 viewports (46 observations), no chart-bound or document horizontal-overflow failures. See volume-range-audit-2026-10-04.json. TypeScript passed.

## Latest: Dime reference replaces TradingView
Grey low-profile volume and seven ranges (1D, 5D, 1M, 6M, YTD, 1Y, 5Y). All seven API requests returned HTTP 200 with nonempty history; YTD began 2026-01-02. Tested all seven ranges across 23 viewport sizes (161 checks): grey volume bars within SVG, all seven tabs inside panel, no document horizontal overflow. Browser simulation only. See dime-volume-audit-2026-10-04.json. TypeScript and production build passed. This supersedes the taller colored-bar experiments above.

## 1D 1.3× adjustment
Raised only 1D Volume from 20% to 26% of drawable height. Other ranges and chart dimensions unchanged. Rechecked 23 simulated viewport sizes with loaded 1D data: volume within SVG and no horizontal document overflow. TypeScript and diff checks passed.

## Latest 1D 3× adjustment
User superseded 1.3× with 3× of the original Dime baseline: 1D now uses 60% of drawable chart height. Other ranges stay at 20%. Verified loaded 1D at all 23 simulated viewport sizes: bars stay within SVG; no horizontal document overflow. Diff check passed.
