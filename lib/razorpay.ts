import Razorpay from "razorpay";
import crypto from "crypto";

export const YEARLY_TRIAL_DAYS = 7;

/**
 * Server-side Razorpay client instance.
 * Only import this in API routes / Server Components — never on the client.
 *
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars.
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables"
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Verifies the webhook signature sent by Razorpay.
 * Razorpay signs every webhook payload with your webhook secret using HMAC-SHA256.
 * We recompute the signature and compare — if they match, the request is genuine.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET environment variable");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export function verifySubscriptionCheckoutSignature(params: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET environment variable");
  }

  const payload = `${params.paymentId}|${params.subscriptionId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(params.signature)
  );
}

/** Plan IDs configured in the Razorpay dashboard */
export function getPlanId(cycle: "monthly" | "yearly"): string {
  const planId =
    cycle === "monthly"
      ? process.env.RAZORPAY_PLAN_MONTHLY_ID
      : process.env.RAZORPAY_PLAN_YEARLY_ID;

  if (!planId) {
    throw new Error(
      `Missing RAZORPAY_PLAN_${cycle.toUpperCase()}_ID environment variable`
    );
  }

  return planId;
}
