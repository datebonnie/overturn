import Link from "next/link";
import { content } from "@/lib/content";

export function Footer() {
  const { brand, footer } = content;

  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
            >
              {brand.name}
            </Link>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-slate-600">
              {footer.tagline}
            </p>
            <p className="mt-6 text-sm text-slate-500">{footer.copyright}</p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-slate-600 hover:text-navy-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-navy-100 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
            {footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
