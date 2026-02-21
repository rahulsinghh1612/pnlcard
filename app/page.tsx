"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

// HeroCardInline removed — carousel now uses real OG card images

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
  const [heroPosition, setHeroPosition] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [galleryFeaturedIndex, setGalleryFeaturedIndex] = useState(0);
  /** Order of small cards [top, bottom]. When null, use default sorted order. */
  const [gallerySmallCardOrder, setGallerySmallCardOrder] = useState<[number, number] | null>(null);
  const heroCards = useMemo(
    () => getPromoCardUrls(cardTheme),
    [cardTheme]
  );
  const heroPositionRef = useRef(0);
  const heroSpeedRef = useRef(1); // 0 = stopped, 1 = full speed — eases for seamless hover
  const rafRef = useRef<number>();

  const howItWorks = useInView();
  const gallery = useInView();
  const pricing = useInView();

  const handleHeroClick = (index: number) => {
    heroPositionRef.current = index;
    setHeroPosition(index);
  };

  const handleHeroPointerEnter = () => setHeroPaused(true);
  const handleHeroPointerLeave = () => setHeroPaused(false);

  // Hero: continuous revolving — smooth decel on hover, smooth accel on leave
  useEffect(() => {
    let lastTime = performance.now();
    const LERP = 0.12; // higher = snappier ease
    const tick = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;
      const targetSpeed = heroPaused ? 0 : 1;
      heroSpeedRef.current += (targetSpeed - heroSpeedRef.current) * LERP;
      heroPositionRef.current += HERO_CARDS_PER_SEC * deltaSec * heroSpeedRef.current;
      if (heroPositionRef.current >= heroCards.length) {
        heroPositionRef.current -= heroCards.length;
      }
      if (heroPositionRef.current < 0) {
        heroPositionRef.current += heroCards.length;
      }
      setHeroPosition(heroPositionRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [heroPaused, heroCards.length]);

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
  }, [cardType, cardTheme, galleryFeaturedIndex]);

  const handleCardChange = (type: "daily" | "weekly" | "monthly") => {
    if (type === cardType) return;
    setGalleryImgLoaded(false);
    setGalleryImgError(false);
    setCardType(type);
    setGalleryFeaturedIndex(type === "daily" ? 0 : type === "weekly" ? 1 : 2);
    setGallerySmallCardOrder(null); // Reset to default order when using tabs
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

            {/* Hero card carousel — Earth-style revolving (cards around a column) */}
            <div className="animate-fade-in-up-delay-2 relative flex flex-col items-center lg:items-end gap-16">
              <div
                className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px]"
                style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
                onMouseEnter={handleHeroPointerEnter}
                onMouseLeave={handleHeroPointerLeave}
                onTouchStart={handleHeroPointerEnter}
                onTouchEnd={handleHeroPointerLeave}
              >
                <div className="absolute -inset-20 rounded-3xl bg-emerald-200/20 blur-3xl pointer-events-none" />
                <div
                  className="absolute inset-0"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${-heroPosition * (360 / heroCards.length)}deg)`,
                  }}
                >
                  {heroCards.map((card, i) => {
                    const angle = (i * 360) / heroCards.length;
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
                          className="w-full h-full rounded-2xl shadow-xl ring-1 ring-black/[0.06] object-cover select-none"
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dot indicators + Light/Dark toggle */}
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-1.5">
                {heroCards.map((card, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    onClick={() => handleHeroClick(i)}
                    className={`rounded-full transition-all duration-300 ${
                      Math.round(heroPosition) % heroCards.length === i
                          ? "w-5 h-2 bg-foreground"
                          : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Show ${card.label} card`}
                  />
                ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {heroCards[Math.round(heroPosition) % heroCards.length].label}
                  </span>
                </div>
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
          </div>

          {/* Gallery bento — one large featured card + two small cards */}
          <div
            className={`flex justify-center transition-all duration-700 delay-300 ${
              gallery.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative flex items-center gap-4">
              <div
                className={`absolute -inset-8 rounded-3xl blur-3xl transition-colors duration-500 pointer-events-none ${
                  cardTheme === "dark"
                    ? "bg-zinc-400/20"
                    : "bg-emerald-200/30"
                }`}
              />
              {/* Large featured card */}
              <div className="relative z-10 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] shrink-0">
                {!galleryImgLoaded && !galleryImgError && (
                  <div className="absolute inset-0 rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {galleryImgError ? (
                  <div className={`w-full h-full rounded-2xl flex items-center justify-center border shadow-2xl ring-1 ring-black/5 ${
                    cardTheme === "dark"
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200/60"
                  }`}>
                    <p className="text-sm text-muted-foreground">Card preview</p>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    ref={galleryImgRef}
                    key={`gallery-${galleryFeaturedIndex}-${cardTheme}`}
                    src={heroCards[galleryFeaturedIndex].url}
                    alt={heroCards[galleryFeaturedIndex].label}
                    onLoad={() => setGalleryImgLoaded(true)}
                    onError={() => setGalleryImgError(true)}
                    width={360}
                    height={360}
                    className={`w-full h-full rounded-2xl shadow-2xl ring-1 ring-black/5 object-cover transition-all duration-500 ${
                      galleryImgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    draggable={false}
                  />
                )}
              </div>
              {/* Small cards column — swapped-out card goes to clicked card's position */}
              <div className="relative z-10 flex flex-col gap-3 shrink-0">
                {(() => {
                  const defaultOrder = ([0, 1, 2] as const).filter(
                    (x) => x !== galleryFeaturedIndex
                  ) as [number, number];
                  const order = gallerySmallCardOrder ?? defaultOrder;
                  return order.map((i) => {
                    const card = heroCards[i];
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
                        className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] md:w-[140px] md:h-[140px] rounded-xl overflow-hidden shadow-lg ring-1 ring-black/[0.06] transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
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
