# MOONSTAR — operational privacy and launch controls

Owner: อินทัช นิรมาณ (Inthat Niramarn), Thailand. Contact: first260549@gmail.com.
Reviewed 2026-10-10. This is an operating procedure, not a legal opinion. No commercial data license or regulatory approval has been obtained by this work.

## Rights requests

1. Monitor the contact inbox every business day. Register a case ID, received date, requested right, account identifier and deadline in a restricted record. Do not store tokens, passwords or unnecessary identity documents.
2. Acknowledge within 3 business days as an internal target. Verify the requester through their authenticated account or existing verified email. Apply proportionate identity checks; do not send account data to a different address solely because it was requested.
3. Access/export: use the authenticated account export. Correction: explain provider-controlled Google/email changes and correct controller-owned records. Deletion: use the authenticated deletion flow, then verify the Auth user and linked watchlist are absent. If self-service is unavailable, authenticate the requester and use the provider's admin procedure. Never delete based only on a public user ID.
4. Restriction, objection and portability: assess applicable law and technical scope; document the decision and any lawful exception. Withdrawal of analytics permission must not disable essential service.
5. Internal target: complete ordinary requests within 30 calendar days, subject to the applicable right and current legal requirements. Record any exception and explain it to the requester. This target is not a statement that every jurisdiction permits 30 days.
6. Record completion and minimal proof; do not retain the exported account contents in the case register.

## Retention schedule — proposed, approval required before publication

| Record | Proposed rule | Current implementation / missing confirmation |
|---|---|---|
| Auth profile and watchlist | While the account exists; remove active records when deletion is completed | Account API and DB cascade prepared; live destructive test pending |
| Browser preferences/guest watchlist | Until user clears storage or browser removes it | User-controlled; no server cleanup claim |
| Optional analytics | Only after permission; use shortest provider-supported period | Provider retention/configuration must be verified |
| Security/operational logs | Proposed 30 days unless an incident/legal hold requires more | Vercel/Supabase actual plan retention must be recorded; not yet verified |
| Rights-request register | Proposed 1 year after closure, minimal evidence only | Operator approval and protected storage required |
| Incident register | Proposed 3 years after closure, minimum necessary | Confirm legal needs with counsel |
| Payment/accounting records | Applicable statutory accounting/tax retention | No payments yet; determine obligations before charging |
| Backups | Provider rotation; restrict restoration and reapply deletions after restore | Actual provider periods and restoration procedure unverified |

Do not present proposed periods as deployed automatic deletion. Record legal holds, overrides and vendor limitations. Review this schedule annually and when providers change.

## Incident procedure

- Immediately record discovery time, affected systems, categories and approximate number of people/records. Preserve minimal evidence securely; never paste credentials or full user data into public issues.
- Contain the incident: revoke compromised credentials/sessions, restrict the affected endpoint, fix access policies, and preserve recovery options. Assess impact before broad account changes.
- Assess notification obligations promptly with qualified advice. Thai PDPA section 37 includes notification without delay and, where feasible, within 72 hours of awareness unless unlikely to risk rights/freedoms; high-risk incidents require notification to affected people without delay. Verify current implementing rules and other applicable jurisdictions. Do not treat 72 hours as permission to wait.
- Prepare regulator/user notices with facts, categories, likely consequences, response measures and contact details. Owner approves and sends; no automated external notification is configured here.
- Document cause, timeline, corrective actions and follow-up tests. On backup restoration, reapply completed deletions and access fixes before reopening service.

## Vendors and transfers

Confirmed Supabase project region: ap-south-1 on 2026-10-10. Do not equate the database region with all Auth/support/log/subprocessor processing locations. Inventory Supabase, Vercel, Google OAuth, Yahoo and external news/logo sources; obtain applicable DPAs, actual processing locations, subprocessors, retention and cross-border safeguards. Analytics consent alone does not establish a transfer safeguard. Country markets for sales remain undecided.

## Verification evidence

Live Supabase catalog: public.watchlists has RLS enabled; SELECT/INSERT/UPDATE policies bind user_id to auth.uid(); UPDATE has WITH CHECK; auth.users FK uses ON DELETE CASCADE.
Rollback-only live DB test passed: own-user read allowed; other-user read and update blocked; owner reassignment blocked. The transaction was rolled back. This is database-role testing, not a full two-browser login test.
Security advisors reported leaked-password protection disabled; existing UI uses Google/email links, but review before adding password authentication. Other security risks are not ruled out by this advisor result.
Account deletion still requires a server-only administrative secret and a disposable-account end-to-end test. Do not put administrative credentials into browser variables or chat. Verify production callback allowlists, email delivery, rate limits and administrator MFA separately.

## Monthly/yearly subscriptions — not yet launched

Prices, sales countries and payment provider remain undecided. Before accepting a payment:
- State seller identity, billing currency, tax-inclusive/exclusive total, monthly/yearly period, feature entitlement and first charge clearly.
- Obtain explicit authorization for recurring charges; disclose renewal date and price. Record the version of terms and authorization. Do not preselect paid consent.
- Provide account cancellation, effective date and confirmation; state whether access continues through the paid period. Make cancellation practicable.
- Publish a jurisdiction-reviewed refund/withdrawal policy preserving mandatory consumer rights. Do not adopt blanket no-refund terms.
- Verify payment-provider webhooks, replay/idempotency, entitlement reconciliation and duplicate-charge protection. Do not handle raw card data yourself.
- Establish receipts/invoices, tax/business registration requirements and bookkeeping with a Thai accountant; determine overseas sales obligations before targeting those markets.
- Test purchase, renewal, failure, cancellation and refund in provider sandbox. Obtain written data permissions and regulatory review before commercial launch.

Sources: Thai PDPA https://ratchakitcha.soc.go.th/documents/17082307.pdf ; SET https://www.set.or.th/th/services/connectivity-and-data/data/market-data-policy ; Supabase security https://supabase.com/docs/guides/security/product-security . Recheck applicability and current rules before launch.
