"use client";

import Link from "next/link";
import { ArrowLeft, Flame, TrendingUp, TrendingDown, Target, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { type WeeklyDebrief } from "@/lib/debrief";
import { format, parseISO, subWeeks, addWeeks } from "date-fns";

type DebriefReportProps = {
  debrief: WeeklyDebrief;
  currency: string;
  isPremium: boolean;
  displayName: string;
};

function formatPnl(value: number, currency: string): string {
  const symbol = currency === "INR" ? "\u20B9" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value >= 0 ? "+" : "\u2212";
  return `${sign}${symbol}${formatted}`;
}

function formatPnlShort(value: number, currency: string): string {
  const symbol = currency === "INR" ? "\u20B9" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  return `${sign}${symbol}${formatted}`;
}

export function DebriefReport({ debrief, currency, isPremium, displayName }: DebriefReportProps) {
  const isProfit = debrief.totalPnl >= 0;

  const prevWeekStr = format(subWeeks(parseISO(debrief.weekStart), 1), "yyyy-MM-dd");
  const nextWeekStr = format(addWeeks(parseISO(debrief.weekStart), 1), "yyyy-MM-dd");

  const maxAbsPnl = Math.max(
    ...debrief.days.map((d) => Math.abs(d.pnl)),
    1
  );

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 sm:p-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Weekly Debrief
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Get a beautiful weekly report with insights on what went well, what hurt you, and one rule to focus on next week.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-slate-50/50 p-6 space-y-3 max-w-sm mx-auto text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Includes</p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                What went well this week
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                What hurt your P&L
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Your single focus rule for next week
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Execution & mood pattern analysis
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
              Weekly
            </span>
            <Link
              href="/dashboard/debrief/monthly"
              className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Monthly
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/debrief?week=${prevWeekStr}`}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/debrief?week=${nextWeekStr}`}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-border bg-white">
        {/* Title section */}
        <div className="p-6 sm:p-8 pb-0 sm:pb-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Weekly Debrief
          </p>
          <h1 className="mt-1 text-lg font-semibold text-foreground">
            {debrief.weekRange}
          </h1>
        </div>

        {debrief.days.filter((d) => d.numTrades > 0 || d.isRestDay).length === 0 ? (
          <div className="p-6 sm:p-8 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              No trades logged this week. Log your trades to see your debrief.
            </p>
          </div>
        ) : (
          <>
            {/* Scoreboard */}
            <div className="p-6 sm:p-8 pt-6 sm:pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Week P&L
                  </p>
                  <p className={`mt-1 text-xl font-bold tracking-tight ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                    {formatPnl(debrief.totalPnl, currency)}
                  </p>
                  {debrief.pnlChange != null && (
                    <p className={`mt-0.5 text-[10px] font-medium ${debrief.pnlChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {debrief.pnlChange >= 0 ? "\u2191" : "\u2193"} {formatPnlShort(Math.abs(debrief.pnlChange), currency)} vs last week
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Win Rate
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                    {debrief.winRate != null ? `${debrief.winRate}%` : "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                    {debrief.wins}W · {debrief.losses}L
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg. Daily P&L
                  </p>
                  <p className={`mt-1 text-xl font-bold tracking-tight ${debrief.avgDailyPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatPnl(Math.round(debrief.avgDailyPnl), currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Streak
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <p className="text-xl font-bold tracking-tight text-foreground">
                      {debrief.streak}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                    {debrief.tradingDays} trading day{debrief.tradingDays !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 sm:mx-8 h-px bg-border" />

            {/* Day-by-day breakdown */}
            <div className="p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Day by Day
              </p>
              <div className="space-y-2">
                {debrief.days.map((day) => {
                  const hasTrade = day.numTrades > 0 || day.isRestDay;
                  const barWidth = hasTrade && !day.isRestDay
                    ? Math.max(8, (Math.abs(day.pnl) / maxAbsPnl) * 100)
                    : 0;

                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
                        {day.dayShort}
                      </span>
                      <div className="flex-1 flex items-center h-7">
                        {hasTrade && !day.isRestDay ? (
                          <div
                            className={`h-5 rounded-sm ${day.pnl >= 0 ? "bg-emerald-400/70" : "bg-red-400/70"}`}
                            style={{ width: `${barWidth}%`, minWidth: "4px" }}
                          />
                        ) : day.isRestDay ? (
                          <span className="text-[10px] font-medium text-muted-foreground/60 italic">
                            rest day
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </div>
                      {hasTrade && !day.isRestDay && (
                        <span className={`text-xs font-semibold tabular-nums ${day.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatPnlShort(day.pnl, currency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {debrief.bestDay && debrief.worstDay && (
                <div className="mt-4 flex items-center gap-6 text-[10px] font-medium text-muted-foreground">
                  <span>
                    Best: <span className="text-emerald-600 font-semibold">{debrief.bestDay.label} {formatPnlShort(debrief.bestDay.pnl, currency)}</span>
                  </span>
                  <span>
                    Worst: <span className="text-red-600 font-semibold">{debrief.worstDay.label} {formatPnlShort(debrief.worstDay.pnl, currency)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mx-6 sm:mx-8 h-px bg-border" />

            {/* What went well / What hurt */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    What went well
                  </p>
                </div>
                {debrief.whatWentWell.length > 0 ? (
                  <ul className="space-y-2">
                    {debrief.whatWentWell.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm text-foreground">{insight.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough tagged data yet. Tag your execution & mood to unlock insights.
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    What hurt
                  </p>
                </div>
                {debrief.whatHurt.length > 0 ? (
                  <ul className="space-y-2">
                    {debrief.whatHurt.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm text-foreground">{insight.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing flagged this week. Keep it up.
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 sm:mx-8 h-px bg-border" />

            {/* Patterns */}
            {(debrief.topExecutionTag || debrief.topMoodTag || debrief.bestCombo) && (
              <>
                <div className="p-6 sm:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Patterns
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {debrief.topExecutionTag && (
                      <div className="rounded-xl border border-border bg-slate-50/50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Top Execution
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {debrief.topExecutionTag.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {debrief.topExecutionTag.count} day{debrief.topExecutionTag.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    {debrief.topMoodTag && (
                      <div className="rounded-xl border border-border bg-slate-50/50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Top Mood
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {debrief.topMoodTag.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {debrief.topMoodTag.count} day{debrief.topMoodTag.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    {debrief.bestCombo && (
                      <div className="rounded-xl border border-border bg-slate-50/50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Best Combo
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {debrief.bestCombo.execution} + {debrief.bestCombo.mood}
                        </p>
                        <p className={`text-[10px] font-medium ${debrief.bestCombo.avgPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          avg {formatPnlShort(Math.round(debrief.bestCombo.avgPnl), currency)}/day
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mx-6 sm:mx-8 h-px bg-border" />
              </>
            )}

            {/* Constraint for next week */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your one rule for next week
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-sm font-medium text-foreground">
                  {debrief.constraint}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
