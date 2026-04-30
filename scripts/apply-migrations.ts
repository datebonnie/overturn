/**
 * Apply Supabase Postgres migrations.
 *
 * Reads every .sql file in supabase/migrations/, sorts alphabetically (the
 * NNNN_name.sql prefix enforces order), and applies each in its own
 * transaction. Tracks applied filenames in a _migrations table so reruns
 * are safe.
 *
 * Usage: npx tsx scripts/apply-migrations.ts
 *
 * Requires .env.local with:
 *   - NEXT_PUBLIC_SUPABASE_URL  (used to derive db hostname)
 *   - SUPABASE_DB_PASSWORD      (postgres user password)
 */

import { Client } from "pg";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_URL || !DB_PASSWORD) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local",
  );
  process.exit(1);
}

const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

// Direct DB hostname (db.<ref>.supabase.co) is IPv6-only without the paid
// IPv4 add-on, so we go through the session pooler. SUPABASE_DB_REGION lets
// you override if your project moves; defaults to us-east-1.
const region = process.env.SUPABASE_DB_REGION ?? "us-east-1";
const host = `aws-1-${region}.pooler.supabase.com`;
const migrationsDir = path.resolve("supabase/migrations");

async function main() {
  const client = new Client({
    host,
    port: 5432,
    user: `postgres.${projectRef}`,
    password: DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  console.log(`Connecting to ${host} ...`);
  await client.connect();
  console.log("Connected.");

  await client.query(`
    create table if not exists public._migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const allFiles = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: applied } = await client.query<{ filename: string }>(
    `select filename from public._migrations`,
  );
  const appliedSet = new Set(applied.map((r) => r.filename));

  const pending = allFiles.filter((f) => !appliedSet.has(f));

  if (pending.length === 0) {
    console.log(`Nothing to apply. ${allFiles.length} migrations already in place.`);
    await client.end();
    return;
  }

  console.log(`${pending.length} pending migration(s):`);
  for (const f of pending) console.log(`  - ${f}`);
  console.log();

  for (const filename of pending) {
    const filePath = path.join(migrationsDir, filename);
    const sql = await readFile(filePath, "utf8");

    process.stdout.write(`Applying ${filename} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        `insert into public._migrations (filename) values ($1)`,
        [filename],
      );
      await client.query("commit");
      console.log("ok");
    } catch (err) {
      await client.query("rollback").catch(() => {});
      console.log("FAILED");
      console.error(err);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`\nDone. ${pending.length} migration(s) applied.`);
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
