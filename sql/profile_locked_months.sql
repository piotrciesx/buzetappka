create table if not exists public.profile_locked_months (
  profile_id uuid not null,
  month_date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint profile_locked_months_pkey primary key (profile_id, month_date),
  constraint profile_locked_months_month_start_check
    check (month_date = date_trunc('month', month_date)::date)
);

alter table public.profile_locked_months enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_locked_months'
      and policyname = 'profile_locked_months_select_own'
  ) then
    create policy profile_locked_months_select_own
      on public.profile_locked_months
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
      and tablename = 'profile_locked_months'
      and policyname = 'profile_locked_months_insert_own'
  ) then
    create policy profile_locked_months_insert_own
      on public.profile_locked_months
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
      and tablename = 'profile_locked_months'
      and policyname = 'profile_locked_months_delete_own'
  ) then
    create policy profile_locked_months_delete_own
      on public.profile_locked_months
      for delete
      using (auth.uid() = profile_id);
  end if;
end
$$;
