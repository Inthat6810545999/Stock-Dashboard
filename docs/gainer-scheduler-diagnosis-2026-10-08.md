# Gainer scheduler investigation — 2026-10-08

## Verified evidence

- Both hourly workflows were active on `main`; the published cron expressions and exchange timezones matched the intended slots.
- US scheduled run `37750547947` started at 15:32 ICT. Its log says the regular session was closed; it did not fetch or publish a ranking. A green run alone does not prove a scan occurred.
- No new scheduled event was present for the expected evening US slots when investigated. The API and runner logs do not reveal why GitHub omitted/delayed those events. Moving the cron minute is not a proven root-cause fix.
- Both hourly workflows were disabled and re-enabled to refresh their registration. Both were confirmed active afterward. This action alone does not prove schedule recovery.
- GitHub manual test [37802661366](https://github.com/Inthat6810545999/Stock-Dashboard/actions/runs/37802661366) succeeded, checked 5,471 symbols (5,469 usable, 2 unavailable, 0 failed), validated the ranking, and published the data. This verifies the runner-to-repository pipeline, not the scheduler.
- Daily run `37716620274` failed separately while fetching the Thai SEC directory: `ETIMEDOUT` to the directory host. That is a source-connectivity failure, not evidence that an hourly event was generated.

## Local mitigation

Hourly workflows now have additional retry triggers during the same exchange sessions. A successful scan writes `todayScan.scheduledSlot`. Later triggers in that slot exit before Yahoo requests. Failed attempts do not update the marker, allowing the next trigger to retry. Manual scans remain available; a successful in-session manual scan also satisfies the current slot.

Actual target slots stay unchanged:

- Thai: 10:05, 11:05, 12:05, 14:35, 15:05, 16:05, 17:05 ICT.
- US: 09:35, 10:05 through 16:05 America/New_York, including DST.

Lunch, weekends, market-state checks and the existing closing-window limits remain in effect. Retries cannot guarantee delivery if GitHub omits every trigger, and GitHub Actions cannot promise exact wall-clock execution. These changes must be pushed before they affect GitHub. Observe an actual `schedule` run and its published snapshot before calling automatic execution verified.

## Validation

- Schedule-slot tests cover delayed attempts, next-hour transitions, DST, lunch, weekends and closure.
- Existing US and Thai session tests pass.
- A real local scheduled US scan checked all 5,471 symbols; a second invocation skipped the already-published slot.
- A scheduled Thai invocation outside trading hours skipped before network requests.
- Snapshot validation, ESLint and TypeScript checks pass.
