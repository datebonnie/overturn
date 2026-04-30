import Image from "next/image";
import Link from "next/link";
import { content } from "@/lib/content";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-navy-50/30 flex flex-col">
      <header className="px-5 sm:px-8 py-5">
        <Link
          href="/"
          aria-label={`${content.brand.name} home`}
          className="inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8 flex-shrink-0"
          />
          <span className="text-xl font-bold tracking-tight text-navy-800">
            {content.brand.name}
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 sm:px-8 pt-6 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl ring-1 ring-navy-100 shadow-[0_24px_60px_-24px_rgba(10,22,40,0.18)] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8">{children}</div>
          </div>
          {footer ? (
            <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
