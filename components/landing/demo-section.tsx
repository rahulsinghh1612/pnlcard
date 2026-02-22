"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CalendarDays, CalendarRange, CalendarCheck } from "lucide-react";
import { DEMO_TRADES } from "@/lib/demo-trades";

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

/* ─── Pre-computed January 2026 data (from real trades) ──── */

const TRADE_MAP = new Map<string, (typeof DEMO_TRADES)[number]>(
  DEMO_TRADES.map((t) => [t.trade_date, t]),
);

const MONTH_PNL = DEMO_TRADES.reduce((s, t) => s + getFinalResult(t), 0);

const HIGHLIGHT = DEMO_TRADES.find((t) => t.trade_date === "2026-01-14")!;
const H_FINAL = getFinalResult(HIGHLIGHT);
const H_ROI =
  HIGHLIGHT.capital_deployed != null
    ? ((H_FINAL / HIGHLIGHT.capital_deployed) * 100).toFixed(2)
    : null;

function buildGrid(): (number | null)[][] {
  const dow = new Date(2026, 0, 1).getDay();
  const pad = (dow + 6) % 7;
  const flat: (number | null)[] = [
    ...Array<null>(pad).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  while (flat.length % 7 !== 0) flat.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

const JAN_GRID = buildGrid();

const dailyFinals = DEMO_TRADES.map(getFinalResult);
const maxProfit = Math.max(...dailyFinals.filter((v) => v > 0), 1);
const maxLoss = Math.max(...dailyFinals.filter((v) => v < 0).map(Math.abs), 1);

function profitBg(v: number): string {
  const r = v / maxProfit;
  if (r >= 0.66) return "bg-emerald-200";
  if (r >= 0.33) return "bg-emerald-100";
  return "bg-emerald-50";
}

function lossBg(v: number): string {
  const r = Math.abs(v) / maxLoss;
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
  { label: "Date *", value: "14/01/2026", id: "date" },
  { label: "Number of trades *", value: "1", id: "num" },
  { label: "P&L (₹) *", value: "3,100", id: "pnl" },
  {
    label: "Charges & taxes (₹)",
    value: "90",
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

/* ─── DemoCalendar (standalone, no weekly column) ────────── */

export function DemoCalendar({ active = true }: { active?: boolean }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        {/* Month navigation bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="w-16 sm:w-20" />
          <div className="flex items-center gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="min-w-[120px] text-center text-sm font-semibold text-foreground">
              January 2026
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-700 ${
              show ? "opacity-100 scale-100" : "opacity-0 scale-75"
            } ${
              MONTH_PNL >= 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {formatCompact(MONTH_PNL)}
          </span>
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
          {JAN_GRID.map((week, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-1">
              {week.map((day, ci) => {
                const cellIdx = ri * 7 + ci;

                if (day === null)
                  return (
                    <div key={`e-${ri}-${ci}`} className="aspect-square rounded-lg" />
                  );

                const ds = `2026-01-${String(day).padStart(2, "0")}`;
                const trade = TRADE_MAP.get(ds);
                const result = trade ? getFinalResult(trade) : 0;
                const isProfit = trade ? result >= 0 : false;

                let bg = "bg-muted/40";
                let text = "text-muted-foreground";
                if (trade) {
                  bg = isProfit ? profitBg(result) : lossBg(result);
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

/* ─── DemoCreateCards ───────────────────────────────────── */

const CARD_OPTIONS = [
  { type: "Daily", pnl: formatCompact(getFinalResult(DEMO_TRADES[DEMO_TRADES.length - 1])), date: "31 Jan 2026", Icon: CalendarDays, iconBg: "bg-blue-50 text-blue-600" },
  { type: "Weekly", pnl: formatCompact(4360), date: "27 Jan – 2 Feb", Icon: CalendarRange, iconBg: "bg-purple-50 text-purple-600" },
  { type: "Monthly", pnl: formatCompact(MONTH_PNL), date: "Jan 2026", Icon: CalendarCheck, iconBg: "bg-amber-50 text-amber-600" },
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
      <div className="overflow-x-auto rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-xl scrollbar-none">
        <div className="min-w-[400px]">
        <h3 className="text-base font-semibold text-foreground text-center mb-6">
          Generate your card
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {CARD_OPTIONS.map((opt, i) => (
            <div
              key={opt.type}
              className={`rounded-xl border border-border bg-white p-4 transition-all duration-500 ${
                show ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: show ? `${i * 120}ms` : "0ms",
              }}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${opt.iconBg} mb-2`}>
                <opt.Icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {opt.type}
              </p>
              <p className="mt-0.5 text-sm font-bold text-emerald-600">{opt.pnl}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{opt.date}</p>
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
          <div className="relative h-[520px]">
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
