// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript:  true,
});

export async function createPaymentIntent({
  amount,
  currency = "thb",
  metadata = {},
}: {
  amount:    number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount:   Math.round(amount * 100), // convert to satang
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}

export async function createCheckoutSession({
  lineItems,
  orderId,
  userId,
  successUrl,
  cancelUrl,
  currency = "thb",
}: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  orderId:   string;
  userId:    string;
  successUrl: string;
  cancelUrl:  string;
  currency?:  string;
}) {
  return stripe.checkout.sessions.create({
    mode:        "payment",
    line_items:  lineItems,
    success_url: successUrl,
    cancel_url:  cancelUrl,
    currency,
    metadata:    { orderId, userId },
    payment_intent_data: { metadata: { orderId, userId } },
  });
}

export function constructWebhookEvent(payload: Buffer | string, sig: string) {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
