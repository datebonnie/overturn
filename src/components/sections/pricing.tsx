import Link from "next/link";
import { Check } from "lucide-react";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Pricing() {
  const { eyebrow, headline, pillLabel, foundingTotal, plans, activationNote, roi, footnote } =
    content.pricing;

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
          <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 lg:items-stretch">
            {plans.map((plan) => (
              <li key={plan.slug} className="flex">
                <PlanCard
                  plan={plan}
                  pillLabel={pillLabel}
                  foundingTotal={foundingTotal}
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <p className="mt-8 text-center text-sm text-slate-500 max-w-2xl mx-auto">
            {activationNote}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-12 mx-auto max-w-3xl rounded-xl border-l-4 border-accent-500 bg-navy-50/60 px-6 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-500">
              {roi.heading}
            </p>
            <p className="mt-3 text-base leading-relaxed text-navy-800 sm:text-lg">
              {roi.body}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-8 text-center text-sm text-slate-500 max-w-2xl mx-auto">
            {footnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

type Plan = (typeof content)["pricing"]["plans"][number];

function PlanCard({
  plan,
  pillLabel,
  foundingTotal,
}: {
  plan: Plan;
  pillLabel: string;
  foundingTotal: number;
}) {
  const featured = plan.featured;
  const remaining = plan.spotsRemaining;
  const soldOut = remaining <= 0;
  const lowStock = !soldOut && remaining <= 5;

  const containerClasses = featured
    ? "relative flex flex-col w-full rounded-2xl bg-navy-800 p-8 text-white shadow-[0_30px_80px_-30px_rgba(10,22,40,0.45)] sm:p-10"
    : "relative flex flex-col w-full rounded-2xl bg-white p-8 ring-1 ring-navy-100 sm:p-10";

  const tierLabelClasses = featured
    ? "text-sm font-bold uppercase tracking-[0.16em] text-accent-300"
    : "text-sm font-bold uppercase tracking-[0.16em] text-accent-500";

  const strikeClasses = featured
    ? "text-sm font-medium text-navy-300 line-through"
    : "text-sm font-medium text-slate-400 line-through";

  const priceClasses = featured
    ? "text-6xl font-bold tracking-tight text-white sm:text-7xl"
    : "text-6xl font-bold tracking-tight text-navy-800 sm:text-7xl";

  const periodClasses = featured
    ? "text-lg font-medium text-navy-200"
    : "text-lg font-medium text-slate-500";

  const descriptionClasses = featured
    ? "mt-4 text-base text-navy-100"
    : "mt-4 text-base text-slate-600";

  const dividerClasses = featured
    ? "mt-8 space-y-3.5 border-t border-navy-600 pt-7"
    : "mt-8 space-y-3.5 border-t border-navy-100 pt-7";

  const featureTextClasses = featured
    ? "text-base leading-relaxed text-navy-100"
    : "text-base leading-relaxed text-navy-700";

  const ctaClasses = featured
    ? "mt-9 inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 sm:text-lg"
    : "mt-9 inline-flex w-full items-center justify-center rounded-md bg-navy-800 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 sm:text-lg";

  const counterDotClass = soldOut
    ? "bg-slate-400"
    : lowStock
      ? "bg-accent-500 animate-pulse"
      : featured
        ? "bg-accent-300"
        : "bg-accent-500";

  const counterTextClass = soldOut
    ? featured
      ? "text-navy-300"
      : "text-slate-400"
    : lowStock
      ? "text-accent-500 font-semibold"
      : featured
        ? "text-navy-100"
        : "text-navy-700";

  const counterLabel = soldOut
    ? "Founding spots filled"
    : `${remaining} of ${foundingTotal} founding spots left`;

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between gap-3">
        <p className={tierLabelClasses}>{plan.name}</p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            featured
              ? "bg-accent-500 text-white"
              : "bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100"
          }`}
        >
          {pillLabel}
        </span>
      </div>

      <div className="mt-6">
        <p className={strikeClasses}>{plan.strikethrough}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={priceClasses}>{plan.price}</span>
          <span className={periodClasses}>{plan.period}</span>
        </div>
      </div>

      <p className={descriptionClasses}>{plan.description}</p>

      <div className="mt-5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${counterDotClass}`}
        />
        <p className={`text-sm ${counterTextClass}`}>{counterLabel}</p>
      </div>

      <ul className={dividerClasses}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-500">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            <span className={featureTextClasses}>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        <Link href={plan.cta.href} className={ctaClasses} aria-disabled={soldOut}>
          {soldOut ? "Join the waitlist" : plan.cta.label}
        </Link>
      </div>
    </div>
  );
}
