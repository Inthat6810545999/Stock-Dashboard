# Subscription implementation status

Status: subscription records and account UI are implemented; Stripe Test mode has recurring THB prices for ฿199/month and ฿1,990/year (annual savings of ฿398 versus twelve monthly payments). A local Test mode checkout completed successfully, and the resulting annual membership synced through the webhook. No live payment has been collected, and no feature paywall has been added. Local checkout is enabled only with Test mode credentials; remote Preview setup remains unverified.

## Provider flow

Stripe hosted Checkout is used for recurring THB plans. The server selects one of two allowlisted recurring Price IDs and verifies the exact THB amount (฿199/month or ฿1,990/year), currency and interval before creating a session. Success and cancellation return to the Membership & billing section in Settings; after success, the page checks server-synced membership state while the webhook is processed. Browser redirects do not grant membership. Stripe webhook signatures are verified against the raw request body; the server then retrieves current subscription state and records it. Duplicate events are safe to process again, and prior subscription rows are retained when an account subscribes again.

Subscription entitlement is derived only from server-synced provider state. Active access ends at the paid-through timestamp; scheduled cancellation remains active through that timestamp. Trials require explicit configuration. Payment issues, canceled, missing or unrecognized state fail closed. Existing site features remain available because no paywall currently consumes this entitlement.

## Private data and account controls

`billing_customers` and webhook receipts are inaccessible to anonymous and authenticated browser roles. Users can read only their own subscription row under RLS. Only trusted server code using a server key writes billing records. The app never stores card numbers or grants access from user-editable metadata. Account deletion is blocked while a paid access period is active so it cannot leave a paid membership unmanaged. Historical provider invoices remain in Stripe and must be covered by the published retention notice before commercial launch.

## Remaining setup before remote Preview testing

- Add the Stripe Test secret, both test Price IDs, `SUPABASE_SECRET_KEY`, and the test webhook secret to Vercel Preview only; never commit them. The webhook must point to the public Preview endpoint and subscribe to `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`.
- Add the Preview URL to the Supabase Auth redirect allowlist and set `NEXT_PUBLIC_SITE_URL` for that Preview environment.
- Enable `BILLING_CHECKOUT_ENABLED` only for the Preview environment after verifying its configuration. Keep `BILLING_LIVE_CHARGING_ENABLED=false` and leave production checkout disabled.
- Test cancellation and billing-portal behavior before treating the sandbox lifecycle as complete.

## Required before any commercial/live launch

The site is not legally or commercially cleared. Confirm data-source commercial licenses, seller/operator and markets, counsel's regulatory classification, PDPA processor/transfer and retention terms, consumer disclosures, displayed total price/tax, renewal authorization, cancellation/refund and complaint process, and tax registrations. Review Stripe's terms and payment methods for the selected countries. Do not enable live charges or Stripe Tax until legal, provider, and tax setup is complete. Never expose Stripe or Supabase server secrets in client bundles or chat.

## Verification limits

Database schema is installed on the connected Supabase project with RLS. Stripe Test prices are created and match the server allowlist. A local annual Test mode Checkout completed and its subscription was synced by the webhook. Cancellation, refund and repeated renewal-cycle behavior remain untested. Vercel Preview billing configuration has not been verified. The security advisor still reports Supabase leaked-password protection disabled; this remains a separate hardening task.
