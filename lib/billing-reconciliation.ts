import { normalizeBillingEmail } from "@/lib/billing";
import { getPlanId, getRazorpayInstance } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subscription } from "@/lib/types";

type SubscriptionStatus = Subscription["status"];

type BillingProfile = {
  plan: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
  yearly_trial_used_at?: string | null;
};

type LocalSubscription = {
  provider_subscription_id: string | null;
  provider?: string | null;
  plan_type: "monthly" | "yearly";
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at?: string | null;
  updated_at?: string | null;
} | null;

type SubscriptionUpsertPayload = NonNullable<LocalSubscription> & {
  user_id: string;
  provider: "razorpay";
};

type RazorpaySubscriptionLike = {
  id: string;
  status: SubscriptionStatus;
  plan_id?: string;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  start_at?: number | null;
  ended_at?: number | null;
  notes?: Record<string, string>;
};

function isFutureDate(value: string | null): boolean {
  if (!value) return false;
  return new Date(value) > new Date();
}

function hasActiveLocalAccess(profile: BillingProfile | null): boolean {
  if (!profile) return false;
  if (profile.plan === "premium") {
    return !profile.plan_expires_at || isFutureDate(profile.plan_expires_at);
  }
  return isFutureDate(profile.trial_ends_at);
}

function shouldReconcile(
  profile: BillingProfile | null,
  subscription: LocalSubscription
): boolean {
  if (!hasActiveLocalAccess(profile)) return false;
  if (!subscription) return true;
  return ["created", "cancelled"].includes(subscription.status);
}

function toIsoDate(value?: number | null): string | null {
  return value ? new Date(value * 1000).toISOString() : null;
}

function getPlanType(subscription: RazorpaySubscriptionLike): "monthly" | "yearly" {
  if (subscription.notes?.cycle === "yearly") return "yearly";
  if (subscription.notes?.cycle === "monthly") return "monthly";

  try {
    if (subscription.plan_id === getPlanId("yearly")) return "yearly";
  } catch {
    // Fall back to monthly if env is unavailable during local tooling.
  }

  return "monthly";
}

function getAccessEnd(subscription: RazorpaySubscriptionLike): string | null {
  return (
    toIsoDate(subscription.current_end) ??
    toIsoDate(subscription.charge_at) ??
    toIsoDate(subscription.start_at)
  );
}

function scoreSubscription(subscription: RazorpaySubscriptionLike): number {
  const statusScore: Record<string, number> = {
    active: 600,
    authenticated: 500,
    pending: 300,
    halted: 250,
    paused: 250,
    cancelled: 150,
    completed: 100,
    expired: 75,
    created: 25,
  };

  const endTime =
    subscription.current_end ??
    subscription.charge_at ??
    subscription.start_at ??
    subscription.ended_at ??
    0;

  return (statusScore[subscription.status] ?? 0) * 10_000_000_000 + endTime;
}

async function findBestRazorpaySubscriptionForUser(params: {
  userId: string;
}) {
  const razorpay = getRazorpayInstance();
  const matches: RazorpaySubscriptionLike[] = [];

  for (let skip = 0; skip < 300; skip += 100) {
    const page = await razorpay.subscriptions.all({ count: 100, skip });
    const items = (page.items ?? []) as RazorpaySubscriptionLike[];

    matches.push(
      ...items.filter((subscription) => {
        const notes = subscription.notes ?? {};
        return notes.user_id === params.userId;
      })
    );

    if (items.length < 100) break;
  }

  return matches.sort((a, b) => scoreSubscription(b) - scoreSubscription(a))[0] ?? null;
}

export async function reconcileRazorpaySubscriptionForUser(params: {
  userId: string;
  email: string | null | undefined;
  profile: BillingProfile | null;
  subscription: LocalSubscription;
}): Promise<LocalSubscription> {
  if (!shouldReconcile(params.profile, params.subscription)) {
    return params.subscription;
  }

  const admin = createAdminClient();
  if (!admin) return params.subscription;

  try {
    const razorpaySubscription = await findBestRazorpaySubscriptionForUser({
      userId: params.userId,
    });

    if (!razorpaySubscription) return params.subscription;

    const planType = getPlanType(razorpaySubscription);
    const currentPeriodStart = toIsoDate(razorpaySubscription.current_start);
    const currentPeriodEnd = getAccessEnd(razorpaySubscription);
    const normalizedEmail = normalizeBillingEmail(params.email);

    const subscriptionPayload: SubscriptionUpsertPayload = {
      user_id: params.userId,
      provider: "razorpay",
      provider_subscription_id: razorpaySubscription.id,
      plan_type: planType,
      status: razorpaySubscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
    };

    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (subscriptionError) throw subscriptionError;

    if (razorpaySubscription.status === "active") {
      await admin
        .from("profiles")
        .update({
          plan: "premium",
          plan_expires_at: currentPeriodEnd,
          trial_ends_at: null,
        })
        .eq("id", params.userId);
    }

    if (
      planType === "yearly" &&
      razorpaySubscription.status === "authenticated" &&
      currentPeriodEnd
    ) {
      await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_expires_at: null,
          trial_ends_at: currentPeriodEnd,
          yearly_trial_used_at:
            params.profile?.yearly_trial_used_at ?? new Date().toISOString(),
        })
        .eq("id", params.userId);
    }

    if (normalizedEmail) {
      const billingPayload: Record<string, string | null> = {
        normalized_email: normalizedEmail,
        latest_auth_user_id: params.userId,
        latest_profile_id: params.userId,
        latest_provider: "razorpay",
        latest_provider_subscription_id: razorpaySubscription.id,
        last_known_status: razorpaySubscription.status,
        deleted_account_at: null,
      };

      if (planType === "yearly") {
        billingPayload.yearly_trial_used_at =
          params.profile?.yearly_trial_used_at ?? new Date().toISOString();
      }

      if (razorpaySubscription.status === "active") {
        billingPayload.first_paid_at = currentPeriodStart ?? new Date().toISOString();
      }

      await admin
        .from("billing_customers")
        .upsert(billingPayload, { onConflict: "normalized_email" });
    }

    return subscriptionPayload;
  } catch (error) {
    console.error("Error reconciling Razorpay subscription:", error);
    return params.subscription;
  }
}
