-- Enable extensions used by the app schema.
-- gen_random_uuid() comes from pgcrypto on older Postgres; on Postgres 13+
-- it's built in, but Supabase exposes it via the extensions schema.

create extension if not exists "pgcrypto" with schema "extensions";

-- pg_cron is used for the 24-hour upload purge. Available on Supabase Pro+.
-- Enabling here is idempotent; if the project tier doesn't allow it, fail loudly.
create extension if not exists "pg_cron" with schema "extensions";

-- pg_net is used by the cron job to call the storage delete API for objects.
create extension if not exists "pg_net" with schema "extensions";
