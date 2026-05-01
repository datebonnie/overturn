import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startCheckoutAction, openPortalAction } from "./actions";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

type Search = { session_id?: string; cancelled?: string };

type PracticeRow = {
  id: string;
  name: string;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { session_id, cancelled } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select(
      "email, practices(id, name, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id)",
    )
    .eq("id", user.id)
    .single();

  type ProfileRow = { email: string; practices: PracticeRow | null };
  const p = profile as ProfileRow | null;
  const practice = p?.practices;

  const status = practice?.subscription_status ?? "trial";
  const trialEnd = practice?.trial_ends_at
    ? new Date(practice.trial_ends_at)
    : null;
  const trialDaysLeft = trialEnd ? daysUntil(trialEnd) : null;
  const trialExpired = status === "trial" && trialDaysLeft === 0;

  const showCheckoutCTA = status === "trial" || status === "cancelled";
  const showPortalCTA = status === "active" || status === "past_due";

  return (
    <>
      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
        {session_id ? <Banner kind="success">Subscription started. You&apos;re on Overturn Pro.</Banner> : null}
        {cancelled ? <Banner kind="info">Checkout cancelled. You&apos;re still on your trial.</Banner> : null}

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
          BILLING
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
          Subscription &amp; payment
        </h1>

        <div className="mt-10 rounded-xl bg-white ring-1 ring-navy-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
                Current plan
              </p>
              <p className="mt-2 text-2xl font-bold text-navy-800">
                Overturn Pro &middot; $199/month
              </p>
            </div>
            <StatusPill status={status} />
          </div>

          {status === "trial" && trialEnd ? (
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              {trialExpired ? (
                <>
                  Your free trial has ended. Add a payment method to keep
                  generating appeals.
                </>
              ) : (
                <>
                  You&apos;re on your free trial.{" "}
                  <strong className="text-navy-800">
                    {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left
                  </strong>{" "}
                  &mdash; ends {trialEnd.toLocaleDateString()}.
                </>
              )}
            </p>
          ) : null}

          {status === "active" ? (
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Subscription is active. Manage your card, view invoices, or
              cancel from the customer portal.
            </p>
          ) : null}

          {status === "past_due" ? (
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Your last payment didn&apos;t go through. Stripe will retry
              automatically; updating your card now usually fixes it
              immediately.
            </p>
          ) : null}

          {status === "cancelled" ? (
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Your subscription is cancelled. Reactivate to keep generating
              appeals.
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            {showCheckoutCTA ? (
              <form action={startCheckoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-accent-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                >
                  {status === "cancelled"
                    ? "Reactivate subscription"
                    : "Add payment method"}
                </button>
              </form>
            ) : null}
            {showPortalCTA ? (
              <form action={openPortalAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-navy-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                >
                  Manage subscription
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          Billing is handled by Stripe. We never see or store your card
          number. Cancel any time — access continues through the end of your
          paid period.
        </p>
      </main>
    </>
  );
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    trial: {
      label: "Trial",
      classes: "bg-accent-50 text-accent-700 ring-accent-100",
    },
    active: {
      label: "Active",
      classes: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    },
    past_due: {
      label: "Past due",
      classes: "bg-amber-50 text-amber-800 ring-amber-100",
    },
    cancelled: {
      label: "Cancelled",
      classes: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  };
  const { label, classes } = map[status] ?? {
    label: status,
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "success" | "info";
  children: React.ReactNode;
}) {
  const classes =
    kind === "success"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-100"
      : "bg-navy-50 text-navy-800 ring-navy-100";
  return (
    <div
      role="status"
      className={`mb-8 rounded-md px-4 py-3 text-sm font-medium ring-1 ring-inset ${classes}`}
    >
      {children}
    </div>
  );
}
