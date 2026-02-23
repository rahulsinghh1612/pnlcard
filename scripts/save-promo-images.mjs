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

// Profit params – daily ~₹4.5–5k, weekly 5 trading days
const profitParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "31st Jan, 2026",
    pnl: "+4,600",
    charges: "100",
    netPnl: "+4,500",
    netRoi: "+0.45%",
    trades: "3",
    streak: "2",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "27 Jan – 2 Feb, 2026",
    pnl: "+5,200",
    roi: "+0.52%",
    winRate: "80%",
    wl: "4W · 1L",
    totalTrades: "5",
    days: JSON.stringify([
      { day: "M", pnl: 1200, win: true },
      { day: "T", pnl: 900, win: true },
      { day: "W", pnl: 1500, win: true },
      { day: "T", pnl: -800, win: false },
      { day: "F", pnl: 1800, win: true },
      { day: "S", pnl: 0, win: false },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Fri +1,800",
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

// Loss params – daily ~₹3–4k, weekly 5 trading days
const lossParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "31st Dec, 2025",
    pnl: "-3,400",
    charges: "100",
    netPnl: "-3,500",
    netRoi: "-0.35%",
    trades: "4",
    streak: "0",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "22 – 28 Dec, 2025",
    pnl: "-3,600",
    roi: "-0.36%",
    winRate: "20%",
    wl: "1W · 4L",
    totalTrades: "5",
    days: JSON.stringify([
      { day: "M", pnl: -800, win: false },
      { day: "T", pnl: -1200, win: false },
      { day: "W", pnl: 600, win: true },
      { day: "T", pnl: -1100, win: false },
      { day: "F", pnl: -1100, win: false },
      { day: "S", pnl: 0, win: false },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Wed +600",
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
