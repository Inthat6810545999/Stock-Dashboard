# Commercial launch readiness — TOPPICKSTOCK

Updated 2026-10-10. Implementation work does not establish legal clearance.

## Implemented locally

- Privacy notice, terms and factual ranking/data methodology pages, linked from login/signup and the dashboard.
- Operator identity/contact fields are configuration-driven. Pages explicitly remain development drafts when any required field is absent.
- Optional Vercel analytics defaults off. Essential-only and allow-analytics choices have equal prominence; preferences can be changed later. Data-provider network requests still operate and are disclosed separately.
- Account data export validates the bearer token with Supabase Auth on the server and queries only that verified user's watchlist under RLS.
- Account deletion requires same-origin JSON, explicit confirmation and recent session-bound login evidence plus recent user login. Administrative credentials stay on the server. Refresh sessions are revoked before hard deletion; the existing watchlist foreign key cascades removal. Provider log/backup retention is not represented as instant erasure.
- Stream labels describe delivery rather than promising licensed real-time exchange prices. Price graphs, delayed quotes, polling, scans, rankings, news, relationships and watchlists remain functional.
- Browser response protections apply under Next.js. They are not a comprehensive XSS or authentication security audit.

## Configuration needed

The operator confirmed these public defaults: อินทัช นิรมาณ (Inthat Niramarn), Thailand, first260549@gmail.com. The following configuration can override them if the operator details change:

- NEXT_PUBLIC_OPERATOR_NAME: legal provider/person name.
- NEXT_PUBLIC_PRIVACY_EMAIL: monitored address for complaints and data-rights requests.
- NEXT_PUBLIC_OPERATOR_COUNTRY: confirmed country of operation.
- SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY: **server only**, needed for self-service deletion. Never use NEXT_PUBLIC_ for administrative credentials. Without it export works but deletion reports unavailable.

Verify the project's Google/email callback allowlist and email delivery configuration. Verify production RLS/foreign-key policies match supabase/schema.sql; test export and deletion with a disposable account, including two-user isolation. Do not test by deleting a real customer account. Refresh-token revocation does not invalidate every already-issued JWT immediately; normal Data API watchlist access remains owner-scoped and deleting the parent user cascades the watchlist and prevents orphan writes. Every account-management API revalidates the user with Auth.

## External launch blockers (not solved by disclaimers)

1. **Market data license.** Current Yahoo integration is unofficial. Obtain written commercial display/redistribution and derived-data permissions for quotations, history, valuation, analyst consensus, scans and snapshots, including exchange requirements. A library's open-source license is not a data license. Yahoo terms: https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html. SET policy: https://www.set.or.th/th/services/connectivity-and-data/data/market-data-policy.
2. **Other sources.** Inventory and clear Alpha Vantage earnings, SET/company announcements, Google News RSS, Yahoo/publisher headlines/excerpts, Google favicon service and Financial Modeling Prep/company logos. Attribution alone does not grant reuse rights. Preserve the features by swapping to licensed sources where permission is unavailable. Never fabricate a cleared license flag.
3. **Financial regulatory classification.** Have Thai counsel/SEC assess the full commercial service, screener content, marketing and any recommendation features. A neutral historical price ranking is not automatically classified here as licensed advice or exempt. Disclaimers do not determine regulatory status.
4. **PDPA operations.** Confirm processing inventory/legal bases, vendor agreements, hosting/auth regions, international-transfer safeguards, retention/deletion schedule, backup/log treatment, rights workflow and incident response. Do not collect marketing consent by bundling it into account signup. Essential session storage does not require a blanket marketing/privacy consent checkbox.
5. **Operator/billing.** Identify the seller, establish applicable business/tax registrations and determine whether ETDA notification applies. The selected prices are ฿199/month and ฿1,990/year. Complete tax display, renewal authorization, cancellation/refund and complaint processes before live collection. The isolated Preview completed a hosted Stripe Test checkout, signed webhook sync, membership display and Billing Portal cancellation; Production checkout/live charging remain disabled. No live payment was collected. The Stripe account/public name and website now use Toppickstock, and Live recurring prices and webhook exist. A fresh Test Billing Portal showed Toppickstock branding. Keep live charging disabled until launch requirements are met.
6. **Security.** The current browser-session architecture still stores tokens in web storage. A future migration to a properly designed server/BFF session architecture needs end-to-end OAuth, email-link, remember-me, watchlist and logout verification; changing to JavaScript-readable cookies alone does not eliminate XSS exposure. Configure provider rate limits and assess MFA/session controls appropriate to the commercial product.

