-- Functional lifecycle closure for recurring payment plans.
-- Additive and safe to run more than once; legacy rows and columns are preserved.

alter table public.recurring_transactions
  add column if not exists paused_at timestamptz null,
  add column if not exists archived_at timestamptz null,
  add column if not exists resume_from_date date null;

alter table public.recurring_transactions
  drop constraint if exists recurring_transactions_status_check;

update public.recurring_transactions
set
  status = 'archived',
  archived_at = coalesce(archived_at, updated_at, created_at, timezone('utc', now()))
where status = 'completed';

update public.recurring_transactions
set paused_at = coalesce(paused_at, updated_at, timezone('utc', now()))
where status = 'paused' and paused_at is null;

alter table public.recurring_transactions
  alter column status set default 'active';

alter table public.recurring_transactions
  add constraint recurring_transactions_status_check
  check (status in ('active', 'paused', 'archived')) not valid;

create index if not exists recurring_transactions_profile_status_created_idx
  on public.recurring_transactions(profile_id, status, created_at desc);

create or replace function public.guard_recurring_payment_plan_name()
returns trigger
language plpgsql
security invoker
as $$
begin
  if new.status in ('active', 'paused') and exists (
    select 1
    from public.recurring_transactions existing
    where existing.profile_id = new.profile_id
      and existing.id <> new.id
      and existing.status in ('active', 'paused')
      and lower(btrim(existing.name)) = lower(btrim(new.name))
  ) then
    raise exception using
      errcode = '23505',
      message = 'Taka płatność już istnieje. Edytuj ją, wznów albo zakończ, zamiast tworzyć drugą.';
  end if;
  return new;
end
$$;

drop trigger if exists recurring_transactions_guard_name on public.recurring_transactions;
create trigger recurring_transactions_guard_name
before insert or update of name, status on public.recurring_transactions
for each row execute function public.guard_recurring_payment_plan_name();

create or replace function public.set_recurring_payment_plan_status(
  p_plan_id uuid,
  p_status text,
  p_restart_date date default null
)
returns public.recurring_transactions
language plpgsql
security invoker
as $$
declare
  result public.recurring_transactions;
  previous_status text;
  restart_date date;
  occurrence_row record;
  occurrence_offset integer := 0;
  next_due_date date;
begin
  if p_status not in ('active', 'paused', 'archived') then
    raise exception 'Unsupported recurring payment plan status';
  end if;

  select status into previous_status
  from public.recurring_transactions
  where id = p_plan_id and profile_id = auth.uid()
  for update;

  if previous_status is null then
    raise exception 'Recurring payment plan not found';
  end if;

  restart_date := greatest(coalesce(p_restart_date, current_date), current_date);

  update public.recurring_transactions
  set
    status = p_status,
    paused_at = case when p_status = 'paused' then timezone('utc', now()) when p_status = 'active' then null else paused_at end,
    archived_at = case when p_status = 'archived' then timezone('utc', now()) when p_status = 'active' then null else archived_at end,
    resume_from_date = case when p_status = 'active' and previous_status <> 'active' then restart_date else resume_from_date end,
    updated_at = timezone('utc', now())
  where id = p_plan_id and profile_id = auth.uid()
  returning * into result;

  -- On resume/restore, move every still-pending occurrence onto a fresh future
  -- cadence. This intentionally avoids creating a backlog for the inactive gap.
  if p_status = 'active' and previous_status <> 'active' then
    for occurrence_row in
      select id
      from public.recurring_payment_occurrences
      where plan_id = p_plan_id and profile_id = auth.uid() and status = 'pending'
      order by sequence_number
    loop
      next_due_date := case result.cadence_unit
        when 'day' then restart_date + (occurrence_offset * result.cadence_interval)
        when 'week' then restart_date + (occurrence_offset * result.cadence_interval * 7)
        when 'year' then (restart_date + make_interval(years => occurrence_offset * result.cadence_interval))::date
        else (restart_date + make_interval(months => occurrence_offset * result.cadence_interval))::date
      end;
      update public.recurring_payment_occurrences
      set due_date = next_due_date, snoozed_until = null, schedule_revision = schedule_revision + 1, updated_at = timezone('utc', now())
      where id = occurrence_row.id;
      occurrence_offset := occurrence_offset + 1;
    end loop;
  end if;

  insert into public.recurring_payment_history(profile_id, plan_id, event_type, payload)
  values(result.profile_id, result.id, 'plan_status_changed', jsonb_build_object(
    'old_status', previous_status,
    'new_status', p_status,
    'restart_date', case when p_status = 'active' then restart_date else null end
  ));

  return result;
end
$$;

grant execute on function public.set_recurring_payment_plan_status(uuid, text, date) to authenticated;

-- Keep the original seeding behavior, but never generate occurrences for a
-- plan that starts its lifecycle paused or archived.
create or replace function public.seed_recurring_payment_occurrences()
returns trigger language plpgsql security invoker as $$
declare i integer; v_count integer; v_due date;
begin
  if new.start_date is null or new.status <> 'active' then return new; end if;
  v_count := case when new.plan_type in ('installment_purchase','loan') and new.installment_total_count is not null
    then least(new.installment_total_count, 240) else 24 end;
  for i in 0..greatest(v_count-1,0) loop
    v_due := case new.cadence_unit
      when 'day' then new.start_date + (i * new.cadence_interval)
      when 'week' then new.start_date + (i * new.cadence_interval * 7)
      when 'year' then (new.start_date + make_interval(years => i * new.cadence_interval))::date
      else (new.start_date + make_interval(months => i * new.cadence_interval))::date end;
    exit when new.end_date is not null and v_due > new.end_date;
    insert into public.recurring_payment_occurrences(profile_id,plan_id,sequence_number,due_date,planned_amount)
      values(new.profile_id,new.id,i+1,v_due,new.amount) on conflict(plan_id,sequence_number) do nothing;
  end loop;
  return new;
end $$;
