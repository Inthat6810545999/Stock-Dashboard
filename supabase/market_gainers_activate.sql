-- Run after market_gainers_scheduler.sql is installed. Without the Vault secret,
-- attempts fail safely until the token is added.
-- UTC windows cover SET sessions and both US daylight-saving/standard-time sessions.
-- GitHub's due-gainer-scans.mjs gates exact slots, holidays and already published data.
select cron.schedule(
  'moonstar-market-gainers',
  '5,15,25,35,45,55 3-21 * * 1-5',
  'select moonstar_private.dispatch_market_gainers()'
);

-- A queued HTTP request ID only confirms dispatch was enqueued, not GitHub acceptance.
-- To test immediately, run separately: select moonstar_private.dispatch_market_gainers();
-- Then inspect net._http_response.status_code (204 means GitHub accepted the dispatch)
-- and verify a workflow_dispatch run under Automatic market gainers on GitHub.
