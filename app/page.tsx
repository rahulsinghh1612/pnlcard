"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Check,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import dynamic from "next/dynamic";
const DemoSection = dynamic(() => import("@/components/landing/demo-section").then((m) => m.DemoSection), {
  ssr: false,
  loading: () => <div className="h-[728px] min-h-[728px]" aria-hidden="true" />,
});
const ReviewShowcase = dynamic(() => import("@/components/landing/review-showcase").then((m) => m.ReviewShowcase), {
  ssr: false,
  loading: () => <div className="h-[400px]" />,
});
// ─── Sample ticker data ──────────────────────────────────────────

const TICKER_1 = [
  { date: "Feb 18", pnl: 24800 },
  { date: "Feb 17", pnl: -3200 },
  { date: "Feb 14", pnl: 12400 },
  { date: "Feb 13", pnl: 8900 },
  { date: "Feb 12", pnl: -5600 },
  { date: "Feb 11", pnl: 21294 },
  { date: "Feb 10", pnl: -1800 },
  { date: "Feb 7", pnl: 15600 },
  { date: "Feb 6", pnl: 9300 },
  { date: "Feb 5", pnl: -7200 },
];

const TICKER_2 = [
  { date: "Jan 31", pnl: 18500 },
  { date: "Jan 30", pnl: -4100 },
  { date: "Jan 29", pnl: 6800 },
  { date: "Jan 28", pnl: 32400 },
  { date: "Jan 27", pnl: -12300 },
  { date: "Jan 24", pnl: 8200 },
  { date: "Jan 23", pnl: -2900 },
  { date: "Jan 22", pnl: 14700 },
  { date: "Jan 21", pnl: 5400 },
  { date: "Jan 20", pnl: -9800 },
];

const TICKER_3 = [
  { date: "Feb 20", pnl: 11200 },
  { date: "Feb 19", pnl: -6400 },
  { date: "Feb 15", pnl: 28300 },
  { date: "Feb 8", pnl: 4700 },
  { date: "Feb 4", pnl: -8100 },
  { date: "Feb 3", pnl: 19600 },
  { date: "Jan 19", pnl: 7300 },
  { date: "Jan 18", pnl: -2500 },
  { date: "Jan 17", pnl: 16800 },
  { date: "Jan 16", pnl: 10100 },
];

// ─── Helpers ─────────────────────────────────────────────────────

function formatINR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-IN");
  const sign = value >= 0 ? "+" : "\u2212";
  return `${sign}\u20B9${formatted}`;
}

// ─── Hooks ───────────────────────────────────────────────────────

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Ticker chip ─────────────────────────────────────────────────

function TickerChip({ date, pnl }: { date: string; pnl: number }) {
  const positive = pnl >= 0;
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-transform duration-200 hover:scale-105 select-none ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {positive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      <span className="opacity-60">{date}</span>
      <span className="font-bold">{formatINR(pnl)}</span>
    </div>
  );
}

// ─── Feature highlights for scrolling strip ─────────────────────
const FEATURE_HIGHLIGHTS = [
  "60-Second Daily Logging",
  "Weekly Review Reports",
  "Discipline & Mistake Tags",
  "Calendar Heatmap",
  "Monthly Review",
  "Pattern Detection",
  "Auto ROI Tracking",
  "Shareable P&L Cards",
  "Multi-Currency Support",
  "Built For Traders",
];

// ─── Hero dashboard preview data ─────────────────────────────────
type HeroTrade = { pnl: number; trades: number };
type HeroWeek = { label: string; range: string; pnl: number; wins: number; losses: number; daily: (number | null)[] };
type HeroMonth = {
  label: string;
  shortLabel: string;
  daysInMonth: number;
  startPad: number;
  trades: Record<number, HeroTrade>;
  weeks: HeroWeek[];
};

