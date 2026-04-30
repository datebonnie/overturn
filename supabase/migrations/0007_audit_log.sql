-- Append-only audit log. Every PHI read, every appeal generation, every
-- download writes a row here. Retained for compliance.
--
-- Direct INSERT is disabled by RLS — rows can only be added through the
-- record_audit() security-definer function, which prevents tampering.

create table if not exists public.audit_log (
  id            bigserial primary key,
  practice_id   uuid not null references public.practices(id) on delete cascade,
  user_id       uuid references public.users(id) on delete set null,
  action        text not null,
  target_type   text not null,
  target_id     uuid,
  ip_address    text,
  user_agent    text,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_practice_time_idx
  on public.audit_log(practice_id, created_at desc);

create index if not exists audit_log_target_idx
  on public.audit_log(target_type, target_id)
  where target_id is not null;

-- The only sanctioned way to write an audit_log row. RLS will block
-- direct inserts; this function runs with elevated privileges.
create or replace function public.record_audit(
  p_practice_id uuid,
  p_user_id     uuid,
  p_action      text,
  p_target_type text,
  p_target_id   uuid default null,
  p_ip_address  text default null,
  p_user_agent  text default null,
  p_metadata    jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (
    practice_id, user_id, action, target_type, target_id,
    ip_address, user_agent, metadata
  ) values (
    p_practice_id, p_user_id, p_action, p_target_type, p_target_id,
    p_ip_address, p_user_agent, p_metadata
  );
end;
$$;
