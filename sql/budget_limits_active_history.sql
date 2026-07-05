-- Budget limits: active/inactive lifecycle with month-effective history.
-- Additive, idempotent and legacy-safe.

alter table public.budget_limit_plans
  add column if not exists inactive_at timestamptz null;
alter table public.budget_limit_versions
  add column if not exists is_active boolean not null default true;
alter table public.budget_limit_periods
  add column if not exists is_active_snapshot boolean not null default true;

alter table public.budget_limit_plans
  drop constraint if exists budget_limit_plans_status_check;

update public.budget_limit_plans
set
  status = 'inactive',
  inactive_at = coalesce(inactive_at, archived_at, updated_at, timezone('utc', now()))
where status in ('paused', 'archived');

alter table public.budget_limit_plans
  alter column status set default 'active';
alter table public.budget_limit_plans
  add constraint budget_limit_plans_status_check
  check (status in ('active', 'inactive')) not valid;

create index if not exists budget_limit_plans_profile_activity_idx
  on public.budget_limit_plans(profile_id, status, created_at);

create or replace function public.ensure_budget_limit_period_v1(p_plan_id uuid,p_month text)
returns uuid language plpgsql security invoker as $$
declare v_start date;v_version public.budget_limit_versions;v_id uuid;
begin
  v_start:=(p_month||'-01')::date;
  select * into v_version from public.budget_limit_versions
  where plan_id=p_plan_id and profile_id=auth.uid() and effective_from<=v_start
    and (effective_to is null or effective_to>=v_start)
  order by effective_from desc limit 1;
  if v_version.id is null then return null;end if;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,is_active_snapshot)
    values(auth.uid(),p_plan_id,v_version.id,v_start,(v_start+interval '1 month'-interval '1 day')::date,v_version.limit_amount,v_version.is_active)
  on conflict(plan_id,period_start) do update set updated_at=now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_budget_limit_plan_v1(p_plan_id uuid,p_name text,p_scope_type text,p_category_id uuid,p_limit_amount numeric,p_effective_month text,p_alert_thresholds integer[],p_forecast_enabled boolean,p_status text default 'active')
returns uuid language plpgsql security invoker as $$
declare v_plan uuid;v_old public.budget_limit_versions;v_version uuid;v_start date;v_active boolean;
begin
  if p_limit_amount<=0 or p_scope_type not in ('category_l2','category_l3','global_expenses') or p_status not in ('active','inactive') then raise exception 'Invalid budget limit';end if;
  v_start:=(p_effective_month||'-01')::date;v_active:=p_status='active';
  if p_plan_id is null then
    insert into public.budget_limit_plans(profile_id,name,status,inactive_at)
      values(auth.uid(),trim(p_name),p_status,case when not v_active then now() end) returning id into v_plan;
  else
    v_plan:=p_plan_id;
    update public.budget_limit_plans set name=trim(p_name),status=p_status,inactive_at=case when v_active then null else coalesce(inactive_at,now()) end,updated_at=now()
      where id=v_plan and profile_id=auth.uid();
    if not found then raise exception 'Plan not found';end if;
  end if;
  select * into v_old from public.budget_limit_versions where plan_id=v_plan and effective_to is null order by effective_from desc limit 1;
  if v_old.id is not null and v_old.effective_from=v_start then
    update public.budget_limit_versions set limit_amount=p_limit_amount,scope_type=p_scope_type,category_id=p_category_id,alert_thresholds=coalesce(p_alert_thresholds,'{}'),forecast_alert_enabled=p_forecast_enabled,is_active=v_active where id=v_old.id returning id into v_version;
  else
    if v_old.id is not null and v_old.effective_from<v_start then update public.budget_limit_versions set effective_to=v_start-1 where id=v_old.id;end if;
    insert into public.budget_limit_versions(profile_id,plan_id,effective_from,limit_amount,scope_type,category_id,alert_thresholds,forecast_alert_enabled,is_active)
      values(auth.uid(),v_plan,v_start,p_limit_amount,p_scope_type,p_category_id,coalesce(p_alert_thresholds,'{}'),p_forecast_enabled,v_active) returning id into v_version;
    if v_old.id is not null then update public.budget_limit_versions set replaced_by_version_id=v_version where id=v_old.id;end if;
  end if;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,is_active_snapshot)
    values(auth.uid(),v_plan,v_version,v_start,(v_start+interval '1 month'-interval '1 day')::date,p_limit_amount,v_active)
  on conflict(plan_id,period_start) do update set version_id=excluded.version_id,limit_amount_snapshot=excluded.limit_amount_snapshot,is_active_snapshot=excluded.is_active_snapshot,updated_at=now();
  return v_plan;
end $$;

create or replace function public.set_budget_limit_plan_active_v1(p_plan_id uuid,p_active boolean,p_effective_month text,p_limit_amount numeric default null)
returns uuid language plpgsql security invoker as $$
declare v_plan public.budget_limit_plans;v_source public.budget_limit_versions;v_existing public.budget_limit_versions;v_start date;v_version uuid;v_amount numeric;
begin
  v_start:=(p_effective_month||'-01')::date;
  select * into v_plan from public.budget_limit_plans where id=p_plan_id and profile_id=auth.uid() for update;
  if v_plan.id is null then raise exception 'Plan not found';end if;
  select * into v_source from public.budget_limit_versions where plan_id=p_plan_id and effective_from<=v_start order by effective_from desc limit 1;
  if v_source.id is null then select * into v_source from public.budget_limit_versions where plan_id=p_plan_id order by effective_from desc limit 1;end if;
  if v_source.id is null then raise exception 'Limit version not found';end if;
  v_amount:=coalesce(p_limit_amount,v_source.limit_amount);
  select * into v_existing from public.budget_limit_versions where plan_id=p_plan_id and effective_from=v_start limit 1;
  if v_existing.id is not null then
    update public.budget_limit_versions set is_active=p_active,limit_amount=v_amount where id=v_existing.id returning id into v_version;
  else
    update public.budget_limit_versions set effective_to=v_start-1 where plan_id=p_plan_id and effective_from<v_start and (effective_to is null or effective_to>=v_start);
    insert into public.budget_limit_versions(profile_id,plan_id,effective_from,limit_amount,scope_type,category_id,category_ids,period_type,alert_thresholds,forecast_alert_enabled,is_active)
      values(v_plan.profile_id,p_plan_id,v_start,v_amount,v_source.scope_type,v_source.category_id,v_source.category_ids,v_source.period_type,v_source.alert_thresholds,v_source.forecast_alert_enabled,p_active)
      returning id into v_version;
  end if;
  update public.budget_limit_plans set status=case when p_active then 'active' else 'inactive' end,inactive_at=case when p_active then null else coalesce(inactive_at,now()) end,updated_at=now() where id=p_plan_id;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,is_active_snapshot)
    values(v_plan.profile_id,p_plan_id,v_version,v_start,(v_start+interval '1 month'-interval '1 day')::date,v_amount,p_active)
  on conflict(plan_id,period_start) do update set version_id=excluded.version_id,limit_amount_snapshot=excluded.limit_amount_snapshot,is_active_snapshot=excluded.is_active_snapshot,updated_at=now();
  return p_plan_id;
end $$;

grant execute on function public.set_budget_limit_plan_active_v1(uuid,boolean,text,numeric) to authenticated;
