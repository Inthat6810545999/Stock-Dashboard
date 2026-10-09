-- Explicit deny policies document the server-only boundary and satisfy policy
-- auditing. Supabase service_role bypasses RLS and is the only writer.
drop policy if exists "Server-only billing customer records" on public.billing_customers;
create policy "Server-only billing customer records"
  on public.billing_customers for all to public
  using (false) with check (false);

drop policy if exists "Server-only billing webhook receipts" on public.billing_webhook_events;
create policy "Server-only billing webhook receipts"
  on public.billing_webhook_events for all to public
  using (false) with check (false);
