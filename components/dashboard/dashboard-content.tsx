"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { LogTradeButton } from "@/components/dashboard/log-trade-button";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { TradeEntryModal } from "@/components/dashboard/trade-entry-modal";
import { BarChart3 } from "lucide-react";

/**
 * DashboardContent is the interactive client wrapper for the dashboard.
 * It owns the trade modal state so both "Log today's trade" and calendar
 * day clicks can open the same modal (create or edit mode).
 */
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
  weekPnl: number;
  weekWinRate: number | null;
  streak: number;
  currency: string;
  userId: string;
  tradingCapital: number | null;
  trades: Trade[];
};

export function DashboardContent({
  displayName,
  weekPnl,
  weekWinRate,
  streak,
  currency,
  userId,
  tradingCapital,
  trades,
}: DashboardContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExistingTrade, setModalExistingTrade] = useState<Trade | null>(
    null
  );
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();

  const hasTrades = trades.length > 0;

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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Hi, {displayName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {hasTrades
              ? "Here's your trading recap."
              : "Log your first trade to get started."}
          </p>
        </div>

        <QuickStats
          weekPnl={weekPnl}
          weekWinRate={weekWinRate}
          streak={streak}
          currency={currency}
        />

        <LogTradeButton
          userId={userId}
          currency={currency}
          tradingCapital={tradingCapital}
          className="w-full sm:w-auto"
          onOpenCreate={openCreateModal}
        />

        {!hasTrades ? (
          <Card className="overflow-hidden border-dashed border-2 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 dark:from-slate-900/30 dark:via-card dark:to-slate-900/20 p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-200/80 to-slate-300/60 dark:from-slate-700/40 dark:to-slate-600/30">
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
            <div className="flex justify-center">
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
              onDayClick={(date, existingTrade) =>
                openEditModal(date, existingTrade)
              }
              />
            </div>

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
      />
    </>
  );
}
