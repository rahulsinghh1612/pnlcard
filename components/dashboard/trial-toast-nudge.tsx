"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { AccessStatus } from "@/lib/types";

type TrialToastNudgeProps = {
  trialDaysRemaining: number;
  accessStatus: AccessStatus;
};

const NUDGE_SCHEDULE: { maxDays: number; message: string }[] = [
  { maxDays: 0, message: "Your trial has ended. Subscribe to continue logging trades." },
  { maxDays: 1, message: "Your trial ends tomorrow! Subscribe now to avoid losing access." },
  { maxDays: 3, message: "Only 3 days left in your trial. Subscribe to keep access." },
  { maxDays: 7, message: "You're halfway through your trial \u2014 7 days left!" },
];

export function TrialToastNudge({
  trialDaysRemaining,
  accessStatus,
}: TrialToastNudgeProps) {
  useEffect(() => {
    if (accessStatus === "subscribed") return;

    const nudge = NUDGE_SCHEDULE.find((n) => trialDaysRemaining <= n.maxDays);
    if (!nudge) return;

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
  }, [trialDaysRemaining, accessStatus]);

  return null;
}