## Evidence to retain

Provider contracts and permissions, dated inventory of each licensed data field/use, counsel/regulator classification, operator/privacy contact, processor and transfer assessments, deletion/backup tests, security review and Live billing configuration. Two-user RLS and isolated Preview Test checkout/cancellation checks were completed on 2026-10-12. Until the other items are complete, call the site a development preview, not legally certified or commercially cleared.

## Local verification (2026-10-10)

- Vinext production build and Next.js production build passed. Final TypeScript, targeted ESLint, diff whitespace, and mocked account API security checks passed.
- Chromium simulation checked dashboard, login, signup, account, privacy, terms, and methodology at all 23 viewports in UI_REQUIREMENTS, resizing forward and backward: 322 page/viewport checks, no document horizontal overflow. Login desktop and privacy mobile screenshots visually reviewed. This checks layout bounds, not physical device or Safari compatibility or provider quote accuracy.
- Optional analytics had no script requests before consent or with essential-only. Allowing analytics enabled its script; withdrawal prevented a script request after reload. Local analytics script was mocked; production telemetry delivery was not tested.
- Real authenticated export and destructive account deletion were not exercised. Server administrative configuration is absent locally. No commercial data permission was verified.

## Follow-up on 2026-10-10

The owner selected monthly/yearly prices of ฿199 and ฿1,990 but has not selected sales territories. The historical Production Supabase annual row was verified against Stripe as Test mode; it is not live revenue. The isolated Preview completed a hosted Test checkout, signed webhook sync, membership display, and Billing Portal cancellation at period end. Database and API billing records are now separated by Stripe Test/Live mode. None of this establishes live readiness. Server example defaults keep checkout and live charging off. See compliance/SUBSCRIPTION_IMPLEMENTATION.md for remaining technical and commercial setup; see compliance/OPERATIONS.md for rights handling, proposed retention, incident handling and billing launch checklist; see compliance/LICENSE_AND_REVIEW_PACK.md for source inventory, licensing inquiry and professional review brief. Draft procedures require operator approval and vendor/legal verification before being represented as deployed controls.

Production uses the verified `toppickstock.com` Vercel domain. Live THB recurring Price IDs, the Live webhook signing secret, and a restricted Live key under Production-only `STRIPE_LIVE_SECRET_KEY` are stored in Vercel. The Stripe integration's global `STRIPE_SECRET_KEY` is a Test key; Production code selects only `STRIPE_LIVE_SECRET_KEY`, while Preview retains the Test key. A new deployment is needed for environment changes to take effect. The Stripe account/public name and website now use `TOPPICKSTOCK`, and both Live and Test membership products are named `TOPPICKSTOCK Membership`. Checkout remains disabled. Do not open real billing until the investment-related offer and business disclosures are cleared, Live integration is verified, and legal review resolves the proposed no-refund policy and other launch requirements.

Live Supabase schema/policy inspection and rollback-only role tests verified watchlist owner isolation, blocked cross-user reads/updates and blocked owner reassignment. FK deletion cascade was confirmed. This does not replace live disposable-account API deletion or two-browser Auth testing. Security advisor found leaked-password protection disabled. Database region confirmed ap-south-1; other provider processing locations remain unverified. Administrative key setup remains outstanding.
