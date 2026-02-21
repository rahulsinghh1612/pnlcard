"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  PenLine,
  Sparkles,
  Share2,
  Check,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

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

function buildCardUrl(
  type: "daily" | "weekly" | "monthly",
  theme: "light" | "dark"
): string {
  const p = new URLSearchParams();
  p.set("theme", theme);
  p.set("handle", "@iamrahulx0");
  p.set("currency", "INR");

  switch (type) {
    case "daily":
      p.set("date", "12th Feb, 2026");
      p.set("pnl", "+21,500");
      p.set("charges", "206");
      p.set("netPnl", "+21,294");
      p.set("netRoi", "+0.4%");
      p.set("trades", "3");
      p.set("streak", "0");
      break;
    case "weekly":
      p.set("range", "10 \u2013 16 Feb, 2026");
      p.set("pnl", "+37,594");
      p.set("roi", "+3.8%");
      p.set("winRate", "60%");
      p.set("wl", "3W \u00B7 2L");
      p.set("bestDay", "Thu +21,294");
      p.set("totalTrades", "14");
      break;
    case "monthly":
      p.set("month", "February 2026");
      p.set("pnl", "+1,87,420");
      p.set("roi", "+18.7%");
      p.set("winRate", "73.7%");
      p.set("wl", "14W \u00B7 5L");
      p.set("best", "16th +24,800");
      p.set("worst", "4th \u22128,200");
      break;
  }

  return `/api/og/${type}?${p.toString()}`;
}

// ─── Hero card data ──────────────────────────────────────────────

type HeroCardData = {
  type: "daily" | "weekly" | "monthly";
  variant: "profit" | "loss";
  label: string;
  date?: string;
  range?: string;
  month?: string;
  trades?: string;
  totalTrades?: string;
  pnl?: string;
  charges?: string;
  netPnl?: string;
  netRoi?: string;
  roi?: string;
  winRate?: string;
  wl?: string;
  days?: { day: string; pnl: number; win: boolean }[];
  calendarData?: Record<number, number>;
};

const HERO_CARDS: HeroCardData[] = [
  {
    type: "daily",
    variant: "profit",
    label: "Daily Profit",
    date: "12th Feb, 2026",
    trades: "3",
    pnl: "+21,500",
    charges: "206",
    netPnl: "+21,294",
    netRoi: "+0.4%",
  },
  {
    type: "weekly",
    variant: "profit",
    label: "Weekly Profit",
    range: "10 \u2013 16 Feb, 2026",
    totalTrades: "14",
    netPnl: "+37,594",
    roi: "+3.8%",
    winRate: "60%",
    wl: "3W \u00B7 2L",
    days: [
      { day: "M", pnl: 12400, win: true },
      { day: "T", pnl: -3200, win: false },
      { day: "W", pnl: 8900, win: true },
      { day: "T", pnl: 21294, win: true },
      { day: "F", pnl: -1800, win: false },
    ],
  },
  {
    type: "monthly",
    variant: "profit",
    label: "Monthly Profit",
    month: "February 2026",
    netPnl: "+1,87,420",
    roi: "+18.7%",
    winRate: "73.7%",
    wl: "14W \u00B7 5L",
    calendarData: {
      2: 8400, 3: 12600, 4: -3200, 5: 5800, 6: 15200,
      9: 24800, 10: -8200, 11: 6400, 12: 18900, 13: -4100,
      16: 21300, 17: 9800, 18: 14200, 19: -6700, 20: 11500,
      23: 7200, 24: 16800, 25: -5400, 26: 13100, 27: 10600,
    },
  },
  {
    type: "daily",
    variant: "loss",
    label: "Daily Loss",
    date: "12th Feb, 2026",
    trades: "4",
    pnl: "-5,400",
    charges: "98",
    netPnl: "-5,498",
    netRoi: "-0.7%",
  },
  {
    type: "weekly",
    variant: "loss",
    label: "Weekly Loss",
    range: "10 \u2013 16 Feb, 2026",
    totalTrades: "14",
    netPnl: "-18,200",
    roi: "-1.8%",
    winRate: "40%",
    wl: "2W \u00B7 3L",
    days: [
      { day: "M", pnl: -8400, win: false },
      { day: "T", pnl: 6200, win: true },
      { day: "W", pnl: -12800, win: false },
      { day: "T", pnl: 8200, win: true },
      { day: "F", pnl: -11400, win: false },
    ],
  },
  {
    type: "monthly",
    variant: "loss",
    label: "Monthly Loss",
    month: "February 2026",
    netPnl: "-42,500",
    roi: "-4.2%",
    winRate: "45%",
    wl: "9W \u00B7 11L",
    calendarData: {
      2: -3400, 3: 5600, 4: -12800, 5: -2800, 6: 8200,
      9: -6400, 10: 3200, 11: -9800, 12: 15200, 13: -4100,
      16: -7300, 17: 2800, 18: -5400, 19: 6700, 20: -11500,
      23: -3200, 24: 4800, 25: -8400, 26: -2100, 27: 3600,
    },
  },
];

