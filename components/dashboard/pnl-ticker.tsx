"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Trade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
};

type PnlTickerProps = {
  trades: Trade[];
  currency: string;
};

function getFinalResult(t: Trade): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function formatCompact(value: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}

export function PnlTicker({ trades, currency }: PnlTickerProps) {
  const chips = useMemo(() => {
    return [...trades]
      .sort((a, b) => b.trade_date.localeCompare(a.trade_date))
      .slice(0, 20)
      .map((t) => ({
        id: t.id,
        date: format(parseISO(t.trade_date), "MMM d"),
        pnl: getFinalResult(t),
      }));
  }, [trades]);

  if (trades.length < 3) return null;

  const tickerContent = (
    <div className="flex items-center gap-2">
      {chips.map((chip) => (
        <div
          key={chip.id}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-transform duration-200 hover:scale-105 ${
            chip.pnl > 0
              ? "bg-emerald-50 text-emerald-700"
              : chip.pnl < 0
                ? "bg-red-50 text-red-700"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {chip.pnl > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : chip.pnl < 0 ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          <span className="opacity-60">{chip.date}</span>
          <span className="font-semibold">{formatCompact(chip.pnl, currency)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="ticker-scroll flex w-max gap-6 hover:[animation-play-state:paused]">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
}
