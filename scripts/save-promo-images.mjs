/**
 * Fetches promo OG card images from the running dev server
 * and saves them as static PNGs in public/promo/.
 * Generates both light and dark variants for hero + gallery.
 *
 * Usage: node scripts/save-promo-images.mjs
 * Requires: dev server running on localhost:3000
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:3000";

const baseParams = {
  daily: {
    handle: "@iamrahulx0",
    currency: "INR",
    date: "2nd Jan, 2026",
    pnl: "+2,000",
    charges: "200",
    netPnl: "+1,800",
    netRoi: "+0.18%",
    trades: "2",
    streak: "0",
  },
  weekly: {
    handle: "@iamrahulx0",
    currency: "INR",
    range: "12 – 18 Jan, 2026",
    pnl: "+5,360",
    roi: "+0.54%",
    winRate: "60%",
    wl: "3W · 2L",
    totalTrades: "9",
    days: JSON.stringify([
      { day: "M", pnl: 0, win: false },
      { day: "T", pnl: -1500, win: false },
      { day: "W", pnl: 3010, win: true },
      { day: "T", pnl: 2250, win: true },
      { day: "F", pnl: 2700, win: true },
      { day: "S", pnl: -1100, win: false },
      { day: "S", pnl: 0, win: false },
    ]),
    bestDay: "Wed +3,010",
  },
  monthly: {
    handle: "@iamrahulx0",
    currency: "INR",
    month: "January 2026",
    pnl: "+16,726",
    roi: "+1.67%",
    winRate: "61%",
    wl: "14W · 9L",
    best: "1st +6,500",
    worst: "21st -3,200",
    calendar: JSON.stringify({
      1: 6500, 2: 1800, 3: -1500, 6: 3627, 7: -550,
      8: 1539, 9: 1120, 10: -1800, 13: -1500, 14: 3010, 15: 2250,
      16: 2700, 17: -1100, 20: 1250, 21: -3200, 22: 900, 23: -1400,
      24: 1850, 27: 1800, 28: -1430, 29: -2200, 30: 2160, 31: 900,
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

for (const type of ["daily", "weekly", "monthly"]) {
  for (const theme of ["light", "dark"]) {
    const params = { ...baseParams[type], theme };
    const url = new URL(`/api/og/${type}`, BASE);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const suffix = theme === "dark" ? "-dark" : "";
    const filename = `${type}${suffix}.png`;

    console.log(`Fetching ${type} (${theme})...`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`  ✗ ${filename}: ${res.status} ${res.statusText}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = resolve(process.cwd(), `public/promo/${filename}`);
    writeFileSync(outPath, buf);
    console.log(`  ✓ Saved ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

console.log("\nDone! Static promo images saved to public/promo/");
