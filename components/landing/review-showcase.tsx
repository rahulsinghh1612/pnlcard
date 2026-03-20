"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  getDemoTrades,
  getDemoTradesDec,
  getDemoTradesFeb,
} from "@/lib/demo-trades";
import {
  useCurrencyCtx,
  formatPnlCurrency,
  formatPnlShortCurrency,
} from "@/lib/currency";

/* ─── Derive all data from demo-trades.ts ─────────────────────
   This ensures the review showcase numbers always match the
   dashboard calendar and weekly breakdown on the landing page.
   ────────────────────────────────────────────────────────────── */

type DemoTrade = { trade_date: string; net_pnl: number; charges: number; num_trades: number };

function finalResult(t: DemoTrade) {
  return t.net_pnl - t.charges;
}

function getDayName(dateStr: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(dateStr + "T00:00:00").getDay()
  ];
}

// Calendar-grid week builder — same logic as DemoWeeklyBreakdown
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

type CalendarWeek = {
  label: string;
  pnl: number;
  wins: number;
  losses: number;
  days: { day: string; pnl: number; date: string }[];
};

function buildCalendarWeeks(
  trades: DemoTrade[],
  year: number,
  month: number,
  monthShort: string
): CalendarWeek[] {
  const grid = buildGridForMonth(year, month);
  const tradeMap = new Map(trades.map((t) => [t.trade_date, t]));
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  return grid
    .map((week) => {
      let total = 0;
      let wins = 0;
      let losses = 0;
      let minDay: number | null = null;
      let maxDay: number | null = null;
      const days: CalendarWeek["days"] = [];

      week.forEach((day) => {
        if (day === null) return;
        if (minDay === null || day < minDay) minDay = day;
        if (maxDay === null || day > maxDay) maxDay = day;

        const ds = `${prefix}-${String(day).padStart(2, "0")}`;
        const trade = tradeMap.get(ds);
        if (trade) {
          const r = finalResult(trade);
          total += r;
          if (r >= 0) wins++;
          else losses++;
          days.push({ day: getDayName(ds), pnl: r, date: ds });
        }
      });

      return {
        label:
          minDay !== null && maxDay !== null
            ? `${minDay} – ${maxDay} ${monthShort}`
            : "",
        pnl: total,
        wins,
        losses,
        days,
      };
    })
    .filter((w) => w.wins + w.losses > 0);
}

// ── Build weekly data from trades ──

function buildWeeklyReviewData(trades: DemoTrade[]) {
  const weeks = buildCalendarWeeks(trades, 2026, 0, "Jan");

  const fullWeeks = weeks.filter((w) => w.days.length >= 4);
  const reviewWeek = fullWeeks[fullWeeks.length - 1] || weeks[weeks.length - 1];

  const totalPnl = reviewWeek.pnl;
  const winRate = Math.round(
    (reviewWeek.wins / (reviewWeek.wins + reviewWeek.losses)) * 100
  );
  const avgDaily = Math.round(totalPnl / reviewWeek.days.length);

  const weeklyTrend = weeks.map((w) => ({
    label: w.label,
    pnl: w.pnl,
    isCurrent: w === reviewWeek,
  }));

  return {
    label: `Weekly Review · ${reviewWeek.label}`,
    totalPnl,
    winRate,
    avgDaily,
    days: reviewWeek.days,
    weeklyTrend,
    tradingDays: reviewWeek.days.length,
  };
}

// ── Build monthly data from trades ──

function buildMonthlyReviewData(trades: DemoTrade[], decTrades: DemoTrade[], febTrades: DemoTrade[]) {
  const allResults = trades.map((t) => ({ ...t, final: finalResult(t) }));
  const totalPnl = allResults.reduce((s, t) => s + t.final, 0);
  const wins = allResults.filter((t) => t.final > 0).length;
  const winRate = Math.round((wins / allResults.length) * 100);
  const avgDaily = Math.round(totalPnl / allResults.length);

  const weeks = buildCalendarWeeks(trades, 2026, 0, "Jan");

  const decTotal = decTrades.reduce((s, t) => s + finalResult(t), 0);
  const febTotal = febTrades.reduce((s, t) => s + finalResult(t), 0);

  const monthlyTrend = [
    { label: "Dec 2025", pnl: decTotal, isCurrent: false },
    { label: "Jan 2026", pnl: totalPnl, isCurrent: true },
    { label: "Feb 2026", pnl: febTotal, isCurrent: false },
  ];

  return {
    label: "Monthly Review · January 2026",
    totalPnl,
    winRate,
    avgDaily,
    weeks: weeks.map((w) => ({ label: w.label, pnl: w.pnl })),
    monthlyTrend,
    tradingDays: allResults.length,
  };
}

