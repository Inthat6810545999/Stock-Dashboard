# Complimentary Premium access

This is an operator-only grant for a signed-in account. It is separate from Stripe subscriptions: it does not create a customer, payment, trial, invoice, or renewal. Apply `20261012144657_premium_access_grants.sql` before deploying code that reads the grant table.

After the friend registers and confirms their own email, look up that exact address in Supabase Auth Users. In the **Production** project's SQL editor, verify the account first, then grant an expiry. Replace the sample address with the exact registered address; do not share a service-role key or add a browser-accessible grant endpoint.

```sql
select id, email, email_confirmed_at
from auth.users
where lower(email) = lower('friend@example.com');

insert into public.premium_access_grants (user_id, expires_at, revoked_at, updated_at)
select id, now() + interval '14 days', null, now()
from auth.users
where lower(email) = lower('friend@example.com')
  and email_confirmed_at is not null
on conflict (user_id) do update
set expires_at = excluded.expires_at,
    revoked_at = null,
    updated_at = now();
```

The insert must affect exactly one row. Confirm the expiry and the user's own signed-in Must Watch access; verify another signed-in account still receives HTTP 403. To revoke immediately:

```sql
update public.premium_access_grants
set revoked_at = now(), updated_at = now()
where user_id = (select id from auth.users where lower(email) = lower('friend@example.com'));
```

For public users, confirm market-data display rights before granting real Premium ranking access. The same table in Preview is isolated from Production.
