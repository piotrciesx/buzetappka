-- Additive lifecycle closure for financial goals.
alter table public.financial_goals
  add column if not exists status_changed_month text null,
  add column if not exists paused_at timestamptz null,
  add column if not exists archived_at timestamptz null;

alter table public.financial_goals
  drop constraint if exists financial_goals_status_check;

update public.financial_goals
set
  status = case
    when status = 'completed' then 'archived_completed'
    when status = 'cancelled' then 'archived_not_completed'
    else coalesce(status, 'active')
  end,
  archived_at = case
    when status in ('completed', 'cancelled') then coalesce(archived_at, completed_at, timezone('utc', now()))
    else archived_at
  end,
  status_changed_month = case
    when status in ('completed', 'cancelled') then coalesce(status_changed_month, to_char(coalesce(completed_at, timezone('utc', now())), 'YYYY-MM'))
    else status_changed_month
  end
where status is null or status in ('completed', 'cancelled');

alter table public.financial_goals
  add constraint financial_goals_status_check
  check (status in ('active', 'paused', 'archived_completed', 'archived_not_completed')) not valid;

alter table public.financial_goals
  drop constraint if exists financial_goals_status_changed_month_check;
alter table public.financial_goals
  add constraint financial_goals_status_changed_month_check
  check (status_changed_month is null or status_changed_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$') not valid;

create index if not exists financial_goals_profile_status_idx
  on public.financial_goals(profile_id, status, created_at);
