import type { Metadata } from "next";
import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Overturn Solutions LLC collects, uses, and protects information at hioverturn.com and across the Overturn service.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "May 3, 2026";
const VERSION = "1.0";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="bg-white pt-16 pb-10 sm:pt-20 sm:pb-14 lg:pt-28 lg:pb-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
                LEGAL
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-6xl lg:text-7xl">
                Privacy Policy
              </h1>
              <p className="mt-6 text-sm font-medium text-slate-500">
                Last updated: {LAST_UPDATED} · Version {VERSION}
              </p>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-700">
                <p>
                  This Privacy Policy describes how Overturn Solutions LLC
                  (&quot;Overturn,&quot; &quot;we,&quot; &quot;us&quot;)
                  collects, uses, and protects information when you visit
                  hioverturn.com or use the Overturn service.
                </p>
                <p>
                  If you are a covered entity under HIPAA and you use Overturn
                  to process Protected Health Information (PHI), your
                  relationship with us is also governed by a separate Business
                  Associate Agreement (BAA). The BAA controls in any conflict
                  between this policy and that agreement.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <article className="bg-white pb-20 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-12">
            <Reveal>
              <Clause heading="1. Information we collect">
                <p>
                  Practice information you provide during signup or in
                  Settings: practice name, address, phone, NPI, and TIN. These
                  are used as letterhead on every appeal we generate, so
                  accuracy matters to your payers.
                </p>
                <p>
                  Account information: your email and a salted-and-hashed
                  password. Password handling is managed by Supabase Auth — we
                  never see your plaintext password.
                </p>
                <p>
                  Usage data: appeals generated, status transitions you make
                  (sent, overturned, lost, withdrawn), and audit log entries
                  that record who did what and when.
                </p>
                <p>
                  Payment information: handled by Stripe through its hosted
                  checkout and customer portal. We never see or store your full
                  card number.
                </p>
                <p>
                  Denial letters and chart notes you upload: these typically
                  contain Protected Health Information (PHI) and are governed
                  by HIPAA and our BAA. See §3.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="2. How we use information">
                <p>
                  To provide the service: generate appeal letters tailored to
                  your denial and chart notes, render them as PDF or DOCX on
                  demand, and let you track outcomes through your appeal
                  lifecycle.
                </p>
                <p>
                  To communicate with you: send transactional emails (welcome,
                  trial reminders, payment failures) and respond to support
                  requests. We do not send marketing emails to paying customers
                  without explicit opt-in.
                </p>
                <p>
                  To maintain audit logs for compliance: every PHI access,
                  edit, download, and status change is recorded. This is
                  required for HIPAA Security Rule compliance and for your own
                  audit trail if a payer disputes a record.
                </p>
                <p>To process payments: Stripe handles billing on our behalf.</p>

                <SubHeading>What we never do with your data:</SubHeading>
                <List>
                  <li>
                    We never sell or rent your information to third parties.
                  </li>
                  <li>We never use PHI to train AI models. Period.</li>
                  <li>
                    We never share patient information with insurance carriers,
                    advertisers, data brokers, or any party outside the
                    BAA-covered service providers required to deliver the
                    product.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="3. PHI handling">
                <p>
                  All PHI is encrypted in transit using TLS 1.3 and at rest
                  using AES-256.
                </p>
                <p>
                  Access is restricted by Postgres row-level security to the
                  practice that uploaded the data. No other practice can read
                  your records. Internal Overturn personnel access PHI only
                  when required for support, debugging, or compliance, and
                  every access is logged.
                </p>
                <p>
                  We do not share PHI with any third party without an executed
                  Business Associate Agreement. Subprocessors that handle PHI
                  are listed in §4 with their BAA status.
                </p>
                <p>
                  You can request export of your stored data or deletion of
                  your account and PHI at any time. See §6.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="4. Data sharing">
                <p>
                  We share data only with the service providers required to
                  operate Overturn:
                </p>
                <List>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Stripe, Inc.
                    </strong>{" "}
                    — payment processing. Receives your name, email, and
                    payment method (entered directly into Stripe Elements).
                    Never receives PHI.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Resend, Inc.
                    </strong>{" "}
                    — transactional email delivery. Receives your email
                    address and the content of lifecycle emails (welcome,
                    trial reminders, payment failures). Templates are non-PHI
                    by design; we never send PHI through this path.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Anthropic, PBC
                    </strong>{" "}
                    — AI model provider that generates the appeal letters.
                    Receives the denial letter text, chart notes, and practice
                    letterhead for each generation. BAA status: pending
                    execution at launch — until BAA is signed, real PHI cannot
                    be processed; the service operates with test data only
                    during this period.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Supabase, Inc.
                    </strong>{" "}
                    — database hosting and authentication. Stores all account
                    data including any PHI you upload. BAA status: pending
                    execution at launch — until BAA is signed, real PHI cannot
                    be processed; the service operates with test data only
                    during this period.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Vercel, Inc.
                    </strong>{" "}
                    — application hosting. Configured to never persist PHI in
                    logs. BAA executed.
                  </li>
                </List>
                <p>
                  Each provider is bound by a written agreement that limits
                  their use of your information to providing services on our
                  behalf. We do not share information with any other third
                  parties except as required by law or with your explicit
                  consent.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="5. Data retention">
                <p>
                  <strong className="font-semibold text-navy-800">
                    Source uploads (denial PDFs, chart notes):
                  </strong>{" "}
                  deleted 24 hours after appeal generation. We process this
                  data; we do not archive it.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Generated appeal letters:
                  </strong>{" "}
                  retained for the life of your account so you can re-download,
                  audit, or resubmit. Deleted 90 days after account
                  termination unless you request earlier deletion.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Account and billing data:
                  </strong>{" "}
                  retained for the life of your account plus 7 years after
                  termination, as required by tax and business records law.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Audit logs:
                  </strong>{" "}
                  retained for the period required by HIPAA and applicable law
                  (typically 6 years per 45 CFR §164.316(b)(2)(i)).
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Cancelled accounts:
                  </strong>{" "}
                  data preserved for 90 days after cancellation, then deleted,
                  unless you extend the retention window in writing.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="6. Your rights">
                <p>You have the right to:</p>
                <List>
                  <li>Access the personal information we have about you.</li>
                  <li>
                    Receive a portable copy of your information in a
                    machine-readable format.
                  </li>
                  <li>
                    Request deletion of your account and associated data.
                  </li>
                  <li>Correct inaccurate information.</li>
                  <li>
                    Opt out of marketing communications. Transactional emails
                    about your account (welcome, trial state changes, billing
                    failures) remain part of the service and cannot be opted
                    out of while you maintain an active account.
                  </li>
                </List>
                <p>
                  To exercise any of these rights, email{" "}
                  <MailLink address="privacy@hioverturn.com" />. We respond
                  within 30 days.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="7. Contact">
                <List>
                  <li>
                    Privacy questions:{" "}
                    <MailLink address="privacy@hioverturn.com" /> (alias setup
                    pending; route via{" "}
                    <MailLink address="support@hioverturn.com" /> until
                    configured)
                  </li>
                  <li>
                    General support:{" "}
                    <MailLink address="support@hioverturn.com" />
                  </li>
                </List>
              </Clause>
            </Reveal>
          </div>
        </article>

        <section className="border-t border-navy-100 bg-navy-50/40 py-10 sm:py-12">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="text-sm italic leading-relaxed text-slate-600">
              This policy is provided as a starting framework. It does not
              constitute legal advice. Healthcare practices and individuals
              should consult their own counsel regarding their specific
              obligations.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight text-navy-800 leading-tight sm:text-3xl">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="font-semibold text-navy-800">{children}</p>;
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-6 marker:text-accent-500">
      {children}
    </ul>
  );
}

function MailLink({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="text-navy-800 underline decoration-navy-200 underline-offset-2 hover:text-accent-600 hover:decoration-accent-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
    >
      {address}
    </a>
  );
}
