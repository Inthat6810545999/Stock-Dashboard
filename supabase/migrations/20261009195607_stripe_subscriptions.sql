-- Billing records are written only by trusted server code after Stripe webhook
-- signature verification. Customer/subscription history intentionally has no
-- auth.users cascade so account deletion cannot silently erase financial records.
create table if not exists public.billing_customers (
  user_id uuid primary key,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key,
  stripe_customer_id text not null unique,
  stripe_subscription_id text not null unique,
  plan_key text not null check (plan_key in ('monthly', 'yearly')),
  status text not null check (status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_end timestamptz,
  billing_attention_required boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_event_created_at timestamptz not null,
  processed_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_webhook_events enable row level security;

revoke all on public.billing_customers from anon, authenticated;
revoke all on public.billing_webhook_events from anon, authenticated;
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

drop policy if exists "Users can read their own subscription" on public.subscriptions;
create policy "Users can read their own subscription"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

grant all on public.billing_customers to service_role;
grant all on public.subscriptions to service_role;
grant all on public.billing_webhook_events to service_role;
