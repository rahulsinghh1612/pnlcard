"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LogTradeButton } from "@/components/dashboard/log-trade-button";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { PnlTicker } from "@/components/dashboard/pnl-ticker";
import { TradeEntryModal } from "@/components/dashboard/trade-entry-modal";
import { CardPreviewModal } from "@/components/dashboard/card-preview-modal";
import { BarChart3, Sparkles, CalendarDays, CalendarRange, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";

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
  /** For landing page demo: use these trades instead of props.trades */
  demoTrades?: Trade[];
  /** For landing page demo: force modal open (step 1) */
  forceModalOpen?: boolean;
  /** For landing page demo: pass to TradeEntryModal to skip DB save */
  demoMode?: boolean;
  /** For landing page demo: CalendarHeatmap shows this month (e.g. "2026-01-01") */
  demoViewDate?: string;
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
  demoTrades,
  forceModalOpen,
  demoMode = false,
  demoViewDate,
}: DashboardContentProps) {
  const effectiveTrades = demoMode && demoTrades ? demoTrades : trades;
  const effectiveMonthPnl =
    demoMode && demoTrades
      ? demoTrades.reduce((sum, t) => sum + (t.charges != null ? t.net_pnl - t.charges : t.net_pnl), 0)
      : monthPnl;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExistingTrade, setModalExistingTrade] = useState<Trade | null>(
    null
  );
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();

  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [cardPreviewTrade, setCardPreviewTrade] = useState<Trade | null>(null);
  const [cardPreviewType, setCardPreviewType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [cardPreviewWeekMonday, setCardPreviewWeekMonday] = useState<string | null>(null);
  const [cardPreviewMonthDate, setCardPreviewMonthDate] = useState<string | null>(null);

  const [dailyIdx, setDailyIdx] = useState(0);
  const [weeklyIdx, setWeeklyIdx] = useState(0);
  const [monthlyIdx, setMonthlyIdx] = useState(0);

  const displayModalOpen = forceModalOpen ?? modalOpen;

  // When forceModalOpen (demo step 1), pre-fill today's date for the create form
  const effectiveModalDefaultDate =
    forceModalOpen && !modalExistingTrade
      ? format(new Date(), "yyyy-MM-dd")
      : modalDefaultDate;

  const hasTrades = effectiveTrades.length > 0;
  const pnlPositive = effectiveMonthPnl >= 0;

  // Dynamic gradient intensity for the hero card (0.0 – 0.18 range).
  // Uses log scale so it works across ₹1K to ₹50L+ without hard thresholds.
  const absPnl = Math.abs(effectiveMonthPnl);
  const intensity = absPnl === 0 ? 0 : Math.min(0.18, Math.log10(absPnl + 1) / 40);
  const heroGradient = pnlPositive
    ? `linear-gradient(135deg, rgba(16,185,129,${intensity}) 0%, rgba(255,255,255,0) 60%)`
    : `linear-gradient(135deg, rgba(239,68,68,${intensity}) 0%, rgba(255,255,255,0) 60%)`;

  // Compute chip data for the Generate Cards section
  const getFinalResult = (t: Trade) =>
    t.charges != null ? t.net_pnl - t.charges : t.net_pnl;

  const dailyChips = useMemo(() =>
    effectiveTrades.map((t) => ({
      trade: t,
      label: format(parseISO(t.trade_date), "MMM d"),
      pnl: getFinalResult(t),
    })),
    [effectiveTrades]
  );

  const weeklyChips = useMemo(() => {
    const weekMap = new Map<string, { mondayStr: string; label: string; pnl: number; count: number }>();
    for (const t of effectiveTrades) {
      const d = parseISO(t.trade_date);
      const monday = startOfWeek(d, { weekStartsOn: 1 });
      const mondayStr = format(monday, "yyyy-MM-dd");
      if (!weekMap.has(mondayStr)) {
        const sunday = addDays(monday, 6);
        const label = `${format(monday, "d")}–${format(sunday, "d MMM")}`;
        weekMap.set(mondayStr, { mondayStr, label, pnl: 0, count: 0 });
      }
      const entry = weekMap.get(mondayStr)!;
      entry.pnl += getFinalResult(t);
      entry.count += 1;
    }
    return Array.from(weekMap.values()).sort((a, b) => b.mondayStr.localeCompare(a.mondayStr));
  }, [effectiveTrades]);

  const monthlyChips = useMemo(() => {
    const monthMap = new Map<string, { dateStr: string; label: string; pnl: number; count: number }>();
    for (const t of effectiveTrades) {
      const d = parseISO(t.trade_date);
      const ms = startOfMonth(d);
      const key = format(ms, "yyyy-MM");
      if (!monthMap.has(key)) {
        const dateStr = format(ms, "yyyy-MM-dd");
        const label = format(ms, "MMM yyyy");
        monthMap.set(key, { dateStr, label, pnl: 0, count: 0 });
      }
      const entry = monthMap.get(key)!;
      entry.pnl += getFinalResult(t);
      entry.count += 1;
    }
    return Array.from(monthMap.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [effectiveTrades]);

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
          className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-all duration-300 group ${
            hasTrades
              ? "cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.995] border-border hover:border-primary/20"
              : "border-border"
          }`}
          style={{ background: `${heroGradient}, linear-gradient(135deg, #fff 0%, #f8fafc 100%)` }}
          onClick={() => {
            if (!hasTrades) return;
            const todayStr = format(new Date(), "yyyy-MM-dd");
            setCardPreviewType("monthly");
            setCardPreviewTrade(null);
            setCardPreviewWeekMonday(null);
            setCardPreviewMonthDate(todayStr);
            setCardPreviewOpen(true);
          }}
          role={hasTrades ? "button" : undefined}
          tabIndex={hasTrades ? 0 : undefined}
          onKeyDown={(e) => {
            if (!hasTrades) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const todayStr = format(new Date(), "yyyy-MM-dd");
              setCardPreviewType("monthly");
              setCardPreviewTrade(null);
              setCardPreviewWeekMonday(null);
              setCardPreviewMonthDate(todayStr);
              setCardPreviewOpen(true);
            }
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-muted-foreground">
                Hi, {displayName}
              </h1>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium tracking-wider text-muted-foreground">
                This Month&apos;s P&L
              </p>
              <p
                className={`mt-1 text-3xl sm:text-4xl font-bold tracking-tight ${
                  pnlPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {formatPnl(effectiveMonthPnl, currency)}
              </p>
              {hasTrades && (
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest transition-all duration-300 opacity-60 group-hover:opacity-100 ${
                    pnlPositive
                      ? "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200"
                      : "bg-red-100 text-red-700 group-hover:bg-red-200"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Monthly Card
                </span>
              )}
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
              trades={effectiveTrades.map((t) => ({
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
                  const fullTrade = effectiveTrades.find((t) => t.id === existingTrade.id);
                  if (fullTrade) {
                    setCardPreviewType("daily");
                    setCardPreviewTrade(fullTrade);
                    setCardPreviewWeekMonday(null);
                    setCardPreviewMonthDate(null);
                    setCardPreviewOpen(true);
                    return;
                  }
                }
                openEditModal(date, null);
              }}
              onWeekClick={(mondayStr) => {
                setCardPreviewType("weekly");
                setCardPreviewTrade(null);
                setCardPreviewWeekMonday(mondayStr);
                setCardPreviewMonthDate(null);
                setCardPreviewOpen(true);
              }}
              onMonthClick={(monthDateStr) => {
                setCardPreviewType("monthly");
                setCardPreviewTrade(null);
                setCardPreviewWeekMonday(null);
                setCardPreviewMonthDate(monthDateStr);
                setCardPreviewOpen(true);
              }}
              initialViewDate={demoViewDate}
            />

            {/* Generate Cards section */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">
                Generate cards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Daily card */}
                {(() => {
                  const current = dailyChips[dailyIdx];
                  const hasPrev = dailyIdx < dailyChips.length - 1;
                  const hasNext = dailyIdx > 0;
                  return (
                    <div
                      className={`group/card rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 dark:from-card dark:via-card dark:to-slate-900/20 p-4 transition-all duration-200 ${
                        current ? "cursor-pointer hover:shadow-md hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]" : ""
                      }`}
                      onClick={() => {
                        if (!current) return;
                        setCardPreviewType("daily");
                        setCardPreviewTrade(current.trade);
                        setCardPreviewWeekMonday(null);
                        setCardPreviewMonthDate(null);
                        setCardPreviewOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        {dailyChips.length > 1 && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={!hasPrev}
                              onClick={(e) => { e.stopPropagation(); setDailyIdx((i) => i + 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!hasNext}
                              onClick={(e) => { e.stopPropagation(); setDailyIdx((i) => i - 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Daily
                      </p>
                      {current ? (
                        <>
                          <p className={`mt-1 text-lg font-bold tracking-tight ${current.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatPnl(current.pnl, currency)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {format(parseISO(current.trade.trade_date), "EEE, MMM d")}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">No trades yet</p>
                      )}
                    </div>
                  );
                })()}

                {/* Weekly card */}
                {(() => {
                  const current = weeklyChips[weeklyIdx];
                  const hasPrev = weeklyIdx < weeklyChips.length - 1;
                  const hasNext = weeklyIdx > 0;
                  return (
                    <div
                      className={`group/card rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 dark:from-card dark:via-card dark:to-slate-900/20 p-4 transition-all duration-200 ${
                        current ? "cursor-pointer hover:shadow-md hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]" : ""
                      }`}
                      onClick={() => {
                        if (!current) return;
                        setCardPreviewType("weekly");
                        setCardPreviewTrade(null);
                        setCardPreviewWeekMonday(current.mondayStr);
                        setCardPreviewMonthDate(null);
                        setCardPreviewOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                          <CalendarRange className="h-4 w-4" />
                        </div>
                        {weeklyChips.length > 1 && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={!hasPrev}
                              onClick={(e) => { e.stopPropagation(); setWeeklyIdx((i) => i + 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!hasNext}
                              onClick={(e) => { e.stopPropagation(); setWeeklyIdx((i) => i - 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Weekly
                      </p>
                      {current ? (
                        <>
                          <p className={`mt-1 text-lg font-bold tracking-tight ${current.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatPnl(current.pnl, currency)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {current.label}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">No trades this week</p>
                      )}
                    </div>
                  );
                })()}

                {/* Monthly card */}
                {(() => {
                  const current = monthlyChips[monthlyIdx];
                  const hasPrev = monthlyIdx < monthlyChips.length - 1;
                  const hasNext = monthlyIdx > 0;
                  return (
                    <div
                      className={`group/card rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 dark:from-card dark:via-card dark:to-slate-900/20 p-4 transition-all duration-200 ${
                        current ? "cursor-pointer hover:shadow-md hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]" : ""
                      }`}
                      onClick={() => {
                        if (!current) return;
                        setCardPreviewType("monthly");
                        setCardPreviewTrade(null);
                        setCardPreviewWeekMonday(null);
                        setCardPreviewMonthDate(current.dateStr);
                        setCardPreviewOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                          <CalendarCheck className="h-4 w-4" />
                        </div>
                        {monthlyChips.length > 1 && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={!hasPrev}
                              onClick={(e) => { e.stopPropagation(); setMonthlyIdx((i) => i + 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!hasNext}
                              onClick={(e) => { e.stopPropagation(); setMonthlyIdx((i) => i - 1); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Monthly
                      </p>
                      {current ? (
                        <>
                          <p className={`mt-1 text-lg font-bold tracking-tight ${current.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatPnl(current.pnl, currency)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {current.label}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">No trades this month</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <PnlTicker
              trades={effectiveTrades.map((t) => ({
                id: t.id,
                trade_date: t.trade_date,
                net_pnl: t.net_pnl,
                charges: t.charges,
                num_trades: t.num_trades,
              }))}
              currency={currency}
            />

            <RecentEntries
              trades={effectiveTrades.map((t) => ({
                id: t.id,
                trade_date: t.trade_date,
                net_pnl: t.net_pnl,
                charges: t.charges,
                num_trades: t.num_trades,
              }))}
              currency={currency}
              onGenerateCard={(tradeId) => {
                const trade = effectiveTrades.find((t) => t.id === tradeId);
                if (!trade) return;
                setCardPreviewType("daily");
                setCardPreviewTrade(trade);
                setCardPreviewWeekMonday(null);
                setCardPreviewMonthDate(null);
                setCardPreviewOpen(true);
              }}
            />
          </>
        )}
      </div>

      <TradeEntryModal
        open={displayModalOpen}
        onOpenChange={setModalOpen}
        userId={userId}
        currency={currency}
        tradingCapital={tradingCapital}
        existingTrade={modalExistingTrade}
        defaultDate={effectiveModalDefaultDate}
        existingTradeDates={new Set(effectiveTrades.map((t) => t.trade_date))}
        demoMode={demoMode}
        onEditExisting={(date) => {
          const trade = effectiveTrades.find((t) => t.trade_date === date);
          if (trade) {
            setModalExistingTrade(trade);
            setModalDefaultDate(undefined);
          }
        }}
        onGenerateCard={() => {
          if (modalExistingTrade) {
            setCardPreviewType("daily");
            setCardPreviewTrade(modalExistingTrade);
            setCardPreviewWeekMonday(null);
            setCardPreviewMonthDate(null);
            setCardPreviewOpen(true);
          }
        }}
      />

      <CardPreviewModal
        open={cardPreviewOpen}
        onOpenChange={setCardPreviewOpen}
        cardType={cardPreviewType}
        trade={cardPreviewTrade}
        weekMondayStr={cardPreviewWeekMonday}
        monthDateStr={cardPreviewMonthDate}
        allTrades={effectiveTrades}
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
