# Subscription implementation status

Status: subscription records and account UI are implemented; Stripe is connected in Sandbox. No product prices have been selected, no checkout is enabled, no payment has been collected, and no feature paywall has been added.

## Provider flow

Stripe hosted Checkout is used for recurring THB plans. The server selects one of two allowlisted recurring Price IDs and verifies currency and interval before creating a session. Browser redirects do not grant membership. Stripe webhook signatures are verified against the raw request body; the server then retrieves current subscription state and records it. Duplicate events are safe to process again, and prior subscription rows are retained when an account subscribes again.

Subscription entitlement is derived only from server-synced provider state. Active access ends at the paid-through timestamp; scheduled cancellation remains active through that timestamp. Trials require explicit configuration. Payment issues, canceled, missing or unrecognized state fail closed. Existing site features remain available because no paywall currently consumes this entitlement.

## Private data and account controls

`billing_customers` and webhook receipts are inaccessible to anonymous and authenticated browser roles. Users can read only their own subscription row under RLS. Only trusted server code using a server key writes billing records. The app never stores card numbers or grants access from user-editable metadata. Account deletion is blocked while a paid access period is active so it cannot leave a paid membership unmanaged. Historical provider invoices remain in Stripe and must be covered by the published retention notice before commercial launch.

## Required setup before sandbox checkout

- Choose and approve the monthly and annual amounts. No draft amount is treated as approved.
- Create recurring THB test Prices in the connected Stripe Sandbox and set `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY` in the server environment.
- Set `SUPABASE_SECRET_KEY` (or the legacy service-role key) only in the server environment; it is not present in this local environment yet.
- Configure `STRIPE_WEBHOOK_SECRET` and subscribe the endpoint to `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`.
- Keep `BILLING_CHECKOUT_ENABLED` off until the test prices, webhook, hosted portal, refund/cancellation behavior and deletion interaction pass sandbox tests.

## Required before any commercial/live launch

The site is not legally or commercially cleared. Confirm data-source commercial licenses, seller/operator and markets, counsel's regulatory classification, PDPA processor/transfer and retention terms, consumer disclosures, displayed total price/tax, renewal authorization, cancellation/refund and complaint process, and tax registrations. Review Stripe's terms and payment methods for the selected countries. Do not enable live charges or Stripe Tax until legal, provider, and tax setup is complete. Never expose Stripe or Supabase server secrets in client bundles or chat.

## Verification limits

Database schema is installed on the connected Supabase project with RLS. Stripe Sandbox integration is connected but test prices and webhook signing secret remain unset, and no end-to-end payment lifecycle was run. The security advisor still reports Supabase leaked-password protection disabled; this is an existing auth-project setting and remains a separate hardening task.
