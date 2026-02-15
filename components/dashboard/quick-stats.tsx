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
  const formatted = abs >= 1_000_000
    ? `${(abs / 1_000_000).toFixed(1)}M`
    : abs >= 1_000
      ? `${(abs / 1_000).toFixed(1)}K`
      : abs.toFixed(0);
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
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          This week&apos;s P&L
        </div>
        <p
          className={`mt-1 text-xl font-semibold ${
            pnlPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatPnl(weekPnl, currency)}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          Win rate
        </div>
        <p className="mt-1 text-xl font-semibold text-foreground">
          {weekWinRate != null ? `${weekWinRate}%` : "—"}
        </p>
      </Card>

      <Card className="p-4">
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
