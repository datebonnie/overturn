import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { WaitlistFormInline } from "@/components/waitlist-form-inline";

export function FinalCta() {
  const { headline, subhead } = content.finalCta;

  return (
    <section
      id="waitlist"
      aria-labelledby="cta-heading"
      className="bg-navy-800 py-20 text-white sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2
            id="cta-heading"
            className="text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-200 sm:text-xl">
            {subhead}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-10 text-left">
            <WaitlistFormInline />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
