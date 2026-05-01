import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "./actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-50/30">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/app"
            aria-label="Overturn dashboard"
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
              Overturn
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/app"
              className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/app/billing"
              className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
            >
              Billing
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
