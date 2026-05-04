import type { Metadata } from "next";
import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your access to and use of Overturn, a service of Overturn Solutions LLC.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "May 3, 2026";
const VERSION = "1.0";

export default function TermsPage() {
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
                Terms of Service
              </h1>
              <p className="mt-6 text-sm font-medium text-slate-500">
                Last updated: {LAST_UPDATED} · Version {VERSION}
              </p>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-700">
                <p>
                  These Terms of Service govern your use of Overturn Solutions
                  LLC&apos;s software (&quot;Overturn,&quot; &quot;the
                  service&quot;) at hioverturn.com.
                </p>
                <p>
                  If you process Protected Health Information (PHI) through
                  Overturn, your use is also governed by our Business Associate
                  Agreement (BAA). The BAA controls in any conflict between
                  these Terms and that agreement.
                </p>
                <p>
                  If you are using Overturn on behalf of a medical practice or
                  other organization, you represent that you have authority to
                  bind that organization to these Terms.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <article className="bg-white pb-20 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-12">
            <Reveal>
              <Clause heading="1. Service description">
                <p>
                  Overturn is an AI-powered medical insurance appeal generator.
                  You upload a denial letter and the relevant chart notes; we
                  produce a draft appeal letter using your practice&apos;s
                  letterhead, citations grounded in CMS and payer guidance, and
                  the structure most likely to win on review.
                </p>
                <p>
                  Generated letters are drafts. You review, edit, and send them
                  through your existing submission channels. Where the chart
                  notes reveal a documentation gap or coding error, we surface
                  a &quot;Required Action&quot; instruction alongside the
                  letter so you don&apos;t miss the necessary follow-up step.
                </p>
                <p>
                  We do not guarantee specific outcomes. Whether a payer
                  overturns or upholds a denial is determined by the payer
                  based on their own criteria, your documentation, and the
                  merits of your case — not by us. Our value is the quality of
                  the draft, not the result.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="2. Subscription">
                <p>
                  Overturn Pro is $199 per month. Every new account starts
                  with a 14-day free trial. No payment method is required
                  during the trial.
                </p>
                <p>
                  If you add a payment method during the trial, your
                  subscription begins automatically when the trial ends and
                  renews monthly thereafter. You can remove your payment
                  method anytime to prevent the conversion.
                </p>
                <p>
                  You can cancel anytime through the Stripe customer portal
                  accessible from your billing page. Cancellation takes effect
                  at the end of your current paid period — you keep access
                  through that period. We do not refund partial months. If you
                  cancel mid-cycle, you continue to have full access until the
                  end of the cycle you&apos;ve already paid for.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="3. Acceptable use">
                <p>
                  You may only upload PHI for patients with whom you have a
                  treatment, payment, or healthcare-operations relationship as
                  defined under HIPAA. You may not upload PHI for individuals
                  who are not your patients.
                </p>
                <p>
                  You are responsible for the secure transmission of PHI to
                  us. The application provides TLS-protected upload paths; you
                  should not transmit PHI through unencrypted channels.
                </p>
                <p>
                  We reserve the right to suspend or terminate accounts for
                  misuse, including:
                </p>
                <List>
                  <li>
                    Uploading content that is not medical insurance denial
                    documentation.
                  </li>
                  <li>
                    Attempting to manipulate appeal outcomes through fabricated
                    documentation.
                  </li>
                  <li>
                    Sharing access credentials between users not authorized
                    under your account.
                  </li>
                  <li>
                    Abusing rate limits or attempting to circumvent system
                    controls.
                  </li>
                  <li>
                    Any use that violates applicable law or regulations.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="4. Liability">
                <p>
                  The service is provided &quot;as-is&quot; and
                  &quot;as-available.&quot; We make no warranty of fitness for
                  a particular purpose, merchantability, or non-infringement.
                </p>
                <p>
                  We are not licensed medical professionals, attorneys, or
                  licensed billing experts. Nothing in our generated letters
                  constitutes medical, legal, or billing advice. You remain
                  responsible for the accuracy and appropriateness of any
                  letter you send under your name or your practice&apos;s
                  letterhead. Review every letter carefully before sending.
                </p>
                <p>
                  Our total cumulative liability for any claim arising out of
                  or related to the service, regardless of theory, is capped
                  at the amount you paid us during the twelve months preceding
                  the claim.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="5. Termination">
                <p>
                  Either party may terminate this agreement at any time with
                  30 days written notice to the other. You may terminate by
                  cancelling your subscription through the customer portal or
                  by emailing <MailLink address="support@hioverturn.com" />.
                </p>
                <p>
                  Outstanding payments are due at termination. Data retention
                  after termination follows our Privacy Policy.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="6. Governing law">
                <p>
                  These Terms are governed by the laws of the State of New
                  Jersey, without regard to conflict-of-laws principles.
                </p>
                <p>
                  Any dispute arising out of or related to these Terms or the
                  service will be resolved through binding arbitration
                  conducted in New Jersey under the rules of the American
                  Arbitration Association. Each party bears its own costs
                  unless the arbitrator awards otherwise. The prevailing party
                  may recover reasonable attorneys&apos; fees.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="7. Contact">
                <List>
                  <li>
                    Legal questions:{" "}
                    <MailLink address="legal@hioverturn.com" /> (alias setup
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
              These terms are provided as a starting framework. They do not
              constitute legal advice. Healthcare practices and individuals
              should consult their own counsel regarding their specific
              obligations and the terms applicable to their use.
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
