-- Budget limits: use shared profile membership instead of profile_id = auth.uid().
-- Idempotent; no rows or historical snapshots are deleted.

do $$
declare table_name text; operation text;
begin
  foreach table_name in array array['budget_limit_plans','budget_limit_versions','budget_limit_periods','budget_limit_alerts'] loop
    foreach operation in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', table_name || '_' || operation || '_own', table_name);
      if operation = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name);
      elsif operation = 'update' then
        execute format('create policy %I on public.%I for update to authenticated using (public.is_profile_member(profile_id)) with check (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name);
      else
        execute format('create policy %I on public.%I for %s to authenticated using (public.is_profile_member(profile_id))', table_name || '_' || operation || '_own', table_name, operation);
      end if;
    end loop;
  end loop;
end
$$;

-- Repair only rows whose target shared profile can be inferred without ambiguity.
do $$
declare repair record;
begin
  for repair in
    select plan.id as plan_id,
      coalesce(
        legacy.profile_id,
        category.profile_id,
        membership.profile_id
      ) as target_profile_id
    from public.budget_limit_plans plan
    left join public.budget_limits legacy on legacy.id = plan.legacy_budget_limit_id
    left join lateral (
      select c.profile_id
      from public.budget_limit_versions version
      join public.categories c on c.id = version.category_id
      where version.plan_id = plan.id
      limit 1
    ) category on true
    left join lateral (
      select min(pu.profile_id::text)::uuid as profile_id
      from public.profile_users pu
      where pu.user_id = plan.profile_id
      having count(*) = 1
    ) membership on true
    where not exists (select 1 from public.profiles p where p.id = plan.profile_id)
  loop
    if repair.target_profile_id is not null then
      update public.budget_limit_alerts set profile_id = repair.target_profile_id where plan_id = repair.plan_id;
      update public.budget_limit_periods set profile_id = repair.target_profile_id where plan_id = repair.plan_id;
      update public.budget_limit_versions set profile_id = repair.target_profile_id where plan_id = repair.plan_id;
      update public.budget_limit_plans set profile_id = repair.target_profile_id where id = repair.plan_id;
    end if;
  end loop;
end
$$;

create or replace function public.ensure_budget_limit_period_v1(p_plan_id uuid, p_month text)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_profile_id uuid;
  v_start date;
  v_version public.budget_limit_versions;
  v_id uuid;
begin
  if p_month is null or p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Invalid budget limit month';
  end if;

  select plan.profile_id into v_profile_id
  from public.budget_limit_plans plan
  where plan.id = p_plan_id;

  if v_profile_id is null or not public.is_profile_member(v_profile_id) then
    raise exception using errcode = '42501', message = 'Budget limit plan not found for an accessible profile';
  end if;

  v_start := (p_month || '-01')::date;
  select version.* into v_version
  from public.budget_limit_versions version
  where version.plan_id = p_plan_id
    and version.profile_id = v_profile_id
    and version.effective_from <= v_start
    and (version.effective_to is null or version.effective_to >= v_start)
  order by version.effective_from desc limit 1;

  if v_version.id is null then return null; end if;

  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,is_active_snapshot)
  values(v_profile_id,p_plan_id,v_version.id,v_start,(v_start+interval '1 month'-interval '1 day')::date,v_version.limit_amount,v_version.is_active)
  on conflict(plan_id,period_start) do nothing
  returning id into v_id;

  if v_id is null then
    select period.id into v_id from public.budget_limit_periods period
    where period.plan_id = p_plan_id and period.period_start = v_start;
  end if;
  return v_id;
end
$$;

