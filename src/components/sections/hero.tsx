import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function Hero() {
  const { eyebrow, headline, subheadline, primaryCta, secondaryCta, socialProof, mockup } =
    content.hero;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-32"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <Reveal className="lg:col-span-7 flex flex-col">
          <Image
            src="/logo.png"
            alt=""
            width={500}
            height={500}
            priority
            className="h-auto w-full max-w-[240px] sm:max-w-[360px] lg:max-w-[500px]"
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            {eyebrow}
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight text-navy-800 leading-[1.02] sm:text-6xl lg:text-7xl">
            {headline}
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-600 sm:text-2xl sm:leading-[1.4]">
            {subheadline}
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-md bg-accent-500 px-7 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 sm:text-lg"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="group inline-flex items-center gap-2 text-base font-semibold text-navy-700 hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-sm sm:text-lg"
            >
              {secondaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p className="mt-8 max-w-xl text-sm text-slate-500">{socialProof}</p>
        </Reveal>

        <Reveal className="lg:col-span-5">
          <HeroMockup
            pill={mockup.pill}
            status={mockup.status}
            letterTitle={mockup.letterTitle}
            letterBody={mockup.letterBody}
          />
        </Reveal>
      </div>
    </section>
  );
}

type MockupProps = {
  pill: string;
  status: string;
  letterTitle: string;
  letterBody: readonly string[];
};

function HeroMockup({ pill, status, letterTitle, letterBody }: MockupProps) {
  return (
    <div
      role="img"
      aria-label="Preview: appeal letter generated in 47 seconds"
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="rounded-2xl bg-white p-5 shadow-[0_24px_60px_-20px_rgba(10,22,40,0.25)] ring-1 ring-navy-100 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-600 ring-1 ring-inset ring-accent-100">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
            {pill}
          </span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
            #A-7842910
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-lg bg-emerald-50 px-3.5 py-3 ring-1 ring-inset ring-emerald-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <p className="text-sm font-semibold text-emerald-900">{status}</p>
        </div>

        <div className="mt-5 rounded-lg border border-navy-100 bg-navy-50/40 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-navy-700">
              {letterTitle}
            </p>
            <span className="font-mono text-[10px] text-slate-400">PDF · 2 pages</span>
          </div>
          <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
            {letterBody.map((line, i) =>
              line === "" ? (
                <div key={i} className="h-1.5" />
              ) : (
                <p key={i}>{line}</p>
              ),
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <p className="text-xs font-medium text-slate-500">
              Ready to send · Aetna formatting applied
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-accent-600">47.2s</span>
        </div>
      </div>

    </div>
  );
}
