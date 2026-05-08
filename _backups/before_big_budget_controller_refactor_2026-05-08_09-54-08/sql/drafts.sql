create extension if not exists pgcrypto;

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid()
);

alter table public.drafts
  add column if not exists profile_id uuid,
  add column if not exists draft_type text,
  add column if not exists level1_id uuid,
  add column if not exists level2_id uuid,
  add column if not exists category_id uuid,
  add column if not exists amount text,
  add column if not exists description text,
  add column if not exists date date,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.drafts
  alter column id set default gen_random_uuid(),
  alter column profile_id set not null,
  alter column draft_type set not null,
  alter column updated_at set default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'drafts_draft_type_check'
      and conrelid = 'public.drafts'::regclass
  ) then
    alter table public.drafts
      add constraint drafts_draft_type_check
      check (draft_type in ('income', 'expense'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'drafts_profile_id_draft_type_key'
      and conrelid = 'public.drafts'::regclass
  ) then
    alter table public.drafts
      add constraint drafts_profile_id_draft_type_key
      unique (profile_id, draft_type);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'drafts_category_id_fkey'
      and conrelid = 'public.drafts'::regclass
  ) then
    alter table public.drafts
      add constraint drafts_category_id_fkey
      foreign key (category_id)
      references public.categories (id)
      on delete set null;
  end if;
end
$$;

create index if not exists drafts_profile_updated_at_idx
  on public.drafts (profile_id, updated_at desc);

create index if not exists drafts_category_id_idx
  on public.drafts (category_id);

create or replace function public.touch_drafts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists drafts_set_updated_at on public.drafts;

create trigger drafts_set_updated_at
before update on public.drafts
for each row
execute function public.touch_drafts_updated_at();

alter table public.drafts enable row level security;

drop policy if exists "drafts_select_own" on public.drafts;
create policy "drafts_select_own"
on public.drafts
for select
using (auth.uid() = profile_id);

drop policy if exists "drafts_insert_own" on public.drafts;
create policy "drafts_insert_own"
on public.drafts
for insert
with check (auth.uid() = profile_id);

drop policy if exists "drafts_update_own" on public.drafts;
create policy "drafts_update_own"
on public.drafts
for update
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

drop policy if exists "drafts_delete_own" on public.drafts;
create policy "drafts_delete_own"
on public.drafts
for delete
using (auth.uid() = profile_id);

-- DEV SAFE:
-- Ten wariant zakłada prosty model: użytkownik widzi i zapisuje tylko własne szkice
-- po profile_id = auth.uid(). Nie podpinałem tego do profile_users, bo w tym projekcie
-- nie ma tu wystarczającego kontekstu do bezpiecznego spięcia członkostwa.
