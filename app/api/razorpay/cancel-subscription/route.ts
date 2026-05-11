import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayInstance } from "@/lib/razorpay";
import { normalizeBillingEmail } from "@/lib/billing";

/**
 * POST /api/razorpay/cancel-subscription
 *
 * Cancels the authenticated user's Razorpay subscription.
 * - Looks up the active subscription in our DB
 * - Calls Razorpay API to cancel it
 * - Updates our DB (subscription status + profile plan)
 *
 * Razorpay cancel_at_cycle_end = true means the user keeps
 * access until the end of their current billing period.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Look for any non-cancelled subscription for this user
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("provider_subscription_id, status, current_period_end, plan_type")
      .eq("user_id", user.id)
      .in("status", ["created", "authenticated", "active", "pending", "halted", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let providerSubscriptionId = subscription?.provider_subscription_id ?? null;

    if (!providerSubscriptionId) {
      const normalizedEmail = normalizeBillingEmail(user.email ?? null);
      if (normalizedEmail) {
        const { data: billingCustomer } = await admin
          .from("billing_customers")
          .select("latest_provider_subscription_id")
          .eq("normalized_email", normalizedEmail)
          .maybeSingle();

        providerSubscriptionId =
          billingCustomer?.latest_provider_subscription_id ?? null;
      }
    }

    if (!providerSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "We couldn't find an active subscription to cancel yet. Please refresh and try again in a moment.",
        },
        { status: 404 }
      );
    }

    const razorpay = getRazorpayInstance();
    const razorpaySubscription = await razorpay.subscriptions.fetch(
      providerSubscriptionId
    );
    const razorpayStatus = razorpaySubscription.status as string;
    const currentPeriodEnd = razorpaySubscription.current_end
      ? new Date(razorpaySubscription.current_end * 1000).toISOString()
      : subscription?.current_period_end ?? null;
    const planType =
      subscription?.plan_type ??
      ((razorpaySubscription.notes as Record<string, string> | undefined)?.cycle ===
      "yearly"
        ? "yearly"
        : "monthly");

    const cancelAtCycleEnd = razorpayStatus === "active";
    await razorpay.subscriptions.cancel(
      providerSubscriptionId,
      cancelAtCycleEnd
    );

    // Mark subscription as cancelled — no more renewals
    await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          provider: "razorpay",
          provider_subscription_id: providerSubscriptionId,
          plan_type: planType,
          status: "cancelled",
          current_period_end: currentPeriodEnd,
        },
        { onConflict: "user_id" }
      );

    if (razorpayStatus !== "active") {
      await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_expires_at: null,
          trial_ends_at: currentPeriodEnd,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      status: "cancelled",
      accessEndsAt: razorpayStatus === "active" ? null : currentPeriodEnd,
    });
  } catch (error: unknown) {
    console.error("Error cancelling subscription:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
