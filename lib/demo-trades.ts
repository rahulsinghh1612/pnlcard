/**
 * Demo trades for the landing page — real January 2026 data from @iamrahulx0.
 * Source: scripts/jan-2026-trades.json
 *
 * No storage/API — used only for the demo section to show the real dashboard UI.
 */
export const DEMO_TRADES = [
  { id: "demo-1", trade_date: "2026-01-01", net_pnl: -3000, charges: 150, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-2", trade_date: "2026-01-02", net_pnl: 2000, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-3", trade_date: "2026-01-03", net_pnl: -1300, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-4", trade_date: "2026-01-05", net_pnl: 3650, charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-5", trade_date: "2026-01-06", net_pnl: 3777, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-6", trade_date: "2026-01-07", net_pnl: -500, charges: 50, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-7", trade_date: "2026-01-08", net_pnl: 1884, charges: 345, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "demo-8", trade_date: "2026-01-09", net_pnl: 1450, charges: 330, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-9", trade_date: "2026-01-10", net_pnl: -1600, charges: 200, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-10", trade_date: "2026-01-13", net_pnl: -1200, charges: 300, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-11", trade_date: "2026-01-14", net_pnl: 3100, charges: 90, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-12", trade_date: "2026-01-15", net_pnl: 2500, charges: 250, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-13", trade_date: "2026-01-16", net_pnl: 3000, charges: 300, num_trades: 3, capital_deployed: 1000000, note: null },
  { id: "demo-14", trade_date: "2026-01-17", net_pnl: -1000, charges: 100, num_trades: 2, capital_deployed: 1000000, note: null },
  { id: "demo-15", trade_date: "2026-01-20", net_pnl: 1400, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-16", trade_date: "2026-01-21", net_pnl: -3000, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-17", trade_date: "2026-01-22", net_pnl: 1100, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-18", trade_date: "2026-01-23", net_pnl: -1200, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-19", trade_date: "2026-01-24", net_pnl: 2000, charges: 150, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-20", trade_date: "2026-01-27", net_pnl: 2000, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-21", trade_date: "2026-01-28", net_pnl: -1300, charges: 130, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-22", trade_date: "2026-01-29", net_pnl: -2000, charges: 200, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-23", trade_date: "2026-01-30", net_pnl: 2400, charges: 240, num_trades: 1, capital_deployed: 1000000, note: null },
  { id: "demo-24", trade_date: "2026-01-31", net_pnl: 1000, charges: 100, num_trades: 1, capital_deployed: 1000000, note: null },
] as const;

export const DEMO_DISPLAY_NAME = "Rahul";
export const DEMO_CAPITAL = 1_000_000;
export const DEMO_CURRENCY = "INR";
export const DEMO_CARD_THEME = "light" as const;
