# Watchlist reorder audit — 2026-11-28

Added Up and Down controls to the left of Remove in Watchlist edit mode. The first stock cannot move up and the last cannot move down. Reordering uses the existing watchlist state, so the dashboard ticker order and existing local/account persistence follow it. The remove control and Edit/Done behavior remain unchanged.

Local in-app browser: moved AAPL above NVDA, observed the editor and dashboard both show AAPL, NVDA, MSFT, TSLA, then reloaded and observed the saved order after hydration. Checked the open edit dialog at desktop 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440; tablet 768×1024, 1024×768, 820×1180, 1180×820, 834×1194, 1194×834, 1024×1366, 1366×1024, 1180×690; phone 360×800, 800×360, 375×667, 667×375, 390×844, 844×390, 430×932, 932×430. In all 23 sizes, the modal and page had no horizontal overflow and all reorder buttons remained in the viewport. Visually inspected 390×844 and 1440×900.

The browser test was unauthenticated, so server-side account sync was not exercised. Viewport simulation in one browser engine does not verify physical Safari or other devices.
