# Overturn — Data Model & Retention Policy

Spec for the Supabase Postgres schema, RLS, Storage layout, and purge mechanics that back the public commitments on hioverturn.com.

The two FAQ items this document is contractually obligated to enforce live in [src/lib/content.ts:142](src/lib/content.ts:142) and [src/lib/content.ts:147](src/lib/content.ts:147). Read them. The schema below is the operational expression of that copy.

---

## 1. PHI minimization principles

**Process, don't archive.** Source PHI lives long enough to do the job, then it's gone. Approved outputs and tracking metadata are the only things that survive past 24 hours.

Two-tier separation:

- **Ephemeral tier** — `uploads` rows + Supabase Storage objects (chart notes, denial PDFs, raw extracted text). Every row carries a hard `expires_at` no more than 24 hours after appeal generation. A scheduled purge enforces it. No soft-delete; the bytes leave the system.
- **Durable tier** — `practices`, `users`, `claims`, `denials` (metadata only — reason code, dates, payer; never the full PDF text), `appeals` (the final letter the practice approved), `audit_log`. These persist for the lifetime of the account.

This split is what backs:

- FAQ #1: *"chart notes and denial PDFs are deleted within 24 hours of appeal generation"* → enforced by `uploads.expires_at` + the purge cron.
- FAQ #2: *"Three things: the appeal letter you approved; metadata for tracking; account data"* → those are exactly the durable tables. Nothing else survives.

The Claude API call is stateless from our side — we send chart-note text and a denial extract, we get back letter text. We persist the **letter**, not the prompt.

---

## 2. ERD (text-based)

```
practices ──< users
practices ──< claims ──< denials ──< appeals
                    │           │
                    │           └──< uploads (ephemeral, expires_at)
                    │
                    └──< audit_log
```

### `practices`

Multi-tenant root. Every PHI-bearing row carries a `practice_id` for RLS.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK, `default gen_random_uuid()` | tenant key |
| `name` | text | not null | display |
| `npi` | text | nullable, unique when set | National Provider Identifier; not PHI but useful for payer routing |
| `specialty` | text | nullable | onboarding/segmentation |
| `plan` | text | not null, default `'trial'`, check in (`trial`,`founding`,`standard`,`canceled`) | billing tier — founding lockup matters per pricing copy |
| `created_at` | timestamptz | not null, default `now()` | |
| `canceled_at` | timestamptz | nullable | when set, RLS still allows read but writes blocked at app layer |

### `users`

Mirrors `auth.users` and binds a Supabase Auth identity to a practice + role.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK, FK → `auth.users(id)` on delete cascade | one row per Auth user |
| `practice_id` | uuid | not null, FK → `practices(id)` | tenant scope |
| `role` | text | not null, check in (`owner`,`manager`,`biller`,`physician`) | authz; `owner` is the only role that can manage billing/users |
| `full_name` | text | nullable | display |
| `email` | text | not null | denormalized from auth for queries; not PHI |
| `created_at` | timestamptz | not null, default `now()` | |

### `claims`

The patient claim — durable metadata only. **No clinical free text.** This is what survives forever and powers deadline tracking.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `practice_id` | uuid | not null, FK | tenant |
| `external_claim_id` | text | not null | the practice's own claim # (e.g. `A-7842910`) |
| `payer` | text | not null | "Aetna", "BCBS-IL", etc. |
| `patient_ref` | text | not null | practice-supplied patient identifier — opaque code, **not** name/DOB/MRN. The practice maps it back in their EHR. |
| `cpt_code` | text | nullable | service code |
| `service_date` | date | nullable | DOS — minimum-necessary metadata; not clinical content |
| `created_at` | timestamptz | not null, default `now()` | |
| `created_by` | uuid | FK → `users(id)` | audit trail |

`patient_ref` deserves a callout: we never store patient name, DOB, SSN, or MRN. The practice generates an opaque ref. This keeps the durable tier outside the strictest PHI definitions while still supporting the practice's own re-identification.

