-- Minimalna migracja dla logowania loginem albo emailem.
-- Uruchom w Supabase SQL Editor przed wdrożeniem nowego auth flow.

create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  created_at timestamptz default now(),
  constraint user_accounts_username_length
    check (char_length(username) >= 3),
  constraint user_accounts_username_format
    check (username ~ '^[A-Za-z0-9._-]+$')
);

create unique index if not exists user_accounts_user_id_key
  on public.user_accounts (user_id);

create unique index if not exists user_accounts_email_key
  on public.user_accounts (email);

alter table public.user_accounts enable row level security;

drop policy if exists user_accounts_select_own on public.user_accounts;
create policy user_accounts_select_own
on public.user_accounts
for select
using (user_id = auth.uid());

drop policy if exists user_accounts_insert_own on public.user_accounts;
create policy user_accounts_insert_own
on public.user_accounts
for insert
with check (user_id = auth.uid());

drop policy if exists user_accounts_update_own on public.user_accounts;
create policy user_accounts_update_own
on public.user_accounts
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.get_email_for_username(username_input text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select user_accounts.email
  from public.user_accounts
  where user_accounts.username = lower(trim(username_input))
  limit 1;
$$;

grant execute on function public.get_email_for_username(text) to anon, authenticated;

create or replace function public.is_email_registered(email_input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where lower(auth.users.email) = lower(trim(email_input))
  )
  or exists (
    select 1
    from public.user_accounts
    where user_accounts.email = lower(trim(email_input))
  );
$$;

grant execute on function public.is_email_registered(text) to anon, authenticated;

create or replace function public.register_user_account(
  user_id_input uuid,
  email_input text,
  username_input text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(email_input));
  normalized_username text := lower(trim(username_input));
begin
  if normalized_username is null
    or char_length(normalized_username) < 3
    or normalized_username !~ '^[A-Za-z0-9._-]+$'
  then
    raise exception 'Nieprawidłowy login.';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'Nieprawidłowy email.';
  end if;

  if exists (
    select 1
    from public.user_accounts
    where user_accounts.username = normalized_username
      and user_accounts.user_id <> user_id_input
  ) then
    raise exception 'Ten login jest już zajęty.';
  end if;

  if exists (
    select 1
    from public.user_accounts
    where user_accounts.email = normalized_email
      and user_accounts.user_id <> user_id_input
  ) then
    raise exception 'Ten adres email jest już użyty.';
  end if;

  if exists (
    select 1
    from auth.users
    where auth.users.id <> user_id_input
      and lower(auth.users.email) = normalized_email
  ) then
    raise exception 'Ten adres email jest już użyty.';
  end if;

  if not exists (
    select 1
    from auth.users
    where auth.users.id = user_id_input
      and lower(auth.users.email) = normalized_email
  ) then
    raise exception 'Nie znaleziono użytkownika auth dla podanego emaila.';
  end if;

  insert into public.user_accounts (user_id, email, username)
  values (user_id_input, normalized_email, normalized_username)
  on conflict (user_id)
  do update set
    email = excluded.email,
    username = excluded.username;
end;
$$;

grant execute on function public.register_user_account(uuid, text, text) to anon, authenticated;
