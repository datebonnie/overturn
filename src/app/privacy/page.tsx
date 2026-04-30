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

const LAST_UPDATED = "April 30, 2026";

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
                Last updated: {LAST_UPDATED}
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
              <Clause heading="1. Who we are">
                <p>
                  Overturn Solutions LLC is a New Jersey limited liability
                  company that provides AI-powered insurance denial appeal
                  generation software for small medical practices. You can
                  reach us at <MailLink address="hello@hioverturn.com" />.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="2. What information we collect">
                <SubHeading>Information you give us directly:</SubHeading>
                <List>
                  <li>
                    Account information when you sign up: name, email, practice
                    name, role, specialty, monthly claim volume, billing
                    address.
                  </li>
                  <li>
                    Payment information: handled by Stripe. We never see or
                    store your full credit card number.
                  </li>
                  <li>
                    Communications: emails, support tickets, demo call
                    recordings (with your consent).
                  </li>
                </List>

                <SubHeading>Information you upload to use the service:</SubHeading>
                <List>
                  <li>
                    Denial letters and Explanation of Benefits (EOB) documents.
                  </li>
                  <li>
                    Patient chart notes and clinical documentation you choose
                    to provide.
                  </li>
                  <li>Generated appeal letters.</li>
                </List>
                <p>
                  This information may include Protected Health Information
                  (PHI). PHI is treated under HIPAA rules and the BAA, not just
                  under this policy.
                </p>

                <SubHeading>Information we collect automatically:</SubHeading>
                <List>
                  <li>
                    Log data: IP address, browser type, device type, pages
                    visited, timestamps, referring URLs.
                  </li>
                  <li>
                    Cookies and similar technologies: used for authentication,
                    session management, and basic analytics. We do not use
                    third-party advertising trackers.
                  </li>
                  <li>
                    Usage data: features used, appeals generated, error
                    reports.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="3. How we use information">
                <p>We use the information we collect to:</p>
                <List>
                  <li>
                    Provide the service (generate appeals, track deadlines,
                    deliver results to you).
                  </li>
                  <li>Process payments and manage your account.</li>
                  <li>
                    Communicate with you about your account, support requests,
                    and product updates.
                  </li>
                  <li>
                    Improve the service through aggregated, de-identified
                    analytics.
                  </li>
                  <li>Comply with legal obligations.</li>
                </List>

                <SubHeading>What we never do with your data:</SubHeading>
                <List>
                  <li>
                    We never sell or rent your information to third parties.
                  </li>
                  <li>
                    We never use PHI to train AI models. Period.
                  </li>
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
              <Clause heading="4. How long we keep information">
                <p>
                  <strong className="font-semibold text-navy-800">
                    Source documents (denial letters, chart notes, supporting
                    clinical documentation):
                  </strong>{" "}
                  Deleted within 24 hours of appeal generation. We process this
                  data, we do not archive it.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Generated appeal letters:
                  </strong>{" "}
                  Retained for the life of your account so you can re-download,
                  audit, or resubmit. Deleted within 30 days of account
                  termination unless you request earlier deletion.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Account and billing data:
                  </strong>{" "}
                  Retained for the life of your account plus 7 years after
                  termination, as required by tax and business records law.
                </p>
                <p>
                  <strong className="font-semibold text-navy-800">
                    Usage logs:
                  </strong>{" "}
                  Retained for up to 12 months in identifiable form, then
                  aggregated or deleted.
                </p>
                <p>
                  You can request deletion of your account and associated data
                  at any time by emailing{" "}
                  <MailLink address="privacy@hioverturn.com" />. We&apos;ll
                  confirm deletion within 30 days.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="5. Who we share information with">
                <p>
                  We share information only with the service providers required
                  to operate Overturn:
                </p>
                <List>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Anthropic, PBC
                    </strong>{" "}
                    (AI model provider): processes appeal generation requests
                    under a Business Associate Agreement. Anthropic does not
                    train models on customer data submitted via the API.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Supabase, Inc.
                    </strong>{" "}
                    (database and authentication): stores account data and
                    generated appeal letters under a BAA.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Vercel, Inc.
                    </strong>{" "}
                    (hosting): serves the application. Configured to never
                    persist PHI in logs.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Stripe, Inc.
                    </strong>{" "}
                    (payment processing): handles billing only. Never receives
                    PHI.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Resend, Inc.
                    </strong>{" "}
                    (transactional email): sends account notifications. Never
                    receives PHI in email content.
                  </li>
                </List>
                <p>
                  Each of these providers is bound by a written agreement that
                  limits their use of your information to providing services on
                  our behalf. We do not share information with any other third
                  parties except as required by law or with your explicit
                  consent.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="6. How we protect information">
                <List>
                  <li>All data is encrypted in transit using TLS 1.3.</li>
                  <li>All data is encrypted at rest using AES-256.</li>
                  <li>
                    Access to production systems is restricted, logged, and
                    reviewed.
                  </li>
                  <li>
                    We follow the HIPAA Security Rule and maintain reasonable
                    administrative, physical, and technical safeguards.
                  </li>
                  <li>
                    We perform regular security reviews and address
                    vulnerabilities promptly.
                  </li>
                </List>
                <p>
                  No system is perfectly secure. If a breach affecting your
                  information occurs, we will notify you and the relevant
                  authorities as required by HIPAA and applicable state law.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="7. Your rights">
                <p>
                  Depending on where you live, you may have the right to:
                </p>
                <List>
                  <li>
                    Access the personal information we have about you.
                  </li>
                  <li>Correct inaccurate information.</li>
                  <li>Request deletion of your information.</li>
                  <li>Object to or restrict certain processing.</li>
                  <li>Receive a portable copy of your information.</li>
                  <li>
                    Opt out of marketing communications (you can also
                    unsubscribe from any email).
                  </li>
                </List>
                <p>
                  To exercise any of these rights, email{" "}
                  <MailLink address="privacy@hioverturn.com" />. We&apos;ll
                  respond within 30 days.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="8. Cookies">
                <p>We use cookies for the following purposes only:</p>
                <List>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Strictly necessary:
                    </strong>{" "}
                    authentication and session management.
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Functional:
                    </strong>{" "}
                    remembering your preferences (e.g. timezone).
                  </li>
                  <li>
                    <strong className="font-semibold text-navy-800">
                      Analytics:
                    </strong>{" "}
                    anonymized usage statistics to improve the product.
                  </li>
                </List>
                <p>
                  We do not use advertising cookies, retargeting cookies, or
                  third-party tracking pixels. You can disable non-essential
                  cookies in your browser settings without breaking the
                  service.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="9. Children">
                <p>
                  Overturn is a B2B service intended for healthcare
                  professionals. We do not knowingly collect information from
                  anyone under 18. If we learn that we have, we will delete it
                  promptly.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="10. International users">
                <p>
                  Overturn is operated from the United States and intended for
                  U.S. healthcare practices. If you access the service from
                  outside the U.S., your information will be transferred to and
                  processed in the United States.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="11. Changes to this policy">
                <p>
                  We may update this Privacy Policy as the product or the law
                  evolves. We&apos;ll post the updated version here with a new
                  &quot;Last updated&quot; date. For material changes, we&apos;ll
                  notify you by email.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="12. Contact us">
                <p>Questions, requests, or concerns about this policy:</p>
                <List>
                  <li>
                    Email: <MailLink address="privacy@hioverturn.com" />
                  </li>
                  <li>
                    General contact:{" "}
                    <MailLink address="hello@hioverturn.com" />
                  </li>
                  <li>
                    Mail: Overturn Solutions LLC, [Your NJ Business Address]
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
  return (
    <p className="font-semibold text-navy-800">{children}</p>
  );
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
