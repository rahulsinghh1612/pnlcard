"use client";

import type { AccessStatus } from "@/lib/types";
import { UpgradeButton } from "./upgrade-button";

type TrialBannerProps = {
  trialDaysRemaining: number;
  accessStatus: AccessStatus;
  userEmail: string;
  userName: string;
};

export function TrialBanner({
  trialDaysRemaining,
  accessStatus,
  userEmail,
  userName,
}: TrialBannerProps) {
  if (accessStatus !== "trial") return null;

  const urgent = trialDaysRemaining <= 3;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${
        urgent
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <p className="font-medium">
        {trialDaysRemaining === 0
          ? "Your trial ends today!"
          : trialDaysRemaining === 1
            ? "1 day left in your free trial"
            : `${trialDaysRemaining} days left in your free trial`}
      </p>
      <UpgradeButton
        userEmail={userEmail}
        userName={userName}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
          urgent
            ? "bg-red-600 hover:bg-red-700"
            : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        Subscribe
      </UpgradeButton>
    </div>
  );
}
