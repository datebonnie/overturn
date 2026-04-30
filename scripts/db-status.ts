/**
 * Quick read-only inspection of the current database state.
 * Lists public-schema tables, RLS status, indexes count, and any cron jobs.
 */

import { Client } from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD!;
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
const region = process.env.SUPABASE_DB_REGION ?? "us-east-1";

(async () => {
  const client = new Client({
    host: `aws-1-${region}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${projectRef}`,
    password: DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log("═══ public.* tables ═══");
  const tables = await client.query<{
    table_name: string;
    rls_enabled: boolean;
    estimated_rows: number;
  }>(`
    select c.relname as table_name,
           c.relrowsecurity as rls_enabled,
           coalesce(c.reltuples, 0)::bigint as estimated_rows
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname
  `);
  for (const r of tables.rows) {
    console.log(
      `  ${r.table_name.padEnd(20)} RLS=${r.rls_enabled ? "ON " : "OFF"}  rows≈${r.estimated_rows}`,
    );
  }

  console.log("\n═══ RLS policies ═══");
  const policies = await client.query<{ tablename: string; policyname: string; cmd: string }>(`
    select tablename, policyname, cmd
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname
  `);
  for (const p of policies.rows) {
    console.log(`  ${p.tablename.padEnd(20)} ${p.cmd.padEnd(8)} ${p.policyname}`);
  }

  console.log("\n═══ storage policies ═══");
  const storagePolicies = await client.query<{ policyname: string; cmd: string }>(`
    select policyname, cmd from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    order by policyname
  `);
  for (const p of storagePolicies.rows) {
    console.log(`  ${p.cmd.padEnd(8)} ${p.policyname}`);
  }

  console.log("\n═══ storage buckets ═══");
  const buckets = await client.query<{ id: string; public: boolean; file_size_limit: number }>(`
    select id, public, file_size_limit from storage.buckets order by id
  `);
  for (const b of buckets.rows) {
    console.log(
      `  ${b.id.padEnd(20)} public=${b.public}  max=${(b.file_size_limit / 1024 / 1024).toFixed(0)}MB`,
    );
  }

  console.log("\n═══ cron jobs ═══");
  const jobs = await client.query<{ jobname: string; schedule: string; active: boolean }>(`
    select jobname, schedule, active from cron.job order by jobname
  `);
  for (const j of jobs.rows) {
    console.log(`  ${j.jobname.padEnd(28)} ${j.schedule.padEnd(12)} active=${j.active}`);
  }

  console.log("\n═══ migrations applied ═══");
  const m = await client.query<{ filename: string; applied_at: string }>(`
    select filename, applied_at from public._migrations order by filename
  `);
  for (const r of m.rows) {
    console.log(`  ${r.filename.padEnd(34)} ${r.applied_at}`);
  }

  await client.end();
})();