Index: `(practice_id, external_claim_id)` unique — a claim is unique within a practice.

### `denials`

One row per denial cycle. Captures the *extracted metadata* from a denial PDF. The PDF itself lives in `uploads` and dies in 24h.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK | |
| `claim_id` | uuid | not null, FK → `claims(id)` | parent |
| `practice_id` | uuid | not null, FK | denormalized for RLS perf |
| `reason_code` | text | not null | e.g. `CO-50` |
| `reason_text` | text | nullable | short payer-supplied label, **not** the full denial letter |
| `denied_on` | date | not null | when payer issued the denial |
| `appeal_deadline` | date | not null | computed from payer + denied_on; powers deadline tracking |
| `status` | text | not null, default `'open'`, check in (`open`,`drafting`,`submitted`,`won`,`lost`,`escalated`,`expired`) | lifecycle |
| `outcome_recorded_at` | timestamptz | nullable | when status moved to a terminal value |
| `created_at` | timestamptz | not null, default `now()` | |

Indexes: `(practice_id, appeal_deadline)` for the dashboard "what's due this week"; `(practice_id, status)` for filtering.

### `uploads`

Ephemeral pointers. **The only table with `expires_at`.** Rows here are tombstones-on-a-clock.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK | also used as the storage object name |
| `practice_id` | uuid | not null, FK | tenant + storage path component |
| `denial_id` | uuid | nullable, FK → `denials(id)` | binding once the user starts an appeal |
| `kind` | text | not null, check in (`denial_pdf`,`chart_note_file`,`chart_note_text`) | drives which bucket / handling |
| `storage_path` | text | nullable | full key in Supabase Storage; null when content is inline-encrypted text (see §6) |
| `ciphertext` | bytea | nullable | for `chart_note_text` we encrypt with the per-upload data key and store the ciphertext here, not in storage |
| `dek_wrapped` | bytea | not null | data key wrapped by the practice's current KEK (envelope encryption) |
| `kek_version` | int | not null | which KEK wrapped this DEK; lets us hard-rotate (see §6) |
| `byte_size` | int | not null | for billing/abuse |
| `created_at` | timestamptz | not null, default `now()` | |
| `expires_at` | timestamptz | not null, default `now() + interval '24 hours'` | the contract |
| `purged_at` | timestamptz | nullable | set briefly between purge and row-delete; if non-null and `expires_at` is in the past, something failed |

Index: `(expires_at)` partial `where purged_at is null` — drives the cron in O(log n).

The `expires_at` default is 24h from creation; once an `appeal` is approved we tighten it to `min(now() + 1h, current expires_at)` — the FAQ says "within 24 hours of appeal generation," so as soon as we have a generation event we accelerate the clock.

### `appeals`

The durable record. The letter text the practice approved.

| column | type | constraints | why |
|---|---|---|---|
| `id` | uuid | PK | |
| `denial_id` | uuid | not null, FK → `denials(id)` | parent |
| `practice_id` | uuid | not null, FK | denormalized for RLS |
| `letter_text` | text | not null | the approved letter — what FAQ #2 promises we keep |
| `payer_format` | text | not null | which payer template was used |
| `model_version` | text | not null | claude-opus-4-7 etc.; useful for later QA |
| `generated_at` | timestamptz | not null, default `now()` | |
| `approved_at` | timestamptz | nullable | when the user clicked "approve and send"; null = draft |
| `approved_by` | uuid | FK → `users(id)` | |
| `submitted_at` | timestamptz | nullable | when sent to payer |

Index: `(denial_id)` unique per approved version — only one approved letter per denial cycle. Drafts can be many; enforce uniqueness via partial index `where approved_at is not null`.

### `audit_log`

Append-only. Every PHI read, every purge, every export.

