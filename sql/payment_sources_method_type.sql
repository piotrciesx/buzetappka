-- Additive, idempotent payment source method classification.
alter table public.payment_sources
  add column if not exists payment_method_type text not null default 'other';

update public.payment_sources
set payment_method_type = 'other'
where payment_method_type is null
   or payment_method_type not in (
     'cash', 'card', 'bank_transfer', 'quick_payment',
     'gift_card', 'app_wallet', 'other'
   );

alter table public.payment_sources
  drop constraint if exists payment_sources_payment_method_type_check;

alter table public.payment_sources
  add constraint payment_sources_payment_method_type_check
  check (payment_method_type in (
    'cash', 'card', 'bank_transfer', 'quick_payment',
    'gift_card', 'app_wallet', 'other'
  )) not valid;

create index if not exists payment_sources_profile_method_idx
  on public.payment_sources(profile_id, payment_method_type, archived_at);
