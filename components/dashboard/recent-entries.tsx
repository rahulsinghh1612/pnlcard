import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ImageIcon } from "lucide-react";

type Trade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
};

type RecentEntriesProps = {
  trades: Trade[];
  currency: string;
};

function getFinalResult(t: Trade): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function formatPnl(value: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${symbol}${formatted}`;
}

export function RecentEntries({ trades, currency }: RecentEntriesProps) {
  if (trades.length === 0) return null;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-card dark:via-card dark:to-slate-900/20 p-6">
      <h2 className="text-sm font-medium text-foreground mb-4">
        Recent entries
      </h2>
      <ul className="space-y-3">
        {trades.slice(0, 7).map((t) => {
          const result = getFinalResult(t);
          const isProfit = result >= 0;
          return (
            <li
              key={t.id}
              className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(t.trade_date + "T12:00:00"), "EEE, MMM d")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.num_trades} trade{t.num_trades !== 1 ? "s" : ""}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  isProfit ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatPnl(result, currency)}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/card?date=${t.trade_date}`}>
                  <ImageIcon className="h-4 w-4" />
                  Generate Card
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
