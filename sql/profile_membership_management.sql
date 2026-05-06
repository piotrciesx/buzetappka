create table if not exists public.profile_users (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (profile_id, user_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_users_role_check'
  ) then
    alter table public.profile_users
      add constraint profile_users_role_check
      check (role in ('owner', 'member'));
  end if;
end $$;

create index if not exists profile_users_user_id_idx
  on public.profile_users (user_id, created_at);

create table if not exists public.profile_invitations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique default gen_random_uuid()::text,
  invited_email text null,
  role text not null default 'member',
  created_by uuid not null references auth.users(id) on delete cascade,
  accepted_by uuid null references auth.users(id) on delete set null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_invitations_role_check'
  ) then
    alter table public.profile_invitations
      add constraint profile_invitations_role_check
      check (role in ('member'));
  end if;
end $$;

create index if not exists profile_invitations_profile_id_idx
  on public.profile_invitations (profile_id, created_at desc);

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

create or replace function public.is_profile_owner(check_profile_id uuid)
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
      and profile_users.role = 'owner'
  );
$$;

create or replace function public.ensure_default_profile_categories(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_month_start date := date_trunc('month', now())::date;
  has_active_from boolean;
begin
  if auth.uid() is null then
    raise exception 'Brak aktywnego użytkownika.';
  end if;

  if target_profile_id is null then
    raise exception 'Brak profilu budżetu.';
  end if;

  if not public.is_profile_member(target_profile_id) then
    raise exception 'Brak dostępu do profilu budżetu.';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'active_from'
  )
  into has_active_from;

  if has_active_from then
    execute $insert_income$
      insert into public.categories (
        profile_id,
        name,
        parent_id,
        level,
        is_active,
        sort_order,
        active_from,
        active_to
      )
      select $1, 'Przychody', null, 1, true, 1, $2, null
      where not exists (
        select 1
        from public.categories
        where profile_id = $1
          and parent_id is null
          and level = 1
          and lower(name) = lower('Przychody')
      )
    $insert_income$
    using target_profile_id, current_month_start;

    execute $insert_expense$
      insert into public.categories (
        profile_id,
        name,
        parent_id,
        level,
        is_active,
        sort_order,
        active_from,
        active_to
      )
      select $1, 'Wydatki', null, 1, true, 2, $2, null
      where not exists (
        select 1
        from public.categories
        where profile_id = $1
          and parent_id is null
          and level = 1
          and lower(name) = lower('Wydatki')
      )
    $insert_expense$
    using target_profile_id, current_month_start;
  else
    insert into public.categories (
      profile_id,
      name,
      parent_id,
      level,
      is_active,
      sort_order,
      active_to
    )
    select target_profile_id, 'Przychody', null, 1, true, 1, null
    where not exists (
      select 1
      from public.categories
      where profile_id = target_profile_id
        and parent_id is null
        and level = 1
        and lower(name) = lower('Przychody')
    );

    insert into public.categories (
      profile_id,
      name,
      parent_id,
      level,
      is_active,
      sort_order,
      active_to
    )
    select target_profile_id, 'Wydatki', null, 1, true, 2, null
    where not exists (
      select 1
      from public.categories
      where profile_id = target_profile_id
        and parent_id is null
        and level = 1
        and lower(name) = lower('Wydatki')
    );
  end if;

  update public.categories
  set is_active = true,
      active_to = null,
      sort_order = case
        when lower(name) = lower('Przychody') then 1
        when lower(name) = lower('Wydatki') then 2
        else sort_order
      end
  where profile_id = target_profile_id
    and parent_id is null
    and level = 1
    and lower(name) in (lower('Przychody'), lower('Wydatki'));
end;
$$;

create or replace function public.create_first_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Brak aktywnego użytkownika.';
  end if;

  select profile_id
  into new_profile_id
  from public.profile_users
  where user_id = auth.uid()
  order by created_at asc
  limit 1;

  if new_profile_id is not null then
    perform public.ensure_default_profile_categories(new_profile_id);
    return new_profile_id;
  end if;

  insert into public.profiles (name)
  values ('Mój budżet')
  returning id into new_profile_id;

  insert into public.profile_users (profile_id, user_id, role)
  values (new_profile_id, auth.uid(), 'owner');

  perform public.ensure_default_profile_categories(new_profile_id);

  return new_profile_id;
end;
$$;

