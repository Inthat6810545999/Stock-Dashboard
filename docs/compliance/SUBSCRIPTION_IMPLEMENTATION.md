# Subscription implementation status

Updated 2026-10-11. Stripe subscriptions are implemented with recurring THB prices of ฿199/month and ฿1,990/year (annual savings of ฿398 versus twelve monthly payments). The isolated `codex/stripe-test-billing-20261011` Vercel Preview branch is configured for Stripe Test mode and the `moonstar-preview` Supabase project. Production checkout remains disabled and live charging remains off. No live payment has been collected, and no feature paywall has been added.

## Provider flow

Stripe-hosted Checkout handles the recurring plans. The server accepts only the two configured recurring Price IDs and verifies each amount, currency and interval before creating a session. Success and cancellation return to Membership & billing in Settings; the UI checks server-synced subscription state after returning. A browser redirect alone never grants access. Stripe webhook signatures are verified against the raw request body, and the server retrieves the current subscription from Stripe before saving it. Repeated events safely re-sync provider state; prior subscription rows are retained when a customer subscribes again.

Subscription entitlement comes only from server-synced provider state. Active access ends at the paid-through timestamp, including when cancellation is scheduled for that date. Trials require explicit configuration. Payment issues, canceled, missing and unrecognized states fail closed. Existing site features remain available because no paywall currently consumes this entitlement.

## Configuration and verification

- Test-only Stripe and Supabase values are scoped to the Preview branch; none are stored in the repository. The checkout switch is enabled for this Preview only, and `BILLING_LIVE_CHARGING_ENABLED` remains false.
- Checkout keys are now environment-locked: Production requires `VERCEL_ENV=production`, an `sk_live_` key, and explicit `BILLING_LIVE_CHARGING_ENABLED=true`; every non-production environment accepts only `sk_test_` keys. This prevents a Test key from opening checkout on Production and prevents a Live key from opening checkout on Preview/local.
- Production remains closed: its Vercel configuration has no Production billing enable flag, webhook signing secret, or recurring Price IDs. A Stripe integration key is present, but its mode was not inspected. Do not enable billing until the account and product have Stripe's explicit approval and the correct Live webhook/prices are configured.
- The Preview webhook listens for `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` and `invoice.payment_failed`.
- The Preview Supabase database has the billing tables and RLS policies. The billing tables are empty of customer/subscription records until a user completes Checkout in this isolated Preview; test webhook fixtures without a matching customer mapping do not create a member.
- Preview page delivery was verified. Unauthenticated membership and checkout API requests return 401, and a webhook with an invalid signature returns 400. A Stripe Test event was previously accepted by the Preview webhook.
- In the local Test environment, a completed annual checkout synced a membership row; the row is `active` with cancellation scheduled at the paid-through date, and subscription-created/updated plus invoice-paid webhook receipts are present.
- The actual signed-in Preview Checkout → Settings confirmation → Billing Portal cancellation sequence has not yet been run against the isolated Preview account. It requires signing into the Preview with an account in `moonstar-preview`; use Stripe test card details only. No real card or payment should be used.

The billing UI and Terms page identify Stripe Test mode when Preview checkout is open. Test transactions do not collect real funds. The production site states checkout is disabled while live collection remains off.

## Private data and account controls

`billing_customers` and webhook receipts are inaccessible to anonymous and authenticated browser roles. Users can read only their own subscription row under RLS. Only trusted server code using a server key writes billing records. The app never stores card numbers or grants access from user-editable metadata. Account deletion is blocked while a paid access period is active so an active membership is not left unmanaged. Historical provider invoices remain in Stripe and must be covered by the published retention notice before commercial launch.

## Before any commercial/live launch

The service is not legally or commercially cleared. Confirm market-data permissions, seller/operator identity and markets, applicable regulatory classification, PDPA processor/transfer and retention terms, consumer disclosures, displayed total price/tax, renewal authorization, cancellation/refund and complaint processes, and tax registrations. Review Stripe's terms and payment methods for the selected countries. Do not enable live charges or Stripe Tax until legal, provider and tax setup is complete. Never expose Stripe or Supabase server secrets in client bundles, logs or chat.

The requested "no refund" position has not been published or configured. Do not promise a blanket no-refund rule; obtain jurisdiction-specific review and state any mandatory exceptions before enabling checkout. The signed-in Preview Checkout → membership sync → Billing Portal cancellation flow is still outstanding.

The Supabase security advisor has reported leaked-password protection disabled; review and address that separate hardening item before launch.
