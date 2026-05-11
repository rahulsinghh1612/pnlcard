import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeBillingEmail } from "@/lib/billing";

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay sends webhook events here when subscription-related things happen.
 * We handle three key events:
 *
 *   subscription.authenticated — card authorised, waiting for future trial-end charge
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

    if (eventType === "subscription.authenticated") {
      await handleSubscriptionAuthenticated(supabase, event);
    } else if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged" ||
      eventType === "subscription.resumed"
    ) {
      await handleSubscriptionActivated(supabase, event);
    } else if (
      eventType === "subscription.pending" ||
      eventType === "subscription.halted" ||
      eventType === "subscription.paused" ||
      eventType === "subscription.completed" ||
      eventType === "subscription.updated"
    ) {
      await handleSubscriptionLifecycleUpdate(supabase, event);
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

async function handleSubscriptionAuthenticated(
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
  const normalizedEmail = normalizeBillingEmail(notes?.user_email);

  if (!userId) {
    console.error("No user_id in subscription notes:", subscriptionId);
    return;
  }

  const planType = (notes?.cycle as "monthly" | "yearly") ?? "monthly";
  const currentStart = subscription.current_start
    ? new Date((subscription.current_start as number) * 1000).toISOString()
    : null;
  const trialEndsAt = subscription.charge_at
    ? new Date((subscription.charge_at as number) * 1000).toISOString()
    : subscription.start_at
      ? new Date((subscription.start_at as number) * 1000).toISOString()
      : null;

  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        provider: "razorpay",
        provider_subscription_id: subscriptionId,
        plan_type: planType,
        status: "authenticated",
        current_period_start: currentStart,
        current_period_end: trialEndsAt,
      },
      { onConflict: "user_id" }
    );

  if (subError) {
    console.error("Error upserting authenticated subscription:", subError);
  }

  if (planType === "yearly" && trialEndsAt) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan: "free",
        plan_expires_at: null,
        trial_ends_at: trialEndsAt,
        yearly_trial_used_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile trial:", profileError);
    }
  }

  if (normalizedEmail) {
    const billingPayload: Record<string, string | null> = {
      normalized_email: normalizedEmail,
      latest_auth_user_id: userId,
      latest_profile_id: userId,
      latest_provider: "razorpay",
      latest_provider_subscription_id: subscriptionId,
      last_known_status: "authenticated",
      deleted_account_at: null,
    };

    if (planType === "yearly") {
      billingPayload.yearly_trial_used_at = new Date().toISOString();
    }

    const { error: billingError } = await supabase
      .from("billing_customers")
      .upsert(billingPayload, { onConflict: "normalized_email" });

    if (billingError) {
      console.error("Error upserting billing customer trial state:", billingError);
    }
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
  const normalizedEmail = normalizeBillingEmail(notes?.user_email);

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
      trial_ends_at: null,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile plan:", profileError);
  }

  if (normalizedEmail) {
    const { error: billingError } = await supabase
      .from("billing_customers")
      .upsert(
        {
          normalized_email: normalizedEmail,
          latest_auth_user_id: userId,
          latest_profile_id: userId,
          first_paid_at: currentStart ?? new Date().toISOString(),
          latest_provider: "razorpay",
          latest_provider_subscription_id: subscriptionId,
          last_known_status: "active",
          deleted_account_at: null,
        },
        { onConflict: "normalized_email" }
      );

    if (billingError) {
      console.error("Error upserting billing customer paid state:", billingError);
    }
  }
}

/**
 * Handles subscription.cancelled events.
 *
 * When a user cancels with "cancel at cycle end", Razorpay sends this webhook
 * but the user has already paid until current_period_end. We only mark the
 * subscription as cancelled — we do NOT downgrade the profile. The user
 * keeps premium access until plan_expires_at (current_period_end). Access
 * is revoked by isPremiumUser() when that date passes.
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
  const normalizedEmail = normalizeBillingEmail(notes?.user_email);

  if (!userId) {
    console.error("No user_id in subscription notes:", subscriptionId);
    return;
  }

  const currentEnd = subscription.current_end
    ? new Date((subscription.current_end as number) * 1000).toISOString()
    : null;

  // Mark subscription as cancelled — no more renewals
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("provider_subscription_id", subscriptionId);

  if (subError) {
    console.error("Error updating subscription status:", subError);
  }

  if (currentEnd && new Date(currentEnd) > new Date()) {
    if (normalizedEmail) {
      const { error: billingError } = await supabase
        .from("billing_customers")
        .upsert(
          {
            normalized_email: normalizedEmail,
            latest_auth_user_id: userId,
            latest_profile_id: userId,
            latest_provider: "razorpay",
            latest_provider_subscription_id: subscriptionId,
            last_known_status: "cancelled",
          },
          { onConflict: "normalized_email" }
        );

      if (billingError) {
        console.error("Error updating billing customer cancelled state:", billingError);
      }
    }
    return;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      plan_expires_at: null,
      trial_ends_at: null,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error downgrading cancelled trial profile:", profileError);
  }

  if (normalizedEmail) {
    const { error: billingError } = await supabase
      .from("billing_customers")
      .upsert(
        {
          normalized_email: normalizedEmail,
          latest_auth_user_id: userId,
          latest_profile_id: userId,
          latest_provider: "razorpay",
          latest_provider_subscription_id: subscriptionId,
          last_known_status: "cancelled",
        },
        { onConflict: "normalized_email" }
      );

    if (billingError) {
      console.error("Error finalizing billing customer cancelled state:", billingError);
    }
  }
}

async function handleSubscriptionLifecycleUpdate(
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
  const normalizedEmail = normalizeBillingEmail(notes?.user_email);

  if (!userId) {
    console.error("No user_id in subscription notes:", subscriptionId);
    return;
  }

  const status = subscription.status as
    | "active"
    | "pending"
    | "halted"
    | "paused"
    | "completed"
    | "expired"
    | "cancelled";
  const planType = (notes?.cycle as "monthly" | "yearly") ?? "monthly";
  const currentStart = subscription.current_start
    ? new Date((subscription.current_start as number) * 1000).toISOString()
    : null;
  const currentEnd = subscription.current_end
    ? new Date((subscription.current_end as number) * 1000).toISOString()
    : null;

  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        provider: "razorpay",
        provider_subscription_id: subscriptionId,
        plan_type: planType,
        status,
        current_period_start: currentStart,
        current_period_end: currentEnd,
      },
      { onConflict: "user_id" }
    );

  if (subError) {
    console.error("Error updating lifecycle subscription state:", subError);
  }

  if (status === "pending" || status === "halted" || status === "paused") {
    const profileUpdate =
      currentEnd && new Date(currentEnd) > new Date()
        ? {
            plan: "premium",
            plan_expires_at: currentEnd,
          }
        : {
            plan: "free",
            plan_expires_at: null,
          };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile for lifecycle issue state:", profileError);
    }
  }

  if ((status === "completed" || status === "expired") && (!currentEnd || new Date(currentEnd) <= new Date())) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan: "free",
        plan_expires_at: null,
        trial_ends_at: null,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error expiring completed subscription profile:", profileError);
    }
  }

  if (normalizedEmail) {
    const { error: billingError } = await supabase
      .from("billing_customers")
      .upsert(
        {
          normalized_email: normalizedEmail,
          latest_auth_user_id: userId,
          latest_profile_id: userId,
          latest_provider: "razorpay",
          latest_provider_subscription_id: subscriptionId,
          last_known_status: status,
        },
        { onConflict: "normalized_email" }
      );

    if (billingError) {
      console.error("Error updating billing customer lifecycle state:", billingError);
    }
  }
}
