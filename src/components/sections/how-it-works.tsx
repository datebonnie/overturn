import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function HowItWorks() {
  const { eyebrow, headline, steps, callout } = content.howItWorks;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="bg-white py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>
          <h2
            id="how-heading"
            className="mt-5 text-4xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
        </Reveal>

        <Reveal>
          <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative flex flex-col rounded-xl border border-navy-100 bg-white p-7 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-base font-bold tracking-wide text-accent-500"
                >
                  {step.number}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal>
          <div className="mt-12 rounded-xl border-l-4 border-accent-500 bg-navy-50/60 px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-base font-semibold leading-relaxed text-navy-800 sm:text-lg">
              {callout}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
