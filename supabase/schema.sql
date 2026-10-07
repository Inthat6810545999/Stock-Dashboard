-- Run in Supabase SQL Editor to enable per-account watchlist sync.
create table if not exists public.watchlists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stocks jsonb not null default '[]'::jsonb check (jsonb_typeof(stocks) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.watchlists enable row level security;
grant select, insert, update on public.watchlists to authenticated;
drop policy if exists "Users can read their own watchlist" on public.watchlists;
create policy "Users can read their own watchlist" on public.watchlists for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own watchlist" on public.watchlists;
create policy "Users can create their own watchlist" on public.watchlists for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own watchlist" on public.watchlists;
create policy "Users can update their own watchlist" on public.watchlists for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
