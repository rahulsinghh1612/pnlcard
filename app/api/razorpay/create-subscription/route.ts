import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayInstance, getPlanId } from "@/lib/razorpay";

/**
 * POST /api/razorpay/create-subscription
 *
 * Called from the frontend when a user clicks "Upgrade to Premium".
 * Creates a Razorpay subscription and returns the subscription ID
 * so the frontend can open the Razorpay checkout modal.
 *
 * Body: { cycle: "monthly" | "yearly" }
 *
 * The flow:
 * 1. Verify the user is authenticated
 * 2. Create a subscription on Razorpay with the chosen plan
 * 3. Return the subscription ID to the frontend
 * 4. Frontend opens Razorpay checkout with that subscription ID
 * 5. After payment, Razorpay sends a webhook (handled by /api/webhooks/razorpay)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cycle = body.cycle as "monthly" | "yearly";

    if (!cycle || !["monthly", "yearly"].includes(cycle)) {
      return NextResponse.json(
        { error: "Invalid cycle. Must be 'monthly' or 'yearly'." },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();
    const planId = getPlanId(cycle);

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: cycle === "monthly" ? 12 : 1,
      quantity: 1,
      notes: {
        user_id: user.id,
        user_email: user.email ?? "",
        cycle,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    console.error("Error creating Razorpay subscription:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
