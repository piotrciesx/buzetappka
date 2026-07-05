-- BudzAppka recurring payments, stage 2.
-- Additive migration: no legacy table, column or row is removed.

alter table public.recurring_transactions
  add column if not exists plan_type text,
  add column if not exists amount_mode text,
  add column if not exists cadence_unit text,
  add column if not exists cadence_interval integer,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.recurring_transactions set
  plan_type = coalesce(plan_type, case when kind = 'installment' then 'installment_purchase' else 'fixed_payment' end),
  amount_mode = coalesce(amount_mode, case when amount is null then 'reminder_only' else 'fixed' end),
  cadence_unit = coalesce(cadence_unit, case when frequency = 'yearly' then 'year' else 'month' end),
  cadence_interval = coalesce(cadence_interval, case when frequency = 'custom' then greatest(coalesce(custom_interval_months, 1), 1) else 1 end)
where plan_type is null or amount_mode is null or cadence_unit is null or cadence_interval is null;

alter table public.recurring_transactions
  alter column plan_type set default 'fixed_payment',
  alter column amount_mode set default 'fixed',
  alter column cadence_unit set default 'month',
  alter column cadence_interval set default 1;

alter table public.recurring_transactions drop constraint if exists recurring_transactions_plan_type_check;
alter table public.recurring_transactions add constraint recurring_transactions_plan_type_check
  check (plan_type in ('fixed_payment', 'installment_purchase', 'loan')) not valid;
alter table public.recurring_transactions drop constraint if exists recurring_transactions_amount_mode_check;
alter table public.recurring_transactions add constraint recurring_transactions_amount_mode_check
  check (amount_mode in ('fixed', 'variable', 'reminder_only')) not valid;
alter table public.recurring_transactions drop constraint if exists recurring_transactions_cadence_check;
alter table public.recurring_transactions add constraint recurring_transactions_cadence_check
  check (cadence_unit in ('day', 'week', 'month', 'year') and cadence_interval > 0) not valid;

create table if not exists public.recurring_installment_purchase_terms (
  plan_id uuid primary key references public.recurring_transactions(id) on delete cascade,
  profile_id uuid not null,
  purchase_amount numeric(12,2) not null check (purchase_amount >= 0),
  down_payment_amount numeric(12,2) not null default 0 check (down_payment_amount >= 0),
  financed_amount numeric(12,2) not null check (financed_amount >= 0),
  pricing_mode text not null check (pricing_mode in ('zero_percent', 'with_cost')),
  declared_installment_count integer null check (declared_installment_count > 0),
  default_installment_amount numeric(12,2) null check (default_installment_amount > 0),
  schedule_mode text not null default 'calculated' check (schedule_mode in ('calculated', 'manual')),
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  check (down_payment_amount <= purchase_amount)
);

