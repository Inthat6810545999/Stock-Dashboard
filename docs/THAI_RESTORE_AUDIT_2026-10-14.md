# Thai stock restoration audit — 2026-10-14

Scope: restored Thai market search, `.BK` dashboards, THB quote/watchlist handling, Thai news and company events, and Thai Must Watch scans on top of the current TOPPICKSTOCK membership and visual design. No changes to subscription entitlement rules.

Validation: `npx tsc --noEmit`, `npm run lint`, `npx next build`, `npm run build`, and all 46 repository tests passed. A local Next.js server returned a connected `PTT.BK` quote in THB with 304 chart points. Browser search for `PTT` in the Thailand filter returned `PTT.BK` and `PTTEP.BK`; opening `PTT.BK` showed a THB quote and ICT timestamp.

Responsive check: simulated desktop 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440; tablet 768×1024, 1024×768, 820×1180, 1180×820, 834×1194, 1194×834, 1024×1366, 1366×1024, 1180×690; phones 360×800, 800×360, 375×667, 667×375, 390×844, 844×390, 430×932, 932×430. No document horizontal overflow was observed. The search dialog was constrained to the viewport height to keep its controls reachable in short landscape windows. This is one in-app browser engine with simulated viewports, not physical-device or cross-browser testing. Premium Must Watch content could not be browser-tested without a signed-in premium account; its market-switching and access checks were reviewed in code.

Operational limits: the checked-in Thai ranking snapshot predates this restoration and is marked historical when over 36 hours old. Scheduled Thai scans only run when workflow files reach the default branch with Actions write permission. Provider market-data/news commercial rights were not established by this code change; verify them separately before selling Thai market access.