const FEB_2026_GRID: (number | null)[] = [
  null, null, null, null, null, null, 1,
  2, 3, 4, 5, 6, 7, 8,
  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, null,
];

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

// ─── Carousel helper ─────────────────────────────────────────────

function getCarouselOffset(index: number, active: number, total: number): number {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
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

// ─── Inline hero card component ──────────────────────────────────

function HeroCardInline({ card }: { card: HeroCardData }) {
  const isProfit = card.variant === "profit";
  const bg = isProfit
    ? "linear-gradient(155deg, #fafcfb 0%, #e8faf0 35%, #c8f4d4 60%, #a7e9b8 100%)"
    : "linear-gradient(155deg, #fafcfb 0%, #fef2f2 35%, #fde2e4 65%, #fafcfb 100%)";
  const accent = isProfit ? "#16a34a" : "#dc2626";
  const pillBg = isProfit ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)";
  const pillBorder = isProfit ? "rgba(22,163,74,0.14)" : "rgba(220,38,38,0.14)";
  const pillText = isProfit ? "#15803d" : "#b91c1c";
  const lbl = "rgba(0,0,0,0.4)";
  const muted = "#52525b";
  const dateTxt = "#3f3f46";
  const dividerClr = "rgba(0,0,0,0.06)";

  if (card.type === "daily") {
    return (
      <div
        className="w-full h-full rounded-2xl shadow-xl ring-1 ring-black/[0.06] flex flex-col select-none overflow-hidden"
        style={{ background: bg }}
      >
        <div className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium" style={{ color: dateTxt }}>
              {card.date}
            </span>
            <span
              className="text-[9px] sm:text-[10px] font-medium rounded-md px-1.5 sm:px-2 py-0.5"
              style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: pillText }}
            >
              {card.trades} Trades
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            <span className="text-[11px] sm:text-xs font-bold" style={{ color: accent }}>
              {card.pnl}
            </span>
            <span
              className="text-[9px] sm:text-[10px] font-medium rounded-md px-1.5 sm:px-2 py-0.5"
              style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: pillText }}
            >
              Charges &amp; taxes: {card.charges}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center py-1">
            <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
              NET P/L
            </p>
            <p
              className="text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-none mt-1"
              style={{ color: accent }}
            >
              {card.netPnl}
            </p>
            <div className="h-px my-2.5 sm:my-3" style={{ background: dividerClr }} />
            <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
              NET ROI
            </p>
            <p
              className="text-[18px] sm:text-[22px] font-extrabold tracking-tight leading-none mt-1"
              style={{ color: accent }}
            >
              {card.netRoi}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: muted }}>
              @iamrahulx0
            </span>
            <span className="text-[9px] sm:text-[10px]" style={{ color: muted }}>
              Daily Recap
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (card.type === "weekly") {
    const days = card.days || [];
    const maxPnl = Math.max(...days.map((d) => Math.abs(d.pnl)), 1);
    return (
      <div
        className="w-full h-full rounded-2xl shadow-xl ring-1 ring-black/[0.06] flex flex-col select-none overflow-hidden"
        style={{ background: bg }}
      >
        <div className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: dateTxt }}>
              {card.range}
            </span>
            <span
              className="text-[9px] sm:text-[10px] font-medium rounded-md px-1.5 sm:px-2 py-0.5"
              style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: pillText }}
            >
              {card.totalTrades} Trades
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center py-1">
            <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
              NET P/L
            </p>
            <p
              className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-none mt-1"
              style={{ color: accent }}
            >
              {card.netPnl}
            </p>
            {card.roi && (
              <div className="mt-2.5">
                <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
                  Net ROI
                </p>
                <p
                  className="text-[16px] sm:text-[20px] font-extrabold tracking-tight leading-none mt-0.5"
                  style={{ color: accent }}
                >
                  {card.roi}
                </p>
              </div>
            )}
            <div className="flex items-end gap-1 sm:gap-1.5 mt-3 sm:mt-4 h-[44px] sm:h-[52px]">
              {days.map((d, idx) => {
                const h = Math.max((Math.sqrt(Math.abs(d.pnl)) / Math.sqrt(maxPnl)) * 100, 15);
                const barColor = d.win ? "rgba(22,163,74,0.4)" : "rgba(220,38,38,0.4)";
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm"
                      style={{ height: `${h}%`, background: barColor }}
                    />
                    <span className="text-[7px] sm:text-[8px] font-medium" style={{ color: muted }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: muted }}>
              @iamrahulx0
            </span>
            <span className="text-[9px] sm:text-[10px]" style={{ color: muted }}>
              Weekly Recap
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Monthly
  const calData = card.calendarData || {};
  const calValues = Object.values(calData).map(Math.abs);
  const maxCal = Math.max(...calValues, 1);
  const getCellColor = (day: number) => {
    const v = calData[day];
    if (v == null) return "rgba(0,0,0,0.04)";
    const intensity = Math.abs(v) / maxCal;
    const opacity = 0.15 + intensity * 0.6;
    return v > 0 ? `rgba(22,163,74,${opacity})` : `rgba(220,38,38,${opacity})`;
  };

  return (
    <div
      className="w-full h-full rounded-2xl shadow-xl ring-1 ring-black/[0.06] flex flex-col select-none overflow-hidden"
      style={{ background: bg }}
    >
      <div className="p-4 sm:p-5 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium" style={{ color: dateTxt }}>
            {card.month}
          </span>
          <span
            className="text-[9px] sm:text-[10px] font-medium rounded-md px-1.5 sm:px-2 py-0.5"
            style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: pillText }}
          >
            {card.wl}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center py-1">
          {/* Calendar heatmap */}
          <div className="flex flex-col gap-[2px] mb-2">
            <div className="flex gap-[2px]">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center"
                  style={{ height: 12 }}
                >
                  <span className="text-[6px] sm:text-[7px] font-semibold" style={{ color: muted }}>
                    {d}
                  </span>
                </div>
              ))}
            </div>
            {Array.from({ length: 5 }, (_, row) => (
              <div key={row} className="flex gap-[2px]">
                {FEB_2026_GRID.slice(row * 7, row * 7 + 7).map((day, col) => (
                  <div
                    key={col}
                    className="flex-1 rounded-[3px]"
                    style={{
                      aspectRatio: "1",
                      background: day ? getCellColor(day) : "transparent",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="h-px mb-2" style={{ background: dividerClr }} />
          <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
            NET P/L
          </p>
          <p
            className="text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-none mt-1"
            style={{ color: accent }}
          >
            {card.netPnl}
          </p>
          <div className="flex gap-5 sm:gap-6 mt-2">
            {card.roi && (
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
                  Net ROI
                </p>
                <p
                  className="text-[13px] sm:text-[15px] font-extrabold tracking-tight leading-none mt-0.5"
                  style={{ color: accent }}
                >
                  {card.roi}
                </p>
              </div>
            )}
            {card.winRate && (
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-[0.1em]" style={{ color: lbl }}>
                  Win Rate
                </p>
                <p
                  className="text-[13px] sm:text-[15px] font-extrabold tracking-tight leading-none mt-0.5"
                  style={{ color: accent }}
                >
                  {card.winRate}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: muted }}>
            @iamrahulx0
          </span>
          <span className="text-[9px] sm:text-[10px]" style={{ color: muted }}>
            Monthly Recap
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────

const HERO_ROTATE_MS = 3000;

export default function LandingPage() {
  const scrolled = useScrolled();
  const [cardType, setCardType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [cardTheme, setCardTheme] = useState<"light" | "dark">("light");
  const [galleryImgLoaded, setGalleryImgLoaded] = useState(false);
  const [galleryImgError, setGalleryImgError] = useState(false);
  const [heroCardIndex, setHeroCardIndex] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);

  const howItWorks = useInView();
  const gallery = useInView();
  const pricing = useInView();

  // Auto-rotate hero carousel
  useEffect(() => {
    if (heroHovered) return;
    const id = setInterval(() => {
      setHeroCardIndex((prev) => (prev + 1) % HERO_CARDS.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(id);
  }, [heroHovered]);

  const handleCardChange = (type: "daily" | "weekly" | "monthly") => {
    if (type === cardType) return;
    setGalleryImgLoaded(false);
    setGalleryImgError(false);
    setCardType(type);
  };

  const handleThemeToggle = () => {
    setGalleryImgLoaded(false);
    setGalleryImgError(false);
    setCardTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <main className="min-h-screen bg-page overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/">
            <div className="logo-capsule px-4 py-1.5 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo-graph.png" alt="" className="h-3.5 w-3.5 object-contain" />
              Pnl Card
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="#gallery"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cards
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <Button asChild size="sm" className="bg-logo hover:opacity-90">
              <Link href="/login">Start for Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Your trades deserve to be{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  seen.
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Log your daily P&amp;L in 60 seconds. Generate stunning,
                shareable recap cards for X and Instagram.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-logo hover:opacity-90 text-base px-8"
                >
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2"
                  >
                    Start for Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8"
                >
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free forever. No credit card required.
              </p>
            </div>

            {/* Hero card carousel — 3D coverflow */}
            <div
              className="animate-fade-in-up-delay-2 relative flex flex-col items-center lg:items-end gap-5"
              onMouseEnter={() => setHeroHovered(true)}
              onMouseLeave={() => setHeroHovered(false)}
            >
              <div className="relative" style={{ perspective: "1200px" }}>
                <div className="absolute -inset-20 rounded-3xl bg-emerald-200/20 blur-3xl pointer-events-none" />
                <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px]">
                  {HERO_CARDS.map((card, i) => {
                    const offset = getCarouselOffset(
                      i,
                      heroCardIndex,
                      HERO_CARDS.length
                    );
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;

                    const translateX = offset * 58;
                    const scale = 1 - absOffset * 0.14;
                    const rotateY = offset * -18;
                    const opacity = 1 - absOffset * 0.35;
                    const zIndex = 10 - absOffset;

                    return (
                      <div
                        key={`${card.type}-${card.variant}`}
                        className="absolute inset-0 transition-all duration-700 ease-out will-change-transform"
                        style={{
                          transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
                          opacity,
                          zIndex,
                          pointerEvents: offset === 0 ? "auto" : "none",
                        }}
                        onClick={() => offset !== 0 && setHeroCardIndex(i)}
                      >
                        <HeroCardInline card={card} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {HERO_CARDS.map((card, i) => (
                  <button
                    key={`dot-${card.type}-${card.variant}`}
                    type="button"
                    onClick={() => setHeroCardIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      heroCardIndex === i
                        ? "w-5 h-2 bg-foreground"
                        : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Show ${card.label} card`}
                  />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {HERO_CARDS[heroCardIndex].label}
                </span>
              </div>
            </div>
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

      {/* ── How It Works ───────────────────────────────────── */}
      <section
        id="how-it-works"
        ref={howItWorks.ref}
        className="scroll-mt-24 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              howItWorks.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Three steps. Sixty seconds.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From trade to shareable card in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: PenLine,
                step: "01",
                title: "Log your trade",
                desc: "Enter your daily P&L, charges, and capital deployed. One entry per day \u2014 that\u2019s it.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "Pick your card",
                desc: "Choose daily, weekly, or monthly. Toggle between light and dark themes.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Share2,
                step: "03",
                title: "Share everywhere",
                desc: "Download a 1080\u00D71080 PNG or copy a shareable link for X and Instagram.",
                color: "bg-amber-50 text-amber-600",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className={`group rounded-2xl border border-border bg-white p-8 transition-all duration-500 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 ${
                  howItWorks.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: howItWorks.visible
                    ? `${150 * (i + 1)}ms`
                    : "0ms",
                }}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}
                >
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase mb-2">
                  {`Step ${s.step}`}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Card Gallery ───────────────────────────────────── */}
      <section
        id="gallery"
        ref={gallery.ref}
        className="scroll-mt-24 py-24 sm:py-32 bg-white"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              gallery.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Cards that make your followers stop scrolling
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Beautiful, data-rich recap cards &mdash; generated in seconds.
            </p>
          </div>

          {/* Controls */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-700 delay-150 ${
              gallery.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Card type tabs */}
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              {(["daily", "weekly", "monthly"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleCardChange(type)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 capitalize ${
                    cardType === type
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={handleThemeToggle}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cardTheme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {cardTheme === "light" ? "Light" : "Dark"}
            </button>
          </div>

          {/* Card image */}
          <div
            className={`flex justify-center transition-all duration-700 delay-300 ${
              gallery.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              <div
                className={`absolute -inset-8 rounded-3xl blur-3xl transition-colors duration-500 ${
                  cardTheme === "dark"
                    ? "bg-zinc-400/20"
                    : "bg-emerald-200/30"
                }`}
              />
              <div className="relative min-w-[320px] min-h-[320px] sm:min-w-[420px] sm:min-h-[420px] flex items-center justify-center">
                {!galleryImgLoaded && !galleryImgError && (
                  <div className="absolute inset-0 rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {galleryImgError ? (
                  <div className={`w-full max-w-[320px] sm:max-w-[420px] aspect-square rounded-2xl flex items-center justify-center border shadow-2xl ring-1 ring-black/5 ${
                    cardTheme === "dark"
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200/60"
                  }`}>
                    <p className="text-sm text-muted-foreground">Card preview</p>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={`${cardType}-${cardTheme}`}
                    src={buildCardUrl(cardType, cardTheme)}
                    alt=""
                    onLoad={() => setGalleryImgLoaded(true)}
                    onError={() => setGalleryImgError(true)}
                    className={`w-full max-w-[320px] sm:max-w-[420px] rounded-2xl shadow-2xl ring-1 ring-black/5 transition-all duration-500 ${
                      galleryImgLoaded
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                    width={420}
                    height={420}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section
        id="pricing"
        ref={pricing.ref}
        className="scroll-mt-24 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              pricing.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Simple pricing. No surprises.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you&apos;re ready to level up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div
              className={`rounded-2xl border border-border bg-white p-8 transition-all duration-700 hover:shadow-lg ${
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
                Everything you need to start
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  ₹0
                </span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited trade logging",
                  "Daily recap cards",
                  "Dark + light themes",
                  "PNLCard branding on cards",
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
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            {/* Premium tier */}
            <div
              className={`relative rounded-2xl border-2 border-foreground bg-white p-8 shadow-xl transition-all duration-700 hover:shadow-2xl ${
                pricing.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: pricing.visible ? "300ms" : "0ms",
              }}
            >
              <div className="absolute -top-3.5 left-8 rounded-full bg-foreground px-4 py-1 text-xs font-bold text-primary-foreground tracking-wide">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-foreground">Premium</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For serious traders who share
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  ₹199
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Weekly & monthly cards",
                  "Your X handle on cards",
                  "No PNLCard watermark",
                  "Story format (1080\u00D71920)",
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
              <Button asChild className="w-full bg-logo hover:opacity-90">
                <Link href="/login">Start Free, Upgrade Anytime</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                or ₹1,499/year (save 37%)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Start sharing your trades today.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Free forever. No credit card required.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white text-zinc-900 hover:bg-zinc-100 text-base px-8"
          >
            <Link href="/login" className="inline-flex items-center gap-2">
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-page py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="logo-capsule px-3.5 py-1 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/logo-graph.png" alt="" className="h-3 w-3 object-contain" />
                Pnl Card
              </div>
              <span className="text-sm text-muted-foreground">
                &mdash; Log. Share. Grow.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="https://x.com/pnlcard"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                𝕏
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground/60">
            A Next Alphabet Product
          </div>
        </div>
      </footer>
    </main>
  );
}
