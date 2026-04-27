create table if not exists public.profile_month_navigation_settings (
  profile_id uuid primary key,
  min_history_month date,
  lock_future_months boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_month_navigation_settings_min_history_month_month_start_check
    check (
      min_history_month is null
      or min_history_month = date_trunc('month', min_history_month)::date
    )
);

alter table public.profile_month_navigation_settings
  alter column min_history_month drop not null;

alter table public.profile_month_navigation_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_month_navigation_settings'
      and policyname = 'profile_month_navigation_settings_select_own'
  ) then
    create policy profile_month_navigation_settings_select_own
      on public.profile_month_navigation_settings
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
      and tablename = 'profile_month_navigation_settings'
      and policyname = 'profile_month_navigation_settings_insert_own'
  ) then
    create policy profile_month_navigation_settings_insert_own
      on public.profile_month_navigation_settings
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
      and tablename = 'profile_month_navigation_settings'
      and policyname = 'profile_month_navigation_settings_update_own'
  ) then
    create policy profile_month_navigation_settings_update_own
      on public.profile_month_navigation_settings
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
      and tablename = 'profile_month_navigation_settings'
      and policyname = 'profile_month_navigation_settings_delete_own'
  ) then
    create policy profile_month_navigation_settings_delete_own
      on public.profile_month_navigation_settings
      for delete
      using (auth.uid() = profile_id);
  end if;
end
$$;
