"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import dynamic from "next/dynamic";
const DemoSection = dynamic(() => import("@/components/landing/demo-section").then((m) => m.DemoSection), {
  ssr: false,
  loading: () => <div className="h-[520px]" />,
});
const DemoCalendar = dynamic(() => import("@/components/landing/demo-section").then((m) => m.DemoCalendar), {
  ssr: false,
  loading: () => <div className="h-[320px]" />,
});
const DemoWeeklyBreakdown = dynamic(() => import("@/components/landing/demo-section").then((m) => m.DemoWeeklyBreakdown), {
  ssr: false,
  loading: () => <div className="h-[320px]" />,
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

/** Static promo card images — same as hero carousel. Regenerate via: node scripts/save-promo-images.mjs */
function getPromoCardImageUrl(
  type: "daily" | "weekly" | "monthly",
  theme: "light" | "dark"
): string {
  const suffix = theme === "dark" ? "-dark" : "";
  return `/promo/${type}${suffix}.png`;
}

// ─── Hero card data — real OG card images from lib/promo-data.ts ──
import {
  getPromoCardUrls,
  type PromoCardMeta,
} from "@/lib/promo-data";

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
  "Track Daily P&L",
  "60-Second Trade Logging",
  "Beautiful Recap Cards",
  "Share On X & Instagram",
  "Dark Mode Cards",
  "Weekly & Monthly Recaps",
  "Auto-Calculated ROI",
  "Win Rate Tracking",
  "Calendar Heatmap View",
  "Multi-Currency Support",
  "Export & Share Anywhere",
  "Built For Traders",
];

// ─── Main page ───────────────────────────────────────────────────

const HERO_CARDS_PER_SEC = 0.3;

export default function LandingPage() {
  const scrolled = useScrolled();
  const [cardType, setCardType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [cardTheme, setCardTheme] = useState<"light" | "dark">("light");
  const [galleryImgLoaded, setGalleryImgLoaded] = useState(false);
  const [galleryImgError, setGalleryImgError] = useState(false);
  const galleryImgRef = useRef<HTMLImageElement>(null);
  const [heroActiveIndex, setHeroActiveIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroRotorRef = useRef<HTMLDivElement>(null);
  const [galleryFeaturedIndex, setGalleryFeaturedIndex] = useState(0);
  /** Order of small cards [top, bottom]. When null, use default sorted order. */
  const [gallerySmallCardOrder, setGallerySmallCardOrder] = useState<[number, number] | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [cardVariant, setCardVariant] = useState<"profit" | "loss">("profit");
  const heroCards = useMemo(
    () => getPromoCardUrls(cardTheme, cardVariant),
    [cardTheme, cardVariant]
  );
  /** Safe cards for hero/gallery — fallback when promo data is empty (e.g. missing public/promo/) */
  const FALLBACK_CARDS: PromoCardMeta[] = [
    { label: "Daily Recap", url: `/promo/daily${cardVariant === "loss" ? "-loss" : ""}.png` },
    { label: "Weekly Recap", url: `/promo/weekly${cardVariant === "loss" ? "-loss" : ""}.png` },
    { label: "Monthly Recap", url: `/promo/monthly${cardVariant === "loss" ? "-loss" : ""}.png` },
  ];
  const displayCards = heroCards.length > 0 ? heroCards : FALLBACK_CARDS;
  const heroPositionRef = useRef(0);
  const heroSpeedRef = useRef(1); // 0 = stopped, 1 = full speed — eases for seamless hover
  const rafRef = useRef<number>();

  const howItWorks = useInView();
  const calendarFeature = useInView();
  const weeklyFeature = useInView();
  const gallery = useInView();
  const pricing = useInView();

  // Always start from top when landing page loads (prevents scroll restoration to pricing, etc.)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Preload current theme/variant images immediately, defer the rest
  useEffect(() => {
    for (const { url } of displayCards) {
      const img = new Image();
      img.src = url;
    }
    const timer = setTimeout(() => {
      for (const v of ["profit", "loss"] as const) {
        for (const t of ["light", "dark"] as const) {
          if (v === cardVariant && t === cardTheme) continue;
          for (const { url } of getPromoCardUrls(t, v)) {
            const img = new Image();
            img.src = url;
          }
        }
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHeroClick = (index: number) => {
    heroPositionRef.current = index;
    setHeroActiveIndex(index);
    if (heroRotorRef.current && displayCards.length > 0) {
      heroRotorRef.current.style.transform = `rotateY(${-index * (360 / displayCards.length)}deg)`;
    }
  };

  const handleHeroPointerEnter = () => setHeroPaused(true);
  const handleHeroPointerLeave = () => setHeroPaused(false);

  // Hero: continuous revolving — writes directly to DOM for 60fps, only triggers React re-render when active dot changes
  useEffect(() => {
    const count = displayCards.length;
    if (count === 0) return;
    let lastTime = performance.now();
    let prevIndex = Math.round(heroPositionRef.current) % count;
    const LERP = 0.12;
    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;
      const targetSpeed = heroPaused ? 0 : 1;
      heroSpeedRef.current += (targetSpeed - heroSpeedRef.current) * LERP;
      heroPositionRef.current += HERO_CARDS_PER_SEC * deltaSec * heroSpeedRef.current;
      if (heroPositionRef.current >= count) heroPositionRef.current -= count;
      if (heroPositionRef.current < 0) heroPositionRef.current += count;

      if (heroRotorRef.current) {
        heroRotorRef.current.style.transform = `rotateY(${-heroPositionRef.current * (360 / count)}deg)`;
      }

      const newIndex = ((Math.round(heroPositionRef.current) % count) + count) % count;
      if (newIndex !== prevIndex) {
        prevIndex = newIndex;
        setHeroActiveIndex(newIndex);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [heroPaused, displayCards.length]);

  // Fix: cached images can fire load before onLoad is attached — check img.complete after render
  useEffect(() => {
    const check = () => {
      const img = galleryImgRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        setGalleryImgLoaded(true);
        setGalleryImgError(false);
      }
    };
    check();
    const t = setTimeout(check, 50);
    return () => clearTimeout(t);
  }, [cardType, cardTheme, cardVariant, galleryFeaturedIndex]);

  const handleCardChange = (type: "daily" | "weekly" | "monthly") => {
    if (type === cardType) return;
    setGalleryImgLoaded(false);
    setGalleryImgError(false);
    setCardType(type);
    setGalleryFeaturedIndex(type === "daily" ? 0 : type === "weekly" ? 1 : 2);
    setGallerySmallCardOrder(null); // Reset to default order when using tabs
  };

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="logo-capsule px-4 py-1.5 text-sm">
                Pnl Card
              </div>
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Log. Share. Grow.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#demo"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works
            </a>
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
            <Link
              href="/signup"
              className="btn-gradient-flow group relative inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform"
            >
              <span className="relative z-[1]">Start for Free</span>
            </Link>
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
            </div>

            {/* Hero card carousel — Earth-style revolving (cards around a column) */}
            <div className="animate-fade-in-up-delay-2 relative flex flex-col items-center lg:items-end gap-16">
              <div
                className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] flex-shrink-0"
                style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
                onMouseEnter={handleHeroPointerEnter}
                onMouseLeave={handleHeroPointerLeave}
                onTouchStart={handleHeroPointerEnter}
                onTouchEnd={handleHeroPointerLeave}
              >
                <div
                  ref={heroRotorRef}
                  className="absolute inset-0"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(0deg)`,
                    willChange: "transform",
                  }}
                >
                  {displayCards.map((card, i) => {
                    const angle = (i * 360) / displayCards.length;
                    const radius = 180;
                    return (
                      <div
                        key={`hero-${i}`}
                        className="absolute left-1/2 top-1/2 w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] cursor-pointer"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                          backfaceVisibility: "hidden",
                          pointerEvents: "auto",
                        }}
                        onClick={() => handleHeroClick(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.url}
                          alt={card.label}
                          width={360}
                          height={360}
                          className="w-full h-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] object-cover select-none"
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dot indicators + toggles — stacked in two fixed rows to prevent layout shift */}
              <div className="flex flex-col items-center gap-4">
                {/* Row 1: Dot indicators + card label */}
                <div className="flex items-center gap-1.5">
                  {displayCards.map((card, i) => (
                    <button
                      key={`dot-${i}`}
                      type="button"
                      onClick={() => handleHeroClick(i)}
                      className={`rounded-full transition-all duration-300 ${
                        heroActiveIndex === i
                            ? "w-5 h-2 bg-foreground"
                            : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                      }`}
                      aria-label={`Show ${card.label} card`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {displayCards[heroActiveIndex]?.label ?? "Daily Recap"}
                  </span>
                </div>
                {/* Row 2: Light/Dark + Profit/Loss toggles */}
                <div className="flex items-center gap-3">
                  {/* Light / Dark toggle */}
                  <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
                    {(["light", "dark"] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => {
                          if (cardTheme === theme) return;
                          setGalleryImgLoaded(false);
                          setGalleryImgError(false);
                          setCardTheme(theme);
                        }}
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          cardTheme === theme
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {theme === "light" ? (
                          <Sun className="h-3.5 w-3.5" />
                        ) : (
                          <Moon className="h-3.5 w-3.5" />
                        )}
                        {theme === "light" ? "Light" : "Dark"}
                      </button>
                    ))}
                  </div>
                  {/* Profit / Loss toggle */}
                  <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
                    {(["profit", "loss"] as const).map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => {
                          if (cardVariant === variant) return;
                          setGalleryImgLoaded(false);
                          setGalleryImgError(false);
                          setCardVariant(variant);
                        }}
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          cardVariant === variant
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {variant === "profit" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                        )}
                        {variant === "profit" ? "Profit" : "Loss"}
                      </button>
                    ))}
                  </div>
                </div>
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
        className="scroll-mt-24 pt-20 sm:pt-24 pb-6"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div
            className={`text-center mb-0 transition-all duration-700 ${
              howItWorks.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Two steps.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Sixty seconds.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From trade to shareable card in under a minute.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ──────────────────────────────── */}
      <DemoSection />

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

      {/* ── Calendar Feature ──────────────────────────────── */}
      <section
        ref={calendarFeature.ref}
        className="scroll-mt-24 py-24 sm:py-32 bg-white"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              calendarFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your PnL,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                One Glance.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See your entire month&apos;s performance in a single calendar view.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              calendarFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <DemoCalendar />
          </div>
        </div>
      </section>

      {/* ── Weekly Feature ─────────────────────────────────── */}
      <section
        ref={weeklyFeature.ref}
        className="scroll-mt-24 pb-24 sm:pb-32 bg-white"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              weeklyFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Zoom into your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Weeks.
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Break down your monthly performance week by week &mdash; spot patterns and stay consistent.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${
              weeklyFeature.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <DemoWeeklyBreakdown />
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
              Cards that make your{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                followers
              </span>{" "}
              stop scrolling
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
            {/* Card type tabs — sync with galleryFeaturedIndex */}
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              {(["daily", "weekly", "monthly"] as const).map((type, i) => (
                <button
                  key={type}
                  onClick={() => handleCardChange(type)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 capitalize ${
                    galleryFeaturedIndex === i
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Theme toggle — Light / Dark side by side */}
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              {(["light", "dark"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    if (cardTheme === theme) return;
                    setGalleryImgLoaded(false);
                    setGalleryImgError(false);
                    setCardTheme(theme);
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    cardTheme === theme
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {theme === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
            {/* Profit / Loss toggle */}
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-1">
              {(["profit", "loss"] as const).map((variant) => (
                <button
                  key={variant}
                  onClick={() => {
                    if (cardVariant === variant) return;
                    setGalleryImgLoaded(false);
                    setGalleryImgError(false);
                    setCardVariant(variant);
                  }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    cardVariant === variant
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {variant === "profit" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  {variant === "profit" ? "Profit" : "Loss"}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery bento — one large featured card + two small cards */}
          <div
            className={`flex justify-center transition-all duration-700 delay-300 ${
              gallery.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative flex flex-col sm:flex-row items-center gap-4">
              {/* Large featured card */}
              <div className="relative z-10 w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] shrink-0">
                {!galleryImgLoaded && !galleryImgError && (
                  <div className="absolute inset-0 rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {galleryImgError ? (
                  <div className={`w-full h-full rounded-2xl flex items-center justify-center border shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 ${
                    cardVariant === "loss"
                      ? cardTheme === "dark"
                        ? "bg-zinc-900 border-red-700/50"
                        : "bg-gradient-to-br from-red-50 to-red-100/80 border-red-200/60"
                      : cardTheme === "dark"
                        ? "bg-zinc-900 border-zinc-700"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200/60"
                  }`}>
                    <p className="text-sm text-muted-foreground">Card preview</p>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    ref={galleryImgRef}
                    key={`gallery-${galleryFeaturedIndex}-${cardTheme}-${cardVariant}`}
                    src={displayCards[galleryFeaturedIndex]?.url ?? `/promo/daily${cardVariant === "loss" ? "-loss" : ""}.png`}
                    alt={displayCards[galleryFeaturedIndex]?.label ?? "Daily Recap"}
                    onLoad={() => setGalleryImgLoaded(true)}
                    onError={() => setGalleryImgError(true)}
                    width={360}
                    height={360}
                    className={`w-full h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 object-cover transition-all duration-500 ${
                      galleryImgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    draggable={false}
                  />
                )}
              </div>
              {/* Small cards column — swapped-out card goes to clicked card's position */}
              <div className="relative z-10 flex flex-row sm:flex-col gap-3 shrink-0">
                {(() => {
                  const defaultOrder = ([0, 1, 2] as const).filter(
                    (x) => x !== galleryFeaturedIndex
                  ) as [number, number];
                  const order = gallerySmallCardOrder ?? defaultOrder;
                  return order.map((i) => {
                    const card = displayCards[i];
                    return (
                      <button
                        key={`gallery-small-${i}`}
                        type="button"
                        onClick={() => {
                          const prevFeatured = galleryFeaturedIndex;
                          const otherIndex = ([0, 1, 2] as const).find(
                            (x) => x !== prevFeatured && x !== i
                          )!;
                          const prevSmallCards = ([0, 1, 2] as const)
                            .filter((x) => x !== prevFeatured)
                            .sort((a, b) => a - b) as [number, number];
                          const clickedPosition = prevSmallCards.indexOf(i);
                          const newOrder: [number, number] = [0, 0];
                          newOrder[clickedPosition] = prevFeatured;
                          newOrder[1 - clickedPosition] = otherIndex;
                          setGalleryFeaturedIndex(i);
                          setCardType(i === 0 ? "daily" : i === 1 ? "weekly" : "monthly");
                          setGalleryImgLoaded(false);
                          setGalleryImgError(false);
                          setGallerySmallCardOrder(newOrder);
                        }}
                        className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[140px] md:h-[140px] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.10)] ring-1 ring-black/10 transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-black/20 focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.url}
                          alt={card.label}
                          width={360}
                          height={360}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          draggable={false}
                        />
                      </button>
                    );
                  });
                })()}
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
            className={`text-center mb-10 transition-all duration-700 ${
              pricing.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
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
                  "PNG download",
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
              <Link
                href="/signup"
                className="btn-gradient-flow group relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 transition-transform"
              >
                <span className="relative z-[1]">Get Started</span>
              </Link>
            </div>

            {/* Premium tier */}
            <div
              className={`relative rounded-2xl border-2 border-emerald-200 bg-white p-8 shadow-xl transition-all duration-700 hover:shadow-2xl ${
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
                For serious traders who share
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
                  "Weekly & monthly cards",
                  "Your X handle on cards",
                  "No PNLCard watermark",
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
                href="/login"
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
      <section className="relative py-24 sm:py-32 bg-page overflow-hidden">
        <div className="mx-auto max-w-3xl px-6 text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Start sharing your trades{" "}
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
      <footer className="border-t border-border bg-page py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <a
                href="#top"
                className="logo-capsule px-3.5 py-1 text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Pnl Card
              </a>
              <span className="text-sm text-muted-foreground">
                Log. Share. Grow.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