create or replace function public.save_budget_limit_plan_v2(
  p_profile_id uuid,p_plan_id uuid,p_name text,p_scope_type text,p_category_id uuid,
  p_limit_amount numeric,p_effective_month text,p_alert_thresholds integer[],
  p_forecast_enabled boolean,p_status text default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_plan uuid;v_old public.budget_limit_versions;v_version uuid;v_start date;v_active boolean;
begin
  if not public.is_profile_member(p_profile_id) then raise exception using errcode='42501',message='Profile membership required';end if;
  if p_limit_amount<=0 or p_scope_type not in ('category_l2','category_l3','global_expenses') or p_status not in ('active','inactive') then raise exception 'Invalid budget limit';end if;
  if p_effective_month is null or p_effective_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then raise exception 'Invalid budget limit month';end if;
  if p_category_id is not null and not exists(select 1 from public.categories c where c.id=p_category_id and c.profile_id=p_profile_id) then raise exception 'Category does not belong to profile';end if;
  v_start:=(p_effective_month||'-01')::date;v_active:=p_status='active';
  if p_plan_id is null then
    insert into public.budget_limit_plans(profile_id,name,status,inactive_at) values(p_profile_id,trim(p_name),p_status,case when not v_active then now() end) returning id into v_plan;
  else
    v_plan:=p_plan_id;
    update public.budget_limit_plans set name=trim(p_name),status=p_status,inactive_at=case when v_active then null else coalesce(inactive_at,now()) end,updated_at=now()
    where id=v_plan and profile_id=p_profile_id;
    if not found then raise exception 'Plan not found';end if;
  end if;
  select * into v_old from public.budget_limit_versions where plan_id=v_plan and profile_id=p_profile_id and effective_to is null order by effective_from desc limit 1;
  if v_old.id is not null and v_old.effective_from=v_start then
    update public.budget_limit_versions set limit_amount=p_limit_amount,scope_type=p_scope_type,category_id=p_category_id,alert_thresholds=coalesce(p_alert_thresholds,'{}'),forecast_alert_enabled=p_forecast_enabled,is_active=v_active where id=v_old.id returning id into v_version;
  else
    if v_old.id is not null and v_old.effective_from<v_start then update public.budget_limit_versions set effective_to=v_start-1 where id=v_old.id;end if;
    insert into public.budget_limit_versions(profile_id,plan_id,effective_from,limit_amount,scope_type,category_id,alert_thresholds,forecast_alert_enabled,is_active)
    values(p_profile_id,v_plan,v_start,p_limit_amount,p_scope_type,p_category_id,coalesce(p_alert_thresholds,'{}'),p_forecast_enabled,v_active) returning id into v_version;
    if v_old.id is not null then update public.budget_limit_versions set replaced_by_version_id=v_version where id=v_old.id;end if;
  end if;
  insert into public.budget_limit_periods(profile_id,plan_id,version_id,period_start,period_end,limit_amount_snapshot,is_active_snapshot)
  values(p_profile_id,v_plan,v_version,v_start,(v_start+interval '1 month'-interval '1 day')::date,p_limit_amount,v_active)
  on conflict(plan_id,period_start) do update set version_id=excluded.version_id,limit_amount_snapshot=excluded.limit_amount_snapshot,is_active_snapshot=excluded.is_active_snapshot,updated_at=now()
  where budget_limit_periods.status='open';
  return v_plan;
end
$$;

create or replace function public.set_budget_limit_plan_active_v1(
  p_plan_id uuid,p_active boolean,p_effective_month text,p_limit_amount numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_plan public.budget_limit_plans;v_source public.budget_limit_versions;v_existing public.budget_limit_versions;v_start date;v_version uuid;v_amount numeric;
begin
  if p_effective_month is null or p_effective_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then raise exception 'Invalid budget limit month';end if;
  v_start:=(p_effective_month||'-01')::date;
  select * into v_plan from public.budget_limit_plans where id=p_plan_id for update;
  if v_plan.id is null or not public.is_profile_member(v_plan.profile_id) then raise exception using errcode='42501',message='Plan not found for an accessible profile';end if;
  select * into v_source from public.budget_limit_versions where plan_id=p_plan_id and profile_id=v_plan.profile_id and effective_from<=v_start order by effective_from desc limit 1;
  if v_source.id is null then select * into v_source from public.budget_limit_versions where plan_id=p_plan_id and profile_id=v_plan.profile_id order by effective_from desc limit 1;end if;
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
  on conflict(plan_id,period_start) do update set version_id=excluded.version_id,limit_amount_snapshot=excluded.limit_amount_snapshot,is_active_snapshot=excluded.is_active_snapshot,updated_at=now()
  where budget_limit_periods.status='open';
  return p_plan_id;
end
$$;

revoke all on function public.ensure_budget_limit_period_v1(uuid,text) from public;
grant execute on function public.ensure_budget_limit_period_v1(uuid,text) to authenticated;
revoke all on function public.save_budget_limit_plan_v2(uuid,uuid,text,text,uuid,numeric,text,integer[],boolean,text) from public;
grant execute on function public.save_budget_limit_plan_v2(uuid,uuid,text,text,uuid,numeric,text,integer[],boolean,text) to authenticated;
revoke all on function public.set_budget_limit_plan_active_v1(uuid,boolean,text,numeric) from public;
grant execute on function public.set_budget_limit_plan_active_v1(uuid,boolean,text,numeric) to authenticated;
