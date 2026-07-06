-- Budget limits: deploy the selected-month period repair as a new migration.
-- Existing periods and history are retained; only the selected month's snapshot is synchronized.

create or replace function public.ensure_budget_limit_period_v1(
  p_plan_id uuid,
  p_month text
)
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
  from public.budget_limit_plans plan where plan.id = p_plan_id;
  if v_profile_id is null or not public.is_profile_member(v_profile_id) then
    raise exception using errcode = '42501', message = 'Budget limit plan not found for an accessible profile';
  end if;

  v_start := (p_month || '-01')::date;

  select version.*
  into v_version
  from public.budget_limit_versions version
  where version.plan_id = p_plan_id
    and version.profile_id = v_profile_id
    and version.effective_from <= v_start
    and (version.effective_to is null or version.effective_to >= v_start)
  order by version.effective_from desc
  limit 1;

  if v_version.id is null then
    return null;
  end if;

  insert into public.budget_limit_periods(
    profile_id,
    plan_id,
    version_id,
    period_start,
    period_end,
    limit_amount_snapshot,
    is_active_snapshot
  ) values (
    v_profile_id,
    p_plan_id,
    v_version.id,
    v_start,
    (v_start + interval '1 month' - interval '1 day')::date,
    v_version.limit_amount,
    v_version.is_active
  )
  on conflict(plan_id, period_start) do nothing
  returning id into v_id;

  if v_id is null then
    select period.id into v_id from public.budget_limit_periods period
    where period.plan_id = p_plan_id and period.period_start = v_start;
  end if;

  return v_id;
end
$$;

revoke all on function public.ensure_budget_limit_period_v1(uuid, text) from public;
grant execute on function public.ensure_budget_limit_period_v1(uuid, text) to authenticated;
