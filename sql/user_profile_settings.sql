create table if not exists public.user_profile_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null,
  visible_modules jsonb not null default '{}'::jsonb,
  theme text not null default 'system',
  currency text not null default 'PLN',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, user_id)
);

create or replace function public.set_user_profile_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profile_settings_set_updated_at on public.user_profile_settings;
create trigger user_profile_settings_set_updated_at
before update on public.user_profile_settings
for each row
execute function public.set_user_profile_settings_updated_at();

alter table public.user_profile_settings enable row level security;

drop policy if exists user_profile_settings_select_own on public.user_profile_settings;
create policy user_profile_settings_select_own
on public.user_profile_settings
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = user_profile_settings.profile_id
      and profile_users.user_id = auth.uid()
  )
);

drop policy if exists user_profile_settings_insert_own on public.user_profile_settings;
create policy user_profile_settings_insert_own
on public.user_profile_settings
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = user_profile_settings.profile_id
      and profile_users.user_id = auth.uid()
  )
);

drop policy if exists user_profile_settings_update_own on public.user_profile_settings;
create policy user_profile_settings_update_own
on public.user_profile_settings
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = user_profile_settings.profile_id
      and profile_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = user_profile_settings.profile_id
      and profile_users.user_id = auth.uid()
  )
);

drop policy if exists user_profile_settings_delete_own on public.user_profile_settings;
create policy user_profile_settings_delete_own
on public.user_profile_settings
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profile_users
    where profile_users.profile_id = user_profile_settings.profile_id
      and profile_users.user_id = auth.uid()
  )
);
