import {
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isWithinInterval,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export type TradeForStats = {
  trade_date: string;
  net_pnl: number;
  charges: number | null;
};

/**
 * Get Monday 00:00 and Sunday 23:59:59 for the current week in the user's timezone.
 * Week = Monday to Sunday per cursorrules.
 */
export function getWeekBounds(timezone: string): { start: Date; end: Date } {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const start = startOfWeek(zonedNow, { weekStartsOn: 1 });
  const end = endOfWeek(zonedNow, { weekStartsOn: 1 });
  return { start, end };
}

/**
 * Final result for a trade: Net P&L if charges exist, else P&L.
 * Per cursorrules: "Final result = Net P&L if charges exist, else P&L."
 */
function getFinalResult(t: TradeForStats): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

/**
 * Check if a trade is a win (final result > 0), loss (< 0), or ignore (= 0).
 */
function isWin(t: TradeForStats): boolean {
  return getFinalResult(t) > 0;
}

function isLoss(t: TradeForStats): boolean {
  return getFinalResult(t) < 0;
}

/**
 * Sum P&L for this week's trades. Uses final result (net of charges) per day.
 */
export function getWeekPnl(
  trades: TradeForStats[],
  weekStart: Date,
  weekEnd: Date
): number {
  return trades.reduce((sum, t) => {
    const d = parseISO(t.trade_date);
    if (!isWithinInterval(d, { start: weekStart, end: weekEnd })) return sum;
    return sum + getFinalResult(t);
  }, 0);
}

/**
 * Win rate for this week: win_days / (win_days + loss_days) * 100.
 * Days with final result = 0 are ignored.
 */
export function getWeekWinRate(
  trades: TradeForStats[],
  weekStart: Date,
  weekEnd: Date
): number | null {
  const weekTrades = trades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  let wins = 0;
  let losses = 0;
  for (const t of weekTrades) {
    if (isWin(t)) wins++;
    else if (isLoss(t)) losses++;
  }

  const total = wins + losses;
  if (total === 0) return null;
  return Math.round((wins / total) * 100);
}

/**
 * Current streak: consecutive days with logged profit, counting backwards from most recent trade.
 * Per cursorrules: "Consecutive days with logged profit (final result > 0)."
 * Streak requires consecutive calendar days.
 */
export function getCurrentStreak(trades: TradeForStats[]): number {
  if (trades.length === 0) return 0;

  const byDate = new Map<string, TradeForStats>();
  for (const t of trades) {
    byDate.set(t.trade_date, t);
  }

  const sortedDates = Array.from(byDate.keys()).sort().reverse();
  const mostRecent = sortedDates[0];
  const mostRecentTrade = byDate.get(mostRecent)!;
  if (!isWin(mostRecentTrade)) return 0;

  let streak = 1;
  let current = parseISO(mostRecent);

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = subDays(current, 1);
    const prevStr = format(prev, "yyyy-MM-dd");
    const prevTrade = byDate.get(prevStr);
    if (!prevTrade || !isWin(prevTrade)) break;
    streak++;
    current = prev;
  }

  return streak;
}
