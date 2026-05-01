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
- [ ] **Trial-expiry gate.** When `practices.trial_ends_at` passes and `subscription_status === 'trial'`, every `/app/*` route except `/app/billing` should redirect to `/app/billing`. Same for `subscription_status === 'cancelled'`. Implement as a server-side guard helper called from each protected page (or as a per-route layout).
- [ ] Rename `src/middleware.ts` to `src/proxy.ts` per the Next.js 16 deprecation warning. No behavior change; renames the file convention.

---

## 🔵 Nice-to-have — post-launch ok

- [ ] Migrate `appeal_documents` purge cron from naive `delete from storage.objects` to envelope-encryption + key-rotation pattern (see `docs/data-model.md` §6) once first 5 customers are in.
- [ ] Switch `auth_practice_id()` from `plpgsql` to `sql` for inline-able performance once we re-run the bootstrap migrations cleanly.

---

## Pause-point-bound items

### Deferred to pause point #4
- [ ] Tiptap (or contenteditable) editor on `/app/appeals/[id]` — currently read-only.
- [ ] Real PDF download via `@react-pdf/renderer` — buttons exist, disabled.
- [ ] Real DOCX download via `docx` library — buttons exist, disabled.
- [ ] Status-change actions (Mark as sent / won / lost / withdrawn) wired to server action + audit_log.
- [ ] `/app/settings` for practice info (address, phone, NPI, TIN) feeding the letterhead block in /app/new.
- [ ] Trial-expiry gate on `/app/*` (currently in soft-blocking; promote when settings ships).
- [ ] Welcome email via Resend SDK from `/auth/callback` after first verified login.
- [ ] Trial-ending + trial-ended emails wired to a daily cron.
- [ ] Payment-failed email triggered by Stripe webhook.

### Deferred to pre-launch (still must happen)
- [ ] Full citation audit on a fresh validation run — verify every CMS IOM / CFR / USC reference at the official source. Currently only the canonical list in `src/lib/prompts/strategies.ts` is hand-curated; runtime citations the model emits need spot-verification on at least one full validation pass.
- [ ] Appeal-deadline correctness audit — for each fixture, confirm `appeals.appeal_deadline` matches the deadline language in the source denial PDF (calendar days, no business-day rounding, stored as date type).
- [ ] Validation pass after the system-prompt update to confirm 10/10 routing.
- [ ] Stripe live-mode keys + production webhook endpoint registered.
- [ ] Anthropic + Supabase + Vercel BAAs signed.
- [ ] Switch RESEND_API_KEY off Resend (no BAA available) for any email path that touches PHI.

### Nice-to-have post-launch
- [ ] Auto-save generated letters to `docs/test-fixtures/manual-review-results/` during founder manual walkthroughs (separate from the validation script's auto-save). Skipped this round.
- [ ] Test practice "Test Fixtures - DO NOT DELETE" + writing validation-pass appeals with `is_test_data=true` so they're visible in /app for review.
- [ ] Cleanup job that purges `appeals where is_test_data = true` on demand.
