-- Recurring payments: allow occurrence seeding for an authenticated user's own plan.
-- Additive, idempotent and safe for existing rows.

alter table public.recurring_payment_occurrences enable row level security;

drop policy if exists recurring_payment_occurrences_insert_own
  on public.recurring_payment_occurrences;
create policy recurring_payment_occurrences_insert_own
  on public.recurring_payment_occurrences
  for insert
  to authenticated
  with check (
    auth.uid() = profile_id
    and exists (
      select 1
      from public.recurring_transactions plan
      where plan.id = recurring_payment_occurrences.plan_id
        and plan.profile_id = auth.uid()
    )
  );

create or replace function public.seed_recurring_payment_occurrences()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  caller_profile_id uuid := auth.uid();
  i integer;
  v_count integer;
  v_due date;
begin
  if caller_profile_id is null or new.profile_id <> caller_profile_id then
    raise exception using
      errcode = '42501',
      message = 'Cannot create recurring payment occurrences for another profile';
  end if;

  if not exists (
    select 1
    from public.recurring_transactions plan
    where plan.id = new.id
      and plan.profile_id = caller_profile_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'Recurring payment plan does not belong to the authenticated profile';
  end if;

  if new.start_date is null or new.status <> 'active' then
    return new;
  end if;

  v_count := case
    when new.plan_type in ('installment_purchase', 'loan')
      and new.installment_total_count is not null
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

    insert into public.recurring_payment_occurrences(
      profile_id,
      plan_id,
      sequence_number,
      due_date,
      planned_amount
    ) values (
      caller_profile_id,
      new.id,
      i + 1,
      v_due,
      new.amount
    )
    on conflict(plan_id, sequence_number) do nothing;
  end loop;

  return new;
end
$$;

revoke all on function public.seed_recurring_payment_occurrences() from public;

drop trigger if exists recurring_transactions_seed_occurrences
  on public.recurring_transactions;
create trigger recurring_transactions_seed_occurrences
after insert on public.recurring_transactions
for each row execute function public.seed_recurring_payment_occurrences();
