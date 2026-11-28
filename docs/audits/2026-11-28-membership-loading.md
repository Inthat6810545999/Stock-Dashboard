# Must Watch membership loading audit — 2026-11-28

## Change

Returning to the same signed-in account no longer resets a verified Premium membership to `checking` when Supabase emits `SIGNED_IN` or `TOKEN_REFRESHED`. Entitlement is checked again in the background. The already loaded paid Must Watch screen stays mounted during that check. A new account or first sign-in sees a neutral loading screen until verification completes; errors show a retry state rather than the Premium sales preview. Server-side `/api/must-watch` authorization remains in place. An explicit denial clears Premium access.

## Local browser check

Used a temporary local route rendering the `checking` state with no authenticated account or real stock data, then removed it. In the in-app browser engine, checked 23 viewport sizes: desktop 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440; tablet 768×1024, 1024×768, 820×1180, 1180×820, 834×1194, 1194×834, 1024×1366, 1366×1024, 1180×690; phone 360×800, 800×360, 375×667, 667×375, 390×844, 844×390, 430×932, 932×430. Resized from desktop to phone and back.

At every size, the loader showed 10 skeleton cards, the membership status, no Premium sales link, and zero document horizontal overflow. The grid used 5, 3, or 2 columns according to width. Visually inspected 390×844 and 1440×900 screenshots; heading, status, and cards remained legible. This is viewport simulation in one browser engine, not physical Safari or a signed-in production test.

## Remaining verification

The actual paid-account alt-tab transition cannot be reproduced in the local unauthenticated fixture. Production still runs the previous build until separately deployed.
