"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addDays,
} from "date-fns";
import { ChevronLeft, ChevronRight, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  currency: string;
  onDayClick: (date: string, existingTrade: TradeForHeatmap | null) => void;
  onWeekClick?: (mondayStr: string) => void;
  onMonthClick?: (monthDateStr: string) => void;
  /** For demo: show this month instead of current (e.g. "2026-01-01" for Jan 2026) */
  initialViewDate?: string;
};

function getFinalResult(t: TradeForHeatmap): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function formatCompact(value: number, currency: string): string {
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function CalendarHeatmap({
  trades,
  currency,
  onDayClick,
  onWeekClick,
  onMonthClick,
  initialViewDate,
}: CalendarHeatmapProps) {
  const [viewDate, setViewDate] = useState(() =>
    initialViewDate ? new Date(initialViewDate + "T12:00:00") : new Date()
  );
  const [showWeekly, setShowWeekly] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pnlcard-show-weekly");
    if (stored !== null) setShowWeekly(stored === "true");
  }, []);

  const toggleWeekly = () => {
    setShowWeekly((prev) => {
      localStorage.setItem("pnlcard-show-weekly", String(!prev));
      return !prev;
    });
  };

  const tradesByDate = new Map<string, TradeForHeatmap>();
  for (const t of trades) {
    tradesByDate.set(t.trade_date, t);
  }

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  const monthTrades = trades.filter((t) => {
    const d = t.trade_date;
    return d >= format(monthStart, "yyyy-MM-dd") && d <= format(monthEnd, "yyyy-MM-dd");
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad so first day aligns with Monday (ISO week starts Monday)
  const startPadding = (monthStart.getDay() + 6) % 7;
  const paddedDays: (Date | null)[] = [
    ...Array(startPadding).fill(null),
    ...days,
  ];
  // Pad end so total is a multiple of 7
  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }

  // Group into week rows (7 days each)
  const weekRows: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weekRows.push(paddedDays.slice(i, i + 7));
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Compute week summaries over the full Mon-Sun range (even if it
  // crosses month boundaries) so the totals match the weekly card.
  type WeekSummary = {
    totalPnl: number;
    totalTrades: number;
    mondayStr: string;
    rangeLabel: string;
  };

  const weekSummaries: WeekSummary[] = weekRows.map((row) => {
    // Find the Monday of this row from the first non-null day
    let monday: Date | null = null;
    for (const day of row) {
      if (day) {
        const dayOfWeek = (day.getDay() + 6) % 7; // 0=Mon
        monday = new Date(day);
        monday.setDate(monday.getDate() - dayOfWeek);
        break;
      }
    }

    if (!monday) {
      return { totalPnl: 0, totalTrades: 0, mondayStr: "", rangeLabel: "" };
    }

    const mondayStr = format(monday, "yyyy-MM-dd");
    const sunday = addDays(monday, 6);

    // Sum trades across all 7 days (Mon-Sun), including days outside the month
    let totalPnl = 0;
    let totalTrades = 0;
    for (let d = 0; d < 7; d++) {
      const dateStr = format(addDays(monday, d), "yyyy-MM-dd");
      const trade = tradesByDate.get(dateStr);
      if (trade) {
        totalPnl += getFinalResult(trade);
        totalTrades += trade.num_trades;
      }
    }

    // Build range label: "27–2" when crossing months, "3–9" normally
    const monDay = monday.getDate();
    const sunDay = sunday.getDate();
    const rangeLabel =
      monDay === sunDay ? `${monDay}` : `${monDay}–${sunDay}`;

    return { totalPnl, totalTrades, mondayStr, rangeLabel };
  });

  // Unified scale: combine daily P&L values and weekly totals so both
  // daily cells and weekly cells are colored on the same scale.
  const dailyResults = monthTrades.map((t) => getFinalResult(t));
  const weeklyResults = weekSummaries
    .filter((s) => s.totalTrades > 0)
    .map((s) => s.totalPnl);
  const allResults = [...dailyResults, ...weeklyResults];

  const allProfits = allResults.filter((r) => r > 0);
  const allLosses = allResults.filter((r) => r < 0);
  const maxProfit = allProfits.length > 0 ? Math.max(...allProfits) : 1;
  const maxLoss = allLosses.length > 0 ? Math.max(...allLosses.map((r) => Math.abs(r))) : 1;

  const getProfitClasses = (value: number): string => {
    const ratio = value / maxProfit;
    if (ratio >= 0.66) return "bg-emerald-200 dark:bg-emerald-900/40";
    if (ratio >= 0.33) return "bg-emerald-100 dark:bg-emerald-900/25";
    return "bg-emerald-50 dark:bg-emerald-950/20";
  };

  const getLossClasses = (value: number): string => {
    const ratio = Math.abs(value) / maxLoss;
    if (ratio >= 0.66) return "bg-red-200 dark:bg-red-900/40";
    if (ratio >= 0.33) return "bg-red-100 dark:bg-red-900/25";
    return "bg-red-50 dark:bg-red-950/20";
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 dark:from-card dark:via-card dark:to-slate-900/30 p-4 sm:p-5 shadow-sm">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {monthTrades.length > 0 && onMonthClick ? (
          <button
            type="button"
            onClick={() => {
              const dateInMonth = format(monthStart, "yyyy-MM-dd");
              onMonthClick(dateInMonth);
            }}
            className="min-w-[140px] text-center text-sm font-semibold text-foreground hover:text-primary transition-all duration-200 cursor-pointer rounded-md px-2 py-0.5 hover:bg-primary/5 active:scale-95"
            title="Generate monthly card"
          >
            {format(viewDate, "MMMM yyyy")}
          </button>
        ) : (
          <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">
            {format(viewDate, "MMMM yyyy")}
          </span>
        )}
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

      {/* Header: 7 day columns + optional weekly summary column */}
      <div className={cn(
        "mb-1.5 grid gap-1 text-center",
        showWeekly
          ? "grid-cols-[repeat(7,1fr)_6px_minmax(50px,1.2fr)] sm:grid-cols-[repeat(7,1fr)_8px_minmax(60px,1.2fr)]"
          : "grid-cols-[repeat(7,1fr)]"
      )}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {showWeekly && (
          <>
            <span />
            <button
              type="button"
              onClick={toggleWeekly}
              className="group/wk inline-flex items-center justify-center gap-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground rounded-full px-1.5 py-0.5 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-90 cursor-pointer"
              title="Hide weekly summary"
            >
              <span className="group-hover/wk:hidden">Wk</span>
              <X className="h-3 w-3 hidden group-hover/wk:block" />
            </button>
          </>
        )}
      </div>

      {/* Week rows */}
      <div className="flex flex-col gap-1">
        {weekRows.map((row, rowIdx) => {
          const summary = weekSummaries[rowIdx];

          return (
            <div
              key={`week-${rowIdx}`}
              className={cn(
                "grid gap-1 rounded-lg px-0.5 -mx-0.5 transition-colors duration-150 hover:bg-muted/20",
                showWeekly
                  ? "grid-cols-[repeat(7,1fr)_6px_minmax(50px,1.2fr)] sm:grid-cols-[repeat(7,1fr)_8px_minmax(60px,1.2fr)]"
                  : "grid-cols-[repeat(7,1fr)]"
              )}
            >
              {/* Day cells */}
              {row.map((day, colIdx) => {
                if (day === null) {
                  return (
                    <div
                      key={`pad-${rowIdx}-${colIdx}`}
                      className="aspect-square min-w-0 rounded-lg"
                    />
                  );
                }

                const dateStr = format(day, "yyyy-MM-dd");
                const trade = tradesByDate.get(dateStr);
                const isFuture = dateStr > todayStr;

                let bgClass = "bg-muted/40";
                let textClass = "text-muted-foreground";
                if (trade) {
                  const result = getFinalResult(trade);
                  if (result >= 0) {
                    bgClass = getProfitClasses(result);
                    textClass = "text-emerald-700 dark:text-emerald-400";
                  } else {
                    bgClass = getLossClasses(result);
                    textClass = "text-red-700 dark:text-red-400";
                  }
                }

                const result = trade ? getFinalResult(trade) : 0;
                const isProfit = trade && result >= 0;

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
                      "group/day relative aspect-square min-w-0 rounded-lg flex flex-col items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      bgClass,
                      textClass,
                      isFuture
                        ? "cursor-not-allowed opacity-40"
                        : trade
                          ? "hover:scale-110 hover:z-10 hover:shadow-lg active:scale-95 cursor-pointer"
                          : "hover:scale-105 hover:bg-muted/70 hover:shadow-sm active:scale-95 cursor-pointer",
                      trade && isProfit && "hover:shadow-emerald-200/50 hover:ring-1 hover:ring-emerald-300/40",
                      trade && !isProfit && "hover:shadow-red-200/50 hover:ring-1 hover:ring-red-300/40"
                    )}
                    title={
                      isFuture
                        ? "Cannot log future dates"
                        : trade
                          ? `${dateStr}: ${formatCompact(result, currency)}`
                          : `Log trade for ${dateStr}`
                    }
                  >
                    {trade && (
                      <span className="absolute top-0.5 left-1 sm:top-1 sm:left-1.5 text-[8px] sm:text-[9px] font-medium leading-none opacity-70 group-hover/day:opacity-100 transition-opacity">
                        {format(day, "d")}
                      </span>
                    )}
                    {trade ? (
                      <>
                        <span className="text-[10px] sm:text-[12px] font-bold leading-tight truncate max-w-full transition-transform duration-200 group-hover/day:scale-105">
                          {formatCompact(result, currency)}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-medium leading-none opacity-75 mt-0.5 transition-opacity duration-200 group-hover/day:opacity-100">
                          {trade.num_trades === 1
                            ? "1 Trade"
                            : `${trade.num_trades} Trades`}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-medium transition-all duration-200 group-hover/day:text-foreground">
                        {format(day, "d")}
                      </span>
                    )}
                  </button>
                );
              })}

              {showWeekly && (
                <>
                  {/* Separator between days and weekly summary */}
                  <div className="flex items-center justify-center">
                    <div className="h-3/4 border-l border-dashed border-border" />
                  </div>

                  {/* Weekly summary column */}
                  <button
                    type="button"
                    onClick={() => {
                      if (summary.totalTrades > 0 && onWeekClick) {
                        onWeekClick(summary.mondayStr);
                      }
                    }}
                    className={cn(
                      "group/wk-cell aspect-square min-w-0 rounded-lg p-0.5 sm:p-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      summary.totalTrades === 0
                        ? "bg-muted/30 text-muted-foreground cursor-default"
                        : summary.totalPnl >= 0
                          ? cn(getProfitClasses(summary.totalPnl), "text-emerald-700 dark:text-emerald-400 cursor-pointer border border-emerald-200/50 dark:border-emerald-800/30 hover:scale-110 hover:z-10 hover:shadow-lg hover:shadow-emerald-200/50 hover:ring-1 hover:ring-emerald-300/40 active:scale-95")
                          : cn(getLossClasses(summary.totalPnl), "text-red-700 dark:text-red-400 cursor-pointer border border-red-200/50 dark:border-red-800/30 hover:scale-110 hover:z-10 hover:shadow-lg hover:shadow-red-200/50 hover:ring-1 hover:ring-red-300/40 active:scale-95")
                    )}
                    title={
                      summary.totalTrades > 0
                        ? `${summary.rangeLabel}: ${formatCompact(summary.totalPnl, currency)} — Click to generate weekly card`
                        : `${summary.rangeLabel}: No trades`
                    }
                  >
                    <span className="text-[8px] sm:text-[9px] font-medium leading-none opacity-70 transition-opacity group-hover/wk-cell:opacity-100">
                      {summary.rangeLabel}
                    </span>
                    {summary.totalTrades > 0 ? (
                      <>
                        <span className="text-[9px] sm:text-[11px] font-bold leading-tight truncate max-w-full transition-transform duration-200 group-hover/wk-cell:scale-105">
                          {formatCompact(summary.totalPnl, currency)}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-medium leading-none opacity-70 transition-opacity group-hover/wk-cell:opacity-100">
                          {`${summary.totalTrades} trades`}
                        </span>
                      </>
                    ) : (
                      <span className="text-[8px] sm:text-[9px] leading-none opacity-50">—</span>
                    )}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30" />
            <span className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-800/30" />
            <span className="h-3 w-3 rounded bg-emerald-200 dark:bg-emerald-900/40 border border-emerald-300/60 dark:border-emerald-800/30" />
          </span>
          Profit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30" />
            <span className="h-3 w-3 rounded bg-red-100 dark:bg-red-900/25 border border-red-200/60 dark:border-red-800/30" />
            <span className="h-3 w-3 rounded bg-red-200 dark:bg-red-900/40 border border-red-300/60 dark:border-red-800/30" />
          </span>
          Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-muted/40 border border-border" />
          No trade
        </span>
        {!showWeekly && (
          <button
            type="button"
            onClick={toggleWeekly}
            className="inline-flex items-center gap-1 text-muted-foreground/50 hover:text-foreground rounded-full px-2 py-0.5 transition-all duration-200 hover:bg-muted active:scale-95 cursor-pointer"
          >
            <BarChart3 className="h-3 w-3" />
            Show weekly
          </button>
        )}
      </div>
    </div>
  );
}
