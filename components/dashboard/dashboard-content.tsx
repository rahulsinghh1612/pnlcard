"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LogTradeButton } from "@/components/dashboard/log-trade-button";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { TradeEntryModal } from "@/components/dashboard/trade-entry-modal";
import { CardPreviewModal } from "@/components/dashboard/card-preview-modal";
import { BarChart3 } from "lucide-react";

type Trade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
  note: string | null;
};

type DashboardContentProps = {
  displayName: string;
  monthPnl: number;
  currency: string;
  timezone: string;
  userId: string;
  tradingCapital: number | null;
  xHandle: string | null;
  cardTheme: string;
  trades: Trade[];
};

function formatPnl(value: number, currency: string): string {
  const symbol = currency === "INR" ? "\u20B9" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${symbol}${formatted}`;
}

export function DashboardContent({
  displayName,
  monthPnl,
  currency,
  timezone,
  userId,
  tradingCapital,
  xHandle,
  cardTheme,
  trades,
}: DashboardContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExistingTrade, setModalExistingTrade] = useState<Trade | null>(
    null
  );
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();

  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [cardPreviewTrade, setCardPreviewTrade] = useState<Trade | null>(null);

  const hasTrades = trades.length > 0;
  const pnlPositive = monthPnl >= 0;

  // Dynamic gradient intensity for the hero card (0.0 – 0.18 range).
  // Uses log scale so it works across ₹1K to ₹50L+ without hard thresholds.
  const absPnl = Math.abs(monthPnl);
  const intensity = absPnl === 0 ? 0 : Math.min(0.18, Math.log10(absPnl + 1) / 40);
  const heroGradient = pnlPositive
    ? `linear-gradient(135deg, rgba(16,185,129,${intensity}) 0%, rgba(255,255,255,0) 60%)`
    : `linear-gradient(135deg, rgba(239,68,68,${intensity}) 0%, rgba(255,255,255,0) 60%)`;

  const openCreateModal = (defaultDate?: string) => {
    setModalExistingTrade(null);
    setModalDefaultDate(defaultDate);
    setModalOpen(true);
  };

  const openEditModal = (date: string, existingTrade: Trade | null) => {
    setModalExistingTrade(existingTrade);
    setModalDefaultDate(existingTrade ? undefined : date);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Hero section: greeting + month P&L */}
        <div
          className="rounded-2xl border border-border p-6 sm:p-8 shadow-sm transition-all duration-500"
          style={{ background: `${heroGradient}, linear-gradient(135deg, #fff 0%, #f8fafc 100%)` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-muted-foreground">
                Hi, {displayName}
              </h1>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                This month&apos;s P&L
              </p>
              <p
                className={`mt-1 text-3xl sm:text-4xl font-bold tracking-tight ${
                  pnlPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatPnl(monthPnl, currency)}
              </p>
            </div>
          </div>

        </div>

        {/* Log trade CTA */}
        <div className="flex justify-center">
          <LogTradeButton
            userId={userId}
            currency={currency}
            tradingCapital={tradingCapital}
            className="w-full sm:w-auto"
            onOpenCreate={openCreateModal}
          />
        </div>

        {!hasTrades ? (
          <Card className="overflow-hidden border-dashed border-2 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-200/80 to-slate-300/60">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">
              No trades yet
            </h2>
            <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
              Log your first trade to generate your first recap card and start
              sharing your progress.
            </p>
            <LogTradeButton
              userId={userId}
              currency={currency}
              tradingCapital={tradingCapital}
              className="mt-6"
              onOpenCreate={openCreateModal}
            />
          </Card>
        ) : (
          <>
            <CalendarHeatmap
              trades={trades.map((t) => ({
                id: t.id,
                trade_date: t.trade_date,
                net_pnl: t.net_pnl,
                charges: t.charges,
                num_trades: t.num_trades,
                capital_deployed: t.capital_deployed,
                note: t.note,
              }))}
              currency={currency}
              onDayClick={(date, existingTrade) => {
                if (existingTrade) {
                  const fullTrade = trades.find((t) => t.id === existingTrade.id);
                  if (fullTrade) {
                    setCardPreviewTrade(fullTrade);
                    setCardPreviewOpen(true);
                    return;
                  }
                }
                openEditModal(date, null);
              }}
            />

            <RecentEntries
              trades={trades.map((t) => ({
                id: t.id,
                trade_date: t.trade_date,
                net_pnl: t.net_pnl,
                charges: t.charges,
                num_trades: t.num_trades,
              }))}
              currency={currency}
            />
          </>
        )}
      </div>

      <TradeEntryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userId={userId}
        currency={currency}
        tradingCapital={tradingCapital}
        existingTrade={modalExistingTrade}
        defaultDate={modalDefaultDate}
        existingTradeDates={new Set(trades.map((t) => t.trade_date))}
      />

      <CardPreviewModal
        open={cardPreviewOpen}
        onOpenChange={setCardPreviewOpen}
        trade={cardPreviewTrade}
        allTrades={trades}
        profile={{
          x_handle: xHandle,
          trading_capital: tradingCapital,
          card_theme: cardTheme,
          currency,
          timezone,
        }}
        onEditTrade={(trade) => {
          setModalExistingTrade(trade);
          setModalDefaultDate(undefined);
          setModalOpen(true);
        }}
      />
    </>
  );
}
