-- BudzAppka recurring payments, stage 2.5. Additive only.

alter table public.recurring_loan_terms
  add column if not exists installment_count integer null check (installment_count > 0);

create table if not exists public.recurring_payment_history (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null,
  plan_id uuid not null references public.recurring_transactions(id) on delete cascade,
  occurrence_id uuid null references public.recurring_payment_occurrences(id) on delete set null,
  event_type text not null, payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists recurring_payment_history_plan_idx
  on public.recurring_payment_history(profile_id, plan_id, created_at desc);
alter table public.recurring_payment_history enable row level security;
drop policy if exists recurring_payment_history_select_own on public.recurring_payment_history;
create policy recurring_payment_history_select_own on public.recurring_payment_history
  for select using (auth.uid() = profile_id);
drop policy if exists recurring_payment_history_insert_own on public.recurring_payment_history;
create policy recurring_payment_history_insert_own on public.recurring_payment_history
  for insert with check (auth.uid() = profile_id);

create or replace function public.log_recurring_occurrence_change()
returns trigger language plpgsql security invoker as $$
begin
  if old.status is distinct from new.status or old.snoozed_until is distinct from new.snoozed_until then
    insert into public.recurring_payment_history(profile_id,plan_id,occurrence_id,event_type,payload)
    values(new.profile_id,new.plan_id,new.id,'occurrence_changed',jsonb_build_object('old_status',old.status,'new_status',new.status,'snoozed_until',new.snoozed_until));
  end if;
  return new;
end $$;
drop trigger if exists recurring_occurrence_history on public.recurring_payment_occurrences;
create trigger recurring_occurrence_history after update on public.recurring_payment_occurrences
for each row execute function public.log_recurring_occurrence_change();

create or replace function public.sync_installment_occurrence_amounts(
  p_plan_id uuid, p_amounts numeric[]
) returns void language plpgsql security invoker as $$
declare v_profile uuid;
begin
  select profile_id into v_profile from public.recurring_transactions where id=p_plan_id and profile_id=auth.uid();
  if v_profile is null then raise exception 'Plan not found'; end if;
  update public.recurring_payment_occurrences occurrence
  set planned_amount=p_amounts[occurrence.sequence_number],updated_at=now()
  where occurrence.plan_id=p_plan_id and occurrence.status='pending' and not occurrence.is_amount_locked
    and occurrence.sequence_number between 1 and coalesce(array_length(p_amounts,1),0);
end $$;

create or replace function public.apply_recurring_schedule_decision(
  p_occurrence_id uuid, p_kind text, p_decision text, p_actual_amount numeric default null
) returns void language plpgsql security invoker as $$
declare v_occ public.recurring_payment_occurrences; v_plan public.recurring_transactions;
  v_last public.recurring_payment_occurrences; v_due date; v_excess numeric; v_count integer;
begin
  select * into v_occ from public.recurring_payment_occurrences where id=p_occurrence_id and profile_id=auth.uid();
  if v_occ.id is null then raise exception 'Occurrence not found'; end if;
  select * into v_plan from public.recurring_transactions where id=v_occ.plan_id and profile_id=auth.uid();

  if p_kind='amount_mismatch' and p_decision='change_from_next_occurrence' then
    if p_actual_amount is null or p_actual_amount <= 0 then raise exception 'Actual amount required'; end if;
    update public.recurring_payment_occurrences set planned_amount=p_actual_amount,updated_at=now()
      where plan_id=v_occ.plan_id and sequence_number>v_occ.sequence_number and status='pending' and not is_amount_locked;
    update public.recurring_transactions set amount=p_actual_amount,updated_at=now() where id=v_occ.plan_id;
  elsif p_kind='skip' and p_decision='append_at_end' then
    select * into v_last from public.recurring_payment_occurrences where plan_id=v_occ.plan_id order by sequence_number desc limit 1;
    v_due := case v_plan.cadence_unit when 'day' then v_last.due_date+v_plan.cadence_interval
      when 'week' then v_last.due_date+(v_plan.cadence_interval*7)
      when 'year' then (v_last.due_date+make_interval(years=>v_plan.cadence_interval))::date
      else (v_last.due_date+make_interval(months=>v_plan.cadence_interval))::date end;
    insert into public.recurring_payment_occurrences(profile_id,plan_id,sequence_number,due_date,planned_amount,schedule_revision)
      values(v_occ.profile_id,v_occ.plan_id,v_last.sequence_number+1,v_due,v_last.planned_amount,v_last.schedule_revision+1);
  elsif p_kind='overpayment' and p_decision='reduce_future_installments' then
    v_excess := greatest(coalesce(p_actual_amount,0)-coalesce(v_occ.planned_amount,0),0);
    select count(*) into v_count from public.recurring_payment_occurrences
      where plan_id=v_occ.plan_id and sequence_number>v_occ.sequence_number and status='pending' and not is_amount_locked;
    if v_count>0 and v_excess>0 then
      update public.recurring_payment_occurrences set planned_amount=greatest(planned_amount-(v_excess/v_count),0),updated_at=now()
        where plan_id=v_occ.plan_id and sequence_number>v_occ.sequence_number and status='pending' and not is_amount_locked and planned_amount is not null;
    end if;
  elsif p_decision not in ('this_occurrence_only','keep_schedule') then
    raise exception 'Decision requires manual schedule editor';
  end if;

  insert into public.recurring_payment_history(profile_id,plan_id,occurrence_id,event_type,payload)
    values(v_occ.profile_id,v_occ.plan_id,v_occ.id,p_kind,jsonb_build_object('decision',p_decision,'actual_amount',p_actual_amount));
end $$;