const HERO_MONTHS: HeroMonth[] = [
  {
    // December 2025 — loss month, total ≈ −₹35,000
    // Mix: W1 +6,200 · W2 −18,400 · W3 +8,600 · W4 −22,800 · W5 −8,600
    label: "December 2025", shortLabel: "December", daysInMonth: 31, startPad: 0,
    trades: {
      1: { pnl: 7200, trades: 2 }, 2: { pnl: -3400, trades: 1 },
      4: { pnl: 5800, trades: 2 }, 5: { pnl: -1200, trades: 1 }, 6: { pnl: -2200, trades: 1 },
      8: { pnl: -8600, trades: 3 }, 10: { pnl: -4200, trades: 1 }, 11: { pnl: 2400, trades: 1 },
      12: { pnl: -6800, trades: 2 }, 13: { pnl: -1200, trades: 1 },
      15: { pnl: 9400, trades: 3 }, 16: { pnl: -4200, trades: 1 }, 18: { pnl: 6800, trades: 2 },
      19: { pnl: -3400, trades: 1 },
      22: { pnl: -11200, trades: 3 }, 23: { pnl: 4600, trades: 1 }, 24: { pnl: -8400, trades: 2 },
      25: { pnl: -4200, trades: 1 }, 26: { pnl: -3600, trades: 1 },
      29: { pnl: 3200, trades: 1 }, 30: { pnl: -7400, trades: 2 }, 31: { pnl: -4400, trades: 1 },
    },
    weeks: [
      { label: "Week 1", range: "1 – 7 Dec", pnl: 6200, wins: 2, losses: 3, daily: [7200, -3400, null, 5800, -1200, -2200, null] },
      { label: "Week 2", range: "8 – 14 Dec", pnl: -18400, wins: 1, losses: 4, daily: [-8600, null, -4200, 2400, -6800, -1200, null] },
      { label: "Week 3", range: "15 – 21 Dec", pnl: 8600, wins: 2, losses: 2, daily: [9400, -4200, null, 6800, -3400, null, null] },
      { label: "Week 4", range: "22 – 28 Dec", pnl: -22800, wins: 1, losses: 4, daily: [-11200, 4600, -8400, -4200, -3600, null, null] },
      { label: "Week 5", range: "29 – 31 Dec", pnl: -8600, wins: 1, losses: 2, daily: [3200, -7400, -4400, null, null, null, null] },
    ],
  },
  {
    // January 2026 — profit month, total ≈ +₹63,200
    // Mix: W1 +10,600 · W2 −4,800 · W3 +22,400 · W4 +14,400 · W5 −6,200 · (net from all = keeps ~63k area)
    // Recalc: 10600 + (−4800) + 22400 + 14400 + 20600 = 63,200
    label: "January 2026", shortLabel: "January", daysInMonth: 31, startPad: 3,
    trades: {
      2: { pnl: 8400, trades: 2 }, 3: { pnl: 2200, trades: 1 },
      5: { pnl: -3400, trades: 1 }, 6: { pnl: -6200, trades: 2 }, 7: { pnl: 3200, trades: 1 },
      9: { pnl: -2800, trades: 1 }, 10: { pnl: 4400, trades: 2 },
      12: { pnl: 9800, trades: 3 }, 14: { pnl: 6200, trades: 1 }, 15: { pnl: 8400, trades: 2 },
      16: { pnl: -2000, trades: 1 },
      19: { pnl: 7600, trades: 3 }, 20: { pnl: -2400, trades: 1 }, 21: { pnl: 4800, trades: 2 },
      22: { pnl: -3200, trades: 1 }, 23: { pnl: 7600, trades: 2 },
      27: { pnl: 8200, trades: 2 }, 28: { pnl: 6400, trades: 2 }, 29: { pnl: -1800, trades: 1 },
      30: { pnl: 5600, trades: 2 }, 31: { pnl: 2200, trades: 1 },
    },
    weeks: [
      { label: "Week 1", range: "1 – 4 Jan", pnl: 10600, wins: 2, losses: 0, daily: [null, null, null, null, 8400, 2200, null] },
      { label: "Week 2", range: "5 – 11 Jan", pnl: -4800, wins: 2, losses: 3, daily: [-3400, -6200, 3200, null, -2800, 4400, null] },
      { label: "Week 3", range: "12 – 18 Jan", pnl: 22400, wins: 3, losses: 1, daily: [9800, null, 6200, 8400, -2000, null, null] },
      { label: "Week 4", range: "19 – 25 Jan", pnl: 14400, wins: 3, losses: 2, daily: [7600, -2400, 4800, -3200, 7600, null, null] },
      { label: "Week 5", range: "26 – 31 Jan", pnl: 20600, wins: 4, losses: 1, daily: [null, 8200, 6400, -1800, 5600, 2200, null] },
    ],
  },
  {
    // February 2026 — profit month, total ≈ +₹49,000
    // Mix: W1 empty · W2 +18,400 · W3 −8,600 · W4 +24,800 · W5 +14,400
    label: "February 2026", shortLabel: "February", daysInMonth: 28, startPad: 6,
    trades: {
      2: { pnl: 8400, trades: 2 }, 3: { pnl: -3200, trades: 1 }, 4: { pnl: 6800, trades: 2 },
      5: { pnl: 9200, trades: 3 }, 6: { pnl: -2800, trades: 1 },
      9: { pnl: -4600, trades: 2 }, 10: { pnl: 3200, trades: 1 }, 12: { pnl: -7800, trades: 2 },
      13: { pnl: -2400, trades: 1 }, 14: { pnl: 3000, trades: 1 },
      16: { pnl: 11400, trades: 3 }, 18: { pnl: -3200, trades: 1 }, 19: { pnl: 7200, trades: 2 },
      20: { pnl: 6800, trades: 2 }, 21: { pnl: 2600, trades: 1 },
      23: { pnl: 8600, trades: 2 }, 24: { pnl: -2400, trades: 1 }, 25: { pnl: 4200, trades: 1 },
      26: { pnl: -1800, trades: 1 }, 27: { pnl: 5800, trades: 2 },
    },
    weeks: [
      { label: "Week 1", range: "1 – 1 Feb", pnl: 0, wins: 0, losses: 0, daily: [null, null, null, null, null, null, null] },
      { label: "Week 2", range: "2 – 8 Feb", pnl: 18400, wins: 3, losses: 2, daily: [8400, -3200, 6800, 9200, -2800, null, null] },
      { label: "Week 3", range: "9 – 15 Feb", pnl: -8600, wins: 2, losses: 3, daily: [-4600, 3200, null, -7800, -2400, 3000, null] },
      { label: "Week 4", range: "16 – 22 Feb", pnl: 24800, wins: 4, losses: 1, daily: [11400, null, -3200, 7200, 6800, 2600, null] },
      { label: "Week 5", range: "23 – 28 Feb", pnl: 14400, wins: 3, losses: 2, daily: [8600, -2400, 4200, -1800, 5800, null, null] },
    ],
  },
];

