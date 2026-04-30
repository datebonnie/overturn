-- Application user record. Mirrors auth.users one-to-one and binds the
-- Supabase Auth identity to a practice + role.
--
-- The signup flow (server action) creates this row alongside a new practice
-- when the first user signs up; subsequent invited users get added by an
-- admin within an existing practice.

create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  practice_id uuid not null references public.practices(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'owner'
              check (role in ('owner', 'admin', 'biller')),
  created_at  timestamptz not null default now()
);

create index if not exists users_practice_idx on public.users(practice_id);
create unique index if not exists users_email_idx on public.users(lower(email));