create or replace function public.get_profile_invitation_status(invitation_token text)
returns table (
  profile_id uuid,
  is_current_member boolean,
  is_accepted boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    profile_invitations.profile_id,
    exists (
      select 1
      from public.profile_users
      where profile_users.profile_id = profile_invitations.profile_id
        and profile_users.user_id = auth.uid()
    ) as is_current_member,
    profile_invitations.accepted_at is not null as is_accepted
  from public.profile_invitations
  where profile_invitations.token = invitation_token
  limit 1;
$$;

create or replace function public.create_profile_invitation(
  target_profile_id uuid,
  target_invited_email text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_invited_email text := nullif(lower(trim(target_invited_email)), '');
  invited_user_id uuid;
  new_token text;
begin
  if auth.uid() is null then
    raise exception 'Zaloguj się, aby utworzyć zaproszenie.';
  end if;

  if target_profile_id is null then
    raise exception 'Brak aktywnego profilu.';
  end if;

  if not public.is_profile_owner(target_profile_id) then
    raise exception 'Tylko owner może tworzyć zaproszenia.';
  end if;

  if normalized_invited_email is not null then
    select id
    into invited_user_id
    from auth.users
    where lower(email) = normalized_invited_email
    limit 1;

    if invited_user_id is not null and exists (
      select 1
      from public.profile_users
      where profile_users.profile_id = target_profile_id
        and profile_users.user_id = invited_user_id
    ) then
      raise exception 'To konto już należy do tego profilu.';
    end if;
  end if;

  insert into public.profile_invitations (
    profile_id,
    invited_email,
    created_by,
    role
  )
  values (
    target_profile_id,
    normalized_invited_email,
    auth.uid(),
    'member'
  )
  returning token into new_token;

  return new_token;
end;
$$;

create or replace function public.accept_profile_invitation(invitation_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record public.profile_invitations%rowtype;
  user_email text;
begin
  if auth.uid() is null then
    raise exception 'Zaloguj się, aby zaakceptować zaproszenie.';
  end if;

  select *
  into invitation_record
  from public.profile_invitations
  where token = invitation_token
    and accepted_at is null
  limit 1;

  if invitation_record.id is null then
    raise exception 'Zaproszenie jest nieprawidłowe albo zostało już użyte.';
  end if;

  select email
  into user_email
  from auth.users
  where id = auth.uid();

  if invitation_record.invited_email is not null
    and lower(invitation_record.invited_email) <> lower(coalesce(user_email, '')) then
    raise exception 'To zaproszenie jest przypisane do innego adresu email.';
  end if;

  if exists (
    select 1
    from public.profile_users
    where profile_id = invitation_record.profile_id
      and user_id = auth.uid()
  ) then
    return invitation_record.profile_id;
  end if;

  insert into public.profile_users (profile_id, user_id, role)
  values (invitation_record.profile_id, auth.uid(), 'member')
  on conflict (profile_id, user_id)
  do update set role = public.profile_users.role;

  update public.profile_invitations
  set accepted_by = auth.uid(),
      accepted_at = now()
  where id = invitation_record.id;

  return invitation_record.profile_id;
end;
$$;

create or replace function public.remove_profile_member(
  target_profile_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Brak aktywnego użytkownika.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Użyj opuszczenia profilu dla własnego członkostwa.';
  end if;

  if not public.is_profile_owner(target_profile_id) then
    raise exception 'Tylko owner może usunąć członka profilu.';
  end if;

  if not exists (
    select 1
    from public.profile_users
    where profile_id = target_profile_id
      and user_id = target_user_id
      and role = 'member'
  ) then
    raise exception 'Można usunąć tylko członka z rolą member.';
  end if;

  delete from public.profile_users
  where profile_id = target_profile_id
    and user_id = target_user_id
    and role = 'member';
end;
$$;

create or replace function public.leave_profile(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
begin
  if auth.uid() is null then
    raise exception 'Brak aktywnego użytkownika.';
  end if;

  select role
  into current_role
  from public.profile_users
  where profile_id = target_profile_id
    and user_id = auth.uid();

  if current_role is null then
    raise exception 'Nie należysz do tego profilu.';
  end if;

  if current_role = 'owner' then
    raise exception 'Owner nie może opuścić profilu bez przekazania roli.';
  end if;

  delete from public.profile_users
  where profile_id = target_profile_id
    and user_id = auth.uid()
    and role = 'member';
end;
$$;

create or replace function public.transfer_profile_ownership(
  target_profile_id uuid,
  next_owner_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'Brak aktywnego użytkownika.';
  end if;

  if next_owner_user_id = auth.uid() then
    raise exception 'Nie możesz przekazać ownera samemu sobie.';
  end if;

  if not public.is_profile_owner(target_profile_id) then
    raise exception 'Tylko owner może przekazać rolę ownera.';
  end if;

  if not exists (
    select 1
    from public.profile_users
    where profile_id = target_profile_id
      and user_id = next_owner_user_id
      and role = 'member'
  ) then
    raise exception 'Nowy owner musi być członkiem profilu z rolą member.';
  end if;

  update public.profile_users
  set role = case
    when user_id = auth.uid() then 'member'
    when user_id = next_owner_user_id then 'owner'
    else role
  end
  where profile_id = target_profile_id
    and user_id in (auth.uid(), next_owner_user_id);

  get diagnostics updated_count = row_count;

  if updated_count <> 2 then
    raise exception 'Nie udało się przekazać roli ownera.';
  end if;
end;
$$;

alter table public.profile_users enable row level security;
alter table public.profile_invitations enable row level security;

drop policy if exists profile_users_select_members on public.profile_users;
create policy profile_users_select_members
on public.profile_users
for select
using (public.is_profile_member(profile_id));

drop policy if exists profile_invitations_select_owner on public.profile_invitations;
create policy profile_invitations_select_owner
on public.profile_invitations
for select
using (public.is_profile_owner(profile_id));

drop policy if exists profile_invitations_insert_owner on public.profile_invitations;
create policy profile_invitations_insert_owner
on public.profile_invitations
for insert
with check (
  public.is_profile_owner(profile_id)
  and created_by = auth.uid()
  and role = 'member'
);
