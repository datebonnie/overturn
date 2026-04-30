# Overturn email templates — drafts for review

Six transactional templates total. Two live in the **Supabase Auth dashboard**
(verification + password reset) and four are sent from **app code via the
Resend SDK** (welcome, trial warnings, payment failure).

| # | Template | Sender | Trigger |
|---|---|---|---|
| 1 | `01-confirm-signup.html` | Supabase Auth | New user signs up; before they can sign in |
| 2 | `02-recovery.html` | Supabase Auth | User clicks "Forgot password?" |
| 3 | `03-welcome.html` | App (Resend SDK) | Right after a user verifies email + lands in /app for the first time |
| 4 | `04-trial-ending.html` | App (Resend SDK, cron) | 3 days before `trial_ends_at` |
| 5 | `05-trial-ended.html` | App (Resend SDK, cron) | At `trial_ends_at` if no active subscription |
| 6 | `06-payment-failed.html` | App (Stripe webhook) | `invoice.payment_failed` event |

**Voice constraints** (per founder spec):
- Plain HTML, single column.
- Navy `#0A1628` header bar.
- No images, no logos beyond text.
- No marketing fluff. No "We're so excited!", no exclamation points.
- Direct, confident, slightly dry. Match the brand voice on hioverturn.com.
- Every email should ship the user back to the app with one obvious next action.

**FROM address (proposed)**: `Overturn <hello@hioverturn.com>`
- `hello@` is already a working alias on Google Workspace.
- Founder may swap to `app@hioverturn.com` or `noreply@hioverturn.com` later
  for stricter human/automated separation. For MVP, `hello@` is consistent
  with the marketing-site signups already routed there.

## Where to install templates 1 + 2 (Supabase Auth)

1. Open [Project → Authentication → Email Templates](https://supabase.com/dashboard/project/gscccrerfdpgqmkvxvzc/auth/templates)
2. **"Confirm signup"** → paste the contents of `01-confirm-signup.html`
3. **"Reset password"** → paste the contents of `02-recovery.html`
4. **"Magic Link"** and **"Change Email Address"** → leave default for MVP (we don't trigger them yet)

The placeholders `{{ .ConfirmationURL }}` and `{{ .Email }}` are evaluated by
Supabase at send time. Don't change them.

## Templates 3–6: app-managed via Resend SDK

These will be wired into the app code as part of the next build phases:

- **Template 3 (welcome)**: sent from `/auth/callback/route.ts` after the
  signup verification handshake succeeds.
- **Templates 4 + 5 (trial)**: sent from a daily cron route checking
  `practices.trial_ends_at`.
- **Template 6 (payment failed)**: sent from the Stripe webhook handler.

Drafts in this folder are reference HTML; the actual Resend SDK sends
will inline these strings (or use `@react-email/render` later).
