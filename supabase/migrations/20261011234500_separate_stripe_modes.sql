-- Keep historical Stripe Test records for audit without treating them as Live billing.
-- Existing rows predate mode tracking and were created with Stripe Test credentials.
alter table public.billing_customers
  add column if not exists stripe_livemode boolean not null default false;

alter table public.subscriptions
  add column if not exists stripe_livemode boolean not null default false;

create index if not exists subscriptions_user_mode_updated_idx
  on public.subscriptions (user_id, stripe_livemode, updated_at desc);
