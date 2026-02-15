/**
 * Helpers to compute card data from trades for Daily, Weekly, Monthly cards.
 *
 * Why: The OG API routes accept query params. This module builds those params
 * from trade data so the dashboard can generate the correct API URLs.
 */
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subDays,
  getDay,
  getDate,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export type TradeForCard = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
};

function getFinalResult(t: TradeForCard): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function isWin(t: TradeForCard): boolean {
  return getFinalResult(t) > 0;
}

/**
 * Format P&L for display: +21,294 or -8,430
 *
 * Why no currency symbol: Satori (the image generator) uses a default
 * Latin font that doesn't include ₹ (Rupee sign). Including it causes
 * "Failed to load dynamic font" errors. The card labels already show
 * the currency, so the value doesn't need the symbol.
 */
export function formatPnl(value: number, currency: string): string {
  const abs = Math.abs(value);
  const formatted =
    currency === "INR"
      ? abs.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : abs.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatted}`;
}

/**
 * Format date for card: "12th Feb, 2026"
 *
 * Why the single quotes around the suffix: In date-fns, letters like
 * t, h, s are format tokens (timestamp, hour, second). Wrapping the
 * suffix in single quotes tells date-fns to treat them as literal text.
 * Without this, "dth" would output day + timestamp + hour = garbage.
 */
export function formatDateForCard(dateStr: string): string {
  const d = parseISO(dateStr);
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return format(d, `d'${suffix}' MMM, yyyy`);
}

/** Streak up to and including the given date (from user's trades) */
export function getStreakUpToDate(
  trades: TradeForCard[],
  targetDateStr: string,
  timezone: string
): number {
  const byDate = new Map<string, TradeForCard>();
  for (const t of trades) {
    byDate.set(t.trade_date, t);
  }
  const sortedDates = Array.from(byDate.keys()).sort().reverse();
  const targetIdx = sortedDates.indexOf(targetDateStr);
  if (targetIdx < 0) return 0;

  const targetTrade = byDate.get(targetDateStr);
  if (!targetTrade || !isWin(targetTrade)) return 0;

  let streak = 1;
  let current = parseISO(targetDateStr);

  for (let i = targetIdx + 1; i < sortedDates.length; i++) {
    const prev = subDays(current, 1);
    const prevStr = format(prev, "yyyy-MM-dd");
    const prevTrade = byDate.get(prevStr);
    if (!prevTrade || !isWin(prevTrade)) break;
    streak++;
    current = prev;
  }
  return streak;
}

/** Week bounds (Mon–Sun) for a given date in user timezone */
export function getWeekBoundsForDate(
  dateStr: string,
  timezone: string
): { start: Date; end: Date } {
  const d = parseISO(dateStr + "T12:00:00");
  const zoned = toZonedTime(d, timezone);
  const start = startOfWeek(zoned, { weekStartsOn: 1 });
  const end = endOfWeek(zoned, { weekStartsOn: 1 });
  return { start, end };
}

/** Month bounds for a given date */
export function getMonthBoundsForDate(
  dateStr: string,
  timezone: string
): { start: Date; end: Date } {
  const d = parseISO(dateStr + "T12:00:00");
  const zoned = toZonedTime(d, timezone);
  const start = startOfMonth(zoned);
  const end = endOfMonth(zoned);
  return { start, end };
}

export type DailyCardParams = {
  date: string;
  pnl: string;
  charges: string | null;
  netPnl: string;
  netRoi: string | null;
  trades: string;
  streak: number;
  handle: string | null;
  theme: string;
  currency: string;
  tradeId: string;
};

export function buildDailyCardParams(
  trade: TradeForCard,
  trades: TradeForCard[],
  profile: {
    x_handle: string | null;
    trading_capital: number | null;
    card_theme: string;
    currency: string;
    timezone?: string;
  }
): DailyCardParams {
  const finalResult = getFinalResult(trade);
  const capital =
    trade.capital_deployed ?? profile.trading_capital;
  const netPnl = trade.charges != null ? finalResult : trade.net_pnl;
  const roi =
    capital != null && capital > 0
      ? (netPnl / capital) * 100
      : null;

  const pnlFormatted = formatPnl(trade.net_pnl, profile.currency);
  const netPnlFormatted = formatPnl(netPnl, profile.currency);
  const roiFormatted = roi != null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%` : null;

  const timezone = profile.timezone ?? "Asia/Kolkata";
  const streak = getStreakUpToDate(trades, trade.trade_date, timezone);

  return {
    date: formatDateForCard(trade.trade_date),
    pnl: pnlFormatted,
    charges: trade.charges != null ? String(trade.charges) : null,
    netPnl: netPnlFormatted,
    netRoi: roiFormatted,
    trades: String(trade.num_trades),
    streak,
    handle: profile.x_handle,
    theme: profile.card_theme,
    currency: profile.currency,
    tradeId: trade.id,
  };
}

export type WeeklyCardParams = {
  range: string;
  pnl: string;
  roi: string | null;
  winRate: string;
  wl: string;
  days: Array<{ day: string; pnl: number; win: boolean }>;
  bestDay: string;
  handle: string | null;
  theme: string;
  currency: string;
};

const WEEKDAY_LABELS: Record<number, string> = {
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
};

