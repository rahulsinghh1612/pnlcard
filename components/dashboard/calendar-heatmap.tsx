"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Calendar Heatmap shows a monthly grid where:
 * - Green = profit day (darker = bigger profit)
 * - Red = loss day (darker = bigger loss)
 * - Gray = no trade logged
 * - Breakeven (0) treated as light green, no separate color
 *
 * Clicking a day triggers onDayClick so the parent can open the trade modal.
 */
type TradeForHeatmap = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
  note: string | null;
};

type CalendarHeatmapProps = {
  trades: TradeForHeatmap[];
  onDayClick: (date: string, existingTrade: TradeForHeatmap | null) => void;
};

function getFinalResult(t: TradeForHeatmap): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

export function CalendarHeatmap({
  trades,
  onDayClick,
}: CalendarHeatmapProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const tradesByDate = new Map<string, TradeForHeatmap>();
  for (const t of trades) {
    tradesByDate.set(t.trade_date, t);
  }

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  // Compute max profit and max loss in this month for heatmap intensity
  const monthTrades = trades.filter((t) => {
    const d = t.trade_date;
    return d >= format(monthStart, "yyyy-MM-dd") && d <= format(monthEnd, "yyyy-MM-dd");
  });
  const profits = monthTrades.map((t) => getFinalResult(t)).filter((r) => r > 0);
  const losses = monthTrades.map((t) => getFinalResult(t)).filter((r) => r < 0);
  const maxProfit = profits.length > 0 ? Math.max(...profits) : 1;
  const maxLoss = losses.length > 0 ? Math.max(...losses.map((r) => Math.abs(r))) : 1;

  const getProfitShade = (result: number): string => {
    const ratio = result / maxProfit;
    if (ratio >= 0.66) return "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800";
    if (ratio >= 0.33) return "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700";
    return "bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600";
  };

  const getLossShade = (result: number): string => {
    const ratio = Math.abs(result) / maxLoss;
    if (ratio >= 0.66) return "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800";
    if (ratio >= 0.33) return "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
    return "bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600";
  };

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start so first day aligns with Monday (week starts on Monday per PRD)
  const startPadding = (monthStart.getDay() + 6) % 7;
  const paddedDays: (Date | null)[] = [
    ...Array(startPadding).fill(null),
    ...days,
  ];

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-[400px] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 dark:from-card dark:via-card dark:to-slate-900/30 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">This month</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewDate((d) => subMonths(d, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-medium text-foreground">
            {format(viewDate, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
          <span
            key={d}
            className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid - balanced size: readable without dominating */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, i) => {
          if (day === null) {
            return <div key={`pad-${i}`} className="h-9 w-full min-w-0" />;
          }

          const dateStr = format(day, "yyyy-MM-dd");
          const trade = tradesByDate.get(dateStr);
          const isFuture = dateStr > todayStr;

          let cellColor = "bg-muted/60"; // gray = no trade
          if (trade) {
            const result = getFinalResult(trade);
            // Treat breakeven (0) as light green; no separate breakeven color
            cellColor =
              result >= 0
                ? `${getProfitShade(result)} text-white shadow-sm`
                : `${getLossShade(result)} text-white shadow-sm`;
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                if (isFuture) return;
                onDayClick(dateStr, trade ?? null);
              }}
              disabled={isFuture}
              className={cn(
                "h-9 min-w-0 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                cellColor,
                isFuture && "cursor-not-allowed opacity-40"
              )}
              title={
                isFuture
                  ? "Cannot log future dates"
                  : trade
                    ? `${dateStr}: ${getFinalResult(trade) >= 0 ? "Profit" : "Loss"}`
                    : `Log trade for ${dateStr}`
              }
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend - shows intensity: darker = bigger profit/loss */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded bg-emerald-400" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="h-3 w-3 rounded bg-emerald-600" />
          </span>
          Profit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded bg-red-400" />
            <span className="h-3 w-3 rounded bg-red-500" />
            <span className="h-3 w-3 rounded bg-red-600" />
          </span>
          Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-muted" />
          No trade
        </span>
      </div>
    </div>
  );
}
