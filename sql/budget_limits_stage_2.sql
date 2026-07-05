-- BudzAppka budget limits v1. Additive migration; legacy budget_limits stays intact.

create table if not exists public.budget_limit_plans (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  name text not null check (length(trim(name)) > 0), status text not null default 'active'
    check (status in ('active','paused','archived')),
  currency text not null default 'PLN' check (currency = 'PLN'),
  legacy_budget_limit_id uuid null references public.budget_limits(id) on delete set null,
  archived_at timestamptz null, created_at timestamptz not null default timezone('utc',now()),
  updated_at timestamptz not null default timezone('utc',now()), unique(legacy_budget_limit_id)
);

create table if not exists public.budget_limit_versions (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  plan_id uuid not null references public.budget_limit_plans(id) on delete cascade,
  effective_from date not null, effective_to date null,
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  scope_type text not null check (scope_type in ('category_l2','category_l3','category_group','global_expenses')),
  category_id uuid null references public.categories(id) on delete set null,
  category_ids uuid[] not null default '{}', period_type text not null default 'monthly' check (period_type='monthly'),
  alert_thresholds integer[] not null default '{50,80,90}', forecast_alert_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc',now()), replaced_by_version_id uuid null,
  check (effective_to is null or effective_to >= effective_from),
  check ((scope_type in ('category_l2','category_l3') and category_id is not null) or scope_type in ('category_group','global_expenses')),
  check (scope_type <> 'category_group' or cardinality(category_ids) > 0)
);
alter table public.budget_limit_versions drop constraint if exists budget_limit_versions_thresholds_check;
alter table public.budget_limit_versions add constraint budget_limit_versions_thresholds_check
  check (0 < all(alert_thresholds) and 100 > all(alert_thresholds)) not valid;

create table if not exists public.budget_limit_periods (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  plan_id uuid not null references public.budget_limit_plans(id) on delete cascade,
  version_id uuid not null references public.budget_limit_versions(id) on delete restrict,
  period_start date not null, period_end date not null, status text not null default 'open' check(status in ('open','closed')),
  limit_amount_snapshot numeric(12,2) not null check(limit_amount_snapshot > 0),
  spent_snapshot numeric(12,2) null check(spent_snapshot >= 0), transaction_count_snapshot integer null check(transaction_count_snapshot >= 0),
  usage_status_snapshot text null check(usage_status_snapshot in ('safe','warning','exceeded')),
  calculated_at timestamptz null, closed_at timestamptz null,
  created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()),
  unique(plan_id,period_start), check(period_end >= period_start)
);

create table if not exists public.budget_limit_alerts (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  plan_id uuid not null references public.budget_limit_plans(id) on delete cascade,
  period_id uuid not null references public.budget_limit_periods(id) on delete cascade,
  kind text not null check(kind in ('threshold_reached','limit_exceeded','projected_exceeded')),
  threshold_percent integer not null default 0, spent_at_trigger numeric(12,2) not null check(spent_at_trigger >= 0),
  limit_at_trigger numeric(12,2) not null check(limit_at_trigger > 0),
  triggered_at timestamptz not null default timezone('utc',now()), read_at timestamptz null,
  muted_for_period boolean not null default false, resolved_at timestamptz null,
  unique(period_id,kind,threshold_percent)
);

create index if not exists budget_limit_plans_profile_status_idx on public.budget_limit_plans(profile_id,status,created_at);
create index if not exists budget_limit_versions_plan_effective_idx on public.budget_limit_versions(plan_id,effective_from desc);
create index if not exists budget_limit_periods_plan_start_idx on public.budget_limit_periods(plan_id,period_start desc);
create index if not exists budget_limit_alerts_period_state_idx on public.budget_limit_alerts(period_id,muted_for_period,read_at);

alter table public.budget_limit_plans enable row level security;
alter table public.budget_limit_versions enable row level security;
alter table public.budget_limit_periods enable row level security;
alter table public.budget_limit_alerts enable row level security;
do $$ declare t text; op text; begin
  foreach t in array array['budget_limit_plans','budget_limit_versions','budget_limit_periods','budget_limit_alerts'] loop
    foreach op in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I',t||'_'||op||'_own',t);
      if op='insert' then execute format('create policy %I on public.%I for insert with check(auth.uid()=profile_id)',t||'_'||op||'_own',t);
      elsif op='update' then execute format('create policy %I on public.%I for update using(auth.uid()=profile_id) with check(auth.uid()=profile_id)',t||'_'||op||'_own',t);
      else execute format('create policy %I on public.%I for %s using(auth.uid()=profile_id)',t||'_'||op||'_own',t,op); end if;
    end loop;
  end loop;
end $$;

insert into public.budget_limit_plans(profile_id,name,status,legacy_budget_limit_id,created_at)
select b.profile_id,case when b.category_id is null then 'Wszystkie wydatki' else 'Limit kategorii' end,
  case when b.end_month is not null and b.end_month < to_char(current_date,'YYYY-MM') then 'archived' else 'active' end,b.id,b.created_at
