import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Flame } from "lucide-react";

type QuickStatsProps = {
  weekPnl: number;
  weekWinRate: number | null;
  streak: number;
  currency: string;
};

function formatPnl(value: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${symbol}${formatted}`;
}

export function QuickStats({
  weekPnl,
  weekWinRate,
  streak,
  currency,
}: QuickStatsProps) {
  const pnlPositive = weekPnl >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card
        className={`overflow-hidden p-4 ${
          pnlPositive
            ? "bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 dark:from-emerald-950/20 dark:via-card dark:to-emerald-950/10"
            : "bg-gradient-to-br from-red-50/80 via-white to-red-50/40 dark:from-red-950/20 dark:via-card dark:to-red-950/10"
        }`}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          This week&apos;s P&L
        </div>
        <p
          className={`mt-1 text-xl font-semibold ${
            pnlPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatPnl(weekPnl, currency)}
        </p>
      </Card>

      <Card className="overflow-hidden bg-gradient-to-br from-slate-50/60 via-white to-slate-50/30 dark:from-slate-900/20 dark:via-card dark:to-slate-900/10 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          Win rate
        </div>
        <p className="mt-1 text-xl font-semibold text-foreground">
          {weekWinRate != null ? `${weekWinRate}%` : "—"}
        </p>
      </Card>

      <Card className="overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-amber-950/15 dark:via-card dark:to-amber-950/5 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4" />
          Streak
        </div>
        <p className="mt-1 text-xl font-semibold text-foreground">
          {streak > 0 ? `${streak}d` : "—"}
        </p>
      </Card>
    </div>
  );
}
