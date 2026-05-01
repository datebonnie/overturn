/**
 * Quick read-only inspection of practices.subscription_status across all
 * practices. Used to confirm webhook events flipped the right rows.
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

  const { rows } = await client.query<{
    name: string;
    subscription_status: string;
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    updated_at: string;
  }>(`
    select name, subscription_status, trial_ends_at,
           stripe_customer_id, stripe_subscription_id, updated_at
    from public.practices
    order by updated_at desc
  `);

  console.log("═══ practices ═══");
  for (const r of rows) {
    console.log(`
  ${r.name}
    status:      ${r.subscription_status}
    trial_ends:  ${r.trial_ends_at ?? "—"}
    customer:    ${r.stripe_customer_id ?? "—"}
    sub:         ${r.stripe_subscription_id ?? "—"}
    updated_at:  ${r.updated_at}`);
  }

  await client.end();
})();
