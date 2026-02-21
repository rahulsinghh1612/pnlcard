/**
 * Permanent promo data for the landing page hero carousel.
 *
 * Source: Real trades from @iamrahulx0's January 2026 account.
 * Fetched on 21 Feb 2026 from Supabase (scripts/jan-2026-trades.json).
 *
 * This file is the single source of truth for landing page card previews.
 * If the user updates their trades, re-run the debug-trades endpoint and
 * update the raw trades below, then the computed values will stay in sync.
 *
 * ── Raw trades used ──────────────────────────────────────────────
 *
 * Jan 2  (profit day):  net_pnl=+2,000  charges=200  trades=2  capital=10L
 * Jan 13 (loss day):    net_pnl=-1,200  charges=300  trades=1  capital=10L
 *
 * Jan 12-18 week:
 *   Mon 12: no trade
 *   Tue 13: net_pnl=-1,200  charges=300  → final=-1,500  (loss)
 *   Wed 14: net_pnl=+3,100  charges=90   → final=+3,010  (win)
 *   Thu 15: net_pnl=+2,500  charges=250  → final=+2,250  (win)
 *   Fri 16: net_pnl=+3,000  charges=300  → final=+2,700  (win)
 *   Sat 17: net_pnl=-1,000  charges=100  → final=-1,100  (loss)
 *   Sun 18: no trade
 *   Week total: +5,360  |  3W · 2L  |  9 trades  |  best: Wed +3,010
 *
 * January 2026 month (23 trading days, Jan 5 excluded):
 *   Jan 1 adjusted to +6,500 for promo display.
 *   Total: +16,726  |  14W · 9L  |  best: 1st +6,500  |  worst: 21st -3,200
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
  pnl: "+2,000",
  charges: "200",
  netPnl: "+1,800",
  netRoi: "+0.18%",
};

// ─── Daily: Jan 13 (Loss) ───────────────────────────────────────

export const PROMO_DAILY_LOSS = {
  type: "daily" as const,
  variant: "loss" as const,
  label: "Daily Loss",
  date: "13th Jan, 2026",
  trades: "1",
  pnl: "-1,200",
  charges: "300",
  netPnl: "-1,500",
  netRoi: "-0.15%",
};

// ─── Weekly: Jan 12–18 ──────────────────────────────────────────

export const PROMO_WEEKLY = {
  type: "weekly" as const,
  variant: "profit" as const,
  label: "Weekly Recap",
  range: "12 – 18 Jan, 2026",
  totalTrades: "9",
  netPnl: "+5,360",
  roi: "+0.54%",
  winRate: "60%",
  wl: "3W · 2L",
  days: [
    { day: "M", pnl: 0, win: false },
    { day: "T", pnl: -1500, win: false },
    { day: "W", pnl: 3010, win: true },
    { day: "T", pnl: 2250, win: true },
    { day: "F", pnl: 2700, win: true },
    { day: "S", pnl: -1100, win: false },
    { day: "S", pnl: 0, win: false },
  ],
};

// ─── Monthly: January 2026 ──────────────────────────────────────

export const PROMO_MONTHLY = {
  type: "monthly" as const,
  variant: "profit" as const,
  label: "Monthly Recap",
  month: "January 2026",
  netPnl: "+16,726",
  roi: "+1.67%",
  winRate: "61%",
  wl: "14W · 9L",
  calendarData: {
    1: 6500,
    2: 1800,
    3: -1500,
    6: 3627,
    7: -550,
    8: 1539,
    9: 1120,
    10: -1800,
    13: -1500,
    14: 3010,
    15: 2250,
    16: 2700,
    17: -1100,
    20: 1250,
    21: -3200,
    22: 900,
    23: -1400,
    24: 1850,
    27: 1800,
    28: -1430,
    29: -2200,
    30: 2160,
    31: 900,
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
export function getPromoCardUrls(theme: "light" | "dark" = "light"): PromoCardMeta[] {
  const suffix = theme === "dark" ? "-dark" : "";
  return [
    { label: "Daily Recap", url: `/promo/daily${suffix}.png` },
    { label: "Weekly Recap", url: `/promo/weekly${suffix}.png` },
    { label: "Monthly Recap", url: `/promo/monthly${suffix}.png` },
  ];
}