export function buildWeeklyCardParams(
  trades: TradeForCard[],
  dateStr: string,
  profile: {
    x_handle: string | null;
    trading_capital: number | null;
    card_theme: string;
    currency: string;
    timezone?: string;
  }
): WeeklyCardParams | null {
  const timezone = profile.timezone ?? "Asia/Kolkata";
  const { start, end } = getWeekBoundsForDate(dateStr, timezone);
  const weekTrades = trades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start, end });
  });
  if (weekTrades.length === 0) return null;

  const capital = profile.trading_capital;
  const totalPnl = weekTrades.reduce((s, t) => s + getFinalResult(t), 0);
  let wins = 0,
    losses = 0;
  for (const t of weekTrades) {
    if (isWin(t)) wins++;
    else if (getFinalResult(t) < 0) losses++;
  }
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const roi =
    capital != null && capital > 0
      ? (totalPnl / capital) * 100
      : null;

  const dayOrder = [1, 2, 3, 4, 5]; // Mon–Fri
  const byWeekday = new Map<number, TradeForCard>();
  for (const t of weekTrades) {
    const d = parseISO(t.trade_date);
    const day = getDay(d);
    const monFri = day === 0 ? 7 : day;
    if (monFri >= 1 && monFri <= 5) {
      byWeekday.set(monFri, t);
    }
  }

  const days: Array<{ day: string; pnl: number; win: boolean }> = dayOrder.map(
    (d) => {
      const t = byWeekday.get(d);
      if (!t) {
        return { day: WEEKDAY_LABELS[d] ?? "?", pnl: 0, win: false };
      }
      const res = getFinalResult(t);
      return {
        day: WEEKDAY_LABELS[d] ?? "?",
        pnl: res,
        win: res > 0,
      };
    }
  );

  const bestTrade = weekTrades.reduce((a, b) =>
    getFinalResult(a) > getFinalResult(b) ? a : b
  );
  const bestDayName = format(parseISO(bestTrade.trade_date), "EEE");
  const bestDayVal = formatPnl(getFinalResult(bestTrade), profile.currency);
  const bestDay = `${bestDayName} ${bestDayVal}`;

  const range = `${format(start, "d MMM")} – ${format(end, "d MMM, yyyy")}`;

  return {
    range,
    pnl: formatPnl(totalPnl, profile.currency),
    roi: roi != null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%` : null,
    winRate: `${winRate}%`,
    wl: `${wins}W · ${losses}L`,
    days,
    bestDay,
    handle: profile.x_handle,
    theme: profile.card_theme,
    currency: profile.currency,
  };
}

export type MonthlyCardParams = {
  month: string;
  pnl: string;
  roi: string | null;
  winRate: string;
  wl: string;
  best: string;
  worst: string;
  calendar: Record<string, number>;
  /** Monday-first grid: null for empty cells, day number (1–31) for cells. Length is multiple of 7. */
  calendarGrid: (number | null)[];
  handle: string | null;
  theme: string;
  currency: string;
};

export function buildMonthlyCardParams(
  trades: TradeForCard[],
  dateStr: string,
  profile: {
    x_handle: string | null;
    trading_capital: number | null;
    card_theme: string;
    currency: string;
    timezone?: string;
  }
): MonthlyCardParams | null {
  const timezone = profile.timezone ?? "Asia/Kolkata";
  const { start, end } = getMonthBoundsForDate(dateStr, timezone);
  const monthTrades = trades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start, end });
  });
  if (monthTrades.length === 0) return null;

  const capital = profile.trading_capital;
  const totalPnl = monthTrades.reduce((s, t) => s + getFinalResult(t), 0);
  let wins = 0,
    losses = 0;
  for (const t of monthTrades) {
    if (isWin(t)) wins++;
    else if (getFinalResult(t) < 0) losses++;
  }
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const roi =
    capital != null && capital > 0
      ? (totalPnl / capital) * 100
      : null;

  const calendar: Record<string, number> = {};
  for (const t of monthTrades) {
    const day = parseISO(t.trade_date).getDate();
    calendar[day] = getFinalResult(t);
  }

  const daysInMonth = getDate(end);
  const firstDayOfMonth = getDay(start);
  const mondayFirstOffset = (firstDayOfMonth + 6) % 7;
  const calendarGrid: (number | null)[] = [];
  for (let i = 0; i < mondayFirstOffset; i++) calendarGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);
  while (calendarGrid.length % 7 !== 0) calendarGrid.push(null);

  const withResults = monthTrades.map((t) => ({
    trade: t,
    result: getFinalResult(t),
  }));
  const best = withResults.reduce((a, b) =>
    a.result > b.result ? a : b
  );
  const worst = withResults.reduce((a, b) =>
    a.result < b.result ? a : b
  );

  const bestStr = `${format(parseISO(best.trade.trade_date), "do")} · ${formatPnl(best.result, profile.currency)}`;
  const worstStr = `${format(parseISO(worst.trade.trade_date), "do")} · ${formatPnl(worst.result, profile.currency)}`;

  return {
    month: format(start, "MMMM yyyy"),
    pnl: formatPnl(totalPnl, profile.currency),
    roi: roi != null ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%` : null,
    winRate: `${winRate}%`,
    wl: `${wins}W · ${losses}L`,
    best: bestStr,
    worst: worstStr,
    calendar,
    calendarGrid,
    handle: profile.x_handle,
    theme: profile.card_theme,
    currency: profile.currency,
  };
}