create table if not exists public.recurring_loan_terms (
  plan_id uuid primary key references public.recurring_transactions(id) on delete cascade,
  profile_id uuid not null,
  principal_amount numeric(12,2) not null check (principal_amount > 0),
  paid_before_tracking_amount numeric(12,2) not null default 0 check (paid_before_tracking_amount >= 0),
  installments_paid_before_tracking_count integer not null default 0 check (installments_paid_before_tracking_count >= 0),
  remaining_principal_at_start numeric(12,2) null check (remaining_principal_at_start >= 0),
  initial_installment_amount numeric(12,2) not null check (initial_installment_amount > 0),
  interest_mode text not null default 'unknown' check (interest_mode in ('fixed', 'variable', 'unknown')),
  interest_rate numeric(8,4) null check (interest_rate >= 0),
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recurring_payment_occurrences (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  plan_id uuid not null references public.recurring_transactions(id) on delete cascade,
  sequence_number integer not null check (sequence_number > 0), due_date date not null,
  planned_amount numeric(12,2) null check (planned_amount >= 0),
  status text not null default 'pending' check (status in ('pending','completed_with_transaction','completed_without_transaction','skipped')),
  completed_at timestamptz null, skipped_at timestamptz null, snoozed_until timestamptz null,
  is_amount_locked boolean not null default false, is_date_locked boolean not null default false,
  schedule_revision integer not null default 1 check (schedule_revision > 0),
  legacy_source text null, legacy_source_id uuid null,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (plan_id, sequence_number)
);
create index if not exists recurring_occurrences_profile_due_idx on public.recurring_payment_occurrences(profile_id, due_date, status);

create or replace function public.seed_recurring_payment_occurrences()
returns trigger language plpgsql security invoker as $$
declare i integer; v_count integer; v_due date;
begin
  if new.start_date is null then return new; end if;
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
drop trigger if exists recurring_transactions_seed_occurrences on public.recurring_transactions;
create trigger recurring_transactions_seed_occurrences after insert on public.recurring_transactions
for each row execute function public.seed_recurring_payment_occurrences();

create table if not exists public.recurring_occurrence_transactions (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  occurrence_id uuid not null references public.recurring_payment_occurrences(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  allocated_amount numeric(12,2) null check (allocated_amount > 0),
  created_at timestamptz not null default timezone('utc', now()), unique (occurrence_id, transaction_id)
);
create index if not exists recurring_occurrence_transactions_transaction_idx on public.recurring_occurrence_transactions(transaction_id);

alter table public.transactions add column if not exists recurring_occurrence_id uuid null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_recurring_occurrence_id_fkey') then
    alter table public.transactions add constraint transactions_recurring_occurrence_id_fkey foreign key (recurring_occurrence_id)
      references public.recurring_payment_occurrences(id) on delete set null;
  end if;
end $$;
create index if not exists transactions_recurring_occurrence_id_idx on public.transactions(recurring_occurrence_id);

alter table public.recurring_installment_purchase_terms enable row level security;
alter table public.recurring_loan_terms enable row level security;
alter table public.recurring_payment_occurrences enable row level security;
alter table public.recurring_occurrence_transactions enable row level security;

do $$ declare t text; op text; begin
  foreach t in array array['recurring_installment_purchase_terms','recurring_loan_terms','recurring_payment_occurrences','recurring_occurrence_transactions'] loop
    foreach op in array array['select','insert','update','delete'] loop
      if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_'||op||'_own') then
        if op = 'insert' then
          execute format('create policy %I on public.%I for insert with check (auth.uid() = profile_id)', t||'_'||op||'_own', t);
        elsif op = 'update' then
          execute format('create policy %I on public.%I for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id)', t||'_'||op||'_own', t);
        else
          execute format('create policy %I on public.%I for %s using (auth.uid() = profile_id)', t||'_'||op||'_own', t, op);
        end if;
      end if;
    end loop;
  end loop;
end $$;

-- Conservative legacy backfill: materialize monthly statuses only; ambiguous `read`
-- remains explicitly labelled instead of being guessed as paid or skipped.
insert into public.recurring_payment_occurrences(profile_id, plan_id, sequence_number, due_date, planned_amount, status, completed_at, legacy_source, legacy_source_id)
select s.profile_id, s.reminder_id,
  1000000 + (extract(year from s.month)::int * 12 + extract(month from s.month)::int),
  (s.month + (greatest(least(coalesce(extract(day from r.start_date)::int,1),28),1)-1) * interval '1 day')::date,
  r.amount, case when s.status='linked' then 'completed_with_transaction' else 'completed_without_transaction' end,
  s.updated_at, case when s.status='read' then 'legacy_unknown_handled' else 'legacy_linked' end, s.id
from public.recurring_reminder_month_statuses s join public.recurring_transactions r on r.id=s.reminder_id
on conflict (plan_id, sequence_number) do nothing;

insert into public.recurring_occurrence_transactions(profile_id, occurrence_id, transaction_id)
select o.profile_id, o.id, s.transaction_id from public.recurring_payment_occurrences o
join public.recurring_reminder_month_statuses s on s.id=o.legacy_source_id where s.transaction_id is not null
on conflict (occurrence_id, transaction_id) do nothing;

create or replace function public.set_recurring_occurrence_status(p_occurrence_id uuid, p_status text, p_snoozed_until timestamptz default null)
returns public.recurring_payment_occurrences language plpgsql security invoker as $$
declare result public.recurring_payment_occurrences;
begin
  if p_status not in ('pending','completed_without_transaction','skipped') then raise exception 'Unsupported status'; end if;
  update public.recurring_payment_occurrences set status=p_status, snoozed_until=p_snoozed_until,
    completed_at=case when p_status='completed_without_transaction' then now() else null end,
    skipped_at=case when p_status='skipped' then now() else null end, updated_at=now()
  where id=p_occurrence_id and profile_id=auth.uid() returning * into result;
  if result.id is null then raise exception 'Occurrence not found'; end if; return result;
end $$;

create or replace function public.link_transaction_to_recurring_occurrence(p_occurrence_id uuid, p_transaction_id uuid)
returns void language plpgsql security invoker as $$
declare v_profile uuid; v_plan uuid;
begin
  select profile_id,plan_id into v_profile,v_plan from public.recurring_payment_occurrences where id=p_occurrence_id and profile_id=auth.uid();
  if v_profile is null then raise exception 'Occurrence not found'; end if;
  if not exists(select 1 from public.transactions where id=p_transaction_id and profile_id=v_profile) then raise exception 'Transaction not found'; end if;
  insert into public.recurring_occurrence_transactions(profile_id,occurrence_id,transaction_id) values(v_profile,p_occurrence_id,p_transaction_id) on conflict do nothing;
  update public.transactions set recurring_occurrence_id=p_occurrence_id, recurring_transaction_id=coalesce(recurring_transaction_id,v_plan) where id=p_transaction_id;
  update public.recurring_payment_occurrences set status='completed_with_transaction',completed_at=now(),snoozed_until=null,updated_at=now() where id=p_occurrence_id;
end $$;
