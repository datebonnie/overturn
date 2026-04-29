import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Problem() {
  const { eyebrow, headline, stats, paragraph } = content.problem;

  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="border-t border-navy-100 bg-navy-50/40 py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>
          <h2
            id="problem-heading"
            className="mt-5 text-4xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
        </Reveal>

        <Reveal>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {stats.map((stat) => (
              <li
                key={stat.value}
                className="rounded-xl bg-white p-7 ring-1 ring-navy-100 sm:p-8"
              >
                <p className="font-mono text-5xl font-bold tracking-tight text-navy-800 sm:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <p className="mt-14 max-w-3xl text-lg leading-relaxed text-slate-700 sm:text-xl">
            {paragraph}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
