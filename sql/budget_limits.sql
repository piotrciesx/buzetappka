create table if not exists public.budget_limits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  category_id uuid null references public.categories(id) on delete cascade,
  amount numeric not null,
  start_month text not null,
  end_month text null,
  mode text not null default 'normal',
  created_at timestamptz not null default timezone('utc', now()),
  constraint budget_limits_amount_positive_check check (amount > 0),
  constraint budget_limits_start_month_check check (start_month ~ '^\d{4}-\d{2}$'),
  constraint budget_limits_end_month_check check (end_month is null or end_month ~ '^\d{4}-\d{2}$'),
  constraint budget_limits_month_order_check check (end_month is null or end_month >= start_month),
  constraint budget_limits_mode_check check (mode in ('normal', 'strict'))
);

create index if not exists budget_limits_profile_id_idx
  on public.budget_limits (profile_id);

create index if not exists budget_limits_profile_category_idx
  on public.budget_limits (profile_id, category_id);

alter table public.budget_limits enable row level security;

drop policy if exists budget_limits_select_own on public.budget_limits;
drop policy if exists budget_limits_insert_own on public.budget_limits;
drop policy if exists budget_limits_update_own on public.budget_limits;
drop policy if exists budget_limits_delete_own on public.budget_limits;

create policy budget_limits_select_own
  on public.budget_limits
  for select
  using (auth.uid() = profile_id or auth.role() = 'anon');

create policy budget_limits_insert_own
  on public.budget_limits
  for insert
  with check (auth.uid() = profile_id or auth.role() = 'anon');

create policy budget_limits_update_own
  on public.budget_limits
  for update
  using (auth.uid() = profile_id or auth.role() = 'anon')
  with check (auth.uid() = profile_id or auth.role() = 'anon');

create policy budget_limits_delete_own
  on public.budget_limits
  for delete
  using (auth.uid() = profile_id or auth.role() = 'anon');
