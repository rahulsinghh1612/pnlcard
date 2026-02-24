/**
 * Permanent promo data for the landing page hero carousel.
 *
 * Capital basis: ₹10,00,000 (10 lakh) for all ROI calculations.
 * Data matches lib/demo-trades.ts so the calendar heatmap and promo cards
 * are consistent across the landing page.
 *
 * ── Weekly cards (Mon–Sun, 5 bars + 1 gap) ──────────────────────
 * Profit week (5–11 Jan 2026):
 *   Mon: +5,800 | Tue: -3,400 | Wed: +10,000 | Thu: — | Fri: -2,800
 *   Sat: +1,800 | Sun: — | Total: +11,400 | 3W · 2L | ROI: +1.14%
 *
 * Loss week (8–14 Dec 2025):
 *   Mon: -3,200 | Tue: -6,400 | Wed: +4,800 | Thu: — | Fri: -4,400
 *   Sat: +1,200 | Sun: — | Total: -8,000 | 2W · 3L | ROI: -0.80%
 *
 * ── Monthly cards ────────────────────────────────────────────────
 * Profit (Jan 2026): +65,000 | 15W · 6L | +6.50% ROI | 21 trades
 * Loss (Dec 2025):   -35,000 | 8W · 11L | -3.50% ROI | 19 trades
 */

export const PROMO_HANDLE = "@iamrahulx0";
export const PROMO_CURRENCY = "INR";
export const PROMO_CAPITAL = 1_000_000;

// ─── Daily: Jan 2 (Profit) ──────────────────────────────────────

export const PROMO_DAILY_PROFIT = {
  type: "daily" as const,
  variant: "profit" as const,
  label: "Daily Profit",
  date: "2nd Jan, 2026",
  trades: "2",
  pnl: "+8,650",
  charges: "250",
  netPnl: "+8,400",
  netRoi: "+0.84%",
};

// ─── Daily: Dec 30 (Loss) ───────────────────────────────────────

export const PROMO_DAILY_LOSS = {
  type: "daily" as const,
  variant: "loss" as const,
  label: "Daily Loss",
  date: "30th Dec, 2025",
  trades: "3",
  pnl: "-13,000",
  charges: "200",
  netPnl: "-13,200",
  netRoi: "-1.32%",
};

// ─── Weekly: Profit (5–11 Jan 2026, 5 bars + gap on Thu) ────────

export const PROMO_WEEKLY = {
  type: "weekly" as const,
  variant: "profit" as const,
  label: "Weekly Recap",
  range: "5 Jan – 11 Jan, 2026",
  totalTrades: "8",
  netPnl: "+11,400",
  roi: "+1.14%",
  winRate: "60%",
  wl: "3W · 2L",
  days: [
    { day: "M", pnl: 5800, win: true },
    { day: "T", pnl: -3400, win: false },
    { day: "W", pnl: 10000, win: true },
    { day: "T", pnl: 0, win: false },
    { day: "F", pnl: -2800, win: false },
    { day: "S", pnl: 1800, win: true },
    { day: "S", pnl: 0, win: false },
  ],
};

// ─── Weekly: Loss (8–14 Dec 2025, 5 bars + gap on Thu) ──────────

export const PROMO_WEEKLY_LOSS = {
  type: "weekly" as const,
  variant: "loss" as const,
  label: "Weekly Loss",
  range: "8 Dec – 14 Dec, 2025",
  totalTrades: "10",
  netPnl: "-8,000",
  roi: "-0.80%",
  winRate: "40%",
  wl: "2W · 3L",
  days: [
    { day: "M", pnl: -3200, win: false },
    { day: "T", pnl: -6400, win: false },
    { day: "W", pnl: 4800, win: true },
    { day: "T", pnl: 0, win: false },
    { day: "F", pnl: -4400, win: false },
    { day: "S", pnl: 1200, win: true },
    { day: "S", pnl: 0, win: false },
  ],
};

// ─── Monthly: Profit (January 2026, 21 trades) ──────────────────

export const PROMO_MONTHLY = {
  type: "monthly" as const,
  variant: "profit" as const,
  label: "Monthly Recap",
  month: "January 2026",
  netPnl: "+65,000",
  roi: "+6.50%",
  winRate: "71%",
  wl: "15W · 6L",
  calendarData: {
    2: 8400, 3: 2200, 5: 5800, 6: -3400, 7: 10000,
    9: -2800, 10: 1800, 12: 6400, 14: 5200, 15: 7200,
    16: -3600, 19: 7600, 20: -2400, 21: 4800, 22: -3200,
    23: 7600, 27: 6800, 28: -2600, 29: 3400, 30: 5600, 31: 1600,
  } as Record<number, number>,
};

// ─── Monthly: Loss (December 2025, 19 trades) ───────────────────

export const PROMO_MONTHLY_LOSS = {
  type: "monthly" as const,
  variant: "loss" as const,
  label: "Monthly Loss",
  month: "December 2025",
  netPnl: "-35,000",
  roi: "-3.50%",
  winRate: "42%",
  wl: "8W · 11L",
  calendarData: {
    1: -4200, 2: 3600, 3: -5800, 5: 2400, 6: -2600,
    8: -3200, 9: -6400, 10: 4800, 12: -4400, 13: 1200,
    15: 3200, 16: -5600, 17: 2800, 19: -3800, 22: -4600,
    23: 3400, 24: -5200, 29: 2600, 30: -13200,
  } as Record<number, number>,
};

/**
 * January 2026 calendar grid (Monday-first).
 * Jan 1 is Thursday → 3 empty cells before day 1.
 * 31 days + 3 offset = 34 → pad to 35 (5 rows of 7).
 */
export const JAN_2026_GRID: (number | null)[] = [
  null, null, null, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, null,
];

/** Metadata for carousel dot indicators */
export type PromoCardMeta = {
  label: string;
  url: string;
};

/**
 * Static promo card images — pre-generated PNGs in public/promo/.
 * To regenerate: node scripts/save-promo-images.mjs (dev server must be running)
 */
export function getPromoCardUrls(
  theme: "light" | "dark" = "light",
  variant: "profit" | "loss" = "profit"
): PromoCardMeta[] {
  const variantSuffix = variant === "loss" ? "-loss" : "";
  const themeSuffix = theme === "dark" ? "-dark" : "";
  return [
    { label: "Daily Recap", url: `/promo/daily${variantSuffix}${themeSuffix}.png` },
    { label: "Weekly Recap", url: `/promo/weekly${variantSuffix}${themeSuffix}.png` },
    { label: "Monthly Recap", url: `/promo/monthly${variantSuffix}${themeSuffix}.png` },
  ];
}
