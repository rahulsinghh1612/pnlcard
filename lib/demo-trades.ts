/**
 * Demo trades for the landing page.
 * No storage/API — used only for the demo section to show the real dashboard UI.
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
  { id: "dec-1",  trade_date: "2025-12-01", net_pnl: -2500, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-2",  trade_date: "2025-12-03", net_pnl: 2500,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-3",  trade_date: "2025-12-05", net_pnl: -3200, charges: 250, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "dec-4",  trade_date: "2025-12-09", net_pnl: 2800,  charges: 180, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-5",  trade_date: "2025-12-11", net_pnl: -1500, charges: 120, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-6",  trade_date: "2025-12-13", net_pnl: -2800, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-7",  trade_date: "2025-12-15", net_pnl: 4200,  charges: 300, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-8",  trade_date: "2025-12-17", net_pnl: -1200, charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-9",  trade_date: "2025-12-18", net_pnl: -2000, charges: 150, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-10", trade_date: "2025-12-19", net_pnl: 1500,  charges: 130, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-11", trade_date: "2025-12-23", net_pnl: -3500, charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "dec-12", trade_date: "2025-12-24", net_pnl: 1800,  charges: 80,  num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-13", trade_date: "2025-12-26", net_pnl: -1800, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-14", trade_date: "2025-12-29", net_pnl: 1800,  charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "dec-15", trade_date: "2025-12-31", net_pnl: -1600, charges: 130, num_trades: 2, capital_deployed: 1000000, note: null },
];

export const DEMO_TRADES: DemoTrade[] = [
  { id: "demo-1",  trade_date: "2026-01-01", net_pnl: -2500, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-2",  trade_date: "2026-01-02", net_pnl: 3500,  charges: 250, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-3",  trade_date: "2026-01-05", net_pnl: 2800,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-4",  trade_date: "2026-01-07", net_pnl: -1500, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-5",  trade_date: "2026-01-08", net_pnl: 3200,  charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "demo-6",  trade_date: "2026-01-10", net_pnl: -1800, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-7",  trade_date: "2026-01-13", net_pnl: 2600,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-8",  trade_date: "2026-01-15", net_pnl: 3500,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-9",  trade_date: "2026-01-16", net_pnl: -2000, charges: 180, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-10", trade_date: "2026-01-20", net_pnl: 1800,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-11", trade_date: "2026-01-22", net_pnl: -1200, charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-12", trade_date: "2026-01-24", net_pnl: 2500,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-13", trade_date: "2026-01-27", net_pnl: 3000,  charges: 250, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-14", trade_date: "2026-01-29", net_pnl: -2000, charges: 130, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-15", trade_date: "2026-01-31", net_pnl: 1000,  charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
];

export const DEMO_TRADES_FEB_2026: DemoTrade[] = [
  { id: "feb-1",  trade_date: "2026-02-02", net_pnl: 2200,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-2",  trade_date: "2026-02-04", net_pnl: -1800, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-3",  trade_date: "2026-02-05", net_pnl: 2200,  charges: 180, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-4",  trade_date: "2026-02-06", net_pnl: 2800,  charges: 250, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-5",  trade_date: "2026-02-09", net_pnl: -2500, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-6",  trade_date: "2026-02-10", net_pnl: 2500,  charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "feb-7",  trade_date: "2026-02-12", net_pnl: 1500,  charges: 120, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-8",  trade_date: "2026-02-16", net_pnl: 2800,  charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-9",  trade_date: "2026-02-18", net_pnl: -1200, charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-10", trade_date: "2026-02-20", net_pnl: 2000,  charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-11", trade_date: "2026-02-21", net_pnl: -900,  charges: 80,  num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-12", trade_date: "2026-02-24", net_pnl: 2600,  charges: 180, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-13", trade_date: "2026-02-25", net_pnl: -1500, charges: 130, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "feb-14", trade_date: "2026-02-26", net_pnl: 1800,  charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "feb-15", trade_date: "2026-02-27", net_pnl: 2400,  charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
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
