-- Ephemeral pointers to source PHI uploads (denial PDF, chart notes file).
-- Every row carries an expires_at no more than 24 hours after upload; a cron
-- job (defined in 0010_cron.sql) deletes the storage object and the row
-- once expires_at is in the past.
--
-- This is the table that backs the public privacy commitment:
-- "chart notes and denial PDFs are deleted within 24 hours of appeal generation."

create table if not exists public.appeal_documents (
  id                    uuid primary key default extensions.gen_random_uuid(),
  appeal_id             uuid references public.appeals(id) on delete cascade,
  practice_id           uuid not null references public.practices(id) on delete cascade,

  document_type         text not null
                        check (document_type in ('denial_letter', 'chart_notes')),

  supabase_storage_path text not null,
  file_name             text not null,
  file_size_bytes       integer not null check (file_size_bytes > 0),

  uploaded_at           timestamptz not null default now(),
  expires_at            timestamptz not null default now() + interval '24 hours',
  purged_at             timestamptz
);

-- Drives the purge cron in O(log n).
create index if not exists appeal_documents_expiry_idx
  on public.appeal_documents(expires_at)
  where purged_at is null;

create index if not exists appeal_documents_practice_idx
  on public.appeal_documents(practice_id);

create index if not exists appeal_documents_appeal_idx
  on public.appeal_documents(appeal_id)
  where appeal_id is not null;
