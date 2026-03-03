"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

/* ─── Step 1: DemoEnterPnl ─────────────────────────────────── */

const PNL_FIELDS = [
  { label: "Date", value: "15/01/2026", id: "date" },
  { label: "Number of trades", value: String(HIGHLIGHT.num_trades), id: "num" },
  { label: "P&L (₹)", value: formatINR(HIGHLIGHT.net_pnl), id: "pnl", positive: HIGHLIGHT.net_pnl >= 0 },
];

function DemoEnterPnl({ active }: { active: boolean }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active) { setRevealed(0); return; }
    let count = 0;
    const id = setInterval(() => {
      count++;
      setRevealed(count);
      if (count >= PNL_FIELDS.length + 1) clearInterval(id);
    }, 600);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-background p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground text-center mb-6">Log trade</h3>
        <div className="space-y-5">
          {PNL_FIELDS.map((f, i) => (
            <div
              key={f.id}
              className="space-y-2 transition-[opacity,transform] duration-500 ease-out"
              style={{
                opacity: revealed > i ? 1 : 0,
                transform: `translateY(${revealed > i ? 0 : 16}px)`,
              }}
            >
              <label className="block text-sm font-medium text-foreground">{f.label}</label>
              <div className={`flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm shadow-sm ${
                f.id === "pnl"
                  ? f.positive ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"
                  : "text-foreground"
              }`}>
                {f.id === "pnl" ? `${f.positive ? "+" : "-"}₹${f.value}` : f.value}
              </div>
            </div>
          ))}
        </div>

        {/* Net result summary */}
        <div
          className="mt-6 rounded-lg bg-emerald-50/60 border border-emerald-200/60 p-3 text-center transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: revealed > PNL_FIELDS.length ? 1 : 0,
            transform: `translateY(${revealed > PNL_FIELDS.length ? 0 : 12}px)`,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">P&L</p>
          <p className={`text-lg font-bold ${H_FINAL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCompact(H_FINAL)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: DemoDiscipline ──────────────────────────────── */

const SCORE_COLORS: Record<number, { bg: string; ring: string }> = {
  1: { bg: "bg-red-500", ring: "ring-red-500" },
  2: { bg: "bg-orange-400", ring: "ring-orange-400" },
  3: { bg: "bg-yellow-400", ring: "ring-yellow-400" },
  4: { bg: "bg-emerald-400", ring: "ring-emerald-400" },
  5: { bg: "bg-emerald-600", ring: "ring-emerald-600" },
};

const SCORE_LABELS: Record<number, string> = {
  1: "Broke all my rules",
  2: "Slipped on a few rules",
  3: "Mostly stuck to the plan",
  4: "Followed the plan well",
  5: "Executed flawlessly",
};

const DEMO_DISCIPLINE_SCORE = 4;

function DemoDiscipline({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=dots visible, 2=score selected

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-background p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground text-center mb-2">Log trade</h3>
        <p className="text-xs text-muted-foreground text-center mb-8">Step 2 of 3</p>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground text-center">Discipline Score</label>
          <div className="flex items-center justify-center gap-3">
            {([1, 2, 3, 4, 5] as const).map((score, i) => {
              const filled = phase >= 2 && score <= DEMO_DISCIPLINE_SCORE;
              const colors = SCORE_COLORS[phase >= 2 ? DEMO_DISCIPLINE_SCORE : score];
              return (
                <div
                  key={score}
                  className={`relative h-9 w-9 rounded-full border-2 transition-[opacity,transform] duration-300 ${
                    filled
                      ? `${colors.bg} border-transparent`
                      : phase >= 1
                        ? "border-border bg-transparent"
                        : "border-transparent bg-transparent"
                  }`}
                  style={{
                    opacity: phase >= 1 ? 1 : 0,
                    transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
                    transitionDelay: phase === 1 ? `${i * 80}ms` : phase === 2 ? `${i * 60}ms` : "0ms",
                  }}
                >
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                    filled ? "text-white" : "text-muted-foreground"
                  }`}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
          <p
            className="text-[11px] text-muted-foreground text-center transition-[opacity,transform] duration-400"
            style={{
              opacity: phase >= 2 ? 1 : phase >= 1 ? 0.6 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(4px)",
            }}
          >
            {phase >= 2 ? SCORE_LABELS[DEMO_DISCIPLINE_SCORE] : "How disciplined were you today?"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: DemoMistakes ────────────────────────────────── */

const DEMO_MISTAKE_TAGS = [
  { value: "overtraded", label: "Overtraded" },
  { value: "fomo_entry", label: "FOMO Entry" },
  { value: "no_stop_loss", label: "Didn't Respect SL" },
];

const DEMO_SELECTED_MISTAKE = "fomo_entry";

function DemoMistakes({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=pills visible, 2=one selected, 3=save visible

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-background p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground text-center mb-2">Log trade</h3>
        <p className="text-xs text-muted-foreground text-center mb-8">Step 3 of 3</p>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground text-center">Any mistakes?</label>
          <div className="flex flex-wrap justify-center gap-2">
            {DEMO_MISTAKE_TAGS.map((tag, i) => {
              const selected = phase >= 2 && tag.value === DEMO_SELECTED_MISTAKE;
              return (
                <span
                  key={tag.value}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-[opacity,transform] duration-300 ${
                    selected
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                  style={{
                    opacity: phase >= 1 ? 1 : 0,
                    transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
                    transitionDelay: phase === 1 ? `${i * 100}ms` : phase === 2 ? `${i * 50}ms` : "0ms",
                  }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
          <p
            className="text-[11px] text-muted-foreground text-center transition-opacity duration-400"
            style={{ opacity: phase >= 1 ? 0.6 : 0 }}
          >
            {phase >= 2 ? "1 mistake tagged" : "Tap any that apply"}
          </p>
        </div>

        <div
          className="mt-6 transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: `translateY(${phase >= 3 ? 0 : 12}px)`,
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

/* ─── Main: DemoSection (3 steps) ─────────────────────────── */

const STEPS = [
  { id: 0, label: "Enter P&L" },
  { id: 1, label: "Rate Discipline" },
  { id: 2, label: "Tag Mistakes" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_MS = [5000, 5000, 6000];

export function DemoSection() {
  const [step, setStep] = useState<StepId>(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scheduleNext = useCallback((current: StepId) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = ((current + 1) % STEPS.length) as StepId;
      setStep(next);
    }, STEP_MS[current]);
  }, []);

  useEffect(() => {
    if (!visible) return;
    scheduleNext(step);
    return () => clearTimeout(timer.current);
  }, [visible, step, scheduleNext]);

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash === "#demo") {
        setStep(0);
      }
    };
    if (typeof window !== "undefined" && window.location.hash === "#demo") {
      setStep(0);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function pickStep(s: StepId) {
    setStep(s);
  }

  return (
    <div id="demo" ref={ref} className="pt-20 sm:pt-24 pb-10 sm:pb-16 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Heading */}
        <div
          className="text-center mb-8 sm:mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.7s, transform 0.7s",
          }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Log a trade in{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              60 seconds
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
            Enter your P&amp;L, rate your discipline, tag any mistakes &mdash; done.
          </p>
        </div>

        {/* Step switcher pills */}
        <div
          className="flex justify-center mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.7s 0.15s, transform 0.7s 0.15s",
          }}
        >
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1 gap-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStep(s.id)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${
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
                <span className="whitespace-nowrap text-xs sm:text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo content area — fixed height, no layout influence */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.7s 0.3s, transform 0.7s 0.3s",
          }}
        >
          <div className="relative overflow-hidden" style={{ height: 420, contain: "strict" }}>
            {/* Step 1: Enter P&L */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{
                opacity: step === 0 ? 1 : 0,
                transition: "opacity 0.5s ease-out",
                pointerEvents: step === 0 ? "auto" : "none",
              }}
            >
              <DemoEnterPnl active={step === 0 && visible} />
            </div>

            {/* Step 2: Rate Discipline */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{
                opacity: step === 1 ? 1 : 0,
                transition: "opacity 0.5s ease-out",
                pointerEvents: step === 1 ? "auto" : "none",
              }}
            >
              <DemoDiscipline active={step === 1 && visible} />
            </div>

            {/* Step 3: Tag Mistakes */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{
                opacity: step === 2 ? 1 : 0,
                transition: "opacity 0.5s ease-out",
                pointerEvents: step === 2 ? "auto" : "none",
              }}
            >
              <DemoMistakes active={step === 2 && visible} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
