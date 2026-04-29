"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { content } from "@/lib/content";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow ${
        scrolled
          ? "border-b border-navy-100 shadow-[0_1px_0_0_rgba(10,22,40,0.04)]"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
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

        <div className="hidden md:flex items-center gap-8">
          {content.nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={content.nav.cta.href}
            className="inline-flex items-center justify-center rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            {content.nav.cta.label}
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-navy-700 hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-navy-100 bg-white px-5 pb-5 pt-2"
        >
          <ul className="flex flex-col gap-1">
            {content.nav.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-navy-700 hover:bg-navy-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={content.nav.cta.href}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-accent-600 transition-colors"
          >
            {content.nav.cta.label}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
