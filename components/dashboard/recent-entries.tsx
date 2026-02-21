import { Card } from "@/components/ui/card";
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
  onGenerateCard?: (tradeId: string) => void;
};

function getFinalResult(t: Trade): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

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

export function RecentEntries({ trades, currency, onGenerateCard }: RecentEntriesProps) {
  if (trades.length === 0) return null;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-card dark:via-card dark:to-slate-900/20 p-6">
      <h2 className="text-sm font-medium text-foreground mb-4">
        Recent entries
      </h2>
      <ul className="space-y-2">
        {trades.slice(0, 7).map((t, i) => {
          const result = getFinalResult(t);
          const isProfit = result >= 0;
          return (
            <li
              key={t.id}
              className="group relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Color accent bar */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full transition-all duration-200 group-hover:h-9 ${
                  isProfit ? "bg-emerald-400" : "bg-red-400"
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(t.trade_date + "T12:00:00"), "EEE, MMM d")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.num_trades} trade{t.num_trades !== 1 ? "s" : ""}
                </p>
              </div>

              <p
                className={`text-sm font-bold tabular-nums tracking-tight ${
                  isProfit ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatPnl(result, currency)}
              </p>

              <button
                onClick={() => onGenerateCard?.(t.id)}
                className="btn-gradient-flow border border-border rounded-lg px-3 py-1.5 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  View Card
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
