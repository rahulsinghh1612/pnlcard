/**
 * Demo trades for the landing page.
 * No storage/API — used only for the demo section to show the real dashboard UI.
 *
 * Capital basis: ₹10,00,000 (10 lakh) for ROI calculations.
 * Each week has 4–5 trading days with natural gaps (no 6-day weeks).
 *
 * Dec 2025: loss month  → -35,000 (-3.50% ROI) | 8W · 11L | 19 trades
 * Jan 2026: profit month → +65,000 (+6.50% ROI) | 15W · 6L | 21 trades
 * Feb 2026: profit month → +68,000 (+6.80% ROI) | 14W · 6L | 20 trades
 */

type DemoTrade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number;
  num_trades: number;
  capital_deployed: number;
  note: null;
};

export const DEMO_TRADES_DEC_2025: DemoTrade[] = [
  // Week 1 (Dec 1–7): 5 days — Mon Tue . Thu Fri Sat
  { id: "dec-1",  trade_date: "2025-12-01", net_pnl: -5000, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-2",  trade_date: "2025-12-02", net_pnl: 3800,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-3",  trade_date: "2025-12-04", net_pnl: -5550, charges: 250, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "dec-4",  trade_date: "2025-12-05", net_pnl: 2550,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-5",  trade_date: "2025-12-06", net_pnl: -2450, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 2 (Dec 8–14): 5 days — Mon . Wed Thu Fri Sat
  { id: "dec-6",  trade_date: "2025-12-08", net_pnl: -3000, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-7",  trade_date: "2025-12-10", net_pnl: -7200, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-8",  trade_date: "2025-12-11", net_pnl: 5100,  charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "dec-9",  trade_date: "2025-12-12", net_pnl: -5200, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-10", trade_date: "2025-12-13", net_pnl: 1350,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 3 (Dec 15–21): 4 days — Mon Tue . Thu Fri
  { id: "dec-11", trade_date: "2025-12-15", net_pnl: 3400,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-12", trade_date: "2025-12-16", net_pnl: -6400, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-13", trade_date: "2025-12-18", net_pnl: 3050,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-14", trade_date: "2025-12-19", net_pnl: -3650, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 4 (Dec 22–28): 3 days — Mon Tue Wed (holiday season)
  { id: "dec-15", trade_date: "2025-12-22", net_pnl: -5400, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-16", trade_date: "2025-12-23", net_pnl: 3600,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-17", trade_date: "2025-12-24", net_pnl: -6050, charges: 150, num_trades: 2, capital_deployed: 1000000, note: null },
  // Week 5 (Dec 29–Jan 4): 2 days — Mon Tue
  { id: "dec-18", trade_date: "2025-12-29", net_pnl: 2750,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-19", trade_date: "2025-12-30", net_pnl: -7000, charges: 200, num_trades: 3, capital_deployed: 1000000, note: null },
];

export const DEMO_TRADES: DemoTrade[] = [
  // Week 1 (Dec 29–Jan 4): 2 days — Fri Sat
  { id: "demo-1",  trade_date: "2026-01-02", net_pnl: 8650,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-2",  trade_date: "2026-01-03", net_pnl: 2350,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 2 (Jan 5–11): 5 days — Mon Tue Wed . Fri Sat
  { id: "demo-3",  trade_date: "2026-01-05", net_pnl: 6000,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-4",  trade_date: "2026-01-06", net_pnl: -3200, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-5",  trade_date: "2026-01-07", net_pnl: 10300, charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "demo-6",  trade_date: "2026-01-09", net_pnl: -2650, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-7",  trade_date: "2026-01-10", net_pnl: 1900,  charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 3 (Jan 12–18): 4 days — Mon . Wed Thu Fri
  { id: "demo-8",  trade_date: "2026-01-12", net_pnl: 6650,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-9",  trade_date: "2026-01-14", net_pnl: 5400,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-10", trade_date: "2026-01-15", net_pnl: 7450,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-11", trade_date: "2026-01-16", net_pnl: -3450, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 4 (Jan 19–25): 5 days — Mon Tue Wed . Fri
  { id: "demo-12", trade_date: "2026-01-19", net_pnl: 7900,  charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "demo-13", trade_date: "2026-01-20", net_pnl: -2250, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-14", trade_date: "2026-01-21", net_pnl: 5000,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-15", trade_date: "2026-01-22", net_pnl: -3000, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-16", trade_date: "2026-01-23", net_pnl: 7850,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  // Week 5 (Jan 26–Feb 1): 5 days — . Tue Wed Thu Fri Sat
  { id: "demo-17", trade_date: "2026-01-27", net_pnl: 7000,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-18", trade_date: "2026-01-28", net_pnl: -2450, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-19", trade_date: "2026-01-29", net_pnl: 3600,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-20", trade_date: "2026-01-30", net_pnl: 5850,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-21", trade_date: "2026-01-31", net_pnl: 1700,  charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
];

export const DEMO_TRADES_FEB_2026: DemoTrade[] = [
  // Week 1 (Feb 2–8): 5 days — Mon Tue Wed Thu Fri .
  { id: "feb-1",  trade_date: "2026-02-02", net_pnl: 6400,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-2",  trade_date: "2026-02-03", net_pnl: -2650, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-3",  trade_date: "2026-02-04", net_pnl: 4600,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-4",  trade_date: "2026-02-05", net_pnl: 8050,  charges: 250, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "feb-5",  trade_date: "2026-02-06", net_pnl: -3000, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 2 (Feb 9–15): 5 days — Mon Tue . Thu Fri Sat
  { id: "feb-6",  trade_date: "2026-02-09", net_pnl: 5800,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-7",  trade_date: "2026-02-10", net_pnl: 10500, charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "feb-8",  trade_date: "2026-02-12", net_pnl: 4000,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-9",  trade_date: "2026-02-13", net_pnl: -4400, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-10", trade_date: "2026-02-14", net_pnl: 2350,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 3 (Feb 16–22): 5 days — Mon . Wed Thu Fri Sat
  { id: "feb-11", trade_date: "2026-02-16", net_pnl: 7050,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-12", trade_date: "2026-02-18", net_pnl: -2450, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-13", trade_date: "2026-02-19", net_pnl: 5600,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-14", trade_date: "2026-02-20", net_pnl: 11500, charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "feb-15", trade_date: "2026-02-21", net_pnl: 1500,  charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  // Week 4 (Feb 23–Mar 1): 5 days — Mon Tue Wed Thu Fri
  { id: "feb-16", trade_date: "2026-02-23", net_pnl: 9650,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-17", trade_date: "2026-02-24", net_pnl: -450,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-18", trade_date: "2026-02-25", net_pnl: -3200, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-19", trade_date: "2026-02-26", net_pnl: 4400,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-20", trade_date: "2026-02-27", net_pnl: 6850,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
];

export type DemoTradeType = DemoTrade;

const MONTH_KEYS = ["2025-12", "2026-01", "2026-02"] as const;
export type DemoMonthKey = (typeof MONTH_KEYS)[number];

export const DEMO_MONTH_KEYS = MONTH_KEYS;

export const DEMO_MONTHS: Record<DemoMonthKey, DemoTrade[]> = {
  "2025-12": DEMO_TRADES_DEC_2025,
  "2026-01": DEMO_TRADES,
  "2026-02": DEMO_TRADES_FEB_2026,
};

export const DEMO_MONTH_LABELS: Record<DemoMonthKey, string> = {
  "2025-12": "December 2025",
  "2026-01": "January 2026",
  "2026-02": "February 2026",
};

export const DEMO_DISPLAY_NAME = "Rahul";
export const DEMO_CAPITAL = 1_000_000;
export const DEMO_CURRENCY = "INR";
export const DEMO_CARD_THEME = "light" as const;
