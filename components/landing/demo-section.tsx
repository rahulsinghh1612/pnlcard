"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CalendarDays, CalendarRange, CalendarCheck } from "lucide-react";
import {
  DEMO_TRADES,
  DEMO_MONTHS,
  DEMO_MONTH_KEYS,
  DEMO_MONTH_LABELS,
  type DemoMonthKey,
  type DemoTradeType,
} from "@/lib/demo-trades";

/* ─── Helpers ────────────────────────────────────────────── */

function getFinalResult(t: { net_pnl: number; charges: number | null }): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function formatINR(value: number): string {
  return Math.abs(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCompact(value: number): string {
  return `${value >= 0 ? "+" : "-"}₹${formatINR(value)}`;
}

/* ─── Pre-computed January 2026 data (for DemoLogTrade form) ── */

const HIGHLIGHT = DEMO_TRADES.find((t) => t.trade_date === "2026-01-15")!;
const H_FINAL = getFinalResult(HIGHLIGHT);
const H_ROI =
  HIGHLIGHT.capital_deployed != null
    ? ((H_FINAL / HIGHLIGHT.capital_deployed) * 100).toFixed(2)
    : null;

/* ─── Month grid builder ──────────────────────────────────── */

function buildGridForMonth(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dow = new Date(year, month, 1).getDay();
  const pad = (dow + 6) % 7;
  const flat: (number | null)[] = [
    ...Array<null>(pad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (flat.length % 7 !== 0) flat.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

function computeMonthData(trades: DemoTradeType[]) {
  const tradeMap = new Map<string, DemoTradeType>(
    trades.map((t) => [t.trade_date, t]),
  );
  const monthPnl = trades.reduce((s, t) => s + getFinalResult(t), 0);
  const finals = trades.map(getFinalResult);
  const mxProfit = Math.max(...finals.filter((v) => v > 0), 1);
  const mxLoss = Math.max(...finals.filter((v) => v < 0).map(Math.abs), 1);
  return { tradeMap, monthPnl, maxProfit: mxProfit, maxLoss: mxLoss };
}

function profitBg(v: number, max: number): string {
  const r = v / max;
  if (r >= 0.66) return "bg-emerald-200";
  if (r >= 0.33) return "bg-emerald-100";
  return "bg-emerald-50";
}

function lossBg(v: number, max: number): string {
  const r = Math.abs(v) / max;
  if (r >= 0.66) return "bg-red-200";
  if (r >= 0.33) return "bg-red-100";
  return "bg-red-50";
}

/* ─── DemoLogTrade ───────────────────────────────────────── */

type Field = {
  label: string;
  value: string;
  id: string;
  subLabel?: string;
  subValue?: string;
  subPositive?: boolean;
};

const FORM_FIELDS: Field[] = [
  { label: "Date *", value: "15/01/2026", id: "date" },
  { label: "Number of trades *", value: String(HIGHLIGHT.num_trades), id: "num" },
  { label: "P&L (₹) *", value: formatINR(HIGHLIGHT.net_pnl), id: "pnl" },
  {
    label: "Charges & taxes (₹)",
    value: formatINR(HIGHLIGHT.charges),
    id: "charges",
    subLabel: "Net P&L",
    subValue: formatCompact(H_FINAL),
    subPositive: H_FINAL >= 0,
  },
  {
    label: "Capital (₹) deployed for ROI",
    value: "10,00,000",
    id: "capital",
    subLabel: "ROI",
    subValue: `+${H_ROI}%`,
    subPositive: true,
  },
];

function DemoLogTrade({ active }: { active: boolean }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active) {
      setRevealed(0);
      return;
    }
    let count = 0;
    const id = setInterval(() => {
      count++;
      setRevealed(count);
      if (count >= FORM_FIELDS.length + 1) clearInterval(id);
    }, 550);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-background p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground text-center mb-6">
          Log a trade
        </h3>

        <div className="space-y-6">
          {FORM_FIELDS.map((f, i) => (
            <div
              key={f.id}
              className="space-y-2 transition-all duration-500 ease-out"
              style={{
                opacity: revealed > i ? 1 : 0,
                transform: `translateY(${revealed > i ? 0 : 16}px)`,
              }}
            >
              <label className="block text-sm font-medium text-foreground">
                {f.label}
              </label>
              <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-sm">
                {f.value}
              </div>
              {f.subLabel && (
                <p
                  className="text-sm transition-opacity duration-300 delay-200"
                  style={{ opacity: revealed > i ? 1 : 0 }}
                >
                  {f.subLabel}:{" "}
                  <span
                    className={`font-medium ${
                      f.subPositive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {f.subValue}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>

        <div
          className="mt-8 transition-all duration-500 ease-out"
          style={{
            opacity: revealed > FORM_FIELDS.length ? 1 : 0,
            transform: `translateY(${revealed > FORM_FIELDS.length ? 0 : 16}px)`,
          }}
        >
          <div className="btn-gradient-flow btn-gradient-flow-active flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm cursor-default">
            <span className="relative z-[1]">Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DemoCalendar (with multi-month navigation) ─────────── */

export function DemoCalendar({ active = true }: { active?: boolean }) {
  const [show, setShow] = useState(false);
  const [monthIdx, setMonthIdx] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const monthKey = DEMO_MONTH_KEYS[monthIdx];
  const trades = DEMO_MONTHS[monthKey];
  const label = DEMO_MONTH_LABELS[monthKey];
  const { tradeMap, monthPnl, maxProfit: mxP, maxLoss: mxL } = computeMonthData(trades);

  const [year, mon] = monthKey.split("-").map(Number);
  const grid = buildGridForMonth(year, mon - 1);
  const datePrefix = monthKey;

  const canPrev = monthIdx > 0;
  const canNext = monthIdx < DEMO_MONTH_KEYS.length - 1;

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }

    const el = ref.current;
    if (!el) {
      const id = setTimeout(() => setShow(true), 200);
      return () => clearTimeout(id);
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  return (
    <div ref={ref} className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 p-4 sm:p-5 shadow-xl">
        {/* Month navigation bar — month name + PNL inline */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => canPrev && setMonthIdx((i) => i - 1)}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted transition-opacity ${
              canPrev ? "text-muted-foreground hover:bg-muted/80 cursor-pointer" : "opacity-30 cursor-default"
            }`}
            disabled={!canPrev}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {label}
            </span>
            <span
              className={`text-xs font-bold transition-all duration-500 ${
                show ? "opacity-100" : "opacity-0"
              } ${monthPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatCompact(monthPnl)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => canNext && setMonthIdx((i) => i + 1)}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted transition-opacity ${
              canNext ? "text-muted-foreground hover:bg-muted/80 cursor-pointer" : "opacity-30 cursor-default"
            }`}
            disabled={!canNext}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={`h-${i}`}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Week rows */}
        <div className="flex flex-col gap-1">
          {grid.map((week, ri) => (
            <div key={`${monthKey}-${ri}`} className="grid grid-cols-7 gap-1">
              {week.map((day, ci) => {
                const cellIdx = ri * 7 + ci;

                if (day === null)
                  return (
                    <div key={`e-${ri}-${ci}`} className="aspect-square rounded-lg" />
                  );

                const ds = `${datePrefix}-${String(day).padStart(2, "0")}`;
                const trade = tradeMap.get(ds);
                const result = trade ? getFinalResult(trade) : 0;
                const isProfit = trade ? result >= 0 : false;

                let bg = "bg-muted/40";
                let text = "text-muted-foreground";
                if (trade) {
                  bg = isProfit ? profitBg(result, mxP) : lossBg(result, mxL);
                  text = isProfit ? "text-emerald-700" : "text-red-700";
                }

                return (
                  <div
                    key={ds}
                    className={`relative aspect-square min-w-0 rounded-lg flex flex-col items-center justify-center transition-all duration-500 ${bg} ${text}`}
                    style={{
                      opacity: show ? 1 : 0,
                      transform: show ? "scale(1)" : "scale(0.6)",
                      transitionDelay: show ? `${cellIdx * 25}ms` : "0ms",
                    }}
                  >
                    {trade ? (
                      <>
                        <span className="absolute top-0.5 left-1 text-[7px] sm:text-[8px] font-medium leading-none opacity-70">
                          {day}
                        </span>
                        <span className="text-[9px] sm:text-[11px] font-bold leading-tight truncate max-w-full">
                          {formatCompact(result)}
                        </span>
                        <span className="text-[6px] sm:text-[7px] font-medium leading-none opacity-75 mt-0.5">
                          {trade.num_trades === 1
                            ? "1 Trade"
                            : `${trade.num_trades} Trades`}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-xs font-medium">
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-200/60" />
              <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200/60" />
              <span className="h-3 w-3 rounded bg-emerald-200 border border-emerald-300/60" />
            </span>
            Profit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <span className="h-3 w-3 rounded bg-red-50 border border-red-200/60" />
              <span className="h-3 w-3 rounded bg-red-100 border border-red-200/60" />
              <span className="h-3 w-3 rounded bg-red-200 border border-red-300/60" />
            </span>
            Loss
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-muted/40 border border-border" />
            No trade
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── DemoWeeklyBreakdown ──────────────────────────────── */

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

type WeekRow = {
  range: string;
  pnl: number;
  wins: number;
  losses: number;
  dailyPnls: { label: string; pnl: number; hasTrade: boolean }[];
};

function buildWeekRows(
  grid: (number | null)[][],
  tradeMap: Map<string, DemoTradeType>,
  datePrefix: string,
  monthShort: string,
): WeekRow[] {
  return grid
    .map((week) => {
      const dailyPnls: WeekRow["dailyPnls"] = [];
      let total = 0;
      let wins = 0;
      let losses = 0;
      let minDay: number | null = null;
      let maxDay: number | null = null;

      week.forEach((day, ci) => {
        if (day === null) {
          dailyPnls.push({ label: DAY_LABELS[ci], pnl: 0, hasTrade: false });
          return;
        }
        if (minDay === null || day < minDay) minDay = day;
        if (maxDay === null || day > maxDay) maxDay = day;

        const ds = `${datePrefix}-${String(day).padStart(2, "0")}`;
        const trade = tradeMap.get(ds);
        if (trade) {
          const r = getFinalResult(trade);
          total += r;
          if (r >= 0) wins++;
          else losses++;
          dailyPnls.push({ label: DAY_LABELS[ci], pnl: r, hasTrade: true });
        } else {
          dailyPnls.push({ label: DAY_LABELS[ci], pnl: 0, hasTrade: false });
        }
      });

      return {
        range:
          minDay !== null && maxDay !== null
            ? `${minDay} – ${maxDay} ${monthShort}`
            : "",
        pnl: total,
        wins,
        losses,
        dailyPnls,
      };
    })
    .filter((w) => w.wins + w.losses > 0);
}

export function DemoWeeklyBreakdown() {
  const [show, setShow] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAvg, setShowAvg] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { tradeMap } = computeMonthData(DEMO_TRADES);
  const grid = buildGridForMonth(2026, 0);
  const weeks = buildWeekRows(grid, tradeMap, "2026-01", "Jan");

  const avgWeekly =
    weeks.length > 0
      ? Math.round(weeks.reduce((s, w) => s + w.pnl, 0) / weeks.length)
      : 0;

  const maxDayAbs = Math.max(
    ...weeks.flatMap((w) =>
      w.dailyPnls.filter((d) => d.hasTrade).map((d) => Math.abs(d.pnl)),
    ),
    1,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRevealedCount(0);
    setShowAvg(false);

    if (!show) return;

    for (let i = 0; i < weeks.length; i++) {
      const t = setTimeout(() => setRevealedCount(i + 1), 200 + i * 600);
      timersRef.current.push(t);
    }

    const avgT = setTimeout(
      () => setShowAvg(true),
      200 + weeks.length * 600 + 400,
    );
    timersRef.current.push(avgT);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <div ref={ref} className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 p-4 sm:p-5 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <span className="text-sm font-semibold text-foreground">
              January 2026
            </span>
            <span className="ml-1.5 text-[10px] sm:text-xs text-muted-foreground">
              · Weekly Breakdown
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {weeks.length} weeks
          </span>
        </div>

        {/* Week rows */}
        <div className="flex flex-col gap-4">
          {weeks.map((week, wi) => {
            const revealed = wi < revealedCount;
            const BAR_MAX_H = 28;

            return (
              <div
                key={`wk-${wi}`}
                className="transition-all duration-500"
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed
                    ? "translateY(0)"
                    : "translateY(12px)",
                }}
              >
                {/* Row header */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground">
                      Week {wi + 1}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {week.range}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {week.wins}W · {week.losses}L
                    </span>
                    <span
                      className={`text-[11px] sm:text-xs font-bold ${
                        week.pnl >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCompact(week.pnl)}
                    </span>
                  </div>
                </div>

                {/* Mini day bars */}
                <div className="grid grid-cols-7 gap-1.5">
                  {week.dailyPnls.map((d, di) => {
                    const barH = d.hasTrade
                      ? Math.max(
                          6,
                          Math.round(
                            (Math.abs(d.pnl) / maxDayAbs) * BAR_MAX_H,
                          ),
                        )
                      : 0;

                    return (
                      <div
                        key={`d-${wi}-${di}`}
                        className="flex flex-col items-center"
                      >
                        {/* Bar container — fixed height for alignment */}
                        <div
                          className="w-full flex items-end justify-center"
                          style={{ height: `${BAR_MAX_H + 2}px` }}
                        >
                          {d.hasTrade ? (
                            <div
                              className="w-full rounded-[4px] transition-all duration-700"
                              style={{
                                height: revealed ? `${barH}px` : "0px",
                                transitionDelay: revealed
                                  ? `${di * 50 + 100}ms`
                                  : "0ms",
                                backgroundColor:
                                  d.pnl >= 0
                                    ? "rgb(16 185 129 / 0.2)"
                                    : "rgb(239 68 68 / 0.2)",
                                borderWidth: "1px",
                                borderColor:
                                  d.pnl >= 0
                                    ? "rgb(16 185 129 / 0.35)"
                                    : "rgb(239 68 68 / 0.35)",
                              }}
                            />
                          ) : (
                            <div
                              className="w-1.5 h-1.5 rounded-full bg-muted/60 transition-opacity duration-500"
                              style={{
                                opacity: revealed ? 1 : 0,
                                transitionDelay: revealed
                                  ? `${di * 50 + 100}ms`
                                  : "0ms",
                              }}
                            />
                          )}
                        </div>
                        {/* Day label */}
                        <span className="mt-1 text-[8px] sm:text-[9px] font-medium text-muted-foreground leading-none">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Avg Weekly */}
        <div
          className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between transition-all duration-700"
          style={{
            opacity: showAvg ? 1 : 0,
            transform: showAvg ? "translateY(0)" : "translateY(6px)",
          }}
        >
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Avg. Weekly P&L
          </span>
          <span
            className={`text-sm sm:text-base font-bold ${
              avgWeekly >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCompact(avgWeekly)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── DemoCreateCards ───────────────────────────────────── */

const JAN_PNL = DEMO_TRADES.reduce((s, t) => s + getFinalResult(t), 0);

const JAN_WEEK_PNL = DEMO_TRADES
  .filter((t) => t.trade_date >= "2026-01-26" && t.trade_date <= "2026-02-01")
  .reduce((s, t) => s + getFinalResult(t), 0);

const CARD_OPTIONS = [
  { type: "Daily", pnl: formatCompact(getFinalResult(DEMO_TRADES[DEMO_TRADES.length - 1])), date: "31 Jan 2026", Icon: CalendarDays, iconBg: "bg-blue-50 text-blue-600" },
  { type: "Weekly", pnl: formatCompact(JAN_WEEK_PNL), date: "26 Jan – 1 Feb", Icon: CalendarRange, iconBg: "bg-purple-50 text-purple-600" },
  { type: "Monthly", pnl: formatCompact(JAN_PNL), date: "Jan 2026", Icon: CalendarCheck, iconBg: "bg-amber-50 text-amber-600" },
];

function DemoCreateCards({ active }: { active: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground text-center mb-6">
          Generate your card
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARD_OPTIONS.map((opt, i) => (
            <div
              key={opt.type}
              className={`rounded-xl border border-border bg-white p-4 transition-all duration-500 flex items-center gap-3 sm:block ${
                show ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: show ? `${i * 120}ms` : "0ms",
              }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${opt.iconBg} sm:mb-2`}>
                <opt.Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {opt.type}
                </p>
                <p className="mt-0.5 text-sm font-bold text-emerald-600">{opt.pnl}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{opt.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          className={`mt-6 transition-all duration-500 ${show ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: show ? "400ms" : "0ms" }}
        >
          <div className="btn-gradient-flow btn-gradient-flow-active flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm cursor-default">
            <span className="relative z-[1]">Generate Daily Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main: DemoSection (2 steps: Log Trade + Create Cards) */

const STEPS = [
  { id: 0 as const, label: "Log a Trade" },
  { id: 1 as const, label: "Create Cards" },
];

const AUTO_MS = 6000;

export function DemoSection() {
  const [step, setStep] = useState<0 | 1>(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(
      () => setStep((p) => (p === 0 ? 1 : 0)),
      AUTO_MS,
    );
  }, []);

  useEffect(() => {
    if (!visible) return;
    startTimer();
    return () => clearInterval(timer.current);
  }, [visible, startTimer]);

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash === "#demo") {
        setStep(0);
        startTimer();
      }
    };
    if (typeof window !== "undefined" && window.location.hash === "#demo") {
      setStep(0);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [startTimer]);

  function pickStep(s: 0 | 1) {
    setStep(s);
    startTimer();
  }

  return (
    <section id="demo" ref={ref} className="pt-8 sm:pt-10 pb-32 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Step switcher pills */}
        <div
          className={`flex justify-center mb-6 transition-all duration-700 delay-150 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStep(s.id)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  step === s.id
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 shrink-0 ${
                    step === s.id
                      ? "bg-foreground text-background"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {s.id + 1}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo content area */}
        <div
          className={`relative transition-all duration-700 delay-300 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative h-[560px] sm:h-[520px]">
            <div
              className="absolute inset-0 flex items-start justify-center transition-all duration-500 ease-out"
              style={{
                opacity: step === 0 ? 1 : 0,
                transform: `translateX(${step === 0 ? 0 : -30}px)`,
                pointerEvents: step === 0 ? "auto" : "none",
              }}
            >
              <DemoLogTrade active={step === 0 && visible} />
            </div>

            <div
              className="absolute inset-0 flex items-start justify-center transition-all duration-500 ease-out"
              style={{
                opacity: step === 1 ? 1 : 0,
                transform: `translateX(${step === 1 ? 0 : 30}px)`,
                pointerEvents: step === 1 ? "auto" : "none",
              }}
            >
              <DemoCreateCards active={step === 1 && visible} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
