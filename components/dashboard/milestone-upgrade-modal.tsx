"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpgradeButton } from "./upgrade-button";
import { Sparkles, BarChart3, CalendarDays } from "lucide-react";

/** Messages for each milestone (1st, 5th, 10th trade logged). */
const MILESTONE_MESSAGES: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Great start!",
    subtitle: "You're building your trading journal. Upgrade to Pro to unlock weekly & monthly reviews, discipline insights, and more.",
  },
  5: {
    title: "You're building a habit!",
    subtitle: "Go Pro to see patterns across your trades and level up your discipline.",
  },
  10: {
    title: "10 trades logged!",
    subtitle: "Unlock Pro to enjoy weekly & monthly reviews, all card types without watermark, and discipline analytics.",
  },
};

type MilestoneUpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
  /** 1, 5, or 10 — which milestone was just hit */
  milestone: number;
};

export function MilestoneUpgradeModal({
  open,
  onOpenChange,
  userEmail,
  userName,
  milestone,
}: MilestoneUpgradeModalProps) {
  const { title, subtitle } = MILESTONE_MESSAGES[milestone] ?? MILESTONE_MESSAGES[1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg border-0 bg-gradient-to-b from-white to-slate-50/80 p-0 shadow-2xl rounded-3xl sm:rounded-2xl overflow-visible"
        hideCloseButton={false}
      >
        <div className="relative overflow-visible rounded-2xl">
          <div className="w-full px-8 py-6 pr-12 text-center sm:px-10 sm:pr-14 sm:py-8">
            <DialogHeader className="space-y-3 text-center sm:text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 ring-2 ring-amber-100/80 ring-offset-2">
                <Sparkles className="h-7 w-7 text-amber-600" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </DialogHeader>

            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left">
              {[
                { icon: BarChart3, text: "Weekly & monthly performance reports" },
                { icon: CalendarDays, text: "Discipline & mistake tracking" },
                { icon: Sparkles, text: "All card types, no watermark" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">{text}</span>
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
                Upgrade to Pro
              </UpgradeButton>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
