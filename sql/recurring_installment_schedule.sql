create table if not exists public.recurring_installment_schedule (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  recurring_transaction_id uuid not null references public.recurring_transactions(id) on delete cascade,
  installment_number integer not null,
  due_date date not null,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint recurring_installment_schedule_amount_check
    check (amount >= 0),
  constraint recurring_installment_schedule_number_check
    check (installment_number > 0),
  constraint recurring_installment_schedule_unique
    unique (recurring_transaction_id, installment_number)
);

create index if not exists recurring_installment_schedule_profile_idx
  on public.recurring_installment_schedule (profile_id, recurring_transaction_id, due_date);

alter table public.recurring_installment_schedule enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recurring_installment_schedule'
      and policyname = 'recurring_installment_schedule_select_own'
  ) then
    create policy recurring_installment_schedule_select_own
      on public.recurring_installment_schedule
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
      and tablename = 'recurring_installment_schedule'
      and policyname = 'recurring_installment_schedule_insert_own'
  ) then
    create policy recurring_installment_schedule_insert_own
      on public.recurring_installment_schedule
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
      and tablename = 'recurring_installment_schedule'
      and policyname = 'recurring_installment_schedule_update_own'
  ) then
    create policy recurring_installment_schedule_update_own
      on public.recurring_installment_schedule
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
      and tablename = 'recurring_installment_schedule'
      and policyname = 'recurring_installment_schedule_delete_own'
  ) then
    create policy recurring_installment_schedule_delete_own
      on public.recurring_installment_schedule
      for delete
      using (auth.uid() = profile_id);
  end if;
end
$$;
