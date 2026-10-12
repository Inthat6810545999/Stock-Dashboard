# Login flow audit — 2026-10-12

The local login page at `http://127.0.0.1:5174/login` was checked in the Codex in-app browser after changing the email-to-password flow. Invalid email syntax stayed on the email step; a valid email opened the password step; Change email returned to the first step; Sign up still showed its email-link flow.

The requested desktop, tablet, and phone viewport matrix from `docs/UI_REQUIREMENTS.md` was exercised (23 sizes). At each size, the login card remained within the document width, there was no horizontal overflow, and the password field remained present after continuing. The in-app browser reported CSS viewport widths at five-sixths of the requested viewport values (for example, requested 360px reported 300px), so this is a responsive simulation rather than physical-device or cross-browser verification. At the narrowest size the taller password step requires vertical scrolling.

ESLint and the Next.js production build passed. The browser flow was tested with a non-account sample email; no password or email link was submitted in this UI check.
