import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS scopes this to the caller's practice. Should return exactly one row.
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role, practice_id, practices(name, subscription_status, trial_ends_at)")
    .eq("id", user.id)
    .single();

  type ProfileRow = {
    full_name: string | null;
    email: string;
    role: string;
    practice_id: string;
    practices: { name: string; subscription_status: string; trial_ends_at: string | null } | null;
  };
  const p = profile as ProfileRow | null;

  return (
    <div className="min-h-screen bg-navy-50/30">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <span className="text-xl font-bold tracking-tight text-navy-800">
            Overturn
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
        {reset === "success" ? (
          <div className="mb-8 rounded-md bg-emerald-50 px-4 py-3 ring-1 ring-inset ring-emerald-100">
            <p className="text-sm font-medium text-emerald-900">
              Password updated. You&apos;re signed in.
            </p>
          </div>
        ) : null}

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
          DASHBOARD STUB
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
          You&apos;re in, {p?.full_name ?? p?.email ?? "founder"}.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          The real dashboard ships next. For now, this page exists to confirm
          auth and the practice/user records are wired correctly.
        </p>

        <div className="mt-10 rounded-xl bg-white ring-1 ring-navy-100 p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
            Account
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Practice" value={p?.practices?.name ?? "—"} />
            <Row label="Email" value={p?.email ?? "—"} />
            <Row label="Role" value={p?.role ?? "—"} />
            <Row
              label="Subscription"
              value={p?.practices?.subscription_status ?? "—"}
            />
            <Row
              label="Trial ends"
              value={
                p?.practices?.trial_ends_at
                  ? new Date(p.practices.trial_ends_at).toLocaleDateString()
                  : "—"
              }
            />
          </dl>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-32 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-base text-navy-800">{value}</dd>
    </div>
  );
}