from public.budget_limits b on conflict(legacy_budget_limit_id) do nothing;
insert into public.budget_limit_versions(profile_id,plan_id,effective_from,effective_to,limit_amount,scope_type,category_id,alert_thresholds,forecast_alert_enabled)
select b.profile_id,p.id,(b.start_month||'-01')::date,
  case
    when b.end_month is null then null
    else (
      date_trunc('month', (b.end_month || '-01')::date)
      + interval '1 month'
      - interval '1 day'
    )::date
  end,
  b.amount,case when b.category_id is null then 'global_expenses' else coalesce(case c.level when 2 then 'category_l2' when 3 then 'category_l3' end,'category_l3') end,
  b.category_id,case when b.mode='strict' then '{}'::integer[] else '{80,90}'::integer[] end,true
from public.budget_limits b join public.budget_limit_plans p on p.legacy_budget_limit_id=b.id left join public.categories c on c.id=b.category_id
where not exists(select 1 from public.budget_limit_versions v where v.plan_id=p.id);

insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,status)
select p.profile_id,p.id,v.id,month_start::date,
  (month_start + interval '1 month' - interval '1 day')::date,
  v.limit_amount,
  case when month_start < date_trunc('month',current_date) then 'closed' else 'open' end
from public.budget_limit_plans p join public.budget_limit_versions v on v.plan_id=p.id
cross join lateral generate_series(v.effective_from::timestamp,least(coalesce(v.effective_to,current_date),current_date)::timestamp,interval '1 month') month_start
where p.legacy_budget_limit_id is not null on conflict(plan_id,period_start) do nothing;

create or replace function public.save_budget_limit_plan_v1(p_plan_id uuid,p_name text,p_scope_type text,p_category_id uuid,p_limit_amount numeric,p_effective_month text,p_alert_thresholds integer[],p_forecast_enabled boolean,p_status text default 'active')
returns uuid language plpgsql security invoker as $$
declare v_plan uuid;v_old public.budget_limit_versions;v_version uuid;v_start date;begin
  if p_limit_amount<=0 or p_scope_type not in ('category_l2','category_l3','global_expenses') or p_status not in ('active','archived') then raise exception 'Invalid budget limit';end if;
  v_start:=(p_effective_month||'-01')::date;
  if p_plan_id is null then insert into public.budget_limit_plans(profile_id,name,status,archived_at) values(auth.uid(),trim(p_name),p_status,case when p_status='archived' then now() end) returning id into v_plan;
  else v_plan:=p_plan_id;update public.budget_limit_plans set name=trim(p_name),status=p_status,archived_at=case when p_status='archived' then coalesce(archived_at,now()) else null end,updated_at=now() where id=v_plan and profile_id=auth.uid();if not found then raise exception 'Plan not found';end if;end if;
  select * into v_old from public.budget_limit_versions where plan_id=v_plan and effective_to is null order by effective_from desc limit 1;
  if v_old.id is not null and v_old.effective_from=v_start then
    update public.budget_limit_versions set limit_amount=p_limit_amount,scope_type=p_scope_type,category_id=p_category_id,alert_thresholds=coalesce(p_alert_thresholds,'{}'),forecast_alert_enabled=p_forecast_enabled where id=v_old.id returning id into v_version;
  else
    if v_old.id is not null then update public.budget_limit_versions set effective_to=v_start-1 where id=v_old.id and effective_from<v_start;end if;
    insert into public.budget_limit_versions(profile_id,plan_id,effective_from,limit_amount,scope_type,category_id,alert_thresholds,forecast_alert_enabled)
      values(auth.uid(),v_plan,v_start,p_limit_amount,p_scope_type,p_category_id,coalesce(p_alert_thresholds,'{}'),p_forecast_enabled) returning id into v_version;
    if v_old.id is not null then update public.budget_limit_versions set replaced_by_version_id=v_version where id=v_old.id;end if;
  end if;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot)
    values(
      auth.uid(),
      v_plan,
      v_version,
      v_start,
      (v_start + interval '1 month' - interval '1 day')::date,
      p_limit_amount
    ) on conflict(plan_id,period_start) do update set version_id=excluded.version_id,limit_amount_snapshot=excluded.limit_amount_snapshot,updated_at=now();
  return v_plan;end $$;

create or replace function public.ensure_budget_limit_period_v1(p_plan_id uuid,p_month text) returns uuid language plpgsql security invoker as $$
declare v_start date;v_version public.budget_limit_versions;v_id uuid;begin v_start:=(p_month||'-01')::date;
  select * into v_version from public.budget_limit_versions where plan_id=p_plan_id and profile_id=auth.uid() and effective_from<=v_start and (effective_to is null or effective_to>=v_start) order by effective_from desc limit 1;
  if v_version.id is null then return null;end if;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot)
    values(
      auth.uid(),
      p_plan_id,
      v_version.id,
      v_start,
      (v_start + interval '1 month' - interval '1 day')::date,
      v_version.limit_amount
    ) on conflict(plan_id,period_start) do update set updated_at=now() returning id into v_id;return v_id;end $$;
