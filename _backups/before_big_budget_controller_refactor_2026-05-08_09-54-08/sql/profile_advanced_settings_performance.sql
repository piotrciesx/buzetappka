alter table public.profile_month_navigation_settings
  add column if not exists budget_start_date date,
  add column if not exists simple_mode boolean not null default false,
  add column if not exists heatmap_variant text not null default 'balance',
  add column if not exists heatmap_display_mode text not null default 'balance',
  add column if not exists heatmap_inverted boolean not null default false,
  add column if not exists auto_exclude_partial_months boolean not null default false;

update public.profile_month_navigation_settings
set budget_start_date = min_history_month
where budget_start_date is null
  and min_history_month is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_month_navigation_settings_profile_id_fkey'
  ) then
    alter table public.profile_month_navigation_settings
      add constraint profile_month_navigation_settings_profile_id_fkey
      foreign key (profile_id)
      references public.profiles(id)
      on delete cascade;
  end if;
end $$;

alter table public.profile_month_navigation_settings
  drop constraint if exists profile_month_navigation_settings_min_history_month_month_start_check,
  drop constraint if exists profile_month_navigation_settings_heatmap_variant_check,
  drop constraint if exists profile_month_navigation_settings_heatmap_display_mode_check;

alter table public.profile_month_navigation_settings
  add constraint profile_month_navigation_settings_min_history_month_month_start_check
    check (
      min_history_month is null
      or min_history_month = date_trunc('month', min_history_month)::date
    ),
  add constraint profile_month_navigation_settings_heatmap_variant_check
    check (heatmap_variant in ('balance', 'income', 'expense')),
  add constraint profile_month_navigation_settings_heatmap_display_mode_check
    check (heatmap_display_mode in ('normal', 'balance'));

create table if not exists public.profile_excluded_months (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  month date not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, month),
  constraint profile_excluded_months_month_start_check
    check (month = date_trunc('month', month)::date)
);

create index if not exists profile_excluded_months_profile_month_idx
  on public.profile_excluded_months (profile_id, month);

create index if not exists transactions_profile_deleted_date_idx
  on public.transactions (profile_id, is_deleted, date);

create index if not exists transactions_profile_deleted_at_idx
  on public.transactions (profile_id, deleted_at)
  where is_deleted = true;

create index if not exists transaction_payment_splits_transaction_id_idx
  on public.transaction_payment_splits (transaction_id);

alter table public.profile_month_navigation_settings enable row level security;
alter table public.profile_excluded_months enable row level security;

drop policy if exists profile_month_navigation_settings_select_own on public.profile_month_navigation_settings;
create policy profile_month_navigation_settings_select_own
on public.profile_month_navigation_settings
for select
using (public.is_profile_member(profile_id));

drop policy if exists profile_month_navigation_settings_insert_own on public.profile_month_navigation_settings;
create policy profile_month_navigation_settings_insert_own
on public.profile_month_navigation_settings
for insert
with check (public.is_profile_member(profile_id));

drop policy if exists profile_month_navigation_settings_update_own on public.profile_month_navigation_settings;
create policy profile_month_navigation_settings_update_own
on public.profile_month_navigation_settings
for update
using (public.is_profile_member(profile_id))
with check (public.is_profile_member(profile_id));

drop policy if exists profile_month_navigation_settings_delete_own on public.profile_month_navigation_settings;
create policy profile_month_navigation_settings_delete_own
on public.profile_month_navigation_settings
for delete
using (public.is_profile_member(profile_id));

drop policy if exists profile_excluded_months_select_own on public.profile_excluded_months;
create policy profile_excluded_months_select_own
on public.profile_excluded_months
for select
using (public.is_profile_member(profile_id));

drop policy if exists profile_excluded_months_insert_own on public.profile_excluded_months;
create policy profile_excluded_months_insert_own
on public.profile_excluded_months
for insert
with check (public.is_profile_member(profile_id));

drop policy if exists profile_excluded_months_update_own on public.profile_excluded_months;
create policy profile_excluded_months_update_own
on public.profile_excluded_months
for update
using (public.is_profile_member(profile_id))
with check (public.is_profile_member(profile_id));

drop policy if exists profile_excluded_months_delete_own on public.profile_excluded_months;
create policy profile_excluded_months_delete_own
on public.profile_excluded_months
for delete
using (public.is_profile_member(profile_id));
