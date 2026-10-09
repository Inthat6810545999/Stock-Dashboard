-- Preserve canceled subscription rows when a returning customer subscribes again.
alter table public.subscriptions drop constraint if exists subscriptions_pkey;
alter table public.subscriptions drop constraint if exists subscriptions_stripe_customer_id_key;
create index if not exists subscriptions_user_updated_idx
  on public.subscriptions (user_id, updated_at desc);
create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);
