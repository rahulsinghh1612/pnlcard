/**
 * Fetches promo OG card images from the running dev server
 * and saves them as static PNGs in public/promo/.
 * Generates profit + loss variants for both light and dark themes.
 *
 * Params derived from lib/demo-trades.ts (Jan 2026 profit, Dec 2025 loss).
 *
 * Usage: node scripts/save-promo-images.mjs
 * Requires: dev server running on localhost:3000
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";

// Profit params from DEMO_TRADES (January 2026)
const profitParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "31st Jan, 2026",
    pnl: "+1,000",
    charges: "100",
    netPnl: "+900",
    netRoi: "+0.09%",
    trades: "1",
    streak: "0",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "27 Jan – 2 Feb, 2026",
    pnl: "+1,520",
    roi: "+0.15%",
    winRate: "67%",
    wl: "2W · 1L",
    totalTrades: "4",
    days: JSON.stringify([
      { day: "M", pnl: 0, win: false },
      { day: "T", pnl: 2750, win: true },
      { day: "W", pnl: 0, win: false },
      { day: "T", pnl: -2130, win: false },
      { day: "F", pnl: 0, win: false },
      { day: "S", pnl: 900, win: true },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Tue +2,750",
  },
  monthly: {
    handle: "@iamrahulx0",
    currency: "INR",
    month: "January 2026",
    pnl: "+10,090",
    roi: "+1.01%",
    winRate: "60%",
    wl: "9W · 6L",
    best: "15th +3,250",
    worst: "1st -2,700",
    calendar: JSON.stringify({
      1: -2700, 2: 3250, 5: 2600, 7: -1650, 8: 2900, 10: -1950,
      13: 2400, 15: 3250, 16: -2180, 20: 1650, 22: -1100, 24: 2300,
      27: 2750, 29: -2130, 31: 900,
    }),
    calendarGrid: JSON.stringify([
      null, null, null, 1, 2, 3, 4,
      5, 6, 7, 8, 9, 10, 11,
      12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25,
      26, 27, 28, 29, 30, 31, null,
    ]),
  },
};

// Loss params from DEMO_TRADES_DEC_2025 (December 2025)
const lossParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "31st Dec, 2025",
    pnl: "-1,600",
    charges: "130",
    netPnl: "-1,730",
    netRoi: "-0.17%",
    trades: "2",
    streak: "0",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "22 – 28 Dec, 2025",
    pnl: "-3,980",
    roi: "-0.40%",
    winRate: "33%",
    wl: "1W · 2L",
    totalTrades: "3",
    days: JSON.stringify([
      { day: "M", pnl: 0, win: false },
      { day: "T", pnl: -3750, win: false },
      { day: "W", pnl: 1720, win: true },
      { day: "T", pnl: 0, win: false },
      { day: "F", pnl: -1950, win: false },
      { day: "S", pnl: 0, win: false },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Wed +1,720",
  },
  monthly: {
    handle: "@iamrahulx0",
    currency: "INR",
    month: "December 2025",
    pnl: "-8,090",
    roi: "-0.81%",
    winRate: "40%",
    wl: "6W · 9L",
    best: "7th +3,900",
    worst: "11th -3,750",
    calendar: JSON.stringify({
      1: -2700, 3: 2350, 5: -3450, 9: 2620, 11: -1620, 13: -3000,
      15: 3900, 17: -1300, 18: -2150, 19: 1370, 23: -3750, 24: 1720,
      26: -1950, 29: 1700, 31: -1730,
    }),
    calendarGrid: JSON.stringify([
      null, 1, 2, 3, 4, 5, 6,
      7, 8, 9, 10, 11, 12, 13,
      14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, null, null, null,
    ]),
  },
};

const promoDir = resolve(process.cwd(), "public/promo");
try {
  mkdirSync(promoDir, { recursive: true });
} catch {}

for (const variant of ["profit", "loss"]) {
  const baseParams = variant === "loss" ? lossParams : profitParams;
  const variantSuffix = variant === "loss" ? "-loss" : "";

  for (const type of ["daily", "weekly", "monthly"]) {
    for (const theme of ["light", "dark"]) {
      const params = { ...baseParams[type], theme };
      const url = new URL(`/api/og/${type}`, BASE);
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }

      const themeSuffix = theme === "dark" ? "-dark" : "";
      const filename = `${type}${variantSuffix}${themeSuffix}.png`;

      console.log(`Fetching ${type} (${variant}, ${theme})...`);
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.error(`  ✗ ${filename}: ${res.status} ${res.statusText}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const outPath = resolve(promoDir, filename);
      writeFileSync(outPath, buf);
      console.log(`  ✓ Saved ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
    }
  }
}

console.log("\nDone! Static promo images saved to public/promo/");
