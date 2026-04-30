-- Durable record of a generated appeal. Survives for the life of the practice
-- account. Source documents (denial PDF, chart notes) live in appeal_documents
-- with a 24-hour TTL; this row is the authored output the practice approved.

create table if not exists public.appeals (
  id                       uuid primary key default extensions.gen_random_uuid(),
  practice_id              uuid not null references public.practices(id) on delete cascade,
  created_by               uuid references public.users(id) on delete set null,

  -- Denial metadata extracted by the model
  claim_number             text,
  -- We never store full patient identifiers. Only the last 4 digits, used
  -- by the practice to disambiguate their own claims.
  patient_identifier_last4 text,
  payer                    text,
  service_date             date,
  denial_reason_code       text,
  denial_reason_category   text,
  cpt_codes                text[] not null default '{}',
  icd10_codes              text[] not null default '{}',

  -- Generated output
  appeal_letter_text       text not null,
  appeal_strategy          text,
  citations_used           text[] not null default '{}',
  appeal_deadline          date,
  confidence               text check (confidence in ('high', 'medium', 'low')),
  confidence_rationale     text,

  -- Lifecycle
  status                   text not null default 'draft'
                           check (status in (
                             'draft', 'ready_to_send', 'sent', 'won', 'lost', 'withdrawn'
                           )),

  generated_at             timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Index for the dashboard "what's open" query and the deadline reminder cron.
create index if not exists appeals_practice_status_idx
  on public.appeals(practice_id, status);
create index if not exists appeals_practice_deadline_idx
  on public.appeals(practice_id, appeal_deadline)
  where appeal_deadline is not null;
create index if not exists appeals_practice_generated_at_idx
  on public.appeals(practice_id, generated_at desc);

drop trigger if exists appeals_set_updated_at on public.appeals;
create trigger appeals_set_updated_at
  before update on public.appeals
  for each row execute function public.set_updated_at();
