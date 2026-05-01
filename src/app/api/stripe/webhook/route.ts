/**
 * Stripe webhook receiver.
 *
 * Handles four events that change a practice's subscription state:
 *   - checkout.session.completed       → subscription activated for the first time
 *   - customer.subscription.updated    → status change (active, past_due, cancelled, etc.)
 *   - customer.subscription.deleted    → cancelled or hard-ended
 *   - invoice.payment_failed           → mark past_due, trigger payment-failed email
 *
 * Identifies the practice via metadata.practice_id (set by the Checkout
 * session) or falls back to looking up the customer id in the practices
 * table. Updates are made through the admin client (RLS bypass).
 *
 * Signed with STRIPE_WEBHOOK_SECRET. Locally use `stripe listen --forward-to
 * http://localhost:3000/api/stripe/webhook` to set up the secret and forward
 * events. In production register the endpoint URL in the Stripe dashboard.
 */

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type AppSubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled";

function mapStripeStatus(status: Stripe.Subscription.Status): AppSubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
    case "paused":
      return "past_due";
    default:
      return "cancelled";
  }
}

async function findPracticeId(
  customerId: string | null | undefined,
  metadataPracticeId: string | null | undefined,
): Promise<string | null> {
  if (metadataPracticeId) return metadataPracticeId;
  if (!customerId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("practices")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function applySubscriptionState(
  practiceId: string,
  subscription: Stripe.Subscription,
) {
  const admin = createAdminClient();
  const status = mapStripeStatus(subscription.status);
  const { error } = await admin
    .from("practices")
    .update({
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
    })
    .eq("id", practiceId);
  if (error) {
    console.error("[stripe-webhook] failed to update practice:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err);
    return NextResponse.json(
      { error: "Signature verification failed." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const practiceId = await findPracticeId(
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
          session.metadata?.practice_id ?? null,
        );
        if (!practiceId) {
          console.error("[stripe-webhook] no practice for session:", session.id);
          break;
        }
        await applySubscriptionState(practiceId, subscription);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const practiceId = await findPracticeId(
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
          subscription.metadata?.practice_id ?? null,
        );
        if (!practiceId) {
          console.error(
            "[stripe-webhook] no practice for subscription:",
            subscription.id,
          );
          break;
        }
        await applySubscriptionState(practiceId, subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;

        const practiceId = await findPracticeId(customerId, null);
        if (!practiceId) {
          console.error("[stripe-webhook] no practice for invoice:", invoice.id);
          break;
        }

        const admin = createAdminClient();
        await admin
          .from("practices")
          .update({ subscription_status: "past_due" })
          .eq("id", practiceId);

        // TODO(billing): send "payment failed" email via Resend (template
        // 06-payment-failed.html) — wire when transactional sender lands.
        break;
      }

      default:
        // Other events ignored. Log for visibility during dev.
        // No-op in production.
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error:", err);
    return NextResponse.json(
      { error: "Handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
