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

const LAST_UPDATED = "April 30, 2026";

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
                Last updated: {LAST_UPDATED}
              </p>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-700">
                <p>
                  These Terms of Service (&quot;Terms&quot;) govern your access
                  to and use of Overturn, a service provided by Overturn
                  Solutions LLC (&quot;Overturn,&quot; &quot;we,&quot;
                  &quot;us&quot;). By creating an account or using Overturn, you
                  agree to these Terms.
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
              <Clause heading="1. What Overturn does">
                <p>
                  Overturn provides AI-powered software that helps healthcare
                  practices generate insurance denial appeal letters from denial
                  documents and supporting clinical information you upload. The
                  service is provided &quot;as is&quot; and is intended as a
                  tool to assist your practice&apos;s billing and appeals
                  workflow. Overturn does not submit appeals to payers, does not
                  communicate directly with insurance carriers on your behalf,
                  and does not guarantee any particular outcome on any appeal.
                </p>
                <p>You and your practice remain responsible for:</p>
                <List>
                  <li>
                    Reviewing every appeal letter Overturn generates before
                    submission.
                  </li>
                  <li>
                    Verifying clinical accuracy and applicability to the
                    specific patient case.
                  </li>
                  <li>
                    Submitting appeals to payers through your existing channels.
                  </li>
                  <li>
                    Complying with all applicable laws, regulations, payer
                    rules, and professional standards.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="2. Eligibility">
                <p>
                  You must be at least 18 years old and legally able to enter
                  into a contract. Overturn is intended for use by U.S.-based
                  healthcare practices and their authorized billing personnel.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="3. Your account">
                <List>
                  <li>
                    You are responsible for keeping your login credentials
                    secure.
                  </li>
                  <li>You are responsible for all activity under your account.</li>
                  <li>
                    You must notify us immediately at{" "}
                    <MailLink address="security@hioverturn.com" /> if you
                    suspect unauthorized access.
                  </li>
                  <li>
                    Each user seat is for one named individual. Sharing logins
                    is a violation of these Terms.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="4. Acceptable use">
                <p>You agree not to:</p>
                <List>
                  <li>Use Overturn for any unlawful purpose.</li>
                  <li>
                    Upload information you do not have the legal right to
                    upload.
                  </li>
                  <li>
                    Submit appeals that are knowingly fraudulent, misleading, or
                    unsupported by clinical documentation.
                  </li>
                  <li>
                    Reverse engineer, decompile, or attempt to extract the
                    source code of the service.
                  </li>
                  <li>
                    Resell, sublicense, or white-label the service without a
                    written agreement with us.
                  </li>
                  <li>
                    Use the service to harass, defame, or harm any party.
                  </li>
                  <li>
                    Use automated tools to scrape, copy, or load-test the
                    service without written permission.
                  </li>
                  <li>
                    Attempt to circumvent rate limits, security controls, or
                    billing.
                  </li>
                </List>
                <p>
                  We may suspend or terminate accounts that violate these rules.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="5. Patient data and HIPAA">
                <p>
                  If you upload Protected Health Information (PHI) to Overturn,
                  you and Overturn are also bound by a separate Business
                  Associate Agreement (BAA), which controls our handling of PHI
                  under HIPAA.
                </p>
                <p>You represent that:</p>
                <List>
                  <li>
                    You are a Covered Entity or a Business Associate as defined
                    under HIPAA, or you are acting on behalf of one.
                  </li>
                  <li>
                    You have the authority and any required patient
                    authorizations to upload the information you submit.
                  </li>
                  <li>
                    The information you upload is necessary for the appeal you
                    are generating and consistent with the minimum necessary
                    standard.
                  </li>
                </List>
                <p>We commit to:</p>
                <List>
                  <li>Treating PHI as required by the BAA and HIPAA.</li>
                  <li>Never using PHI to train AI models.</li>
                  <li>
                    Never selling or sharing PHI outside the service providers
                    required to deliver the product.
                  </li>
                  <li>
                    Deleting source documents (denial letters, chart notes)
                    within 24 hours of appeal generation.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="6. Pricing and billing">
                <List>
                  <li>
                    Overturn is offered at $199 per month per practice account,
                    billed monthly in advance.
                  </li>
                  <li>
                    New accounts may receive a 14-day free trial. No credit card
                    is required to start the trial.
                  </li>
                  <li>
                    After the trial, your card is charged on the first day of
                    each billing cycle.
                  </li>
                  <li>
                    All fees are non-refundable except as required by law or as
                    expressly stated in writing by us.
                  </li>
                  <li>
                    We may change pricing for new customers at any time.
                    Existing customers will receive at least 30 days&apos;
                    notice before any price increase.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="7. Cancellation">
                <p>
                  You can cancel your subscription at any time from your account
                  settings. Cancellation takes effect at the end of your current
                  billing period. You will retain access to the service until
                  that period ends and will not be charged again.
                </p>
                <p>
                  We may terminate or suspend your account immediately if you
                  materially breach these Terms, fail to pay, or use the service
                  in a way that creates legal risk for us or other customers.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="8. Intellectual property">
                <List>
                  <li>
                    Overturn (the software, the brand, the documentation, the
                    templates) is owned by Overturn Solutions LLC.
                  </li>
                  <li>
                    You retain ownership of all data you upload, including
                    denial letters, chart notes, and the appeal letters Overturn
                    generates for you.
                  </li>
                  <li>
                    You grant us a limited license to process your data solely
                    to provide the service.
                  </li>
                  <li>
                    We may use aggregated, de-identified data to improve the
                    service. This data cannot reasonably be used to identify
                    you, your practice, or any patient.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="9. AI-generated content">
                <p>
                  Appeal letters generated by Overturn are produced by AI models
                  based on the inputs you provide. AI output may contain errors,
                  omissions, or content that does not fit your specific case.
                  You are responsible for reviewing every generated appeal
                  before submission. Overturn is not the author of any appeal
                  you submit, and you submit appeals at your own discretion and
                  risk.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="10. Disclaimers">
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW,
                  OVERTURN DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
                  INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.
                </p>
                <p>WE DO NOT GUARANTEE:</p>
                <List>
                  <li>
                    That any specific appeal will be approved or overturned by
                    any payer.
                  </li>
                  <li>
                    That the service will be uninterrupted, error-free, or
                    available at all times.
                  </li>
                  <li>
                    Any specific recovery rate, financial outcome, or revenue
                    impact.
                  </li>
                </List>
                <p>
                  Healthcare practice management, billing, and appeals are
                  governed by laws and payer rules that change frequently. You
                  are responsible for staying current with the requirements that
                  apply to your practice.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="11. Limitation of liability">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, OVERTURN&apos;S TOTAL
                  LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATED TO
                  THESE TERMS OR THE SERVICE IS LIMITED TO THE AMOUNT YOU PAID
                  US IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
                <p>
                  OVERTURN IS NOT LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL,
                  SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST
                  REVENUE, OR LOST DATA, EVEN IF WE HAVE BEEN ADVISED OF THE
                  POSSIBILITY OF SUCH DAMAGES.
                </p>
                <p>
                  Some jurisdictions do not allow these limitations. In those
                  jurisdictions, our liability is limited to the maximum extent
                  permitted by law.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="12. Indemnification">
                <p>
                  You agree to defend and indemnify Overturn against any claim,
                  loss, or expense (including reasonable attorneys&apos; fees)
                  arising from:
                </p>
                <List>
                  <li>Your violation of these Terms.</li>
                  <li>Your violation of any law or third-party right.</li>
                  <li>Information you upload or appeals you submit.</li>
                  <li>
                    Your use of the service in connection with patient care
                    decisions.
                  </li>
                </List>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="13. Governing law">
                <p>
                  These Terms are governed by the laws of the State of New
                  Jersey, without regard to conflict of law principles. Any
                  dispute will be resolved in the state or federal courts
                  located in New Jersey, and you consent to personal
                  jurisdiction there.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="14. Changes to these Terms">
                <p>
                  We may update these Terms as the service or the law evolves.
                  We&apos;ll post the updated version here with a new &quot;Last
                  updated&quot; date. For material changes, we&apos;ll notify
                  you by email at least 30 days before the change takes effect.
                  Continued use of the service after the change means you accept
                  the updated Terms.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="15. Entire agreement">
                <p>
                  These Terms, together with our Privacy Policy and any
                  applicable Business Associate Agreement, are the entire
                  agreement between you and Overturn regarding the service. If
                  any provision is found unenforceable, the rest of these Terms
                  remain in effect.
                </p>
              </Clause>
            </Reveal>

            <Reveal>
              <Clause heading="16. Contact">
                <p>Questions about these Terms:</p>
                <List>
                  <li>
                    Email: <MailLink address="legal@hioverturn.com" />
                  </li>
                  <li>
                    General: <MailLink address="hello@hioverturn.com" />
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
              These Terms are provided as a starting framework. They do not
              constitute legal advice. Before relying on these Terms in
              commercial transactions involving patient data, healthcare
              practices and Overturn must consult qualified legal counsel.
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
