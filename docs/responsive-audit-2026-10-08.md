# After-hours quote layout audit — 2026-10-08

After-hours shares the price row immediately before the timeframe controls. The existing two-column desktop grid now has three columns when the extended quote is present. Price at appears on the left above the period return; the chart range dates remain on the right. Controls wrap when the card content is narrower than 600px. Phone quotes use smaller type to prevent overlapping the extended quote.

Checked the loaded NVDA dashboard in the Codex in-app browser at all 23 required viewport sizes from UI_REQUIREMENTS.md, resizing in both directions. Read rendered quote, timeframe, panel, chart-canvas and SVG bounds. Final pass: no horizontal page overflow, no overlap between the main change and extended quote, controls contained by their panel, and chart canvas contained by its panel at every size. Desktop and wider tablet cards keep After-hours and timeframes in one row; narrow cards wrap the timeframe controls. Price at is visible above the return. The initial 1180x690 check found chart overflow from unconditional tablet wrapping; card-width container queries resolved it in the final pass.

This is viewport simulation in one browser engine. Physical Mac Safari, iPad, Android and Windows were not tested. No push or deployment was performed.

Latest spacing adjustment: reduced price-line leading, row gaps and the margin before the period return. Rechecked all 23 sizes: quotes do not overlap, controls and chart canvas fit inside their panel, and no horizontal page overflow. At 1440x900 the plot canvas gained 12px (157px to 169px); at 1280x720 it gained about 18px (97px to 115px). Phone plot height stayed 240px. Volume rendering code was not changed. Saved a loaded desktop screenshot at ../after-hours-layout.png.
