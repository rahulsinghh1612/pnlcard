/**
 * Fetches promo OG card images from the running dev server
 * and saves them as static PNGs in public/promo/.
 * Generates profit + loss variants for both light and dark themes.
 *
 * Data derived from lib/demo-trades.ts — same trades power the
 * calendar heatmap demo and these promo card images.
 *
 * Usage: node scripts/save-promo-images.mjs
 * Requires: dev server running on localhost:3000
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";

// Profit params — derived from Jan 2026 demo trades (capital: 10L)
const profitParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "2nd Jan, 2026",
    pnl: "+8,650",
    charges: "250",
    netPnl: "+8,400",
    netRoi: "+0.84%",
    trades: "2",
    streak: "2",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "5 Jan – 11 Jan, 2026",
    pnl: "+11,400",
    roi: "+1.14%",
    winRate: "60%",
    wl: "3W · 2L",
    totalTrades: "8",
    days: JSON.stringify([
      { day: "M", pnl: 5800, win: true },
      { day: "T", pnl: -3400, win: false },
      { day: "W", pnl: 10000, win: true },
      { day: "T", pnl: 0, win: false },
      { day: "F", pnl: -2800, win: false },
      { day: "S", pnl: 1800, win: true },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Wed +10,000",
  },
  monthly: {
    handle: "@iamrahulx0",
    currency: "INR",
    month: "January 2026",
    pnl: "+65,000",
    roi: "+6.50%",
    winRate: "71%",
    wl: "15W · 6L",
    best: "7th · +10,000",
    worst: "16th · -3,600",
    calendar: JSON.stringify({
      2: 8400, 3: 2200, 5: 5800, 6: -3400, 7: 10000,
      9: -2800, 10: 1800, 12: 6400, 14: 5200, 15: 7200,
      16: -3600, 19: 7600, 20: -2400, 21: 4800, 22: -3200,
      23: 7600, 27: 6800, 28: -2600, 29: 3400, 30: 5600, 31: 1600,
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

// Loss params — derived from Dec 2025 demo trades (capital: 10L)
const lossParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "30th Dec, 2025",
    pnl: "-7,000",
    charges: "200",
    netPnl: "-7,200",
    netRoi: "-0.72%",
    trades: "3",
    streak: "0",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "8 Dec – 14 Dec, 2025",
    pnl: "-10,000",
    roi: "-1.00%",
    winRate: "40%",
    wl: "2W · 3L",
    totalTrades: "10",
    days: JSON.stringify([
      { day: "M", pnl: -3200, win: false },
      { day: "T", pnl: 0, win: false },
      { day: "W", pnl: -7400, win: false },
      { day: "T", pnl: 4800, win: true },
      { day: "F", pnl: -5400, win: false },
      { day: "S", pnl: 1200, win: true },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Thu +4,800",
  },
  monthly: {
    handle: "@iamrahulx0",
    currency: "INR",
    month: "December 2025",
    pnl: "-35,000",
    roi: "-3.50%",
    winRate: "42%",
    wl: "8W · 11L",
    best: "11th · +4,800",
    worst: "10th · -7,400",
    calendar: JSON.stringify({
      1: -5200, 2: 3600, 4: -5800, 5: 2400, 6: -2600,
      8: -3200, 10: -7400, 11: 4800, 12: -5400, 13: 1200,
      15: 3200, 16: -6600, 18: 2800, 19: -3800, 22: -5600,
      23: 3400, 24: -6200, 29: 2600, 30: -7200,
    }),
    calendarGrid: JSON.stringify([
      1, 2, 3, 4, 5, 6, 7,
      8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28,
      29, 30, 31, null, null, null, null,
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
