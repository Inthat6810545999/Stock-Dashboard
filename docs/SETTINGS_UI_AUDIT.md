# Settings verification — 2026-10-10

Added /settings and changed signed-in profile menu entry to Settings. Account export, local clearing and deletion reuse the existing AccountControls component; /account remains available. No price/chart/scan settings changed.

Settings includes persisted decorative motion, existing analytics preference dialog, account/data controls, sign-out, service terms, methodology and operator contact. Fixed Bangkok time and instrument currencies are explained rather than adding unsupported selectors. Remember me stays on the sign-in form to avoid changing live session storage unexpectedly. Payment settings are not exposed because billing is not configured.

Chromium simulated all 23 required UI_REQUIREMENTS sizes in both directions (46 checks): no horizontal document overflow. Verified motion saves as off and restores after reload; privacy button opens existing consent panel. Desktop screenshot reviewed. Signed-out account state verified. No physical-device/Safari tests, authenticated customer deletion or sign-out session test claimed. API/security verification is recorded in COMMERCIAL_READINESS.md.

## Category layout update

Replaced the single scrolling settings article with a sidebar category picker and one selected content area: General, Appearance, Privacy, Account & data, Help & legal. Sidebar search filters categories by English/Thai labels and keywords. Phones show a compact two-column category menu above the content. Chromium exercised all five categories at 23 sizes forward/back (230 checks), no horizontal document overflow; category switching, search, privacy dialog and motion persistence passed. Next and Vinext builds and targeted ESLint passed. Desktop appearance screenshot reviewed; same browser/device/auth limitations apply.

## Stable frame update

Settings shell now has a viewport-relative fixed height with independently scrollable sidebar/content and a reserved scrollbar gutter. Mobile keeps a bounded category header and remaining-height content scroll. Repeated the 230 category/viewport checks with no horizontal overflow. Explicit frame-bound checks across all categories on desktop, tablet, phone and short landscape verify identical x/y/width/height; contact content remains reachable by internal scrolling. Next production build passed.

## Footer readability

Footer uses an opaque navy surface with cream 12px text, wrapping and spaced controls. Dashboard privacy button moved into the footer layout; floating duplicate hidden only on dashboard. Chromium checked footer child bounds at all 23 viewport sizes and the inline privacy dialog trigger; passed. Desktop footer screenshot reviewed. Next production build passed. No cross-engine or physical-device verification.

User correction: keep original footer height. Supersedes footer wrapping above: footer is fixed 36px high, single row with horizontal scrolling on narrow screens, cream text on navy, and inline privacy control. Chromium verified 36px at all 23 sizes and privacy dialog opens. Floating duplicate is hidden. This preserves dashboard vertical space.
