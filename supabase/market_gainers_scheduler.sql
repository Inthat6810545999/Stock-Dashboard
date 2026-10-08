-- Run in the Moonstardashboard Supabase project's SQL Editor as postgres.
-- The GitHub token is entered separately in Vault as moonstar_github_actions_token.
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;

create schema if not exists moonstar_private;
revoke all on schema moonstar_private from public, anon, authenticated;

create or replace function moonstar_private.dispatch_market_gainers()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  github_token text;
begin
  select decrypted_secret
    into github_token
    from vault.decrypted_secrets
   where name = 'moonstar_github_actions_token';

  if github_token is null or github_token = '' then
    raise exception 'Missing moonstar_github_actions_token in Supabase Vault';
  end if;

  return net.http_post(
    url := 'https://api.github.com/repos/Inthat6810545999/Stock-Dashboard/actions/workflows/automatic-market-gainers.yml/dispatches',
    body := '{"ref":"main"}'::jsonb,
    headers := jsonb_build_object(
      'Accept', 'application/vnd.github+json',
      'Authorization', 'Bearer ' || github_token,
      'Content-Type', 'application/json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'moonstar-supabase-cron'
    ),
    timeout_milliseconds := 10000
  );
end;
$$;

revoke all on function moonstar_private.dispatch_market_gainers()
  from public, anon, authenticated;
