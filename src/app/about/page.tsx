import type { Metadata } from "next";
import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Overturn was built to even the asymmetry between insurers and the small practices they deny. One product, one fight.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="bg-white pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
                ABOUT
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-6xl lg:text-7xl">
                About Overturn
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-slate-600 sm:text-2xl sm:leading-[1.4]">
                Every denial deserves a fight.
              </p>
            </Reveal>
          </div>
        </section>

        <article className="bg-white pb-20 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-14">
            <Reveal>
              <AboutSection title="The asymmetry that started this">
                <p>
                  In 2026, the largest health insurers in the United States
                  process millions of claims a day using AI. They flag, route,
                  and deny requests at machine speed. They reject claims for
                  reasons most providers can&apos;t decode without a senior
                  biller and an afternoon.
                </p>
                <p>
                  On the other side of that fight is a practice manager with 14
                  browser tabs open, a stack of denial letters, and a fax
                  machine. The math doesn&apos;t work. Most denials never get
                  appealed. Most appealable revenue is left on the table. The
                  American Medical Association estimates U.S. healthcare loses
                  around $20 billion a year to unrecovered denied claims.
                </p>
                <p>
                  We built Overturn because that asymmetry is wrong, and because
                  nobody else is fighting it for the practices that need it
                  most.
                </p>
              </AboutSection>
            </Reveal>

            <Reveal>
              <AboutSection title="Who we serve">
                <p>
                  Solo practitioners. Family medicine groups. Pediatric offices.
                  Behavioral health practices. Dental offices. Physical therapy
                  clinics. Podiatrists. Dermatologists.
                </p>
                <p>
                  The practices the big revenue cycle platforms ignore because
                  the contracts are too small. The practices that can&apos;t
                  afford a six-month Epic rollout. The practices that don&apos;t
                  have a dedicated denials team because there are only three
                  people in the building.
                </p>
                <p>
                  If your practice is large enough to be denied claims and small
                  enough to feel every one, you&apos;re who we built this for.
                </p>
              </AboutSection>
            </Reveal>

            <Reveal>
              <AboutSection title="What we do">
                <p>One thing.</p>
                <p>
                  Overturn turns denied insurance claims into payer-formatted
                  appeal letters in under 60 seconds. We use AI tuned to the
                  most common denial reason codes, the medical necessity
                  language that wins, and the formatting requirements of major
                  commercial and government payers.
                </p>
                <p>
                  Your billing team uploads the denial. We generate the appeal.
                  They review, and submit. We track the deadline. You get paid
                  for work you&apos;ve already done.
                </p>
                <p>That&apos;s the whole product. It&apos;s why it works.</p>
              </AboutSection>
            </Reveal>

            <Reveal>
              <AboutSection title="What we don't do">
                <p>
                  We don&apos;t do your billing. We don&apos;t manage your
                  revenue cycle. We don&apos;t integrate with your EHR or store
                  your patient data. We don&apos;t try to replace your
                  clearinghouse or your practice management software.
                </p>
                <p>
                  We chose one fight, the appeals fight, and we win it.
                  Everything else is some other product.
                </p>
              </AboutSection>
            </Reveal>

            <Reveal>
              <AboutSection title="Where we came from">
                <p>
                  Overturn was founded in 2026 in New Jersey by a team that got
                  obsessed with one question: why does $20 billion a year in
                  winnable claims get written off? After months of talking to
                  practice managers, billers, and revenue cycle consultants, the
                  answer was always the same: the economics of appealing are
                  broken. Practices know they should fight more denials. They
                  just don&apos;t have the time, the staff, or the tools.
                </p>
                <p>
                  We built the tool. All you have to do is set aside 30 seconds
                  to use it. This is how you Overturn.
                </p>
              </AboutSection>
            </Reveal>

            <Reveal>
              <AboutSection title="What we promise">
                <p>
                  We will not sell your patient data. Ever. To anyone. For any
                  price.
                </p>
                <p>
                  We will not train AI models on your patients&apos; clinical
                  information.
                </p>
                <p>
                  We will never lock you into annual contracts or charge
                  per-claim fees that punish you for using the product more.
                </p>
                <p>
                  We will always be honest about what Overturn does and
                  doesn&apos;t do.
                </p>
                <p>That&apos;s the company. The work is everything else.</p>
              </AboutSection>
            </Reveal>
          </div>
        </article>

        <section
          aria-labelledby="contact-heading"
          className="border-t border-navy-100 bg-navy-50/40 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2
              id="contact-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500"
            >
              Contact
            </h2>
            <dl className="mt-6 space-y-5">
              <ContactRow
                label="Get in touch"
                value="hello@hioverturn.com"
                href="mailto:hello@hioverturn.com"
              />
              <ContactRow label="Headquartered in" value="New Jersey, USA" />
              <ContactRow
                label="Press inquiries"
                value="press@hioverturn.com"
                href="mailto:press@hioverturn.com"
              />
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function AboutSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-navy-800 leading-tight sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5 space-y-5 text-lg leading-relaxed text-slate-700">
        {children}
      </div>
    </section>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-700 sm:w-48 sm:flex-shrink-0">
        {label}
      </dt>
      <dd className="text-base text-slate-700">
        {href ? (
          <a
            href={href}
            className="text-navy-800 hover:text-accent-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
