"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { BillingState } from "@/lib/utils";

type TrialToastNudgeProps = {
  billingState: BillingState;
  trialDaysRemaining: number;
};

const NUDGE_SCHEDULE: { maxDays: number; message: string }[] = [
  { maxDays: 0, message: "Your yearly trial has ended. Subscribe to continue logging trades." },
  { maxDays: 1, message: "Your yearly trial ends tomorrow. Cancel before then if you do not want the annual charge." },
  { maxDays: 3, message: "Only 3 days left in your yearly trial. Cancel before it ends to avoid the annual charge." },
  { maxDays: 7, message: "Your 7-day yearly trial is live. Your card will be charged only if you keep it past the trial end." },
];

export function TrialToastNudge({
  billingState,
  trialDaysRemaining,
}: TrialToastNudgeProps) {
  useEffect(() => {
    if (billingState === "subscribed_active" || billingState === "subscribed_cancelled") {
      return;
    }
    if (billingState === "trial_cancelled") return;
    if (billingState === "expired" && trialDaysRemaining > 0) return;
    if (billingState === "expired" && trialDaysRemaining === 0) {
      const key = "pnlcard_trial_nudge_0";
      try {
        if (localStorage.getItem(key) === "shown") return;
        localStorage.setItem(key, "shown");
      } catch {
        return;
      }

      const t = setTimeout(() => {
        toast(NUDGE_SCHEDULE[0].message, {
          duration: 8000,
          action: {
            label: "Subscribe",
            onClick: () => {
              window.location.href = "/dashboard/settings";
            },
          },
        });
      }, 1500);

      return () => clearTimeout(t);
    }

    const nudge = NUDGE_SCHEDULE.find((n) => trialDaysRemaining <= n.maxDays);
    if (!nudge) return;
    if (nudge.maxDays === 0) return;

    const key = `pnlcard_trial_nudge_${nudge.maxDays}`;
    try {
      if (localStorage.getItem(key) === "shown") return;
      localStorage.setItem(key, "shown");
    } catch {
      return;
    }

    const t = setTimeout(() => {
      toast(nudge.message, {
        duration: 8000,
        action: {
          label: "Subscribe",
          onClick: () => {
            window.location.href = "/dashboard/settings";
          },
          },
        });
      }, 1500);

    return () => clearTimeout(t);
  }, [trialDaysRemaining, billingState]);

  return null;
}
