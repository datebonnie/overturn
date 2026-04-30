-- Row-Level Security policies.
-- Tenant isolation is enforced via the auth_practice_id() helper from 0002.
-- Every table containing tenant or PHI data has RLS enabled and policies
-- scoped by practice_id.

alter table public.practices       enable row level security;
alter table public.users           enable row level security;
alter table public.appeals         enable row level security;
alter table public.appeal_documents enable row level security;
alter table public.audit_log       enable row level security;

-- =====================================================================
-- practices
-- Members can read their own practice. Only the service role (via the
-- billing webhook + signup server action) can mutate the row directly.
-- =====================================================================

drop policy if exists practices_select_own on public.practices;
create policy practices_select_own
  on public.practices
  for select
  to authenticated
  using (id = public.auth_practice_id());

drop policy if exists practices_update_own on public.practices;
create policy practices_update_own
  on public.practices
  for update
  to authenticated
  using (id = public.auth_practice_id())
  with check (id = public.auth_practice_id());

-- INSERT and DELETE on practices are reserved for the service role
-- (signup flow, account deletion). No client-facing policy.

-- =====================================================================
-- users
-- Members can see other users in the same practice.
-- A user can update their own row (full_name, email).
-- INSERT/DELETE happen via service-role flows (signup, invite, remove).
-- =====================================================================

drop policy if exists users_select_same_practice on public.users;
create policy users_select_same_practice
  on public.users
  for select
  to authenticated
  using (practice_id = public.auth_practice_id());

drop policy if exists users_update_self on public.users;
create policy users_update_self
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and practice_id = public.auth_practice_id());

-- =====================================================================
-- appeals — full CRUD scoped to caller's practice.
-- =====================================================================

drop policy if exists appeals_select_own on public.appeals;
create policy appeals_select_own
  on public.appeals
  for select
  to authenticated
  using (practice_id = public.auth_practice_id());

drop policy if exists appeals_insert_own on public.appeals;
create policy appeals_insert_own
  on public.appeals
  for insert
  to authenticated
  with check (practice_id = public.auth_practice_id());

drop policy if exists appeals_update_own on public.appeals;
create policy appeals_update_own
  on public.appeals
  for update
  to authenticated
  using (practice_id = public.auth_practice_id())
  with check (practice_id = public.auth_practice_id());

drop policy if exists appeals_delete_own on public.appeals;
create policy appeals_delete_own
  on public.appeals
  for delete
  to authenticated
  using (practice_id = public.auth_practice_id());

-- =====================================================================
-- appeal_documents
-- Members can SELECT and INSERT (upload).
-- UPDATE/DELETE are NOT exposed to clients — purge is system-only via
-- the cron job running with service-role privileges.
-- =====================================================================

drop policy if exists appeal_documents_select_own on public.appeal_documents;
create policy appeal_documents_select_own
  on public.appeal_documents
  for select
  to authenticated
  using (practice_id = public.auth_practice_id());

drop policy if exists appeal_documents_insert_own on public.appeal_documents;
create policy appeal_documents_insert_own
  on public.appeal_documents
  for insert
  to authenticated
  with check (practice_id = public.auth_practice_id());

-- =====================================================================
-- audit_log
-- Members can SELECT their practice's audit trail (read-only).
-- INSERT is blocked from client; only record_audit() (security definer)
-- can write.
-- UPDATE/DELETE never allowed.
-- =====================================================================

drop policy if exists audit_log_select_own on public.audit_log;
create policy audit_log_select_own
  on public.audit_log
  for select
  to authenticated
  using (practice_id = public.auth_practice_id());