// ── Discipline demo data (realistic, consistent with trades) ──
// We assign discipline scores that correlate with P&L direction

function buildDisciplineData(
  items: { pnl: number }[],
  granularity: "day" | "week"
) {
  const scored = items.map((item) => {
    let score: number;
    if (granularity === "day") {
      if (item.pnl > 7000) score = 5;
      else if (item.pnl > 4000) score = 4;
      else if (item.pnl > 0) score = 3;
      else if (item.pnl > -3000) score = 2;
      else score = 1;
    } else {
      if (item.pnl > 5000) score = 5;
      else if (item.pnl > 2000) score = 4;
      else if (item.pnl > 0) score = 3;
      else if (item.pnl > -2000) score = 2;
      else score = 1;
    }
    return { ...item, score };
  });

  const avgScore = +(scored.reduce((s, d) => s + d.score, 0) / scored.length).toFixed(1);

  const bucketDefs = [
    { label: "High", range: "4–5", min: 4, max: 5, color: "#34d399", dotClass: "bg-emerald-400", textClass: "text-emerald-600" },
    { label: "Medium", range: "3", min: 3, max: 3, color: "#eab308", dotClass: "bg-yellow-500", textClass: "text-yellow-600" },
    { label: "Low", range: "1–2", min: 1, max: 2, color: "#f87171", dotClass: "bg-red-400", textClass: "text-red-600" },
  ];

  const buckets = bucketDefs.map((def) => {
    const matching = scored.filter((d) => d.score >= def.min && d.score <= def.max);
    const totalPnl = matching.reduce((s, d) => s + d.pnl, 0);
    return {
      ...def,
      count: matching.length,
      avgPnl: matching.length > 0 ? Math.round(totalPnl / matching.length) : 0,
    };
  });

  return { avgScore, buckets };
}

// ── Mistake demo data ──

