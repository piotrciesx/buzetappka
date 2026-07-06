-- Recurring payments: profile_id identifies a shared budget profile, not auth.uid().
-- Access is granted through profile_users membership. Existing data is untouched.

alter table public.recurring_payment_occurrences enable row level security;

do $$
declare table_name text; operation text;
begin
  foreach table_name in array array[
    'recurring_installment_purchase_terms',
    'recurring_loan_terms',
    'recurring_occurrence_transactions',
    'recurring_payment_history'
  ] loop
    foreach operation in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', table_name || '_' || operation || '_own', table_name);
      if operation = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name);
      elsif operation = 'update' then
        execute format('create policy %I on public.%I for update to authenticated using (public.is_profile_member(profile_id)) with check (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name);
      else
        execute format('create policy %I on public.%I for %s to authenticated using (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name, operation);
      end if;
    end loop;
  end loop;
end
$$;

drop policy if exists recurring_payment_occurrences_select_own on public.recurring_payment_occurrences;
create policy recurring_payment_occurrences_select_own on public.recurring_payment_occurrences
  for select to authenticated using (public.is_profile_member(profile_id));
drop policy if exists recurring_payment_occurrences_update_own on public.recurring_payment_occurrences;
create policy recurring_payment_occurrences_update_own on public.recurring_payment_occurrences
  for update to authenticated using (public.is_profile_member(profile_id)) with check (public.is_profile_member(profile_id));
drop policy if exists recurring_payment_occurrences_delete_own on public.recurring_payment_occurrences;
create policy recurring_payment_occurrences_delete_own on public.recurring_payment_occurrences
  for delete to authenticated using (public.is_profile_member(profile_id));

drop policy if exists recurring_payment_occurrences_insert_own on public.recurring_payment_occurrences;
create policy recurring_payment_occurrences_insert_own
  on public.recurring_payment_occurrences
  for insert to authenticated
  with check (
    public.is_profile_member(profile_id)
    and exists (
      select 1
      from public.recurring_transactions plan
      where plan.id = recurring_payment_occurrences.plan_id
        and plan.profile_id = recurring_payment_occurrences.profile_id
        and public.is_profile_member(plan.profile_id)
    )
  );

create or replace function public.seed_recurring_payment_occurrences()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  i integer;
  v_count integer;
  v_due date;
begin
  if auth.uid() is null or not public.is_profile_member(new.profile_id) then
    raise exception using
      errcode = '42501',
      message = 'Cannot create recurring payment occurrences for a profile without membership';
  end if;

  if not exists (
    select 1
    from public.recurring_transactions plan
    where plan.id = new.id
      and plan.profile_id = new.profile_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'Recurring payment plan profile mismatch';
  end if;

  if new.start_date is null or new.status <> 'active' then
    return new;
  end if;

  v_count := case
    when new.plan_type in ('installment_purchase', 'loan') and new.installment_total_count is not null
      then least(new.installment_total_count, 240)
    else 24
  end;

  for i in 0..greatest(v_count - 1, 0) loop
    v_due := case new.cadence_unit
      when 'day' then new.start_date + (i * new.cadence_interval)
      when 'week' then new.start_date + (i * new.cadence_interval * 7)
      when 'year' then (new.start_date + make_interval(years => i * new.cadence_interval))::date
      else (new.start_date + make_interval(months => i * new.cadence_interval))::date
    end;
    exit when new.end_date is not null and v_due > new.end_date;

    insert into public.recurring_payment_occurrences(profile_id, plan_id, sequence_number, due_date, planned_amount)
    values(new.profile_id, new.id, i + 1, v_due, new.amount)
    on conflict(plan_id, sequence_number) do nothing;
  end loop;

  return new;
end
$$;

revoke all on function public.seed_recurring_payment_occurrences() from public;

drop trigger if exists recurring_transactions_seed_occurrences on public.recurring_transactions;
create trigger recurring_transactions_seed_occurrences
after insert on public.recurring_transactions
for each row execute function public.seed_recurring_payment_occurrences();
