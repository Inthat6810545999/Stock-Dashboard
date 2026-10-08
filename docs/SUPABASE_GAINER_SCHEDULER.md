# Supabase backup scheduler for Must Watch gainers

GitHub's scheduled events did not appear for expected market slots on 8–9 October 2026. The scan itself worked when dispatched manually. Supabase Cron can send `workflow_dispatch` to the existing `Automatic market gainers` workflow. That workflow checks exchange-local market hours and the latest published slot before scanning. Its US and Thai workflows continue to publish snapshots through the existing GitHub/Vercel pipeline.

On 9 October 2026 at 00:35 ICT, the installed `moonstar-market-gainers` job ran at its scheduled time. It stopped at the explicit missing-Vault-token check, so dispatch to GitHub is not yet verified. The job is active and will use the token as soon as it is saved under the required name.

## Set up

1. In GitHub, create a fine-grained personal access token for owner `Inthat6810545999`, limited to repository `Stock-Dashboard`, with repository permission **Actions: Read and write**. Choose an expiry you will remember to renew. Never paste the token in chat or commit it.
2. In the Moonstardashboard Supabase project, open **Integrations → Vault → Secrets**. Save the token with name `moonstar_github_actions_token`. The value is the raw token, without `Bearer `.
3. Run [`market_gainers_scheduler.sql`](../supabase/market_gainers_scheduler.sql) in the Supabase SQL Editor. It enables `pg_net` and creates a private dispatch function. Supabase Cron (`pg_cron`) must also be installed. **Already done in this project.**
4. Run [`market_gainers_activate.sql`](../supabase/market_gainers_activate.sql) in the same project. The named job is idempotent: running `cron.schedule` again with the same name updates that job. **Already done in this project.**
5. Test with `select moonstar_private.dispatch_market_gainers();` in SQL Editor. After the transaction commits, check `select id, status_code, error_msg, created from net._http_response order by created desc limit 10;`. HTTP **204** confirms GitHub accepted the dispatch request. Check GitHub Actions for a new `workflow_dispatch` run, then check whether the gate found a market slot due. Outside market hours, a successful gate will intentionally skip scanning.

The Cron job fires every ten minutes between 03:05 and 21:55 UTC on weekdays. The GitHub gate permits only target slots: Thai 10:05, 11:05, 12:05, 14:35, 15:05, 16:05 and 17:05 ICT, plus a separate full-universe close confirmation at 17:15 ICT (retries through 17:55 share that slot); US 09:35 then hourly 10:05–16:05 New York time, including DST changes, plus a separate full-universe regular-session close confirmation starting at 16:15 New York time. Retries through 16:34 share that one confirmation slot, so a retry cannot publish duplicates. The separate daily YoY/growth scan stays on its existing schedule.

## Monitoring

`cron.job_run_details` records whether Postgres executed the job. It does **not** confirm HTTP delivery. `net._http_response` records the GitHub HTTP response for about six hours by default; 204 means accepted, 401/403 points to token or permissions, and 404 often points to repository/workflow visibility or token scope. Check a matching GitHub Actions run and the `todayScan.scheduledSlot` in `data/must-watch-{us,th}.json` to confirm an actual scan published. GitHub Actions can still queue or fail after accepting the dispatch.

GitHub's own cron remains registered until a later authorized push removes it. Both paths use the same slot gate. The token expires and must be rotated in Vault before its expiry for this backup scheduler to keep working.