| column | type | constraints | why |
|---|---|---|---|
| `id` | bigserial | PK | high-volume; uuid overkill |
| `practice_id` | uuid | not null, FK | tenant scope |
| `actor_user_id` | uuid | nullable, FK → `users(id)` | null for system actions (cron, etc.) |
| `actor_kind` | text | not null, check in (`user`,`system`,`support`) | |
| `action` | text | not null | e.g. `upload.purge`, `appeal.approve`, `claim.read` |
| `target_table` | text | not null | which table the row sits in |
| `target_id` | text | not null | uuid or composite as text |
| `metadata` | jsonb | nullable | sanitized — **never** raw PHI; sizes, counts, status transitions |
| `created_at` | timestamptz | not null, default `now()` | |

Index: `(practice_id, created_at desc)`; `(target_table, target_id)`.

---

## 3. Postgres DDL

```sql
-- 0001_practices.sql
create table practices (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  npi         text unique,
  specialty   text,
  plan        text not null default 'trial'
              check (plan in ('trial','founding','standard','canceled')),
  created_at  timestamptz not null default now(),
  canceled_at timestamptz
);

-- 0002_users.sql
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  practice_id uuid not null references practices(id) on delete cascade,
  role        text not null
              check (role in ('owner','manager','biller','physician')),
  full_name   text,
  email       text not null,
  created_at  timestamptz not null default now()
);
create index users_practice_idx on users(practice_id);

-- 0003_claims.sql
create table claims (
  id                 uuid primary key default gen_random_uuid(),
  practice_id        uuid not null references practices(id) on delete cascade,
  external_claim_id  text not null,
  payer              text not null,
  patient_ref        text not null,
  cpt_code           text,
  service_date       date,
  created_at         timestamptz not null default now(),
  created_by         uuid references users(id),
  unique (practice_id, external_claim_id)
);
create index claims_practice_idx on claims(practice_id);

-- 0004_denials.sql
create table denials (
  id                  uuid primary key default gen_random_uuid(),
  claim_id            uuid not null references claims(id) on delete cascade,
  practice_id         uuid not null references practices(id) on delete cascade,
  reason_code         text not null,
  reason_text         text,
  denied_on           date not null,
  appeal_deadline     date not null,
  status              text not null default 'open'
                      check (status in ('open','drafting','submitted','won','lost','escalated','expired')),
  outcome_recorded_at timestamptz,
  created_at          timestamptz not null default now()
);
create index denials_practice_deadline_idx on denials(practice_id, appeal_deadline);
create index denials_practice_status_idx   on denials(practice_id, status);

-- 0005_uploads.sql
create table uploads (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  denial_id     uuid references denials(id) on delete set null,
  kind          text not null
                check (kind in ('denial_pdf','chart_note_file','chart_note_text')),
  storage_path  text,
  ciphertext    bytea,
  dek_wrapped   bytea not null,
  kek_version   int  not null,
  byte_size     int  not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '24 hours',
  purged_at     timestamptz,
  check ((storage_path is not null) <> (ciphertext is not null))
);
create index uploads_expiry_idx
  on uploads(expires_at)
  where purged_at is null;
create index uploads_practice_idx on uploads(practice_id);

-- 0006_appeals.sql
create table appeals (
  id            uuid primary key default gen_random_uuid(),
  denial_id     uuid not null references denials(id) on delete cascade,
  practice_id   uuid not null references practices(id) on delete cascade,
  letter_text   text not null,
  payer_format  text not null,
  model_version text not null,
  generated_at  timestamptz not null default now(),
  approved_at   timestamptz,
  approved_by   uuid references users(id),
  submitted_at  timestamptz
);
create unique index appeals_one_approved_per_denial
  on appeals(denial_id)
  where approved_at is not null;
create index appeals_practice_idx on appeals(practice_id);

-- 0007_audit_log.sql
create table audit_log (
  id            bigserial primary key,
  practice_id   uuid not null references practices(id) on delete cascade,
  actor_user_id uuid references users(id),
  actor_kind    text not null check (actor_kind in ('user','system','support')),
  action        text not null,
  target_table  text not null,
  target_id     text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);
create index audit_practice_time_idx on audit_log(practice_id, created_at desc);
create index audit_target_idx        on audit_log(target_table, target_id);
```

