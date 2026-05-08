create table if not exists public.payment_sources (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  name text not null,
  type text not null check (type in ('cash', 'card', 'account', 'other')),
  is_income_source boolean not null default true,
  is_expense_source boolean not null default true,
  emoji text null,
  color text null,
  created_at timestamptz not null default now()
);

alter table public.payment_sources
  add column if not exists is_income_source boolean not null default true,
  add column if not exists is_expense_source boolean not null default true,
  add column if not exists emoji text null,
  add column if not exists color text null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'payment_sources_type_check'
  ) then
    alter table public.payment_sources
      drop constraint payment_sources_type_check;
  end if;
end $$;

alter table public.payment_sources
  add constraint payment_sources_type_check
  check (type in ('cash', 'card', 'account', 'other'));

create index if not exists payment_sources_profile_id_idx
  on public.payment_sources (profile_id, name);

create table if not exists public.profile_finance_settings (
  profile_id uuid primary key,
  default_payment_source_id uuid null references public.payment_sources(id) on delete set null,
  default_income_payment_source_id uuid null references public.payment_sources(id) on delete set null,
  default_expense_payment_source_id uuid null references public.payment_sources(id) on delete set null,
  show_income_payment_source boolean not null default true,
  show_expense_payment_source boolean not null default true,
  goal_split_mode_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_finance_settings
  add column if not exists default_income_payment_source_id uuid null references public.payment_sources(id) on delete set null,
  add column if not exists default_expense_payment_source_id uuid null references public.payment_sources(id) on delete set null,
  add column if not exists show_income_payment_source boolean not null default true,
  add column if not exists show_expense_payment_source boolean not null default true,
  add column if not exists goal_split_mode_enabled boolean not null default false;

update public.profile_finance_settings
set
  default_income_payment_source_id = coalesce(default_income_payment_source_id, default_payment_source_id),
  default_expense_payment_source_id = coalesce(default_expense_payment_source_id, default_payment_source_id)
where default_payment_source_id is not null;

alter table public.transactions
  add column if not exists payment_source_id uuid null references public.payment_sources(id) on delete set null;

alter table public.transactions
  add column if not exists recurring_transaction_id uuid null;

create table if not exists public.transaction_payment_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  payment_source_id uuid not null references public.payment_sources(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists transaction_payment_splits_transaction_id_idx
  on public.transaction_payment_splits (transaction_id);

create index if not exists transaction_payment_splits_source_id_idx
  on public.transaction_payment_splits (payment_source_id);

create index if not exists transactions_payment_source_id_idx
  on public.transactions (payment_source_id);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  name text not null default 'Przypomnienie',
  category_id uuid not null references public.categories(id) on delete cascade,
  payment_source_id uuid null references public.payment_sources(id) on delete set null,
  amount numeric(12, 2) null,
  description text null,
  frequency text not null default 'monthly',
  custom_interval_months integer null,
  start_date date null,
  end_date date null,
  installment_total_count integer null,
  kind text not null default 'open',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.recurring_transactions
  add column if not exists name text not null default 'Przypomnienie',
  add column if not exists payment_source_id uuid null references public.payment_sources(id) on delete set null,
  add column if not exists custom_interval_months integer null,
  add column if not exists installment_total_count integer null,
  add column if not exists kind text not null default 'open';

alter table public.recurring_transactions
  alter column amount drop not null,
  alter column start_date drop not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_transactions_frequency_check'
  ) then
    alter table public.recurring_transactions
      drop constraint recurring_transactions_frequency_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_transactions_status_check'
  ) then
    alter table public.recurring_transactions
      drop constraint recurring_transactions_status_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_transactions_kind_check'
  ) then
    alter table public.recurring_transactions
      drop constraint recurring_transactions_kind_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_transactions_amount_check'
  ) then
    alter table public.recurring_transactions
      drop constraint recurring_transactions_amount_check;
  end if;
end $$;

alter table public.recurring_transactions
  add constraint recurring_transactions_amount_check
  check (amount is null or amount > 0);

alter table public.recurring_transactions
  add constraint recurring_transactions_frequency_check
  check (frequency in ('monthly', 'yearly', 'custom'));

alter table public.recurring_transactions
  add constraint recurring_transactions_status_check
  check (status in ('active', 'paused', 'completed'));

alter table public.recurring_transactions
  add constraint recurring_transactions_kind_check
  check (kind in ('open', 'installment'));

create index if not exists recurring_transactions_profile_id_idx
  on public.recurring_transactions (profile_id, status, start_date);

create table if not exists public.recurring_transaction_executions (
  id uuid primary key default gen_random_uuid(),
  recurring_transaction_id uuid not null references public.recurring_transactions(id) on delete cascade,
  transaction_id uuid null references public.transactions(id) on delete set null,
  generated_for_date date not null,
  status text not null default 'completed',
  marked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.recurring_transaction_executions
  add column if not exists status text not null default 'completed',
  add column if not exists marked_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'recurring_transaction_executions_status_check'
  ) then
    alter table public.recurring_transaction_executions
      drop constraint recurring_transaction_executions_status_check;
  end if;