function heroMaxes(trades: Record<number, HeroTrade>) {
  const vals = Object.values(trades);
  return {
    profit: Math.max(...vals.filter(t => t.pnl > 0).map(t => t.pnl), 1),
    loss: Math.max(...vals.filter(t => t.pnl < 0).map(t => Math.abs(t.pnl)), 1),
  };
}
function heroProfitBg(v: number, maxP: number): string {
  const r = v / maxP;
  if (r >= 0.66) return "bg-emerald-200";
  if (r >= 0.33) return "bg-emerald-100";
  return "bg-emerald-50";
}
function heroLossBg(v: number, maxL: number): string {
  const r = Math.abs(v) / maxL;
  if (r >= 0.66) return "bg-red-200";
  if (r >= 0.33) return "bg-red-100";
  return "bg-red-50";
}
function heroFormatPnl(v: number): string {
  const sign = v >= 0 ? "+" : "\u2212";
  return `${sign}₹${Math.abs(v).toLocaleString("en-IN")}`;
}

function HeroDashboard() {
  const [step, setStep] = useState(0);
  const [monthIdx, setMonthIdx] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const autoCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteracted = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const kick = () => {
      if (started.current) return;
      started.current = true;
      const delays = [0, 300, 700, 1200, 1500, 1800, 2100, 2400, 2700, 3000];
      delays.forEach((d, i) => {
        setTimeout(() => setStep(i + 1), d);
      });
    };

    const el = ref.current;
    if (!el) { kick(); return; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      kick();
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          obs.disconnect();
          kick();
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (step < 10 || userInteracted.current) return;
    const AUTO_CYCLE_MS = 4000;
    autoCycleRef.current = setInterval(() => {
      setMonthIdx((prev) => (prev + 1) % HERO_MONTHS.length);
    }, AUTO_CYCLE_MS);
    return () => {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
    };
  }, [step]);

  const m = HERO_MONTHS[monthIdx];
  const days = Array.from({ length: m.daysInMonth }, (_, i) => i + 1);
  const { profit: maxP, loss: maxL } = heroMaxes(m.trades);
  const monthPnl = Object.values(m.trades).reduce((s, t) => s + t.pnl, 0);
  const heroMaxDayAbs = Math.max(
    ...m.weeks.flatMap((w) => w.daily.filter((d): d is number => d !== null).map(Math.abs)),
    1,
  );
  const activeWeeks = m.weeks.filter((w) => w.wins + w.losses > 0);

  const done = step >= 10;

  const stopAutoCycle = () => {
    userInteracted.current = true;
    if (autoCycleRef.current) { clearInterval(autoCycleRef.current); autoCycleRef.current = null; }
  };
  const goPrev = () => { stopAutoCycle(); setMonthIdx((prev) => (prev - 1 + HERO_MONTHS.length) % HERO_MONTHS.length); };
  const goNext = () => { stopAutoCycle(); setMonthIdx((prev) => (prev + 1) % HERO_MONTHS.length); };

  return (
    <div ref={ref} className={`w-full max-w-[680px] space-y-5 sm:space-y-6 ${done ? "animate-hero-float" : ""}`}>
      {/* ── Card 1: P&L + Calendar Heatmap ── */}
      <div className="rounded-xl border border-slate-200/60 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Title bar */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-md bg-white/80 border border-slate-200/60 px-3 py-0.5 text-[10px] text-slate-400 font-medium w-44 justify-center">
              <svg className="h-2 w-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              pnlcard.com
            </div>
          </div>
        </div>

        <div className="bg-[#fafafa] p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Hero P&L card */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: step >= 1 ? 1 : 0,
              transform: `translateY(${step >= 1 ? 0 : 20}px)`,
            }}
          >
            <div
              className="rounded-xl border border-slate-200 p-3 sm:p-5"
              style={{
                background: monthPnl >= 0
                  ? "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #fff 0%, #f8fafc 100%)"
                  : "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-slate-500">Hi, Trader</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">{m.shortLabel} P&L</p>
                  <p className={`mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-300 ${monthPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {heroFormatPnl(monthPnl)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar heatmap */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: step >= 2 ? 1 : 0,
              transform: `translateY(${step >= 2 ? 0 : 20}px)`,
            }}
          >
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-3 sm:p-5">
              {/* Month nav */}
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">{m.label}</span>
                  <span className={`text-[11px] sm:text-xs font-bold transition-colors duration-300 ${monthPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{heroFormatPnl(monthPnl)}</span>
                </div>
                <button
                  onClick={goNext}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="mb-1 sm:mb-1.5 grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={`hdr-${i}`} className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-slate-400">{d}</span>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="flex flex-col gap-0.5 sm:gap-1">
                {(() => {
                  const flat: (number | null)[] = [
                    ...Array<null>(m.startPad).fill(null),
                    ...days,
                  ];
                  while (flat.length % 7 !== 0) flat.push(null);
                  const weeks: (number | null)[][] = [];
                  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));

                  return weeks.map((week, ri) => (
                    <div key={`wk-${ri}`} className="grid grid-cols-7 gap-0.5 sm:gap-1">
                      {week.map((day, ci) => {
                        const cellIdx = ri * 7 + ci;
                        if (day === null) return <div key={`e-${ri}-${ci}`} className="aspect-square rounded-md sm:rounded-lg" />;

                        const trade = m.trades[day];
                        const hasTrade = !!trade;
                        const isProfit = hasTrade && trade.pnl >= 0;

                        let bg = "bg-slate-100/40";
                        let textColor = "text-slate-400";
                        if (hasTrade) {
                          bg = isProfit ? heroProfitBg(trade.pnl, maxP) : heroLossBg(trade.pnl, maxL);
                          textColor = isProfit ? "text-emerald-700" : "text-red-700";
                        }

                        return (
                          <div
                            key={`c-${day}`}
                            className={`relative aspect-square min-w-0 rounded-md sm:rounded-lg flex flex-col items-center justify-center ${bg} ${textColor} transition-all`}
                            style={{
                              transitionDuration: "500ms",
                              transitionDelay: step >= 2 ? `${cellIdx * 25}ms` : "0ms",
                              opacity: step >= 2 ? 1 : 0,
                              transform: step >= 2 ? "scale(1)" : "scale(0.6)",
                            }}
                          >
                            {hasTrade ? (
                              <>
                                <span className="absolute top-px left-0.5 sm:top-0.5 sm:left-1 text-[6px] sm:text-[8px] font-medium leading-none opacity-70">{day}</span>
                                <span className="text-[8px] sm:text-[11px] font-bold leading-tight truncate max-w-full px-px">
                                  {heroFormatPnl(trade.pnl)}
                                </span>
                                <span className="text-[5px] sm:text-[7px] font-medium leading-none opacity-75 mt-px sm:mt-0.5">
                                  {trade.trades === 1 ? "1 Trade" : `${trade.trades} Trades`}
                                </span>
                              </>
                            ) : (
                              <span className="text-[9px] sm:text-xs font-medium">{day}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>

              {/* Legend */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="flex gap-0.5">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-emerald-50 border border-emerald-200/60" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-emerald-100 border border-emerald-200/60" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-emerald-200 border border-emerald-300/60" />
                  </span>
                  Profit
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex gap-0.5">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-red-50 border border-red-200/60" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-red-100 border border-red-200/60" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-red-200 border border-red-300/60" />
                  </span>
                  Loss
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-slate-100/40 border border-slate-200" />
                  No trade
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge copy between cards */}
      <p
        className="text-center text-sm text-slate-500 transition-all duration-700 ease-out"
        style={{
          opacity: step >= 3 ? 1 : 0,
          transform: `translateY(${step >= 3 ? 0 : 8}px)`,
        }}
      >
        See how each week shaped up
      </p>

      {/* ── Card 2: Weekly Breakdown ── */}
      <div
        className="rounded-xl border border-slate-200/60 bg-white shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-700 ease-out"
        style={{
          opacity: step >= 3 ? 1 : 0,
          transform: `translateY(${step >= 3 ? 0 : 20}px)`,
        }}
      >
        <div className="bg-[#fafafa] p-3 sm:p-5">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-3 sm:p-5">
            <div className="mb-3 sm:mb-5 flex items-baseline justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{m.label}</span>
                <span className="ml-1 sm:ml-1.5 text-[9px] sm:text-xs text-slate-400">· Weekly Breakdown</span>
              </div>
              <span className="text-[9px] sm:text-xs text-slate-400">{activeWeeks.length} weeks</span>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {m.weeks.map((week, wi) => {
                if (week.wins + week.losses === 0) return null;
                const revealed = step >= 4 + wi;
                const BAR_MAX_H = 28;
                const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

                return (
                  <div
                    key={`hw-${wi}`}
                    className="transition-all duration-500"
                    style={{
                      opacity: revealed ? 1 : 0,
                      transform: revealed ? "translateY(0)" : "translateY(12px)",
                    }}
                  >
                    <div className="flex items-baseline justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-baseline gap-1 sm:gap-1.5">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-800">{week.label}</span>
                        <span className="text-[8px] sm:text-[10px] text-slate-400">{week.range}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-[8px] sm:text-[10px] text-slate-400">{week.wins}W · {week.losses}L</span>
                        <span className={`text-[10px] sm:text-xs font-bold ${week.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {heroFormatPnl(week.pnl)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {week.daily.map((d, di) => {
                        const hasTrade = d !== null;
                        const barH = hasTrade ? Math.max(6, Math.round((Math.abs(d) / heroMaxDayAbs) * BAR_MAX_H)) : 0;

                        return (
                          <div key={`hd-${wi}-${di}`} className="flex flex-col items-center">
                            <div className="w-full flex items-end justify-center" style={{ height: `${BAR_MAX_H + 2}px` }}>
                              {hasTrade ? (
                                <div
                                  className="w-full rounded-[3px] sm:rounded-[4px] transition-all duration-700"
                                  style={{
                                    height: revealed ? `${barH}px` : "0px",
                                    transitionDelay: revealed ? `${di * 50 + 100}ms` : "0ms",
                                    backgroundColor: d >= 0 ? "rgb(16 185 129 / 0.2)" : "rgb(239 68 68 / 0.2)",
                                    borderWidth: "1px",
                                    borderColor: d >= 0 ? "rgb(16 185 129 / 0.35)" : "rgb(239 68 68 / 0.35)",
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-1.5 h-1.5 rounded-full bg-slate-200/60 transition-opacity duration-500"
                                  style={{ opacity: revealed ? 1 : 0, transitionDelay: revealed ? `${di * 50 + 100}ms` : "0ms" }}
                                />
                              )}
                            </div>
                            <span className="mt-0.5 sm:mt-1 text-[7px] sm:text-[9px] font-medium text-slate-400 leading-none">{dayLabels[di]}</span>
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
              className="mt-4 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-200/60 flex items-center justify-between transition-all duration-700"
              style={{
                opacity: step >= 4 + m.weeks.length ? 1 : 0,
                transform: step >= 4 + m.weeks.length ? "translateY(0)" : "translateY(6px)",
              }}
            >
              <span className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Avg. Weekly P&L</span>
              <span className={`text-xs sm:text-base font-bold ${monthPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {heroFormatPnl(activeWeeks.length > 0 ? Math.round(activeWeeks.reduce((s, w) => s + w.pnl, 0) / activeWeeks.length) : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card showcase ───────────────────────────────────────────────

type CardType = "daily" | "weekly" | "monthly";
type CardTheme = "light" | "dark";
type CardSide = "profit" | "loss";

const CARD_META: Record<CardType, { label: string; pnl: string; pnlLoss: string; date: string }> = {
  daily:   { label: "DAILY CARD",   pnl: "+₹8,400", pnlLoss: "-₹4,200", date: "2nd Jan, 2026" },
  weekly:  { label: "WEEKLY CARD",  pnl: "+₹11,400", pnlLoss: "-₹6,800", date: "5 Jan – 11 Jan, 2026" },
  monthly: { label: "MONTHLY CARD", pnl: "+₹65,000", pnlLoss: "-₹12,000", date: "Jan 2026" },
};

function getPromoSrc(type: CardType, theme: CardTheme, side: CardSide): string {
  const loss = side === "loss" ? "-loss" : "";
  const dark = theme === "dark" ? "-dark" : "";
  return `/promo/${type}${loss}${dark}.png`;
}

function CardShowcase() {
  const [cardType, setCardType] = useState<CardType>("daily");
  const [theme, setTheme] = useState<CardTheme>("light");
  const [side, setSide] = useState<CardSide>("profit");

  const meta = CARD_META[cardType];
  const mainSrc = getPromoSrc(cardType, theme, side);

  const otherTypes = (["daily", "weekly", "monthly"] as const).filter((t) => t !== cardType);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Toggle bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Card type */}
        <div className="flex rounded-full border border-border bg-muted/40 p-0.5 sm:p-1">
          {(["daily", "weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCardType(t)}
              className={`rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium capitalize transition-all ${
                cardType === t
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="flex rounded-full border border-border bg-muted/40 p-0.5 sm:p-1">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
              theme === "light" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
              theme === "dark" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Dark
          </button>
        </div>

        {/* Profit / Loss */}
        <div className="flex rounded-full border border-border bg-muted/40 p-0.5 sm:p-1">
          <button
            onClick={() => setSide("profit")}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
              side === "profit" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
            Profit
          </button>
          <button
            onClick={() => setSide("loss")}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all ${
              side === "loss" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
            Loss
          </button>
        </div>
      </div>

      {/* Card preview */}
      <div className="flex items-start justify-center gap-6 w-full">
        {/* Main card */}
        <div className="flex-shrink-0 w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={mainSrc}
            src={mainSrc}
            alt={`${meta.label} preview`}
            width={540}
            height={540}
            className="w-full rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-300"
            draggable={false}
          />
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</p>
            <p className={`mt-0.5 text-lg font-bold ${side === "profit" ? "text-emerald-600" : "text-red-600"}`}>
              {side === "profit" ? meta.pnl : meta.pnlLoss}
            </p>
            <p className="text-xs text-muted-foreground">{meta.date}</p>
          </div>
        </div>

        {/* Side thumbnails */}
        <div className="hidden sm:flex flex-col gap-4 flex-shrink-0 pt-2">
          {otherTypes.map((t) => {
            const src = getPromoSrc(t, theme, side);
            const m = CARD_META[t];
            return (
              <button
                key={t}
                onClick={() => setCardType(t)}
                className="group relative w-48 rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={m.label}
                  width={200}
                  height={200}
                  className="w-full rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────

export default function LandingPage() {
  const scrolled = useScrolled();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const debriefFeature = useInView();
  const cardsFeature = useInView();
  const pricing = useInView();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="min-h-screen bg-page overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <div className="logo-capsule px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm">
              <PnLCardLogo size={16} />
            </div>
          </Link>

          <div className="flex items-center">
            {/* Page links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-5">
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
            </div>

            <div className="hidden md:block w-px h-5 bg-border mx-5" />

            {/* Auth actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-gradient-flow group relative inline-flex items-center justify-center rounded-lg sm:rounded-xl px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform"
              >
                <span className="relative z-[1]">Start for Free</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Text — centered above the dashboard preview */}
          <div className="animate-fade-in-up text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              The trading journal that takes{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                60 seconds
              </span>{" "}
              a day
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Log your P&amp;L. Score your discipline. Get weekly and monthly
              insights that actually make you better. No spreadsheets, no complexity.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="btn-gradient-flow group relative inline-flex items-center justify-center rounded-xl px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform"
              >
                <span className="relative z-[1]">Start for Free</span>
              </Link>
              <a
                href="#how-it-works"
                className="group/link inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-transparent px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
              >
                See how it works
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-14 sm:mt-16 flex justify-center animate-fade-in-up-delay-2">
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* ── Ticker Strips ──────────────────────────────────── */}
      <section className="relative py-8 overflow-hidden">
        <div className="-rotate-2 -mx-6 space-y-3">
          {/* Row 1 — scrolls left */}
          <div className="overflow-hidden">
            <div className="ticker-landing-1 flex flex-row flex-nowrap w-max gap-3 hover:[animation-play-state:paused]">
              {[...TICKER_1, ...TICKER_1].map((c, i) => (
                <TickerChip key={`t1-${i}`} date={c.date} pnl={c.pnl} />
              ))}
            </div>
          </div>
          {/* Row 2 — scrolls right */}
          <div className="overflow-hidden">
            <div className="ticker-landing-2 flex flex-row flex-nowrap w-max gap-3 hover:[animation-play-state:paused]">
              {[...TICKER_2, ...TICKER_2].map((c, i) => (
                <TickerChip key={`t2-${i}`} date={c.date} pnl={c.pnl} />
              ))}
            </div>
          </div>
          {/* Row 3 — scrolls left */}
          <div className="overflow-hidden">
            <div className="ticker-landing-3 flex flex-row flex-nowrap w-max gap-3 hover:[animation-play-state:paused]">
              {[...TICKER_3, ...TICKER_3].map((c, i) => (
                <TickerChip key={`t3-${i}`} date={c.date} pnl={c.pnl} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ──────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 pt-20 sm:pt-24 pb-6 min-h-[832px]">
        <DemoSection />
      </section>

      {/* ── Scrolling Feature Strip ──────────────────────────── */}
      <section className="relative mt-6 py-5 overflow-hidden border-y border-border/40" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 w-20 sm:w-28 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, hsl(var(--page-bg)) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-20 sm:w-28 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, hsl(var(--page-bg)) 0%, transparent 100%)",
          }}
        />
        <div className="overflow-hidden w-full">
          <div className="animate-stock-ticker flex items-center flex-nowrap w-max">
            {[...FEATURE_HIGHLIGHTS, ...FEATURE_HIGHLIGHTS].map((text, i) => (
              <div key={`feat-${i}`} className="flex shrink-0 items-center gap-4 px-6">
                <span className="text-sm font-medium text-foreground/70">{text}</span>
                <span className="text-emerald-400 select-none">&#x2022;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Weekly & Monthly Review Feature ────────────────── */}
      <section
        id="features"
        ref={debriefFeature.ref}
        className="scroll-mt-24 py-16 sm:py-32 bg-white"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div
            className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${
              debriefFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Weekly &amp; monthly reviews &mdash; the{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                payoff
              </span>{" "}
              for journaling
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get a private report with P&amp;L trends, discipline analytics, and mistake tracking &mdash; every week and every month.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              debriefFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <ReviewShowcase visible={debriefFeature.visible} />
          </div>
        </div>
      </section>

      {/* ── Share Your Wins (Cards — interactive) ─────────── */}
      <section
        ref={cardsFeature.ref}
        className="scroll-mt-24 py-16 sm:py-32"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div
            className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${
              cardsFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              When you&apos;re ready to share,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                we&apos;ve got you.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Generate beautiful P&amp;L cards for X and Instagram &mdash; daily, weekly, or monthly.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              cardsFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <CardShowcase />
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section
        id="pricing"
        ref={pricing.ref}
        className="scroll-mt-24 py-16 sm:py-32"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div
            className={`text-center mb-8 sm:mb-10 transition-all duration-700 ${
              pricing.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Simple pricing.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                No surprises.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you&apos;re ready to level up.
            </p>
          </div>

          {/* Billing cycle toggle */}
          <div
            className={`flex justify-center mb-12 transition-all duration-700 delay-100 ${
              pricing.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              {(["monthly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 capitalize ${
                    billingCycle === cycle
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cycle}
                  {cycle === "yearly" && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Save 33%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div
              className={`rounded-2xl border border-border bg-white p-5 sm:p-8 transition-all duration-700 hover:shadow-lg ${
                pricing.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: pricing.visible ? "150ms" : "0ms",
              }}
            >
              <h3 className="text-xl font-bold text-foreground">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build the journaling habit
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  ₹0
                </span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Daily trade logging",
                  "Calendar heatmap",
                  "Discipline & mistake tracking",
                  "Basic stats (P&L, win rate)",
                  "Daily recap cards",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-gradient-flow group relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 transition-transform"
              >
                <span className="relative z-[1]">Get Started</span>
              </Link>
            </div>

            {/* Premium tier */}
            <div
              className={`relative rounded-2xl border-2 border-emerald-200 bg-white p-5 sm:p-8 shadow-xl transition-all duration-700 hover:shadow-2xl ${
                pricing.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: pricing.visible ? "300ms" : "0ms",
              }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1 text-xs font-bold text-white tracking-wide">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-foreground">Premium</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For traders who want to improve
              </p>
              <div className="mt-6 mb-8">
                {billingCycle === "monthly" ? (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      ₹249
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      ₹1,999
                    </span>
                    <span className="text-muted-foreground">/year</span>
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      ₹167/mo &mdash; save ₹989 vs monthly
                    </p>
                  </>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Weekly & Monthly Reviews",
                  "Discipline analytics & trends",
                  "All card types (no watermark)",
                  "Export CSV",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-gradient-flow group relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 transition-transform"
              >
                <span className="relative z-[1]">Upgrade to Premium</span>
              </Link>
              {billingCycle === "monthly" && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  or{" "}
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className="text-emerald-600 font-medium hover:underline"
                  >
                    ₹1,999/year (save 33%)
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="relative py-16 sm:py-32 bg-page overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Start your trading journal{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              today.
            </span>
          </h2>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="btn-gradient-flow group relative inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 transition-transform"
            >
              <span className="relative z-[1]">Start for Free</span>
            </Link>
          </div>
        </div>

        {/* Ticker strips — same style as the top section */}
        <div className="-rotate-1 -mx-6 space-y-3">
          <div className="overflow-hidden">
            <div className="ticker-landing-2 flex flex-row flex-nowrap w-max gap-3 hover:[animation-play-state:paused]">
              {[...TICKER_2, ...TICKER_2].map((c, i) => (
                <TickerChip key={`cta-t1-${i}`} date={c.date} pnl={c.pnl} />
              ))}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="ticker-landing-1 flex flex-row flex-nowrap w-max gap-3 hover:[animation-play-state:paused]">
              {[...TICKER_3, ...TICKER_3].map((c, i) => (
                <TickerChip key={`cta-t2-${i}`} date={c.date} pnl={c.pnl} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-page py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <a
                href="#top"
                className="logo-capsule px-2.5 py-1 text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <PnLCardLogo size={14} />
              </a>
              <span className="text-sm text-muted-foreground">
                Your Trading Journal
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="https://x.com/nextalphabet_"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                𝕏
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground/60">
            <a
              href="https://www.nextalphabet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/70 transition-colors"
            >
              A Next Alphabet Product
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