---

## 4. Row-Level Security

Standard Supabase pattern. A SQL helper resolves the caller's `practice_id` once; every policy uses it.

```sql
-- helper: caller's practice
create or replace function auth_practice_id() returns uuid
language sql stable security definer set search_path = public as $$
  select practice_id from users where id = auth.uid()
$$;

alter table practices  enable row level security;
alter table users      enable row level security;
alter table claims     enable row level security;
alter table denials    enable row level security;
alter table uploads    enable row level security;
alter table appeals    enable row level security;
alter table audit_log  enable row level security;

-- example: claims, full CRUD scoped to the caller's practice
create policy claims_select on claims
  for select using (practice_id = auth_practice_id());
create policy claims_insert on claims
  for insert with check (practice_id = auth_practice_id());
create policy claims_update on claims
  for update using (practice_id = auth_practice_id())
             with check (practice_id = auth_practice_id());
create policy claims_delete on claims
  for delete using (practice_id = auth_practice_id());
```

| table | policy | rule |
|---|---|---|
| `practices` | select-only for members | `id = auth_practice_id()`. Inserts/updates handled by service role only. |
| `users` | select for same practice; update self only; insert/delete by service role | `practice_id = auth_practice_id()` for select; `id = auth.uid()` for self-update |
| `claims` | full CRUD scoped | `practice_id = auth_practice_id()` |
| `denials` | full CRUD scoped | `practice_id = auth_practice_id()` |
| `uploads` | insert + select scoped; **no update or delete from clients** | clients can read their own uploads; only the service role / cron can delete. Hard-delete is a system-level guarantee, not a user action. |
| `appeals` | full CRUD scoped, but `approved_at` mutation gated at app layer to `owner`/`manager`/`biller` | `practice_id = auth_practice_id()` |
| `audit_log` | select scoped, **insert only via `security definer` function**, no update/delete | append-only log; cannot be tampered with from client |

The audit log gets one extra rule: a `security definer` `record_audit(...)` function is the only way to insert. Direct insert is denied even for the practice's own users.

---

## 5. Supabase Storage layout + lifecycle

### Buckets

Two private buckets, signed-URL-only:

- `denial-pdfs/` — keys: `{practice_id}/{upload_id}.pdf`
- `chart-notes/` — keys: `{practice_id}/{upload_id}.{ext}` (file uploads only; pasted text never lands in storage — it goes inline-encrypted into `uploads.ciphertext`)

Both buckets are private. No public reads. All access via short-lived (≤5 min) signed URLs generated server-side after an RLS-equivalent practice check.

### Why text-paste content stays in Postgres, not Storage

If a biller pastes 4 KB of chart notes, round-tripping through Storage is overkill and adds a second surface to purge. Inline `bytea` ciphertext in `uploads.ciphertext` keeps the purge story to "delete the row." Storage is only for binary uploads (PDFs, scanned files).

### The purge job

Supabase Storage has no native lifecycle rules. We run our own. Two options, pick one:

- **pg_cron** inside Supabase, calling a `plpgsql` function that uses `supabase_storage` REST via `pg_net` — possible but fragile; storage deletes from inside Postgres are awkward.
- **Vercel Cron** hitting an edge route every 5 minutes. Simpler, observable, runs as service role. **Recommended.**

```sql
-- selection query the cron runs first; LIMIT to bound the batch
select id, practice_id, storage_path, kind
from uploads
where expires_at < now()
  and purged_at is null
order by expires_at asc
limit 500;
```

