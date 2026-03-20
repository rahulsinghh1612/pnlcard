/**
 * USD Demo trades for the landing page (non-India visitors).
 * Hand-picked values for a ~$12,000 account US retail trader.
 *
 * Capital basis: $12,000 for ROI calculations.
 * Same trade dates, same win/loss pattern, same num_trades as INR version.
 *
 * Dec 2025: loss month  → -$420 (-3.50% ROI) | 8W · 11L | 19 trades
 * Jan 2026: profit month → +$760 (+6.33% ROI) | 14W · 7L | 21 trades
 * Feb 2026: profit month → +$820 (+6.83% ROI) | 14W · 6L | 20 trades
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

export const DEMO_CAPITAL_USD = 12_000;

export const DEMO_TRADES_DEC_2025_USD: DemoTrade[] = [
  // Week 1 (Dec 1–7): 5 days
  { id: "dec-1",  trade_date: "2025-12-01", net_pnl: -60,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-2",  trade_date: "2025-12-02", net_pnl: 45,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "dec-3",  trade_date: "2025-12-04", net_pnl: -65,  charges: 3, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "dec-4",  trade_date: "2025-12-05", net_pnl: 30,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "dec-5",  trade_date: "2025-12-06", net_pnl: -30,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 2 (Dec 8–14): 5 days
  { id: "dec-6",  trade_date: "2025-12-08", net_pnl: -35,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-7",  trade_date: "2025-12-10", net_pnl: -85,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-8",  trade_date: "2025-12-11", net_pnl: 60,   charges: 4, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "dec-9",  trade_date: "2025-12-12", net_pnl: -62,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-10", trade_date: "2025-12-13", net_pnl: 15,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 3 (Dec 15–21): 4 days
  { id: "dec-11", trade_date: "2025-12-15", net_pnl: 40,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-12", trade_date: "2025-12-16", net_pnl: -75,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "dec-13", trade_date: "2025-12-18", net_pnl: 35,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-14", trade_date: "2025-12-19", net_pnl: -45,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 4 (Dec 22–28): 3 days
  { id: "dec-15", trade_date: "2025-12-22", net_pnl: -65,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "dec-16", trade_date: "2025-12-23", net_pnl: 42,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "dec-17", trade_date: "2025-12-24", net_pnl: -72,  charges: 2, num_trades: 2, capital_deployed: 12000, note: null },
  // Week 5 (Dec 29–Jan 4): 2 days
  { id: "dec-18", trade_date: "2025-12-29", net_pnl: 32,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "dec-19", trade_date: "2025-12-30", net_pnl: -85,  charges: 3, num_trades: 3, capital_deployed: 12000, note: null },
];

export const DEMO_TRADES_USD: DemoTrade[] = [
  // Week 1 (Jan 1–4): 2 days — 2W·0L = +$130
  { id: "demo-1",  trade_date: "2026-01-02", net_pnl: 105,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-2",  trade_date: "2026-01-03", net_pnl: 28,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 2 (Jan 5–11): 5 days — 2W·3L = -$55
  { id: "demo-3",  trade_date: "2026-01-05", net_pnl: -38,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-4",  trade_date: "2026-01-06", net_pnl: -72,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-5",  trade_date: "2026-01-07", net_pnl: 40,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-6",  trade_date: "2026-01-09", net_pnl: -32,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-7",  trade_date: "2026-01-10", net_pnl: 55,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  // Week 3 (Jan 12–18): 4 days — 3W·1L = +$270
  { id: "demo-8",  trade_date: "2026-01-12", net_pnl: 120,  charges: 4, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "demo-9",  trade_date: "2026-01-14", net_pnl: 75,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-10", trade_date: "2026-01-15", net_pnl: 105,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-11", trade_date: "2026-01-16", net_pnl: -22,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 4 (Jan 19–25): 5 days — 3W·2L = +$170
  { id: "demo-12", trade_date: "2026-01-19", net_pnl: 95,   charges: 4, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "demo-13", trade_date: "2026-01-20", net_pnl: -27,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-14", trade_date: "2026-01-21", net_pnl: 60,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-15", trade_date: "2026-01-22", net_pnl: -36,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-16", trade_date: "2026-01-23", net_pnl: 95,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  // Week 5 (Jan 26–31): 5 days — 4W·1L = +$245
  { id: "demo-17", trade_date: "2026-01-27", net_pnl: 100,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-18", trade_date: "2026-01-28", net_pnl: 78,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-19", trade_date: "2026-01-29", net_pnl: -19,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "demo-20", trade_date: "2026-01-30", net_pnl: 70,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "demo-21", trade_date: "2026-01-31", net_pnl: 28,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
];

export const DEMO_TRADES_FEB_2026_USD: DemoTrade[] = [
  // Week 1 (Feb 2–8): 5 days
  { id: "feb-1",  trade_date: "2026-02-02", net_pnl: 75,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-2",  trade_date: "2026-02-03", net_pnl: -32,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-3",  trade_date: "2026-02-04", net_pnl: 55,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-4",  trade_date: "2026-02-05", net_pnl: 95,   charges: 3, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "feb-5",  trade_date: "2026-02-06", net_pnl: -36,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 2 (Feb 9–15): 5 days
  { id: "feb-6",  trade_date: "2026-02-09", net_pnl: 70,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-7",  trade_date: "2026-02-10", net_pnl: 125,  charges: 4, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "feb-8",  trade_date: "2026-02-12", net_pnl: 48,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-9",  trade_date: "2026-02-13", net_pnl: -52,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-10", trade_date: "2026-02-14", net_pnl: 28,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 3 (Feb 16–22): 5 days
  { id: "feb-11", trade_date: "2026-02-16", net_pnl: 85,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-12", trade_date: "2026-02-18", net_pnl: -30,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-13", trade_date: "2026-02-19", net_pnl: 68,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-14", trade_date: "2026-02-20", net_pnl: 135,  charges: 4, num_trades: 3, capital_deployed: 12000, note: null },
  { id: "feb-15", trade_date: "2026-02-21", net_pnl: 18,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  // Week 4 (Feb 23–Mar 1): 5 days
  { id: "feb-16", trade_date: "2026-02-23", net_pnl: 115,  charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-17", trade_date: "2026-02-24", net_pnl: -5,   charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-18", trade_date: "2026-02-25", net_pnl: -38,  charges: 2, num_trades: 1, capital_deployed: 12000, note: null },
  { id: "feb-19", trade_date: "2026-02-26", net_pnl: 52,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
  { id: "feb-20", trade_date: "2026-02-27", net_pnl: 82,   charges: 3, num_trades: 2, capital_deployed: 12000, note: null },
];

export const DEMO_MONTHS_USD: Record<string, DemoTrade[]> = {
  "2025-12": DEMO_TRADES_DEC_2025_USD,
  "2026-01": DEMO_TRADES_USD,
  "2026-02": DEMO_TRADES_FEB_2026_USD,
};
