-- PROPOZYCJA MIGRACJI - NIEURUCHAMIANA AUTOMATYCZNIE
-- Cel:
-- 1. Dane publiczne użytkownika do profilu i listy członków.
-- 2. Ikona kategorii dla Level 2 / Level 3.
--
-- Przed uruchomieniem sprawdzić istniejące polityki RLS i indeksy w środowisku Supabase.

create table if not exists public.user_public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text null,
  avatar_key text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_public_profiles_display_name_length
    check (display_name is null or char_length(display_name) between 1 and 48),
  constraint user_public_profiles_avatar_key_length
    check (avatar_key is null or char_length(avatar_key) <= 64)
);

create or replace function public.set_user_public_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_public_profiles_set_updated_at on public.user_public_profiles;
create trigger user_public_profiles_set_updated_at
before update on public.user_public_profiles
for each row
execute function public.set_user_public_profiles_updated_at();

alter table public.user_public_profiles enable row level security;

drop policy if exists user_public_profiles_select_profile_members on public.user_public_profiles;
create policy user_public_profiles_select_profile_members
on public.user_public_profiles
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profile_users current_member
    join public.profile_users viewed_member
      on viewed_member.profile_id = current_member.profile_id
    where current_member.user_id = auth.uid()
      and viewed_member.user_id = user_public_profiles.user_id
  )
);

drop policy if exists user_public_profiles_insert_own on public.user_public_profiles;
create policy user_public_profiles_insert_own
on public.user_public_profiles
for insert
with check (user_id = auth.uid());

drop policy if exists user_public_profiles_update_own on public.user_public_profiles;
create policy user_public_profiles_update_own
on public.user_public_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

alter table public.categories
  add column if not exists icon_key text null;

alter table public.categories
  drop constraint if exists categories_icon_key_length;

alter table public.categories
  add constraint categories_icon_key_length
  check (icon_key is null or char_length(icon_key) <= 64);

create index if not exists categories_profile_icon_idx
  on public.categories (profile_id, icon_key)
  where icon_key is not null;