Pseudocode for the edge route (`src/app/api/cron/purge-uploads/route.ts` — to be written, not part of this spec):

```ts
// Auth: header check against CRON_SECRET. Reject otherwise.
// Use Supabase service-role client; this bypasses RLS by design.
const due = await sb.from('uploads')
  .select('id, practice_id, storage_path, kind')
  .lt('expires_at', new Date().toISOString())
  .is('purged_at', null)
  .order('expires_at', { ascending: true })
  .limit(500);

for (const row of due.data ?? []) {
  if (row.storage_path) {
    const bucket = row.kind === 'denial_pdf' ? 'denial-pdfs' : 'chart-notes';
    await sb.storage.from(bucket).remove([row.storage_path]);
  }
  // hard-delete the row (no soft-delete); the audit_log is the only trace
  await sb.from('uploads').delete().eq('id', row.id);
  await sb.rpc('record_audit', {
    practice_id: row.practice_id,
    actor_kind: 'system',
    action: 'upload.purge',
    target_table: 'uploads',
    target_id: row.id,
    metadata: { kind: row.kind, had_storage: row.storage_path != null },
  });
}
```

Cadence: every 5 minutes. With a 24h SLA we have huge margin; the tight cadence is to keep batch size small and recover quickly from any outage.

Failure handling: if Storage delete fails, do **not** delete the row. Leave it for the next run. Alert if a row is past `expires_at + 1h` and still present — that's an SLA breach in flight.

---

## 6. Backups and the 24-hour promise

The honest version: **plain row deletion does not, by itself, satisfy the FAQ promise.** Supabase runs continuous Postgres backups (PITR up to 7 days on Pro, up to 28 on higher tiers), and Storage keeps versioned objects for some retention window. A row deleted at hour 23 still exists in any backup taken before then. A literal restore would resurface the PHI.

We solve this with **envelope encryption + key destruction**, which is the standard HIPAA-compatible approach and is what makes "deleted" mean what the FAQ says it means.

**Mechanism:**

1. Every upload's content (storage object body and inline `ciphertext`) is encrypted with a per-upload Data Encryption Key (DEK).
2. The DEK is wrapped by a per-practice Key Encryption Key (KEK). Only the wrapped DEK lives in Postgres (`uploads.dek_wrapped`). Only the unwrapped DEK can decrypt the bytes.
3. KEKs live in a dedicated KMS (AWS KMS, GCP KMS, or Supabase Vault for the bootstrap version). Postgres only ever sees wrapped DEKs.
4. **Daily, we rotate each practice's KEK.** Old KEK version is destroyed in KMS after a 25-hour grace window. After destruction, any wrapped DEK that was wrapped by that KEK is permanently un-unwrappable — including those sitting in any backup.
5. Net effect: even if a backup from yesterday is restored, the `dek_wrapped` blobs in it cannot be unwrapped, and the storage objects (also encrypted with the now-orphaned DEKs) are unreadable. The PHI is cryptographically erased.

**Caveats to flag:**

- Storage object bodies inside Supabase Storage's own backup tier are encrypted by Supabase's keys, not ours. Cryptographic erasure works only if our envelope sits *inside* the bytes Supabase stores. So we encrypt client-server-side before upload — Supabase Storage holds opaque ciphertext, never plaintext. Confirmed-feasible; needs to be implemented in the upload route, not assumed.
- The 25-hour grace exists so a botched rotation doesn't lock a practice out of an in-flight upload. It also means the strict mathematical purge SLA is "within ~25 hours of expiry" — call it 24–26 hours in practice. Materially this still backs the FAQ; if legal wants exactly-24, tighten the grace to 1h and accept higher rotation risk.
- KEK rotation is non-trivial ops. Day-one cheaper alternative: skip per-practice KEKs, use a single global KEK rotated weekly. Worse blast-radius story but operationally simpler. Decide with founder (see §9).

---

## 7. Logging discipline

