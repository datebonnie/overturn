/**
 * One-shot setup for the Overturn Stripe account.
 *
 * Idempotently:
 *   - Creates (or finds) the "Overturn Pro" product
 *   - Creates (or finds) the $199/month recurring USD price
 *   - Configures the Customer Portal (cancel + update card + view invoices)
 *
 * Prints the price id to stdout. Paste it into .env.local as
 * STRIPE_PRICE_OVERTURN_PRO so the Checkout flow knows what to charge for.
 *
 * Run:    npx tsx scripts/setup-stripe.ts
 * Re-run: safe, idempotent — won't create duplicates.
 */

import Stripe from "stripe";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY not set in .env.local");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

const PRODUCT_NAME = "Overturn Pro";
const PRODUCT_DESCRIPTION =
  "AI-generated payer-formatted insurance denial appeals for small medical practices.";
const PRICE_AMOUNT_CENTS = 19900; // $199.00
const PRICE_CURRENCY = "usd";
const PRICE_INTERVAL: Stripe.PriceCreateParams.Recurring.Interval = "month";

async function findOrCreateProduct(): Promise<Stripe.Product> {
  const existing = await stripe.products.search({
    query: `name:'${PRODUCT_NAME}' AND active:'true'`,
    limit: 1,
  });
  if (existing.data.length > 0) {
    console.log(`✓ Reusing existing product: ${existing.data[0].id}`);
    return existing.data[0];
  }

  const product = await stripe.products.create({
    name: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    metadata: { managed_by: "overturn-setup-script" },
  });
  console.log(`✓ Created product: ${product.id}`);
  return product;
}

async function findOrCreatePrice(productId: string): Promise<Stripe.Price> {
  const existing = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  const match = existing.data.find(
    (p) =>
      p.unit_amount === PRICE_AMOUNT_CENTS &&
      p.currency === PRICE_CURRENCY &&
      p.recurring?.interval === PRICE_INTERVAL &&
      p.recurring?.interval_count === 1,
  );
  if (match) {
    console.log(`✓ Reusing existing price: ${match.id}`);
    return match;
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: PRICE_AMOUNT_CENTS,
    currency: PRICE_CURRENCY,
    recurring: { interval: PRICE_INTERVAL },
    nickname: "Overturn Pro — $199/month",
    metadata: { managed_by: "overturn-setup-script" },
  });
  console.log(`✓ Created price: ${price.id}`);
  return price;
}

async function configurePortal(): Promise<Stripe.BillingPortal.Configuration> {
  const existing = await stripe.billingPortal.configurations.list({
    is_default: true,
    limit: 1,
  });

  // Single-plan SaaS: practices can update cards, view invoices, and cancel.
  // No subscription_update — there's nothing to switch to. Re-enable that
  // feature when we add an Enterprise tier or annual billing.
  // Stripe's exported namespace types are not accessible under ESM in v22+;
  // pull the Features type out of the actual SDK function signature.
  type CreateParams = Parameters<typeof stripe.billingPortal.configurations.create>[0];
  type Features = NonNullable<CreateParams["features"]>;

  const features: Features = {
    customer_update: {
      enabled: true,
      allowed_updates: ["email", "address", "phone", "tax_id"],
    },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: {
      enabled: true,
      mode: "at_period_end",
      cancellation_reason: {
        enabled: true,
        options: [
          "too_expensive",
          "missing_features",
          "switched_service",
          "unused",
          "customer_service",
          "too_complex",
          "low_quality",
          "other",
        ],
      },
    },
  };

  const businessProfile = {
    headline: "Manage your Overturn subscription.",
    privacy_policy_url: "https://hioverturn.com/privacy",
    terms_of_service_url: "https://hioverturn.com/terms",
  };

  if (existing.data.length > 0) {
    const updated = await stripe.billingPortal.configurations.update(
      existing.data[0].id,
      { features, business_profile: businessProfile },
    );
    console.log(`✓ Updated existing portal config: ${updated.id}`);
    return updated;
  }

  const config = await stripe.billingPortal.configurations.create({
    features,
    business_profile: businessProfile,
    default_return_url: "https://hioverturn.com/app/billing",
  });
  console.log(`✓ Created portal config: ${config.id}`);
  return config;
}

(async () => {
  try {
    const product = await findOrCreateProduct();
    const price = await findOrCreatePrice(product.id);
    await configurePortal();

    console.log("\n═══ done ═══");
    console.log(`Product:  ${product.id}`);
    console.log(`Price:    ${price.id}`);
    console.log("\nAdd this line to .env.local (replace the existing empty value):");
    console.log(`STRIPE_PRICE_OVERTURN_PRO=${price.id}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
