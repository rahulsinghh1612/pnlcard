import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
export function isPremiumUser(profile: {
  plan: string | null;
  plan_expires_at: string | null;
}): boolean {
  if (profile?.plan !== "premium") return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at) > new Date();
}