Things that **never** get logged. Add this as an eng-team checklist before any first deploy.

- [ ] No request bodies for `POST /api/uploads/*`, `POST /api/appeals/generate`, or anything that touches chart-note text or denial PDF bytes. Log only `request_id`, `practice_id`, `byte_size`, `kind`.
- [ ] No Claude API request or response payloads. Log `model_version`, latency, token counts, success/failure. Disable Anthropic SDK debug logging in prod.
- [ ] No PII/PHI in error reports. Sentry (or equivalent) `beforeSend` hook strips known fields; default to redact-unless-allowlisted.
- [ ] No `console.log` of user-supplied content in any route handler. Lint rule: ban `console.*` in `src/app/api/**`.
- [ ] Vercel function logs must be enabled at the lowest verbosity that supports debugging, not below.
- [ ] `audit_log.metadata` is allowlist-only. Permitted keys: `kind`, `byte_size`, `status_from`, `status_to`, `model_version`, counts, durations. Never patient identifiers, never letter text, never reason text beyond the structured `reason_code`.
- [ ] Database query logs at `log_statement = 'ddl'` only. No `'all'`. No `'mod'`. Postgres should never log INSERTs into PHI tables.
- [ ] BAA with Vercel + Supabase + Anthropic. No third-party log shipper without a BAA in the path.

---

## 8. Migration order

Run in this order. Each is a separate migration file so failures roll back cleanly.

1. `0001_practices.sql`
2. `0002_users.sql` — depends on `practices` and `auth.users`
3. `0003_claims.sql` — depends on `practices`, `users`
4. `0004_denials.sql` — depends on `claims`
5. `0005_uploads.sql` — depends on `denials` (nullable FK; uploads can predate denial linking)
6. `0006_appeals.sql` — depends on `denials`
7. `0007_audit_log.sql` — depends on `practices`, `users`
8. `0008_rls.sql` — `auth_practice_id()` helper + all policies + the `record_audit()` security-definer function. Run **after** all tables exist.
9. `0009_cron.sql` — if using pg_cron, register the purge schedule here. If using Vercel Cron, this migration is a no-op and the cron is configured in `vercel.json`.

**Local dev seeds** (`supabase/seed.sql`):

- One `practices` row (`Cedar Family Medicine`).
- Three `users` rows covering `owner`, `manager`, `biller` roles, all linked to that practice and to seeded `auth.users` rows.
- Two `claims`, one `denial` per claim, no `uploads`, no `appeals`. Devs generate uploads/appeals through the actual flow so the encryption path is exercised end-to-end.
- Skip seeding `audit_log` — it should fill in naturally.

---

## 9. Decisions locked (2026-04-29)

The six open questions raised during spec-out have been resolved with the founder. Decisions captured here so future implementers don't re-litigate.

1. **Backup retention window** → **Supabase Pro (7-day PITR)**. The §6 cryptographic-erasure story holds at this tier. Revisit when upgrading to the HIPAA add-on.
2. **KEK rotation cadence** → **Single global KEK rotated weekly** for v1. Simpler ops; per-practice daily rotation is a v2 graduation. The FAQ doesn't promise per-practice keys, so this still backs the public copy.
3. **Outcomes — enum or freeform?** → **Strict enum only.** No `outcome_note text`. Practices bucket their outcomes into the canonical statuses; analytics integrity wins over edge-case freedom.
4. **Virus scanning** → **Defer to v2.** Small-practice user base, low phishing target value. Flag for legal review before first paying customer.
5. **Patient identifier policy** → **Opaque `patient_ref` only.** No `patient_name_encrypted`. Significant PHI-scope reduction for the durable tier.
6. **Billing tier shape** → **Flat-rate `plan` enum as written** (`trial`,`founding`,`standard`,`canceled`). Landing copy commits to "Unlimited appeals / $199/month flat" — no seats, no caps. If pricing changes, schema changes.
