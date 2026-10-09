# Supply chain coverage — 10 October 2026

Implemented a searchable directory view alongside the unchanged AI ecosystem and company relationship maps. Live Nasdaq Trader discovery produced 5,472 securities using the existing scanner filters. Share classes are securities, not unique companies. Curated foreign/private entities remain present. Curated US entries absent from the scanner directory remain visible with an explicit label.

This is a directory foundation, not complete supply-chain mapping across the US market. Existing content has 50 curated businesses, 13 AI industry layers and separately cited company relationships. No automated edge inference was introduced.

Source availability audit: see supply-chain-sources.json. 38 distinct source URLs checked; 10 blocked or failed in automated retrieval. An HTTP 200 is NOT semantic validation. Historic links are NOT confirmation of current contracts. Every source still needs claim-level review before calling the entire dataset verified.

Validation: TypeScript, focused ESLint, existing ecosystem integrity and directory parser tests. Local UI search for VAST preserved the private entity without an Explore stock button. Coverage tab rendered alongside original 13-layer map.

Responsive simulation: all 23 requested viewport sizes were exercised in the in-app browser. Existing browser zoom produced CSS viewport dimensions about 1/1.2 of the requested override (e.g. 360 became 300 CSS px). No horizontal overflow in the coverage panel or document at those actual sizes. Search was populated with VAST for these checks. This is neither exact requested CSS-size certification nor physical device / cross-browser verification. Original SVG geometry was not changed.

Refresh directory: node scripts/supply-chain/refresh-catalog.mjs
Audit source reachability: node --experimental-strip-types scripts/supply-chain/audit.mjs
Neither command is scheduled automatically. Refresh snapshots must be reviewed and committed; frontend visitors do not initiate bulk directory/source requests.

Remaining: claim-level review of all existing sources, current listing identity reconciliation (including scanner-filtered ADRs), source-backed sector maps outside AI, full customer/supplier disclosure ingestion and review. Complete coverage of all private companies worldwide cannot be certified from these public sources.

Identity correction: Pure Storage / PSTG is now Everpure / P. Confirmed against the Nasdaq directory and issuer announcement https://www.everpuredata.com/company/newsroom/press-releases/everpure-to-change-ticker-symbol.html and SEC May 2026 filing https://www.sec.gov/Archives/edgar/data/1474432/000147443226000061/pstg-20260503.htm. Historical PSTG requests resolve to P in map helpers. ARM / ASX directory absence is consistent with the scanner ADR filter, not a declaration of delisting.

## User correction
Market coverage UI was removed at user request. The ecosystem renderer now selects AI industry context for participating companies, otherwise builds issuer-specific input / partnership / deployment layers from individually cited relationships. A single focal node for an unresearched issuer is explicitly incomplete, not a delivered complete ecosystem. Tour lengths and responsive graph edges use the selected graph rather than a hardcoded 13-stage count. This does not fulfill full-market relationship coverage yet.
