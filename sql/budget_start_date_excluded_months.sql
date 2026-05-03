alter table public.profile_month_navigation_settings
  add column if not exists budget_start_date date;

update public.profile_month_navigation_settings
set budget_start_date = min_history_month
where budget_start_date is null
  and min_history_month is not null;

alter table public.profile_month_navigation_settings
  drop constraint if exists profile_month_navigation_settings_min_history_month_month_start_check;

create table if not exists public.profile_excluded_months (
  profile_id uuid not null,
  month date not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, month),
  constraint profile_excluded_months_month_start_check
    check (month = date_trunc('month', month)::date)
);

create index if not exists profile_excluded_months_profile_month_idx
  on public.profile_excluded_months (profile_id, month);

alter table public.profile_excluded_months enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_excluded_months'
      and policyname = 'profile_excluded_months_select_own'
  ) then
    create policy profile_excluded_months_select_own
      on public.profile_excluded_months
      for select
      using (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_excluded_months'
      and policyname = 'profile_excluded_months_insert_own'
  ) then
    create policy profile_excluded_months_insert_own
      on public.profile_excluded_months
      for insert
      with check (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_excluded_months'
      and policyname = 'profile_excluded_months_update_own'
  ) then
    create policy profile_excluded_months_update_own
      on public.profile_excluded_months
      for update
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_excluded_months'
      and policyname = 'profile_excluded_months_delete_own'
  ) then
    create policy profile_excluded_months_delete_own
      on public.profile_excluded_months
      for delete
      using (auth.uid() = profile_id);
  end if;
end
$$;

alter table public.recurring_transactions
  add column if not exists use_amount_when_creating boolean not null default false,
  add column if not exists initial_payment_amount numeric(12, 2);

create table if not exists public.recurring_reminder_month_statuses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  reminder_id uuid not null references public.recurring_transactions(id) on delete cascade,
  month date not null,
  status text not null,
  transaction_id uuid null references public.transactions(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint recurring_reminder_month_statuses_month_start_check
    check (month = date_trunc('month', month)::date),
  constraint recurring_reminder_month_statuses_status_check
    check (status in ('read', 'linked')),
  constraint recurring_reminder_month_statuses_unique
    unique (profile_id, reminder_id, month)
);

create index if not exists recurring_reminder_month_statuses_profile_month_idx
  on public.recurring_reminder_month_statuses (profile_id, month, status);

alter table public.recurring_reminder_month_statuses enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recurring_reminder_month_statuses'
      and policyname = 'recurring_reminder_month_statuses_select_own'
  ) then
    create policy recurring_reminder_month_statuses_select_own
      on public.recurring_reminder_month_statuses
      for select
      using (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recurring_reminder_month_statuses'
      and policyname = 'recurring_reminder_month_statuses_insert_own'
  ) then
    create policy recurring_reminder_month_statuses_insert_own
      on public.recurring_reminder_month_statuses
      for insert
      with check (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recurring_reminder_month_statuses'
      and policyname = 'recurring_reminder_month_statuses_update_own'
  ) then
    create policy recurring_reminder_month_statuses_update_own
      on public.recurring_reminder_month_statuses
      for update
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recurring_reminder_month_statuses'
      and policyname = 'recurring_reminder_month_statuses_delete_own'
  ) then
    create policy recurring_reminder_month_statuses_delete_own
      on public.recurring_reminder_month_statuses
      for delete
      using (auth.uid() = profile_id);
  end if;
end
$$;
