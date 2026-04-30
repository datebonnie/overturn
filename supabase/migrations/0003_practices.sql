-- Multi-tenant root. Every PHI-bearing row carries practice_id for RLS scoping.

create table if not exists public.practices (
  id                     uuid primary key default extensions.gen_random_uuid(),
  name                   text not null,
  address                text,
  phone                  text,
  npi                    text,
  -- TIN is sensitive but not PHI. v1: plain text.
  -- TODO: migrate to pgsodium-managed column-level encryption before
  -- accepting first paying customer.
  tin                    text,
  specialty              text,
  subscription_status    text not null default 'trial'
                         check (subscription_status in (
                           'trial', 'active', 'past_due', 'cancelled'
                         )),
  trial_ends_at          timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists practices_stripe_customer_idx
  on public.practices(stripe_customer_id)
  where stripe_customer_id is not null;

drop trigger if exists practices_set_updated_at on public.practices;
create trigger practices_set_updated_at
  before update on public.practices
  for each row execute function public.set_updated_at();
