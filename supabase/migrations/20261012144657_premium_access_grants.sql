-- Complimentary Premium access is independent from Stripe billing history.
-- Only the service role can create, renew, or revoke a grant.
create table if not exists public.premium_access_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > granted_at)
);

alter table public.premium_access_grants enable row level security;
revoke all on public.premium_access_grants from anon, authenticated;
grant select, insert, update, delete on public.premium_access_grants to service_role;
