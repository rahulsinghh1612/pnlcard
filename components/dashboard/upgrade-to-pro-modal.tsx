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

const PAYWALL_CONTENT = {
  title: "Subscribe to PnLCard",
  features: [
    {
      icon: BarChart3,
      title: "Keep logging trades daily",
    },
    {
      icon: CalendarDays,
      title: "All card types — daily, weekly, monthly",
    },
    {
      icon: TrendingUp,
      title: "Weekly & monthly reviews",
    },
    {
      icon: AlertCircle,
      title: "Uninterrupted access to your data",
    },
  ],
  ctaPrimary: "Subscribe to PnLCard",
  ctaSecondary: "Maybe later",
  trustLine: "No credit card required to start. Cancel anytime.",
};

type UpgradeToProModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
  /** When false, closing does not redirect (e.g. when already on dashboard) */
  redirectOnClose?: boolean;
};

export function UpgradeToProModal({
  open,
  onOpenChange,
  userEmail,
  userName,
  redirectOnClose = true,
}: UpgradeToProModalProps) {
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && redirectOnClose) {
      router.push("/dashboard");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg border-0 bg-gradient-to-b from-white to-slate-50/80 p-0 shadow-2xl rounded-3xl sm:rounded-2xl overflow-visible"
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
                Keep your trading journal going. Don&apos;t lose your streak.
              </p>
            </DialogHeader>

            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left">
              {PAYWALL_CONTENT.features.map(({ icon: Icon, title }) => (
                <li
                  key={title}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">{title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2">
              <UpgradeButton
                userEmail={userEmail}
                userName={userName}
                dropdownPosition="top"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
