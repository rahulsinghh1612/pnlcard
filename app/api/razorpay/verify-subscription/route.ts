import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getRazorpayInstance,
  verifySubscriptionCheckoutSignature,
} from "@/lib/razorpay";
import { normalizeBillingEmail } from "@/lib/billing";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const cycle = body.cycle as "monthly" | "yearly";
    const paymentId = body.paymentId as string;
    const subscriptionId = body.subscriptionId as string;
    const signature = body.signature as string;

    if (!cycle || !["monthly", "yearly"].includes(cycle)) {
      return NextResponse.json({ error: "Invalid cycle." }, { status: 400 });
    }

    if (!paymentId || !subscriptionId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    const isValid = verifySubscriptionCheckoutSignature({
      paymentId,
      subscriptionId,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    const notes = subscription.notes as Record<string, string> | undefined;
    if (notes?.user_id && notes.user_id !== user.id) {
      return NextResponse.json({ error: "Subscription mismatch." }, { status: 403 });
    }

    const status = subscription.status as
      | "created"
      | "authenticated"
      | "active"
      | "pending"
      | "halted"
      | "cancelled"
      | "expired"
      | "completed";

    const currentStart = subscription.current_start
      ? new Date(subscription.current_start * 1000).toISOString()
      : null;
    const currentEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000).toISOString()
      : null;
    const trialEndsAt = subscription.charge_at
      ? new Date(subscription.charge_at * 1000).toISOString()
      : subscription.start_at
        ? new Date(subscription.start_at * 1000).toISOString()
        : null;

    const { error: upsertError } = await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          provider: "razorpay",
          provider_subscription_id: subscription.id,
          plan_type: cycle,
          status,
          current_period_start: currentStart,
          current_period_end: currentEnd ?? trialEndsAt,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      throw upsertError;
    }

    if (cycle === "yearly" && status === "authenticated" && trialEndsAt) {
      const normalizedEmail = normalizeBillingEmail(user.email ?? null);
      const { error: profileError } = await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_expires_at: null,
          trial_ends_at: trialEndsAt,
          yearly_trial_used_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      if (normalizedEmail) {
        const { error: billingError } = await admin
          .from("billing_customers")
          .upsert(
            {
              normalized_email: normalizedEmail,
              latest_auth_user_id: user.id,
              latest_profile_id: user.id,
              yearly_trial_used_at: new Date().toISOString(),
              latest_provider: "razorpay",
              latest_provider_subscription_id: subscription.id,
              last_known_status: status,
              deleted_account_at: null,
            },
            { onConflict: "normalized_email" }
          );

        if (billingError) {
          throw billingError;
        }
      }

      return NextResponse.json({ status: "trial", trialEndsAt });
    }

    if (status === "active") {
      const accessEndsAt = currentEnd ?? trialEndsAt;
      const normalizedEmail = normalizeBillingEmail(user.email ?? null);
      const { error: profileError } = await admin
        .from("profiles")
        .update({
          plan: "premium",
          plan_expires_at: accessEndsAt,
          trial_ends_at: null,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      if (normalizedEmail) {
        const { error: billingError } = await admin
          .from("billing_customers")
          .upsert(
            {
              normalized_email: normalizedEmail,
              latest_auth_user_id: user.id,
              latest_profile_id: user.id,
              first_paid_at: currentStart ?? new Date().toISOString(),
              latest_provider: "razorpay",
              latest_provider_subscription_id: subscription.id,
              last_known_status: status,
              deleted_account_at: null,
            },
            { onConflict: "normalized_email" }
          );

        if (billingError) {
          throw billingError;
        }
      }

      return NextResponse.json({ status: "subscribed", planExpiresAt: accessEndsAt });
    }

    return NextResponse.json({ status });
  } catch (error: unknown) {
    console.error("Error verifying Razorpay subscription:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
