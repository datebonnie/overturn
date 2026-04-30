# Overturn — pre-launch TODOs

A single source of truth for items that **must** be resolved before the
first paying customer signs up. New entries land here when discovered;
nothing on this list is optional.

---

## 🔒 Blocking — pre-launch

### Database

- [ ] **Encrypt `practices.tin` using pgsodium before first paying customer signs up. Fix is non-optional, not nice-to-have.**
  - Currently stored as plain text (`supabase/migrations/0003_practices.sql`).
  - Migration: enable `pgsodium`, add `tin_encrypted bytea`, copy data, drop `tin`.
  - Update server actions that read/write TIN to use `pgsodium.crypto_aead_det_*`.

### HIPAA / BAAs

- [ ] **Sign Anthropic BAA.** Required before any real PHI flows through Claude API. Sales-assisted via [claude.com/contact-sales](https://claude.com/contact-sales).
- [ ] **Sign Supabase HIPAA add-on.** Required before any real PHI lands in Postgres or Storage. ~$599/mo, requires Team plan upgrade.
- [ ] **Sign Vercel HIPAA BAA.** $350/mo add-on on Pro tier (self-serve since Sep 2025).
- [ ] **Confirm Resend HIPAA path.** Resend does not currently sign BAAs. For PHI-touching emails (e.g. deadline reminders that include claim ID), migrate transactional sends to a HIPAA-eligible vendor (AWS SES with BAA, SendGrid HIPAA tier, or Postmark) **before first paying customer**. Non-PHI account emails (welcome, password reset) can stay on Resend.

### Legal & ops

- [ ] Replace `[Your NJ Business Address]` placeholder in `/terms` and `/privacy` with the real Overturn Solutions LLC mailing address.
- [ ] Add Google Workspace aliases: `legal@`, `security@`, `privacy@`, `billing@`, `app@` (or `noreply@`) per references in Terms/Privacy.
- [ ] Lawyer review of `/terms` and `/privacy`, especially Terms §§ 5, 10, 11, 12 and Privacy §§ 4, 5.
- [ ] Draft + lawyer-review the BAA template every customer signs.

### App

- [ ] Replace static `LAST_UPDATED` constants in `/terms` and `/privacy` with a real version-history strategy before any change to either policy ships post-launch.

---

## 🟡 Soft-blocking — strongly recommended pre-launch

- [ ] DMARC graduation from `p=none` (monitor) to `p=quarantine` then `p=reject` after ~2 weeks of clean reports.
- [ ] Vercel Pro upgrade ($20/mo) if not already on it; required for HIPAA add-on attachment.
- [ ] Replace plain-text refund policy in welcome email with a versioned, lawyer-approved doc.

---

## 🔵 Nice-to-have — post-launch ok

- [ ] Migrate `appeal_documents` purge cron from naive `delete from storage.objects` to envelope-encryption + key-rotation pattern (see `docs/data-model.md` §6) once first 5 customers are in.
- [ ] Switch `auth_practice_id()` from `plpgsql` to `sql` for inline-able performance once we re-run the bootstrap migrations cleanly.