end $$;

alter table public.recurring_transaction_executions
  add constraint recurring_transaction_executions_status_check
  check (status in ('completed', 'skipped'));

create index if not exists recurring_transaction_executions_recurring_id_idx
  on public.recurring_transaction_executions (recurring_transaction_id, created_at desc);

create unique index if not exists recurring_transaction_executions_cycle_unique_idx
  on public.recurring_transaction_executions (recurring_transaction_id, generated_for_date);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_recurring_transaction_id_fkey'
  ) then
    alter table public.transactions
      add constraint transactions_recurring_transaction_id_fkey
      foreign key (recurring_transaction_id)
      references public.recurring_transactions(id)
      on delete set null;
  end if;
end $$;

create index if not exists transactions_recurring_transaction_id_idx
  on public.transactions (recurring_transaction_id);

create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  start_month text null,
  deadline_month text null,
  allocation_percent numeric(5, 2) null,
  current_amount numeric(12, 2) not null default 0,
  start_date date not null,
  end_date date not null,
  category_id uuid null references public.categories(id) on delete set null,
  category_ids uuid[] not null default '{}',
  status text not null default 'active',
  completed_at timestamptz null,
  tag_ids uuid[] null default '{}',
  created_at timestamptz not null default now()
);

alter table public.financial_goals
  add column if not exists start_month text null,
  add column if not exists deadline_month text null,
  add column if not exists allocation_percent numeric(5, 2) null,
  add column if not exists category_ids uuid[] not null default '{}',
  add column if not exists status text not null default 'active',
  add column if not exists completed_at timestamptz null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financial_goals_allocation_percent_check'
  ) then
    alter table public.financial_goals
      drop constraint financial_goals_allocation_percent_check;
  end if;
end $$;

alter table public.financial_goals
  add constraint financial_goals_allocation_percent_check
  check (allocation_percent is null or (allocation_percent >= 0 and allocation_percent <= 100));

create table if not exists public.category_month_limits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  month text not null,
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now()
);

create unique index if not exists category_month_limits_unique_idx
  on public.category_month_limits (profile_id, category_id, month);

create index if not exists category_month_limits_profile_month_idx
  on public.category_month_limits (profile_id, month);

update public.financial_goals
set start_month = coalesce(start_month, to_char(start_date, 'YYYY-MM'))
where start_month is null and start_date is not null;

update public.financial_goals
set deadline_month = coalesce(deadline_month, to_char(end_date, 'YYYY-MM'))
where deadline_month is null and end_date is not null;

create index if not exists financial_goals_profile_start_month_idx
  on public.financial_goals (profile_id, start_month, created_at);

create index if not exists financial_goals_profile_deadline_month_idx
  on public.financial_goals (profile_id, deadline_month, created_at);

create table if not exists public.financial_goal_month_priorities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  goal_id uuid not null references public.financial_goals(id) on delete cascade,
  month text not null,
  sort_order integer not null default 0,
  allocation_percent numeric(5, 2) null,
  created_at timestamptz not null default now()
);

alter table public.financial_goal_month_priorities
  add column if not exists allocation_percent numeric(5, 2) null;

create unique index if not exists financial_goal_month_priorities_unique_goal_idx
  on public.financial_goal_month_priorities (profile_id, month, goal_id);

create unique index if not exists financial_goal_month_priorities_unique_order_idx
  on public.financial_goal_month_priorities (profile_id, month, sort_order);

create index if not exists financial_goal_month_priorities_profile_month_idx
  on public.financial_goal_month_priorities (profile_id, month, sort_order);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financial_goal_month_priorities_allocation_percent_check'
  ) then
    alter table public.financial_goal_month_priorities
      drop constraint financial_goal_month_priorities_allocation_percent_check;
  end if;
end $$;

alter table public.financial_goal_month_priorities
  add constraint financial_goal_month_priorities_allocation_percent_check
  check (allocation_percent is null or (allocation_percent >= 0 and allocation_percent <= 100));

create table if not exists public.financial_goal_month_configs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  month text not null,
  mode text not null default 'priority',
  created_at timestamptz not null default now()
);

create unique index if not exists financial_goal_month_configs_profile_month_idx
  on public.financial_goal_month_configs (profile_id, month);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financial_goal_month_configs_mode_check'
  ) then
    alter table public.financial_goal_month_configs
      drop constraint financial_goal_month_configs_mode_check;
  end if;
end $$;

alter table public.financial_goal_month_configs
  add constraint financial_goal_month_configs_mode_check
  check (mode in ('priority', 'allocation'));

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'financial_goals_status_check'
  ) then
    alter table public.financial_goals
      drop constraint financial_goals_status_check;
  end if;
end $$;

alter table public.financial_goals
  add constraint financial_goals_status_check
  check (status in ('active', 'completed', 'cancelled'));

create index if not exists financial_goals_profile_id_idx
  on public.financial_goals (profile_id, end_date);
