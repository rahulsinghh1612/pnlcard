import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AccessStatus, Subscription } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type BillingProfile = {
  plan: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
};

type BillingSubscription = Pick<
  Subscription,
  "status" | "plan_type" | "current_period_end"
> | null;

export type BillingState =
  | "expired"
  | "trial_active"
  | "trial_cancelled"
  | "subscribed_active"
  | "subscribed_cancelled"
  | "payment_retry"
  | "payment_halted"
  | "subscription_paused";

function isFutureDate(value: string | null): boolean {
  if (!value) return false;
  return new Date(value) > new Date();
}

/**
 * Determines if a user has active premium access.
 * Premium is active when plan is "premium" AND either:
 * - plan_expires_at is null (legacy / no expiry), OR
 * - plan_expires_at is in the future (user has paid until that date).
 *
 * When a user cancels, we keep plan="premium" and plan_expires_at until
 * the end of their billing period — so they retain access until they've
 * used what they paid for.
 */
function isSubscribed(profile: BillingProfile): boolean {
  if (profile?.plan !== "premium") return false;
  if (!profile.plan_expires_at) return true;
  return isFutureDate(profile.plan_expires_at);
}

export function getBillingState(
  profile: BillingProfile,
  subscription?: BillingSubscription
): BillingState {
  const subscriptionStatus = subscription?.status as string | undefined;

  if (subscriptionStatus === "pending") {
    return "payment_retry";
  }

  if (subscriptionStatus === "halted") {
    return "payment_halted";
  }

  if (subscriptionStatus === "paused") {
    return "subscription_paused";
  }

  if (isSubscribed(profile)) {
    return subscription?.status === "active"
      ? "subscribed_active"
      : "subscribed_cancelled";
  }

  const hasTrialAccess = isFutureDate(profile.trial_ends_at);
  if (!hasTrialAccess) {
    return "expired";
  }

  const isYearlyTrial =
    subscription?.plan_type === "yearly" || profile.trial_ends_at != null;
  const cancellableTrialStatuses = new Set(["authenticated", "created", "pending"]);
  const canCancelTrial =
    isYearlyTrial &&
    cancellableTrialStatuses.has(subscriptionStatus ?? "");

  return canCancelTrial ? "trial_active" : "trial_cancelled";
}

/** Tri-state access: subscribed > trial > expired */
export function getUserAccessStatus(
  profile: BillingProfile,
  subscription?: BillingSubscription
): AccessStatus {
  const billingState = getBillingState(profile, subscription);
  if (billingState === "subscribed_active" || billingState === "subscribed_cancelled") {
    return "subscribed";
  }
  if (billingState === "payment_retry" || billingState === "payment_halted" || billingState === "subscription_paused") {
    return "subscribed";
  }
  if (billingState === "trial_active" || billingState === "trial_cancelled") {
    return "trial";
  }
  return "expired";
}

export function getBillingStateDetails(
  profile: BillingProfile,
  subscription?: BillingSubscription
) {
  const billingState = getBillingState(profile, subscription);
  const accessStatus = getUserAccessStatus(profile, subscription);
  const trialDaysRemaining = getTrialDaysRemaining({
    trial_ends_at: profile.trial_ends_at,
  });

  return {
    billingState,
    accessStatus,
    trialDaysRemaining,
    isYearlyTrial:
      accessStatus === "trial" &&
      (subscription?.plan_type === "yearly" || profile.trial_ends_at != null),
    canCancelTrial: billingState === "trial_active",
    hasCancelledTrial: billingState === "trial_cancelled",
    hasActiveSubscription: billingState === "subscribed_active",
    hasCancelledSubscription: billingState === "subscribed_cancelled",
    hasPaymentRetryIssue: billingState === "payment_retry",
    hasPaymentHaltedIssue: billingState === "payment_halted",
    isPausedSubscription: billingState === "subscription_paused",
  };
}

/** Full access = trial or subscribed (not expired) */
export function hasFullAccess(
  profile: BillingProfile,
  subscription?: BillingSubscription
): boolean {
  return getUserAccessStatus(profile, subscription) !== "expired";
}

/** Days remaining in trial (0 if expired or subscribed) */
export function getTrialDaysRemaining(profile: {
  trial_ends_at: string | null;
}): number {
  if (!profile.trial_ends_at) return 0;
  const diff = new Date(profile.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Alias for backward compatibility during migration */
export function isPremiumUser(profile: {
  plan: string | null;
  plan_expires_at: string | null;
  trial_ends_at?: string | null;
}): boolean {
  return hasFullAccess({
    plan: profile.plan,
    plan_expires_at: profile.plan_expires_at,
    trial_ends_at: profile.trial_ends_at ?? null,
  });
}

/**
 * Format a number string with Indian (en-IN) or US (en-US) locale commas.
 * Strips non-digits first, then formats. Returns "" for empty.
 */
export function formatTradingCapital(value: string, currency: "INR" | "USD"): string {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return "";
  const num = parseInt(digits, 10);
  if (isNaN(num)) return "";
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return num.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/**
 * Parse a formatted trading capital string back to raw number (for DB).
 */
export function parseTradingCapital(value: string): number | null {
  const digits = value.replace(/,/g, "").replace(/\s/g, "").trim();
  if (digits === "") return null;
  const num = parseFloat(digits);
  return isNaN(num) ? null : num;
}
