# Premium offer header audit — 2026-10-12

The header now renders Get offer only after membership status is confirmed as unpaid. It stays hidden while authentication or membership is being checked, when the check fails, and for paid or complimentary Premium access. The production subscription API returned `hasPremiumAccess: true` for the existing complimentary demo account at the time of this change.

The local guest header was checked in the Codex in-app browser at all 23 desktop, tablet, and phone viewport sizes in `docs/UI_REQUIREMENTS.md`. The header and Get offer button stayed within the viewport at every size, with no document-level horizontal overflow. This is viewport simulation, not physical-device or cross-browser verification. No authenticated password was entered during this browser check.

ESLint and the Next.js production build passed.
