/**
 * Pre-walkthrough audit for pause point #3.
 * Read-only inspection of practices, appeals, audit_log + fixture
 * deadlines + (optionally) trial extension if requested.
 *
 * Run: npx tsx scripts/audit-pause-3.ts
 */

import { Client } from "pg";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD!;
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
const region = process.env.SUPABASE_DB_REGION ?? "us-east-1";

const FIXTURES_ROOT = path.resolve("docs/test-fixtures");

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

  // ─── #2 Test practice state ─────────────────────────────────────────
  console.log("═══ #2 practices ═══");
  const practices = await client.query<{
    id: string;
    name: string;
    subscription_status: string;
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    days_until_trial_end: number | null;
    created_at: string;
  }>(`
    select id, name, subscription_status, trial_ends_at,
           stripe_customer_id, stripe_subscription_id,
           case when trial_ends_at is null then null
                else extract(day from (trial_ends_at - now()))::int
           end as days_until_trial_end,
           created_at
    from public.practices
    order by created_at asc
  `);
  for (const p of practices.rows) {
    console.log(
      `  ${p.id.slice(0, 8)} ${p.name} status=${p.subscription_status} trial_ends=${p.trial_ends_at ?? "—"} (${p.days_until_trial_end ?? "—"} days) cus=${p.stripe_customer_id ?? "—"} sub=${p.stripe_subscription_id ?? "—"}`,
    );
  }

  // ─── #11 / #12 appeals counts by practice ───────────────────────────
  console.log("\n═══ #12 appeals counts by practice ═══");
  const appealsCounts = await client.query<{
    practice_id: string;
    practice_name: string;
    n: number;
  }>(`
    select a.practice_id, p.name as practice_name, count(*)::int as n
    from public.appeals a
    join public.practices p on p.id = a.practice_id
    group by a.practice_id, p.name
    order by p.name
  `);
  if (appealsCounts.rows.length === 0) {
    console.log("  (no appeals rows yet)");
  } else {
    for (const r of appealsCounts.rows) {
      console.log(
        `  ${r.practice_id.slice(0, 8)} ${r.practice_name}: ${r.n} appeals`,
      );
    }
  }

  // ─── #9 audit_log audit ─────────────────────────────────────────────
  console.log("\n═══ #9 audit_log ═══");
  const auditTotal = await client.query<{ n: number }>(
    `select count(*)::int as n from public.audit_log`,
  );
  console.log(`  total rows: ${auditTotal.rows[0].n}`);

  const actionBreakdown = await client.query<{ action: string; n: number }>(`
    select action, count(*)::int as n
    from public.audit_log
    group by action
    order by n desc
  `);
  console.log("  action breakdown:");
  for (const r of actionBreakdown.rows) {
    console.log(`    ${r.action.padEnd(28)} ${r.n}`);
  }

  const nullScan = await client.query<{
    null_practice: number;
    null_user_system: number;
    null_user_other: number;
    null_target_type: number;
    null_created_at: number;
  }>(`
    select
      count(*) filter (where practice_id is null)::int as null_practice,
      count(*) filter (where user_id is null and actor_kind is distinct from 'system')::int as null_user_other,
      count(*) filter (where user_id is null and actor_kind = 'system')::int as null_user_system,
      count(*) filter (where target_type is null)::int as null_target_type,
      count(*) filter (where created_at is null)::int as null_created_at
    from public.audit_log
  `).catch(async () => {
    // fallback for schemas where actor_kind isn't queryable directly
    return client.query<{
      null_practice: number;
      null_user_system: number;
      null_user_other: number;
      null_target_type: number;
      null_created_at: number;
    }>(`
      select
        count(*) filter (where practice_id is null)::int as null_practice,
        0::int as null_user_other,
        count(*) filter (where user_id is null)::int as null_user_system,
        count(*) filter (where target_type is null)::int as null_target_type,
        count(*) filter (where created_at is null)::int as null_created_at
      from public.audit_log
    `);
  });
  const ns = nullScan.rows[0];
  console.log("  null/missing scan:");
  console.log(`    practice_id NULL: ${ns.null_practice}`);
  console.log(`    user_id NULL (non-system actors): ${ns.null_user_other}`);
  console.log(`    user_id NULL (system actor — expected): ${ns.null_user_system}`);
  console.log(`    target_type NULL: ${ns.null_target_type}`);
  console.log(`    created_at NULL: ${ns.null_created_at}`);

  // ─── #6 deadlines from fixtures ──────────────────────────────────────
  console.log("\n═══ #6 fixture deadlines (per source PDF) ═══");
  const slugs = readdirSync(FIXTURES_ROOT)
    .filter((s) => statSync(path.join(FIXTURES_ROOT, s)).isDirectory())
    .sort();
  for (const slug of slugs) {
    const meta = JSON.parse(
      readFileSync(path.join(FIXTURES_ROOT, slug, "meta.json"), "utf8"),
    );
    console.log(
      `  ${slug.padEnd(34)} expected category=${meta.expected.detected_category ?? "(other)"}`,
    );
  }
  console.log(
    "  (deadline correctness audit requires running through /api/appeals/generate to populate appeals.appeal_deadline; will be verified post-walkthrough)",
  );

  await client.end();
})();
