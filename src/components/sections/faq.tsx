import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { FaqItem } from "@/components/faq-item";

export function Faq() {
  const { eyebrow, headline, items } = content.faq;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-t border-navy-100 bg-navy-50/40 py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>
          <h2
            id="faq-heading"
            className="mt-5 text-4xl font-bold tracking-tight text-navy-800 leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
        </Reveal>

        <Reveal>
          <div className="mt-12 border-t border-navy-100">
            {items.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
