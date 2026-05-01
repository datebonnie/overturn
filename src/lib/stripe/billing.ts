/**
 * Server-only billing helpers.
 *
 * Two flows:
 *   - createCheckoutSession: trial / unsubscribed practice → Stripe Checkout
 *     to attach a card and start the subscription.
 *   - createPortalSession: active practice → Stripe Customer Portal to
 *     update card, cancel, view invoices.
 *
 * Both create a Stripe Customer lazily the first time the practice
 * touches billing, and stash the customer id back to practices.stripe_customer_id.
 */

import "server-only";

import { stripe } from "./server";
import { createAdminClient } from "@/lib/supabase/admin";

type Practice = {
  id: string;
  name: string;
  stripe_customer_id: string | null;
};

/**
 * Returns a Stripe customer for the given practice. Creates one and
 * persists the id if this is the first time billing has been touched.
 */
async function ensureCustomerForPractice(
  practice: Practice,
  userEmail: string,
): Promise<string> {
  if (practice.stripe_customer_id) {
    return practice.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: userEmail,
    name: practice.name,
    metadata: { practice_id: practice.id },
  });

  const admin = createAdminClient();
  const { error } = await admin
    .from("practices")
    .update({ stripe_customer_id: customer.id })
    .eq("id", practice.id);
  if (error) {
    console.error("[billing] failed to persist stripe_customer_id:", error);
    // Stripe customer exists; the next billing call will find no id and
    // create another. Not great. Loud error so we notice in logs.
    throw new Error("Could not persist Stripe customer reference.");
  }

  return customer.id;
}

export async function createCheckoutSession(args: {
  practice: Practice;
  userEmail: string;
  origin: string;
}): Promise<string> {
  const { practice, userEmail, origin } = args;

  const priceId = process.env.STRIPE_PRICE_OVERTURN_PRO;
  if (!priceId) {
    throw new Error(
      "STRIPE_PRICE_OVERTURN_PRO is not set. Run `npx tsx scripts/setup-stripe.ts`.",
    );
  }

  const customerId = await ensureCustomerForPractice(practice, userEmail);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    // No trial here — the trial is enforced by our app (practices.trial_ends_at).
    // Practices subscribing during/after trial start paying immediately.
    payment_method_collection: "always",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${origin}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/app/billing?cancelled=1`,
    metadata: { practice_id: practice.id },
    subscription_data: {
      metadata: { practice_id: practice.id },
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }
  return session.url;
}

export async function createPortalSession(args: {
  practice: Practice;
  userEmail: string;
  origin: string;
}): Promise<string> {
  const { practice, userEmail, origin } = args;

  const customerId = await ensureCustomerForPractice(practice, userEmail);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/app/billing`,
  });

  return session.url;
}
