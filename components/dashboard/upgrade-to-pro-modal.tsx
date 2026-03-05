"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpgradeButton } from "./upgrade-button";
import { Crown, BarChart3, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";

/** Single consolidated paywall for Weekly & Monthly Reviews. */
const PAYWALL_CONTENT = {
  title: "Unlock your weekly & monthly trading report",
  features: [
    {
      icon: BarChart3,
      title: "Weekly performance breakdown",
    },
    {
      icon: CalendarDays,
      title: "Daily performance analysis",
    },
    {
      icon: TrendingUp,
      title: "Discipline vs profitability insights",
    },
    {
      icon: AlertCircle,
      title: "Mistake tracking (FOMO, overtrading, etc.)",
    },
  ],
  ctaPrimary: "Unlock Weekly & Monthly Reviews",
  ctaSecondary: "Continue with free plan",
  trustLine: "Built for traders serious about improving discipline.",
};

type UpgradeToProModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
};

export function UpgradeToProModal({
  open,
  onOpenChange,
  userEmail,
  userName,
}: UpgradeToProModalProps) {
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      router.push("/dashboard");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg border-0 bg-gradient-to-b from-white to-slate-50/80 p-0 shadow-2xl sm:rounded-2xl overflow-visible"
        hideCloseButton={false}
      >
        <div className="relative overflow-visible rounded-2xl">
          <div className="w-full px-8 py-6 pr-12 text-center sm:px-10 sm:pr-14 sm:py-8">
            <DialogHeader className="space-y-3 text-center sm:text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 ring-2 ring-amber-100/80 ring-offset-2">
                <Crown className="h-7 w-7 text-amber-600" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {PAYWALL_CONTENT.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="block">Turn your data into clear insights.</span>
                <span className="block">See profits, losses, and how discipline shaped results.</span>
              </p>
            </DialogHeader>

            <ul className="mt-4 space-y-2.5">
              {PAYWALL_CONTENT.features.map(({ icon: Icon, title }) => (
                <li
                  key={title}
                  className="flex items-center justify-center gap-3 rounded-lg bg-white/60 px-3 py-2.5 shadow-sm ring-1 ring-slate-200/60"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-foreground">{title}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2">
              <UpgradeButton
                userEmail={userEmail}
                userName={userName}
                dropdownPosition="top"
                className="btn-gradient-flow w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {PAYWALL_CONTENT.ctaPrimary}
              </UpgradeButton>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {PAYWALL_CONTENT.ctaSecondary}
              </button>
              <p className="pt-1 text-center text-[11px] text-muted-foreground/80">
                {PAYWALL_CONTENT.trustLine}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
