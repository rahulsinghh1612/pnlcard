import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AccessStatus } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
function isSubscribed(profile: {
  plan: string | null;
  plan_expires_at: string | null;
}): boolean {
  if (profile?.plan !== "premium") return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at) > new Date();
}

/** Tri-state access: subscribed > trial > expired */
export function getUserAccessStatus(profile: {
  plan: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
}): AccessStatus {
  if (isSubscribed(profile)) return "subscribed";
  if (!profile.trial_ends_at) return "trial"; // NULL = new account, treat as active trial
  if (new Date(profile.trial_ends_at) > new Date()) return "trial";
  return "expired";
}

/** Full access = trial or subscribed (not expired) */
export function hasFullAccess(profile: {
  plan: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
}): boolean {
  return getUserAccessStatus(profile) !== "expired";
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
