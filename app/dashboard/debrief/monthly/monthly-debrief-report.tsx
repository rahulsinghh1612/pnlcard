"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  Info,
} from "lucide-react";
import {
  type MonthlyDebrief,
  type MonthlyPnlPoint,
  type TagPnlCorrelation,
} from "@/lib/debrief";
import { format, parseISO, subMonths, addMonths } from "date-fns";

type MonthlyDebriefReportProps = {
  debrief: MonthlyDebrief;
  currency: string;
  isPremium: boolean;
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

export function MonthlyDebriefReport({
  debrief,
  currency,
  isPremium,
}: MonthlyDebriefReportProps) {
  const isProfit = debrief.totalPnl >= 0;

  const prevMonthStr = format(
    subMonths(parseISO(debrief.monthStart), 1),
    "yyyy-MM-dd"
  );
  const nextMonthStr = format(
    addMonths(parseISO(debrief.monthStart), 1),
    "yyyy-MM-dd"
  );

  const maxWeekAbsPnl = Math.max(
    ...debrief.weeks.map((w) => Math.abs(w.pnl)),
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
              Monthly Debrief
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Get a comprehensive monthly report with week-by-week analysis,
              day-of-week patterns, and a theme for next month.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-slate-50/50 p-6 space-y-3 max-w-sm mx-auto text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Includes
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Week-by-week P&L breakdown
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Day-of-week performance patterns
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                What helped and what hurt
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Your theme for next month
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
    <div className="space-y-3 pb-12">
      {/* ── Nav row ── */}
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
            <Link
              href="/dashboard/debrief"
              className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Weekly
            </Link>
            <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
              Monthly
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/debrief/monthly?month=${prevMonthStr}`}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/debrief/monthly?month=${nextMonthStr}`}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CARD 1 — Hero P&L + metric cards
         ════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-white px-6 py-6 sm:px-8">
        <p className="text-xs font-medium text-muted-foreground">
          Monthly Debrief · {debrief.monthLabel}
        </p>

        {debrief.tradingDays === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">
            No trades logged this month. Log your trades to see your debrief.
          </p>
        ) : (
          <>
            <p
              className={`mt-1 text-3xl sm:text-4xl font-bold tracking-tight ${
                isProfit ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {formatPnl(debrief.totalPnl, currency)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetricCard
                label="Win Rate"
                value={
                  debrief.winRate != null ? `${debrief.winRate}%` : "\u2014"
                }
              />
              <MetricCard
                label="Avg / Day"
                value={formatPnlShort(
                  Math.round(debrief.avgDailyPnl),
                  currency
                )}
                valueColor={
                  debrief.avgDailyPnl >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              />
            </div>
          </>
        )}
      </div>

      {debrief.tradingDays > 0 && (
        <>
          {/* ════════════════════════════════════════════════════════
              CARD 2 — Week-by-week diverging bar chart
             ════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-border bg-white px-6 py-5 sm:px-8">
            <p className="text-xs font-medium text-muted-foreground mb-4">
              Week by Week
            </p>
            <div className="space-y-1">
              {debrief.weeks.map((week) => {
                const barPct = Math.max(
                  4,
                  (Math.abs(week.pnl) / maxWeekAbsPnl) * 50
                );

                return (
                  <div
                    key={week.mondayStr}
                    className="flex items-center gap-0 h-7"
                  >
                    <span className="w-[72px] text-right text-[10px] text-muted-foreground shrink-0 pr-2 tabular-nums">
                      {week.range.split(" – ")[0]}
                    </span>

                    {/* Left half (losses) */}
                    <div className="flex-1 flex justify-end items-center">
                      {week.pnl < 0 && (
                        <>
                          <span className="text-[10px] font-semibold tabular-nums text-red-600 mr-1.5 shrink-0">
                            {formatPnlShort(week.pnl, currency)}
                          </span>
                          <div
                            className="h-[18px] rounded-l-sm bg-red-400/70"
                            style={{
                              width: `${barPct}%`,
                              minWidth: "4px",
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* Center baseline */}
                    <div className="w-px h-5 bg-border shrink-0" />

                    {/* Right half (profits) */}
                    <div className="flex-1 flex justify-start items-center">
                      {week.pnl >= 0 && (
                        <>
                          <div
                            className="h-[18px] rounded-r-sm bg-emerald-400/70"
                            style={{
                              width: `${barPct}%`,
                              minWidth: "4px",
                            }}
                          />
                          <span className="text-[10px] font-semibold tabular-nums text-emerald-600 ml-1.5 shrink-0">
                            {formatPnlShort(week.pnl, currency)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              CARD 3 — Monthly P&L Trend (animated dot-line chart)
             ════════════════════════════════════════════════════════ */}
          {debrief.monthlyPnlTrend.filter((m) => m.pnl !== 0).length >= 2 && (
            <div className="rounded-2xl border border-border bg-white px-6 py-5 sm:px-8">
              <p className="text-xs font-medium text-muted-foreground mb-4">
                Monthly P&L Trend
              </p>
              <MonthlyPnlTrendChart
                data={debrief.monthlyPnlTrend}
                currency={currency}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CARD 4 — Mood & Execution → P&L correlation
             ════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {debrief.executionCorrelation.length > 0 && (
              <div className="rounded-2xl border border-border bg-white px-5 py-5 sm:px-6">
                <div className="mb-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Execution Impact
                    </p>
                    <span className="group relative">
                      <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                      <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 rounded-lg bg-foreground px-3 py-2 text-[11px] text-background leading-snug z-10">
                        Avg P&L on days you tagged each execution style this
                        month.
                      </span>
                    </span>
                  </div>
                </div>
                <CorrelationBars
                  data={debrief.executionCorrelation}
                  currency={currency}
                />
              </div>
            )}
            {debrief.moodCorrelation.length > 0 && (
              <div className="rounded-2xl border border-border bg-white px-5 py-5 sm:px-6">
                <div className="mb-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Mood Impact
                    </p>
                    <span className="group relative">
                      <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                      <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 rounded-lg bg-foreground px-3 py-2 text-[11px] text-background leading-snug z-10">
                        Avg P&L on days you tagged each mood this month.
                      </span>
                    </span>
                  </div>
                </div>
                <CorrelationBars
                  data={debrief.moodCorrelation}
                  currency={currency}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Metric mini-card ─── */

function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/60 px-4 py-3.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1.5 text-base font-semibold tabular-nums leading-none ${
          valueColor ?? "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] text-muted-foreground leading-none">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Monthly P&L Trend Chart (SVG dot-and-line) ─── */

function catmullRomPath(
  pts: { x: number; y: number; pnl: number }[]
): string {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  const tension = 0.35;
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];

    if (p1.pnl === 0 && p2.pnl === 0) {
      d += ` L ${p2.x} ${p2.y}`;
      continue;
    }

    const p0 = pts[Math.max(i - 1, 0)];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function MonthlyPnlTrendChart({
  data,
  currency,
}: {
  data: MonthlyPnlPoint[];
  currency: string;
}) {
  const W = 800;
  const H = 160;
  const padY = 28;
  const count = data.length;

  const xPos = (i: number) => ((i + 0.5) / count) * W;

  const maxPnl = Math.max(...data.map((d) => d.pnl), 0);
  const minPnl = Math.min(...data.map((d) => d.pnl), 0);
  const range = Math.max(maxPnl - minPnl, 1);

  const pnlToY = (pnl: number) =>
    padY + ((maxPnl - pnl) / range) * (H - padY * 2);

  const zeroY = pnlToY(0);

  const points = data.map((d, i) => ({
    x: xPos(i),
    y: pnlToY(d.pnl),
    pnl: d.pnl,
    isCurrent: d.isCurrent,
  }));

  const curveD = catmullRomPath(points);

  const areaAboveD =
    curveD +
    ` L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;

  const areaBelowD = areaAboveD;

  const lineLength = points.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
        <defs>
          <linearGradient id="mpnl-grad-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="mpnl-grad-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id="mpnl-clip-above">
            <rect x="0" y="0" width={W} height={zeroY} />
          </clipPath>
          <clipPath id="mpnl-clip-below">
            <rect x="0" y={zeroY} width={W} height={H - zeroY} />
          </clipPath>
        </defs>

        {/* Zero baseline */}
        <line
          x1={points[0].x}
          y1={zeroY}
          x2={points[points.length - 1].x}
          y2={zeroY}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.6"
        />

        {/* Green area fill above zero (profit) — only if any month is positive */}
        {data.some((d) => d.pnl > 0) && (
          <path
            d={areaAboveD}
            fill="url(#mpnl-grad-green)"
            clipPath="url(#mpnl-clip-above)"
            opacity="0"
            className="animate-pnl-area"
          />
        )}

        {/* Red area fill below zero (loss) — only if any month is negative */}
        {data.some((d) => d.pnl < 0) && (
          <path
            d={areaBelowD}
            fill="url(#mpnl-grad-red)"
            clipPath="url(#mpnl-clip-below)"
            opacity="0"
            className="animate-pnl-area"
          />
        )}

        {/* Smooth connecting line */}
        <path
          d={curveD}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lineLength * 1.5}
          strokeDashoffset={lineLength * 1.5}
          className="animate-pnl-draw"
          style={
            { "--line-length": lineLength * 1.5 } as React.CSSProperties
          }
          opacity="0.45"
        />

        {/* Dots */}
        {points.map((p, i) => {
          const color =
            p.pnl > 0
              ? "#34d399"
              : p.pnl < 0
                ? "#f87171"
                : "hsl(var(--muted-foreground))";

          const dotR = p.pnl === 0 ? 3 : 5;

          return (
            <g key={i}>
              {p.isCurrent && p.pnl !== 0 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  className="animate-pnl-pulse"
                />
              )}
              {p.pnl !== 0 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={dotR + 3}
                  fill={color}
                  opacity="0.12"
                  className="animate-pnl-dot"
                  style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={dotR}
                fill={p.pnl === 0 ? "hsl(var(--border))" : color}
                stroke="white"
                strokeWidth={p.pnl === 0 ? 0 : 2}
                className="animate-pnl-dot"
                style={{ animationDelay: `${0.2 + i * 0.12}s` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels row */}
      <div className="flex mt-2">
        {data.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {point.monthLabel}
            </p>
            <p
              className={`text-[10px] tabular-nums font-medium ${
                point.pnl === 0
                  ? "text-muted-foreground/40"
                  : point.pnl > 0
                    ? "text-emerald-600"
                    : "text-red-600"
              }`}
            >
              {point.pnl === 0
                ? "\u2014"
                : formatPnlShort(point.pnl, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Correlation Bars (tag → avg P&L) ─── */

function CorrelationBars({
  data,
  currency,
}: {
  data: TagPnlCorrelation[];
  currency: string;
}) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.avgPnl)), 1);

  return (
    <div className="space-y-2.5">
      {data.map((item) => {
        const barPct = Math.max(6, (Math.abs(item.avgPnl) / maxAbs) * 100);
        const isPositive = item.avgPnl >= 0;

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-foreground">
                {item.label}
              </span>
              <span
                className={`text-[11px] font-semibold tabular-nums ${
                  isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatPnlShort(Math.round(item.avgPnl), currency)}
                <span className="text-muted-foreground font-normal ml-0.5">
                  avg
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/50">
              <div
                className={`h-2 rounded-full ${
                  isPositive ? "bg-emerald-400" : "bg-red-400"
                }`}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {item.count} day{item.count !== 1 ? "s" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
