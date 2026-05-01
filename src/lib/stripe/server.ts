/**
 * Server-only Stripe client. Use in server actions, route handlers, and
 * the webhook receiver. Never import from a client component.
 */

import "server-only";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Throw at module-load time during dev so we get a loud error, but allow
  // marketing-route prod builds to render — they don't import this module.
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local before using billing.",
    );
  }
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // Pin the API version so unattended Stripe rolling updates don't break us.
  // Bump intentionally after testing in test mode.
  apiVersion: "2026-04-22.dahlia",
  appInfo: {
    name: "Overturn",
    url: "https://hioverturn.com",
  },
});
