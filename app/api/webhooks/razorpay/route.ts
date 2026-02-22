import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay sends webhook events here when subscription-related things happen.
 * We handle three key events:
 *
 *   subscription.activated  — first payment succeeded, subscription is active
 *   subscription.charged    — recurring payment succeeded (renewal)
 *   subscription.cancelled  — user or system cancelled the subscription
 *
 * For each event we:
 *   1. Verify the webhook signature (ensures the request is genuinely from Razorpay)
 *   2. Extract the subscription and user info from the payload
 *   3. Upsert the `subscriptions` table in our database
 *   4. Update the user's `profiles.plan` field accordingly
 *
 * IMPORTANT: This route uses the Supabase admin client (service role key)
 * because webhook requests aren't authenticated as any user — they come
 * from Razorpay's servers.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 400 }
      );
    }

    let isValid = false;
    try {
      isValid = verifyWebhookSignature(body, signature);
    } catch {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const eventType: string = event.event;

    const supabase = createAdminClient();
    if (!supabase) {
      console.error("Supabase admin client not available — missing service role key");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      await handleSubscriptionActivated(supabase, event);
    } else if (eventType === "subscription.cancelled") {
      await handleSubscriptionCancelled(supabase, event);
    }

    // Always return 200 so Razorpay doesn't retry
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ status: "ok" });
  }
}

/**
 * Handles subscription.activated and subscription.charged events.
 * These mean the user has successfully paid.
 */
async function handleSubscriptionActivated(
  supabase: ReturnType<typeof createAdminClient> & object,
  event: Record<string, unknown>
) {
  const payload = event.payload as Record<string, unknown>;
  const subscription = (payload.subscription as Record<string, unknown>)
    ?.entity as Record<string, unknown>;

  if (!subscription) {
    console.error("No subscription entity in webhook payload");
    return;
  }

  const subscriptionId = subscription.id as string;
  const notes = subscription.notes as Record<string, string> | undefined;
  const userId = notes?.user_id;

  if (!userId) {
    console.error("No user_id in subscription notes:", subscriptionId);
    return;
  }

  const planType = (notes?.cycle as "monthly" | "yearly") ?? "monthly";
  const currentStart = subscription.current_start
    ? new Date((subscription.current_start as number) * 1000).toISOString()
    : null;
  const currentEnd = subscription.current_end
    ? new Date((subscription.current_end as number) * 1000).toISOString()
    : null;

  // Upsert the subscription record — if one already exists for this user
  // from the same provider subscription, update it; otherwise insert new.
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        provider: "razorpay",
        provider_subscription_id: subscriptionId,
        plan_type: planType,
        status: "active",
        current_period_start: currentStart,
        current_period_end: currentEnd,
      },
      { onConflict: "user_id" }
    );

  if (subError) {
    console.error("Error upserting subscription:", subError);
  }

  // Upgrade the user's profile to premium
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      plan: "premium",
      plan_expires_at: currentEnd,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile plan:", profileError);
  }
}

/**
 * Handles subscription.cancelled events.
 * Downgrades the user back to the free plan.
 */
async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createAdminClient> & object,
  event: Record<string, unknown>
) {
  const payload = event.payload as Record<string, unknown>;
  const subscription = (payload.subscription as Record<string, unknown>)
    ?.entity as Record<string, unknown>;

  if (!subscription) {
    console.error("No subscription entity in webhook payload");
    return;
  }

  const subscriptionId = subscription.id as string;
  const notes = subscription.notes as Record<string, string> | undefined;
  const userId = notes?.user_id;

  if (!userId) {
    console.error("No user_id in subscription notes:", subscriptionId);
    return;
  }

  // Mark subscription as cancelled
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("provider_subscription_id", subscriptionId);

  if (subError) {
    console.error("Error updating subscription status:", subError);
  }

  // Downgrade the user to free
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      plan_expires_at: null,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error downgrading profile:", profileError);
  }
}
