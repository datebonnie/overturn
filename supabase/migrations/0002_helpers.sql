-- Generic updated_at trigger function used by every table that tracks updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Resolves the caller's practice_id from the users table.
-- Used by every RLS policy that scopes by tenant.
-- security definer + locked search_path so it can read users even when called
-- inside a row-level-security context.
-- Uses plpgsql (not sql) so the function body's reference to public.users
-- isn't bound at creation time — the users table is defined in a later
-- migration in this run.
create or replace function public.auth_practice_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  select practice_id into pid from public.users where id = auth.uid();
  return pid;
end;
$$;
