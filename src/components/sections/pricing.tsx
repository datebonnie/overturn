import Link from "next/link";
import { Check } from "lucide-react";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Pricing() {
  const { eyebrow, headline, plan, footnote } = content.pricing;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="bg-white py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>
          <h2
            id="pricing-heading"
            className="mt-5 text-4xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
        </Reveal>

        <Reveal>
          <div className="mt-14 mx-auto w-full max-w-xl">
            <div className="relative rounded-2xl bg-navy-800 p-8 text-white shadow-[0_30px_80px_-30px_rgba(10,22,40,0.45)] sm:p-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-300">
                  {plan.name}
                </p>
                <span className="inline-flex items-center rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  {plan.pill}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-navy-300 line-through">
                  {plan.strikethrough}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tight text-white sm:text-7xl">
                    {plan.price}
                  </span>
                  <span className="text-lg font-medium text-navy-200">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="mt-8 space-y-3.5 border-t border-navy-600 pt-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-500">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-base leading-relaxed text-navy-100">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className="mt-9 inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 sm:text-lg"
              >
                {plan.cta.label}
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">{footnote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
