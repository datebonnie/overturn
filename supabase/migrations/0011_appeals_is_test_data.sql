-- Adds an is_test_data flag to the appeals table.
--
-- Used to distinguish dev/validation rows from real production data.
-- Defaults to false so production rows are never accidentally flagged.
-- A future cleanup job can purge `is_test_data = true` rows en masse without
-- touching real customer data.
--
-- Validation-pass appeals are not (yet) written to DB — the routing
-- validation script bypasses the API to avoid audit_log pollution. When
-- we eventually write test rows (or run dev seeding), set this true on
-- those rows.

alter table public.appeals
  add column if not exists is_test_data boolean not null default false;

create index if not exists appeals_is_test_data_idx
  on public.appeals(is_test_data)
  where is_test_data = true;
