import { Stethoscope, Building2, ShieldCheck, BadgeDollarSign } from "lucide-react";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

const ICONS = [Stethoscope, Building2, ShieldCheck, BadgeDollarSign] as const;

export function WhyItWins() {
  const { eyebrow, headline, features } = content.whyItWins;

  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="border-t border-navy-100 bg-navy-50/40 py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>
          <h2
            id="why-heading"
            className="mt-5 text-4xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
        </Reveal>

        <Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = ICONS[i] ?? Stethoscope;
              return (
                <li
                  key={feature.title}
                  className="flex flex-col rounded-xl bg-white p-7 ring-1 ring-navy-100 sm:p-8"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-navy-800 sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {feature.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
