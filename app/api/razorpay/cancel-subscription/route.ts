import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayInstance } from "@/lib/razorpay";

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
      .select("provider_subscription_id, status, current_period_end")
      .eq("user_id", user.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription?.provider_subscription_id) {
      // No subscription in DB — downgrade the profile (edge case: manual or webhook-only)
      await admin
        .from("profiles")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", user.id);

      return NextResponse.json({ status: "cancelled" });
    }

    const razorpay = getRazorpayInstance();
    // cancel_at_cycle_end = true: user keeps access until end of paid period
    await razorpay.subscriptions.cancel(
      subscription.provider_subscription_id,
      true
    );

    // Mark subscription as cancelled — no more renewals
    await admin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("provider_subscription_id", subscription.provider_subscription_id);

    // Do NOT downgrade the profile. User has paid until current_period_end.
    // Keep plan="premium" and plan_expires_at so they retain access until then.
    // The isPremiumUser() helper checks plan_expires_at to revoke access when it passes.
    return NextResponse.json({ status: "cancelled" });
  } catch (error: unknown) {
    console.error("Error cancelling subscription:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
