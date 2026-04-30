import { Client } from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD!;
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

const HOSTS = [
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-1-us-east-1.pooler.supabase.com",
  "aws-0-us-east-2.pooler.supabase.com",
  "aws-1-us-east-2.pooler.supabase.com",
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-1-us-west-1.pooler.supabase.com",
  "aws-0-us-west-2.pooler.supabase.com",
  "aws-1-us-west-2.pooler.supabase.com",
  "aws-0-ca-central-1.pooler.supabase.com",
  "aws-1-ca-central-1.pooler.supabase.com",
  "aws-0-eu-west-2.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
];

const PORTS = [5432, 6543];

async function probe(host: string, port: number) {
  const client = new Client({
    host,
    port,
    user: `postgres.${projectRef}`,
    password: DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
    return { ok: true };
  } catch (err) {
    await client.end().catch(() => {});
    return { ok: false, err: (err as Error).message };
  }
}

(async () => {
  for (const host of HOSTS) {
    for (const port of PORTS) {
      const result = await probe(host, port);
      const tag = result.ok ? "✓" : "✗";
      const detail = result.ok ? "CONNECTED" : result.err;
      console.log(`${tag} ${host}:${port} — ${detail}`);
      if (result.ok) {
        console.log(`\nUSE: host=${host}, port=${port}, user=postgres.${projectRef}`);
        return;
      }
    }
  }
})();
