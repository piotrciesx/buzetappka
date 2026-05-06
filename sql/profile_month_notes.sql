create table if not exists public.profile_month_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  note text not null default '',
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, month)
);

create or replace function public.set_profile_month_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profile_month_notes_set_updated_at on public.profile_month_notes;
create trigger profile_month_notes_set_updated_at
before update on public.profile_month_notes
for each row
execute function public.set_profile_month_notes_updated_at();

create or replace function public.is_profile_member(check_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = check_profile_id
      and profile_users.user_id = auth.uid()
  );
$$;

alter table public.profile_month_notes enable row level security;

drop policy if exists profile_month_notes_select_members on public.profile_month_notes;
create policy profile_month_notes_select_members
on public.profile_month_notes
for select
using (public.is_profile_member(profile_id));

drop policy if exists profile_month_notes_insert_members on public.profile_month_notes;
create policy profile_month_notes_insert_members
on public.profile_month_notes
for insert
with check (public.is_profile_member(profile_id));

drop policy if exists profile_month_notes_update_members on public.profile_month_notes;
create policy profile_month_notes_update_members
on public.profile_month_notes
for update
using (public.is_profile_member(profile_id))
with check (public.is_profile_member(profile_id));

drop policy if exists profile_month_notes_delete_members on public.profile_month_notes;
create policy profile_month_notes_delete_members
on public.profile_month_notes
for delete
using (public.is_profile_member(profile_id));