function buildMistakeData(
  items: { pnl: number }[],
  tradingDays: number
) {
  const lossDays = items.filter((d) => d.pnl < 0);
  const fomoCount = lossDays.filter((d) => d.pnl < -2000).length || (lossDays.length > 0 ? 1 : 0);
  const overtradedCount = Math.max(0, lossDays.length - fomoCount);
  const slCount = lossDays.filter((d) => d.pnl < -3000).length;

  const mistakes = [
    ...(fomoCount > 0 ? [{ label: "FOMO Entry", count: fomoCount }] : []),
    ...(overtradedCount > 0 ? [{ label: "Overtraded", count: overtradedCount }] : []),
    ...(slCount > 0 ? [{ label: "Didn't Respect SL", count: slCount }] : []),
  ];

  return { mistakes, mistakeDays: lossDays.length, tradingDays };
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/* ─── Catmull-Rom spline ─────────────────────────────────────── */

function catmullRomPath(pts: { x: number; y: number; pnl: number }[]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  const tension = 0.35;
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (p1.pnl === 0 && p2.pnl === 0) { d += ` L ${p2.x} ${p2.y}`; continue; }
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

/* ─── Mini Trend Chart ───────────────────────────────────────── */

function MiniTrendChart({
  data,
  show,
  uid,
  isINR,
}: {
  data: { label: string; pnl: number; isCurrent?: boolean }[];
  show: boolean;
  uid: string;
  isINR: boolean;
}) {
  const W = 400;
  const H = 100;
  const padY = 18;
  const count = data.length;

  const xPos = (i: number) => ((i + 0.5) / count) * W;
  const maxPnl = Math.max(...data.map((d) => d.pnl), 0);
  const minPnl = Math.min(...data.map((d) => d.pnl), 0);
  const range = Math.max(maxPnl - minPnl, 1);
  const pnlToY = (pnl: number) => padY + ((maxPnl - pnl) / range) * (H - padY * 2);
  const zeroY = pnlToY(0);

  const points = data.map((d, i) => ({
    x: xPos(i),
    y: pnlToY(d.pnl),
    pnl: d.pnl,
    isCurrent: d.isCurrent ?? false,
  }));

  const curveD = catmullRomPath(points);
  const areaD = curveD + ` L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;

  const lineLength = points.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);

  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(6px)",
        transitionDelay: show ? "400ms" : "0ms",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
        <defs>
          <linearGradient id={`${uid}-grad-green`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`${uid}-grad-red`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id={`${uid}-clip-above`}>
            <rect x="0" y="0" width={W} height={zeroY} />
          </clipPath>
          <clipPath id={`${uid}-clip-below`}>
            <rect x="0" y={zeroY} width={W} height={H - zeroY} />
          </clipPath>
        </defs>

        <line x1={points[0].x} y1={zeroY} x2={points[points.length - 1].x} y2={zeroY} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />

        {show && data.some((d) => d.pnl > 0) && (
          <path d={areaD} fill={`url(#${uid}-grad-green)`} clipPath={`url(#${uid}-clip-above)`} className="animate-pnl-area" />
        )}
        {show && data.some((d) => d.pnl < 0) && (
          <path d={areaD} fill={`url(#${uid}-grad-red)`} clipPath={`url(#${uid}-clip-below)`} className="animate-pnl-area" />
        )}

        {show && (
          <path
            d={curveD}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={lineLength * 1.5}
            strokeDashoffset={lineLength * 1.5}
            className="animate-pnl-draw"
            style={{ "--line-length": lineLength * 1.5 } as React.CSSProperties}
            opacity="0.45"
          />
        )}

        {show &&
          points.map((p, i) => {
            const color = p.pnl > 0 ? "#34d399" : p.pnl < 0 ? "#f87171" : "hsl(var(--muted-foreground))";
            const dotR = p.pnl === 0 ? 2.5 : 4;
            return (
              <g key={i}>
                {p.isCurrent && p.pnl !== 0 && (
                  <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={color} strokeWidth="1.5" className="animate-pnl-pulse" />
                )}
                {p.pnl !== 0 && (
                  <circle cx={p.x} cy={p.y} r={dotR + 2.5} fill={color} opacity="0.12" className="animate-pnl-dot" style={{ animationDelay: `${0.2 + i * 0.12}s` }} />
                )}
                <circle cx={p.x} cy={p.y} r={dotR} fill={p.pnl === 0 ? "hsl(var(--border))" : color} stroke="white" strokeWidth={p.pnl === 0 ? 0 : 1.5} className="animate-pnl-dot" style={{ animationDelay: `${0.2 + i * 0.12}s` }} />
              </g>
            );
          })}
      </svg>

      <div className="flex mt-1.5">
        {data.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-[8px] tabular-nums text-muted-foreground leading-tight">{point.label}</p>
            <p className={`text-[8px] tabular-nums font-medium ${point.pnl === 0 ? "text-muted-foreground/40" : point.pnl > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {point.pnl === 0 ? "\u2014" : formatPnlShortCurrency(point.pnl, isINR)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mini Discipline Donut ──────────────────────────────────── */

type BucketInfo = {
  label: string;
  range: string;
  color: string;
  dotClass: string;
  textClass: string;
  count: number;
  avgPnl: number;
};

function MiniDonut({
  buckets,
  avgScore,
  show,
  isINR,
}: {
  buckets: BucketInfo[];
  avgScore: number;
  show: boolean;
  isINR: boolean;
}) {
  const R = 36;
  const CX = 44;
  const CY = 44;
  const STROKE = 8;
  const circumference = 2 * Math.PI * R;
  const totalDays = buckets.reduce((s, b) => s + b.count, 0);
  const activeBuckets = buckets.filter((b) => b.count > 0);
  const GAP = activeBuckets.length > 1 ? 4 : 0;
  const totalGap = GAP * activeBuckets.length;
  const usable = circumference - totalGap;

  let offset = -circumference / 4;
  const arcs = activeBuckets.map((bucket) => {
    const frac = totalDays > 0 ? bucket.count / totalDays : 0;
    const arcLen = frac * usable;
    const arc = { ...bucket, dasharray: `${arcLen} ${circumference - arcLen}`, dashoffset: -offset, arcLen };
    offset += arcLen + GAP;
    return arc;
  });

  const scoreColor = avgScore >= 4 ? "text-emerald-600" : avgScore >= 3 ? "text-foreground" : "text-red-600";

  return (
    <div
      className="flex items-center gap-4 transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(6px)",
        transitionDelay: show ? "600ms" : "0ms",
      }}
    >
      <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
        <svg viewBox="0 0 88 88" className="w-full h-full">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {show &&
            arcs.map((arc, i) => (
              <circle
                key={arc.label}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={arc.dasharray}
                strokeDashoffset={arc.dashoffset}
                className="donut-arc"
                style={{ animationDelay: `${600 + i * 120}ms` }}
              />
            ))}
        </svg>
        {show && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold tabular-nums leading-none ${scoreColor}`}>{avgScore.toFixed(1)}</span>
            <span className="text-[8px] text-muted-foreground mt-0.5">/5</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        {buckets.map((bucket, i) => (
          <div
            key={bucket.label}
            className="flex items-center gap-2 transition-all duration-400"
            style={{
              opacity: show ? (bucket.count === 0 ? 0.3 : 1) : 0,
              transform: show ? "translateX(0)" : "translateX(-6px)",
              transitionDelay: show ? `${700 + i * 80}ms` : "0ms",
            }}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${bucket.dotClass}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] font-medium text-foreground">{bucket.label}</span>
                <span className="text-[8px] text-muted-foreground">({bucket.range})</span>
              </div>
              <p className="text-[9px] text-muted-foreground">
                {bucket.count > 0 ? `${bucket.count} day${bucket.count !== 1 ? "s" : ""}` : "No data"}
              </p>
            </div>
            {bucket.count > 0 && (
              <span className={`text-[10px] font-semibold tabular-nums shrink-0 ${bucket.avgPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatPnlShortCurrency(bucket.avgPnl, isINR)} avg
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mini Mistake Bars ──────────────────────────────────────── */

function MiniMistakes({
  data,
  tradingDays,
  mistakeDays,
  show,
}: {
  data: { label: string; count: number }[];
  tradingDays: number;
  mistakeDays: number;
  show: boolean;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-4 gap-1.5 transition-all duration-500"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(6px)",
          transitionDelay: show ? "800ms" : "0ms",
        }}
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M6 10l3 3 5-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xs font-medium text-emerald-700">No mistakes logged</p>
      </div>
    );
  }

  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(6px)",
        transitionDelay: show ? "800ms" : "0ms",
      }}
    >
      <div className="space-y-2.5">
        {data.map((item, i) => {
          const barPct = Math.max(8, (item.count / maxCount) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
                <span className="text-[10px] font-semibold tabular-nums text-red-600">
                  {item.count} day{item.count !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-red-50">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
                  style={{
                    width: show ? `${barPct}%` : "0%",
                    transitionDelay: show ? `${900 + i * 80}ms` : "0ms",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-muted-foreground text-center pt-2 mt-2.5 border-t border-border/50">
        Mistakes on {mistakeDays} of {tradingDays} trading days
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ReviewShowcase — Main exported component
   ═══════════════════════════════════════════════════════════════ */

export function ReviewShowcase({ visible }: { visible: boolean }) {
  const { isINR } = useCurrencyCtx();
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const [show, setShow] = useState(false);
  const prevTab = useRef(tab);

  const computed = useMemo(() => {
    const trades = getDemoTrades(isINR);
    const decTrades = getDemoTradesDec(isINR);
    const febTrades = getDemoTradesFeb(isINR);

    const weekly = buildWeeklyReviewData(trades);
    const monthly = buildMonthlyReviewData(trades, decTrades, febTrades);

    const weeklyDiscipline = buildDisciplineData(
      weekly.days.map((d) => ({ pnl: d.pnl })),
      "day"
    );
    const monthlyDiscipline = buildDisciplineData(
      trades.map((t) => ({ pnl: finalResult(t) })),
      "day"
    );

    const weeklyMistakes = {
      mistakes: [
        { label: "FOMO Entry", count: 1 },
        { label: "Overtraded", count: 1 },
      ],
      mistakeDays: 1,
      tradingDays: weekly.tradingDays,
    };
    const monthlyMistakes = buildMistakeData(
      trades.map((t) => ({ pnl: finalResult(t) })),
      monthly.tradingDays
    );

    return { weekly, monthly, weeklyDiscipline, monthlyDiscipline, weeklyMistakes, monthlyMistakes };
  }, [isINR]);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    const id = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(id);
  }, [visible]);

  useEffect(() => {
    if (tab !== prevTab.current) {
      setShow(false);
      prevTab.current = tab;
      const id = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(id);
    }
  }, [tab]);

  const isWeekly = tab === "weekly";

  const totalPnl = isWeekly ? computed.weekly.totalPnl : computed.monthly.totalPnl;
  const winRate = isWeekly ? computed.weekly.winRate : computed.monthly.winRate;
  const avgDaily = isWeekly ? computed.weekly.avgDaily : computed.monthly.avgDaily;
  const isProfit = totalPnl >= 0;

  const barItems: { label: string; pnl: number }[] = isWeekly
    ? computed.weekly.days.map((d) => ({ label: d.day, pnl: d.pnl }))
    : computed.monthly.weeks;

  const maxAbsPnl = Math.max(...barItems.map((b) => Math.abs(b.pnl)), 1);

  const trendData = isWeekly ? computed.weekly.weeklyTrend : computed.monthly.monthlyTrend;
  const discipline = isWeekly ? computed.weeklyDiscipline : computed.monthlyDiscipline;
  const mistakeData = isWeekly ? computed.weeklyMistakes : computed.monthlyMistakes;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tab toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5">
          {(["weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Card stack */}
      <div className="space-y-3">
        {/* CARD 1 — Hero P&L */}
        <div className="rounded-2xl border border-border bg-white px-5 py-5 sm:px-6 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground">
            {isWeekly ? computed.weekly.label : computed.monthly.label}
          </p>
          <p
            className={`mt-1 text-2xl sm:text-3xl font-bold tracking-tight transition-all duration-500 ${
              isProfit ? "text-emerald-600" : "text-red-600"
            }`}
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(4px)",
              transitionDelay: show ? "50ms" : "0ms",
            }}
          >
            {formatPnlCurrency(totalPnl, isINR)}
          </p>

          <div
            className="mt-4 grid grid-cols-2 gap-2.5 transition-all duration-500"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(4px)",
              transitionDelay: show ? "120ms" : "0ms",
            }}
          >
            <div className="rounded-lg border border-border bg-slate-50/60 px-3 py-2.5">
              <p className="text-[9px] font-medium text-muted-foreground">Win Rate</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{winRate}%</p>
            </div>
            <div className="rounded-lg border border-border bg-slate-50/60 px-3 py-2.5">
              <p className="text-[9px] font-medium text-muted-foreground">Avg / Day</p>
              <p className={`mt-1 text-sm font-semibold tabular-nums ${avgDaily >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatPnlCurrency(avgDaily, isINR)}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2 — Day by Day / Week by Week */}
        <div className="rounded-2xl border border-border bg-white px-5 py-4 sm:px-6 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground mb-3">
            {isWeekly ? "Day by Day" : "Week by Week"}
          </p>
          <div
            className="space-y-0.5 transition-all duration-500"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(4px)",
              transitionDelay: show ? "200ms" : "0ms",
            }}
          >
            {barItems.map((item, i) => {
              const barPct = Math.max(4, (Math.abs(item.pnl) / maxAbsPnl) * 50);
              return (
                <div key={i} className="flex items-center gap-0 h-6">
                  <span className="w-[4.5rem] text-left text-[9px] font-semibold shrink-0 pr-2 text-foreground truncate">
                    {item.label}
                  </span>

                  <div className="flex-1 flex justify-end items-center">
                    {item.pnl < 0 && (
                      <>
                        <span className="text-[8px] font-semibold tabular-nums text-red-600 mr-1 shrink-0">
                          {formatPnlShortCurrency(item.pnl, isINR)}
                        </span>
                        <div
                          className="h-[14px] rounded-l-sm bg-red-400/70 transition-all duration-700"
                          style={{
                            width: show ? `${barPct}%` : "0%",
                            transitionDelay: show ? `${250 + i * 50}ms` : "0ms",
                          }}
                        />
                      </>
                    )}
                  </div>

                  <div className="w-px h-4 bg-border shrink-0" />

                  <div className="flex-1 flex justify-start items-center">
                    {item.pnl >= 0 && (
                      <>
                        <div
                          className="h-[14px] rounded-r-sm bg-emerald-400/70 transition-all duration-700"
                          style={{
                            width: show ? `${barPct}%` : "0%",
                            transitionDelay: show ? `${250 + i * 50}ms` : "0ms",
                          }}
                        />
                        <span className="text-[8px] font-semibold tabular-nums text-emerald-600 ml-1 shrink-0">
                          {formatPnlShortCurrency(item.pnl, isINR)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3 — P&L Trend */}
        <div className="rounded-2xl border border-border bg-white px-5 py-4 sm:px-6 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground mb-3">
            {isWeekly ? "Weekly P&L Trend" : "Monthly P&L Trend"}
          </p>
          <MiniTrendChart data={trendData} show={show} uid={`landing-${tab}`} isINR={isINR} />
        </div>

        {/* CARD 4 — Discipline Donut */}
        <div className="rounded-2xl border border-border bg-white px-5 py-4 sm:px-6 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground mb-3">Discipline</p>
          <MiniDonut buckets={discipline.buckets} avgScore={discipline.avgScore} show={show} isINR={isINR} />
        </div>

        {/* CARD 5 — Mistakes */}
        <div className="rounded-2xl border border-border bg-white px-5 py-4 sm:px-6 shadow-lg">
          <p className="text-[10px] font-medium text-muted-foreground mb-3">Mistakes</p>
          <MiniMistakes
            data={mistakeData.mistakes}
            tradingDays={mistakeData.tradingDays}
            mistakeDays={mistakeData.mistakeDays}
            show={show}
          />
        </div>
      </div>
    </div>
  );
}
