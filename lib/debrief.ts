/**
 * Weekly Debrief analysis engine.
 *
 * Takes a week's trades (with tags) and produces structured insights:
 * - What went well / what hurt
 * - Execution & mood pattern correlations
 * - Scoreboard (P&L, win rate, streak, best/worst day)
 * - A single "constraint" recommendation for next week
 */
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getDay,
  subWeeks,
  subMonths,
  addDays,
} from "date-fns";

export type TradeForDebrief = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
  execution_tag: string | null;
  mood_tag: string | null;
  note: string | null;
};

function getFinalResult(t: TradeForDebrief): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function isWin(t: TradeForDebrief): boolean {
  return getFinalResult(t) > 0;
}

const EXECUTION_LABELS: Record<string, string> = {
  followed_plan: "Followed Plan",
  overtraded: "Overtraded",
  revenge_traded: "Revenge Traded",
  fomo_entry: "FOMO Entry",
  cut_early: "Cut Early",
  stayed_out: "Stayed Out",
  avoided_fomo: "Avoided FOMO",
};

const MOOD_LABELS: Record<string, string> = {
  calm: "Calm",
  confident: "Confident",
  anxious: "Anxious",
  frustrated: "Frustrated",
  tired: "Tired",
};

const POSITIVE_EXECUTION = new Set(["followed_plan", "stayed_out", "avoided_fomo"]);
const NEGATIVE_EXECUTION = new Set(["overtraded", "revenge_traded", "fomo_entry", "cut_early"]);
const POSITIVE_MOOD = new Set(["calm", "confident"]);
const NEGATIVE_MOOD = new Set(["anxious", "frustrated", "tired"]);

export type DebriefInsight = {
  type: "positive" | "negative";
  text: string;
};

export type DebriefDay = {
  date: string;
  dayLabel: string;
  dayShort: string;
  pnl: number;
  numTrades: number;
  executionTags: string[];
  moodTags: string[];
  isWin: boolean;
  isRestDay: boolean;
};

export type WeeklyDebrief = {
  weekRange: string;
  weekStart: string;
  weekEnd: string;
  days: DebriefDay[];
  tradingDays: number;
  restDays: number;

  // Scoreboard
  totalPnl: number;
  avgDailyPnl: number;
  winRate: number | null;
  wins: number;
  losses: number;
  bestDay: { date: string; label: string; pnl: number } | null;
  worstDay: { date: string; label: string; pnl: number } | null;
  totalTrades: number;
  streak: number;

  // vs previous week
  prevWeekPnl: number | null;
  pnlChange: number | null;

  // Insights
  whatWentWell: DebriefInsight[];
  whatHurt: DebriefInsight[];

  // Tag frequency
  topExecutionTag: { tag: string; label: string; count: number } | null;
  topMoodTag: { tag: string; label: string; count: number } | null;

  // Best combo (execution + mood → avg P&L)
  bestCombo: { execution: string; mood: string; avgPnl: number; count: number } | null;
  worstCombo: { execution: string; mood: string; avgPnl: number; count: number } | null;

  // Single constraint for next week
  constraint: string;

  hasEnoughData: boolean;
};

/**
 * Get week bounds (Mon–Sun) for a given Monday date string.
 */
export function getDebriefWeekBounds(mondayStr: string): { start: Date; end: Date } {
  const d = parseISO(mondayStr + "T12:00:00");
  const start = startOfWeek(d, { weekStartsOn: 1 });
  const end = endOfWeek(d, { weekStartsOn: 1 });
  return { start, end };
}

/**
 * Get the Monday of the most recent completed week.
 */
export function getLastCompletedWeekMonday(): string {
  const now = new Date();
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  const lastMonday = subWeeks(thisMonday, 1);
  return format(lastMonday, "yyyy-MM-dd");
}

/**
 * Get the Monday of the current week.
 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  return format(thisMonday, "yyyy-MM-dd");
}

/**
 * Check if the current week is complete (it's Sunday or later).
 */
export function isCurrentWeekComplete(): boolean {
  const now = new Date();
  return getDay(now) === 0; // Sunday
}

function parseTags(tagStr: string | null): string[] {
  if (!tagStr) return [];
  return tagStr.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Build a complete weekly debrief from trades.
 */
export function buildWeeklyDebrief(
  allTrades: TradeForDebrief[],
  mondayStr: string,
  loggingStreak: number,
): WeeklyDebrief {
  const { start, end } = getDebriefWeekBounds(mondayStr);

  const weekTrades = allTrades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start, end });
  });

  const weekRange = `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;

  // Build day-by-day breakdown (Mon–Fri only for display, but include Sat/Sun if traded)
  const dayMap = new Map<string, TradeForDebrief>();
  for (const t of weekTrades) {
    dayMap.set(t.trade_date, t);
  }

  const WEEKDAY_SHORTS = ["M", "T", "W", "T", "F", "S", "S"];
  const days: DebriefDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = format(d, "yyyy-MM-dd");
    const trade = dayMap.get(dateStr);
    const isRestDay = trade ? trade.num_trades === 0 : false;

    days.push({
      date: dateStr,
      dayLabel: format(d, "EEE, d MMM"),
      dayShort: WEEKDAY_SHORTS[i],
      pnl: trade ? getFinalResult(trade) : 0,
      numTrades: trade?.num_trades ?? 0,
      executionTags: trade ? parseTags(trade.execution_tag) : [],
      moodTags: trade ? parseTags(trade.mood_tag) : [],
      isWin: trade ? isWin(trade) : false,
      isRestDay,
    });
  }

  const activeTrades = weekTrades.filter((t) => t.num_trades > 0);
  const tradingDays = activeTrades.length;
  const restDays = weekTrades.length - tradingDays;

  // Scoreboard
  const totalPnl = weekTrades.reduce((s, t) => s + getFinalResult(t), 0);
  const avgDailyPnl = tradingDays > 0 ? totalPnl / tradingDays : 0;
  let wins = 0, losses = 0;
  for (const t of activeTrades) {
    if (isWin(t)) wins++;
    else if (getFinalResult(t) < 0) losses++;
  }
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
  const totalTrades = weekTrades.reduce((s, t) => s + t.num_trades, 0);

  // Best / worst day
  let bestDay: WeeklyDebrief["bestDay"] = null;
  let worstDay: WeeklyDebrief["worstDay"] = null;
  if (activeTrades.length > 0) {
    const sorted = [...activeTrades].sort((a, b) => getFinalResult(b) - getFinalResult(a));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    bestDay = {
      date: best.trade_date,
      label: format(parseISO(best.trade_date), "EEE"),
      pnl: getFinalResult(best),
    };
    worstDay = {
      date: worst.trade_date,
      label: format(parseISO(worst.trade_date), "EEE"),
      pnl: getFinalResult(worst),
    };
  }

  // Previous week comparison
  const prevMonday = format(subWeeks(start, 1), "yyyy-MM-dd");
  const { start: prevStart, end: prevEnd } = getDebriefWeekBounds(prevMonday);
  const prevWeekTrades = allTrades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start: prevStart, end: prevEnd });
  });
  const prevWeekPnl = prevWeekTrades.length > 0
    ? prevWeekTrades.reduce((s, t) => s + getFinalResult(t), 0)
    : null;
  const pnlChange = prevWeekPnl != null ? totalPnl - prevWeekPnl : null;

  // Tag frequency analysis
  const execCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();
  for (const t of weekTrades) {
    for (const tag of parseTags(t.execution_tag)) {
      execCounts.set(tag, (execCounts.get(tag) ?? 0) + 1);
    }
    for (const tag of parseTags(t.mood_tag)) {
      moodCounts.set(tag, (moodCounts.get(tag) ?? 0) + 1);
    }
  }

  const topExecutionTag = execCounts.size > 0
    ? Array.from(execCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
        tag, label: EXECUTION_LABELS[tag] ?? tag, count,
      }))[0]
    : null;

  const topMoodTag = moodCounts.size > 0
    ? Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
        tag, label: MOOD_LABELS[tag] ?? tag, count,
      }))[0]
    : null;

  // Combo analysis: execution × mood → avg P&L
  const combos = new Map<string, { total: number; count: number }>();
  for (const t of activeTrades) {
    const execTags = parseTags(t.execution_tag);
    const moodTagsList = parseTags(t.mood_tag);
    if (execTags.length === 0 || moodTagsList.length === 0) continue;
    for (const exec of execTags) {
      for (const mood of moodTagsList) {
        const key = `${exec}|${mood}`;
        const existing = combos.get(key) ?? { total: 0, count: 0 };
        existing.total += getFinalResult(t);
        existing.count += 1;
        combos.set(key, existing);
      }
    }
  }

  let bestCombo: WeeklyDebrief["bestCombo"] = null;
  let worstCombo: WeeklyDebrief["worstCombo"] = null;
  if (combos.size > 0) {
    const comboArr = Array.from(combos.entries())
      .filter(([, v]) => v.count >= 1)
      .map(([key, v]) => {
        const [exec, mood] = key.split("|");
        return {
          execution: EXECUTION_LABELS[exec] ?? exec,
          mood: MOOD_LABELS[mood] ?? mood,
          avgPnl: v.total / v.count,
          count: v.count,
        };
      })
      .sort((a, b) => b.avgPnl - a.avgPnl);
    if (comboArr.length > 0) bestCombo = comboArr[0];
    if (comboArr.length > 1) worstCombo = comboArr[comboArr.length - 1];
  }

  // Generate insights
  const whatWentWell: DebriefInsight[] = [];
  const whatHurt: DebriefInsight[] = [];

  // Win rate insight
  if (winRate != null && winRate >= 60) {
    whatWentWell.push({ type: "positive", text: `${winRate}% win rate — strong week` });
  } else if (winRate != null && winRate < 40 && wins + losses >= 3) {
    whatHurt.push({ type: "negative", text: `${winRate}% win rate — tough week` });
  }

  // Execution tag insights
  const followedPlanCount = execCounts.get("followed_plan") ?? 0;
  if (followedPlanCount >= 3) {
    whatWentWell.push({ type: "positive", text: `Followed your plan ${followedPlanCount} out of ${tradingDays} days` });
  }

  const overtradedCount = execCounts.get("overtraded") ?? 0;
  if (overtradedCount >= 2) {
    whatHurt.push({ type: "negative", text: `Overtraded on ${overtradedCount} days` });
  }

  const revengeCount = execCounts.get("revenge_traded") ?? 0;
  if (revengeCount >= 1) {
    whatHurt.push({ type: "negative", text: `Revenge traded on ${revengeCount} day${revengeCount > 1 ? "s" : ""}` });
  }

  const fomoCount = execCounts.get("fomo_entry") ?? 0;
  if (fomoCount >= 1) {
    whatHurt.push({ type: "negative", text: `FOMO entries on ${fomoCount} day${fomoCount > 1 ? "s" : ""}` });
  }

  // Mood insights
  const calmCount = moodCounts.get("calm") ?? 0;
  const confidentCount = moodCounts.get("confident") ?? 0;
  if (calmCount + confidentCount >= 3) {
    whatWentWell.push({ type: "positive", text: `Stayed calm/confident ${calmCount + confidentCount} days` });
  }

  const anxiousCount = moodCounts.get("anxious") ?? 0;
  const frustratedCount = moodCounts.get("frustrated") ?? 0;
  if (anxiousCount + frustratedCount >= 2) {
    whatHurt.push({ type: "negative", text: `Felt anxious or frustrated ${anxiousCount + frustratedCount} days` });
  }

  // Best combo insight
  if (bestCombo && bestCombo.avgPnl > 0 && bestCombo.count >= 2) {
    whatWentWell.push({
      type: "positive",
      text: `${bestCombo.execution} + ${bestCombo.mood} = profitable (${bestCombo.count} days)`,
    });
  }

  // Worst combo insight
  if (worstCombo && worstCombo.avgPnl < 0 && worstCombo.count >= 2) {
    whatHurt.push({
      type: "negative",
      text: `${worstCombo.execution} + ${worstCombo.mood} = losses (${worstCombo.count} days)`,
    });
  }

  // Rest day insight
  if (restDays > 0) {
    whatWentWell.push({ type: "positive", text: `Took ${restDays} rest day${restDays > 1 ? "s" : ""} — discipline` });
  }

  // Previous week comparison
  if (pnlChange != null && pnlChange > 0) {
    whatWentWell.push({ type: "positive", text: "Improved over last week" });
  }

  // Generate constraint (single rule for next week)
  let constraint = "Keep logging every day — consistency is the edge.";
  if (revengeCount >= 1) {
    constraint = "No revenge trades. Walk away after a loss.";
  } else if (overtradedCount >= 2) {
    constraint = "Set a max trade limit before market open.";
  } else if (fomoCount >= 1) {
    constraint = "Only take setups from your watchlist. No chasing.";
  } else if (anxiousCount + frustratedCount >= 2) {
    constraint = "If you feel anxious, reduce position size by 50%.";
  } else if (winRate != null && winRate < 40 && wins + losses >= 3) {
    constraint = "Focus on fewer, higher-conviction trades.";
  } else if (followedPlanCount >= 3 && winRate != null && winRate >= 60) {
    constraint = "You're in a groove. Don't change anything — repeat.";
  }

  const hasEnoughData = weekTrades.length >= 3;

  return {
    weekRange,
    weekStart: format(start, "yyyy-MM-dd"),
    weekEnd: format(end, "yyyy-MM-dd"),
    days,
    tradingDays,
    restDays,
    totalPnl,
    avgDailyPnl,
    winRate,
    wins,
    losses,
    bestDay,
    worstDay,
    totalTrades,
    streak: loggingStreak,
    prevWeekPnl,
    pnlChange,
    whatWentWell,
    whatHurt,
    topExecutionTag,
    topMoodTag,
    bestCombo,
    worstCombo,
    constraint,
    hasEnoughData,
  };
}

// ============================================================
// Monthly Debrief
// ============================================================

export type MonthlyDebriefWeek = {
  mondayStr: string;
  range: string;
  pnl: number;
  wins: number;
  losses: number;
  tradingDays: number;
};

export type DayOfWeekStats = {
  day: string;
  avgPnl: number;
  count: number;
};

export type MonthlyDebrief = {
  monthLabel: string;
  monthStart: string;
  monthEnd: string;

  // Scoreboard
  totalPnl: number;
  avgDailyPnl: number;
  winRate: number | null;
  wins: number;
  losses: number;
  tradingDays: number;
  restDays: number;
  totalTrades: number;
  bestDay: { date: string; label: string; pnl: number } | null;
  worstDay: { date: string; label: string; pnl: number } | null;
  streak: number;

  // vs previous month
  prevMonthPnl: number | null;
  pnlChange: number | null;

  // Week-by-week breakdown
  weeks: MonthlyDebriefWeek[];
  avgWeeklyPnl: number;

  // Day-of-week performance
  dayOfWeekStats: DayOfWeekStats[];
  bestDayOfWeek: DayOfWeekStats | null;
  worstDayOfWeek: DayOfWeekStats | null;

  // Insights
  whatWentWell: DebriefInsight[];
  whatHurt: DebriefInsight[];

  // Tag frequency
  topExecutionTag: { tag: string; label: string; count: number } | null;
  topMoodTag: { tag: string; label: string; count: number } | null;
  bestCombo: { execution: string; mood: string; avgPnl: number; count: number } | null;
  worstCombo: { execution: string; mood: string; avgPnl: number; count: number } | null;

  // Theme for next month
  theme: string;

  hasEnoughData: boolean;
};

export function getMonthDebriefBounds(dateStr: string): { start: Date; end: Date } {
  const d = parseISO(dateStr + "T12:00:00");
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export function getCurrentMonthStart(): string {
  return format(startOfMonth(new Date()), "yyyy-MM-dd");
}

export function buildMonthlyDebrief(
  allTrades: TradeForDebrief[],
  monthDateStr: string,
  loggingStreak: number,
): MonthlyDebrief {
  const { start, end } = getMonthDebriefBounds(monthDateStr);

  const monthTrades = allTrades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start, end });
  });

  const monthLabel = format(start, "MMMM yyyy");
  const activeTrades = monthTrades.filter((t) => t.num_trades > 0);
  const tradingDays = activeTrades.length;
  const restDays = monthTrades.length - tradingDays;

  // Scoreboard
  const totalPnl = monthTrades.reduce((s, t) => s + getFinalResult(t), 0);
  const avgDailyPnl = tradingDays > 0 ? totalPnl / tradingDays : 0;
  let wins = 0, losses = 0;
  for (const t of activeTrades) {
    if (isWin(t)) wins++;
    else if (getFinalResult(t) < 0) losses++;
  }
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
  const totalTrades = monthTrades.reduce((s, t) => s + t.num_trades, 0);

  // Best / worst day
  let bestDay: MonthlyDebrief["bestDay"] = null;
  let worstDay: MonthlyDebrief["worstDay"] = null;
  if (activeTrades.length > 0) {
    const sorted = [...activeTrades].sort((a, b) => getFinalResult(b) - getFinalResult(a));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    bestDay = {
      date: best.trade_date,
      label: format(parseISO(best.trade_date), "EEE, d MMM"),
      pnl: getFinalResult(best),
    };
    worstDay = {
      date: worst.trade_date,
      label: format(parseISO(worst.trade_date), "EEE, d MMM"),
      pnl: getFinalResult(worst),
    };
  }

  // Previous month comparison
  const prevMonthDate = format(subMonths(start, 1), "yyyy-MM-dd");
  const { start: prevStart, end: prevEnd } = getMonthDebriefBounds(prevMonthDate);
  const prevMonthTrades = allTrades.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start: prevStart, end: prevEnd });
  });
  const prevMonthPnl = prevMonthTrades.length > 0
    ? prevMonthTrades.reduce((s, t) => s + getFinalResult(t), 0)
    : null;
  const pnlChange = prevMonthPnl != null ? totalPnl - prevMonthPnl : null;

  // Week-by-week breakdown
  const weekMap = new Map<string, MonthlyDebriefWeek>();
  for (const t of monthTrades) {
    const d = parseISO(t.trade_date);
    const monday = startOfWeek(d, { weekStartsOn: 1 });
    const mondayStr = format(monday, "yyyy-MM-dd");
    if (!weekMap.has(mondayStr)) {
      const sunday = addDays(monday, 6);
      weekMap.set(mondayStr, {
        mondayStr,
        range: `${format(monday, "d MMM")} – ${format(sunday, "d MMM")}`,
        pnl: 0,
        wins: 0,
        losses: 0,
        tradingDays: 0,
      });
    }
    const week = weekMap.get(mondayStr)!;
    const result = getFinalResult(t);
    week.pnl += result;
    if (t.num_trades > 0) {
      week.tradingDays += 1;
      if (result > 0) week.wins += 1;
      else if (result < 0) week.losses += 1;
    }
  }
  const weeks = Array.from(weekMap.values()).sort((a, b) => a.mondayStr.localeCompare(b.mondayStr));
  const avgWeeklyPnl = weeks.length > 0
    ? weeks.reduce((s, w) => s + w.pnl, 0) / weeks.length
    : 0;

  // Day-of-week performance
  const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowTotals = new Map<number, { total: number; count: number }>();
  for (const t of activeTrades) {
    const d = parseISO(t.trade_date);
    const dow = getDay(d);
    const existing = dowTotals.get(dow) ?? { total: 0, count: 0 };
    existing.total += getFinalResult(t);
    existing.count += 1;
    dowTotals.set(dow, existing);
  }
  const dayOfWeekStats: DayOfWeekStats[] = [1, 2, 3, 4, 5].map((dow) => {
    const data = dowTotals.get(dow);
    return {
      day: DOW_LABELS[dow],
      avgPnl: data ? data.total / data.count : 0,
      count: data?.count ?? 0,
    };
  }).filter((d) => d.count > 0);

  let bestDayOfWeek: DayOfWeekStats | null = null;
  let worstDayOfWeek: DayOfWeekStats | null = null;
  if (dayOfWeekStats.length > 0) {
    const sorted = [...dayOfWeekStats].sort((a, b) => b.avgPnl - a.avgPnl);
    bestDayOfWeek = sorted[0];
    worstDayOfWeek = sorted[sorted.length - 1];
  }

  // Tag frequency analysis (reuse same logic as weekly)
  const execCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();
  for (const t of monthTrades) {
    for (const tag of parseTags(t.execution_tag)) {
      execCounts.set(tag, (execCounts.get(tag) ?? 0) + 1);
    }
    for (const tag of parseTags(t.mood_tag)) {
      moodCounts.set(tag, (moodCounts.get(tag) ?? 0) + 1);
    }
  }

  const topExecutionTag = execCounts.size > 0
    ? Array.from(execCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
        tag, label: EXECUTION_LABELS[tag] ?? tag, count,
      }))[0]
    : null;

  const topMoodTag = moodCounts.size > 0
    ? Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
        tag, label: MOOD_LABELS[tag] ?? tag, count,
      }))[0]
    : null;

  // Combo analysis
  const combos = new Map<string, { total: number; count: number }>();
  for (const t of activeTrades) {
    const execTags = parseTags(t.execution_tag);
    const moodTagsList = parseTags(t.mood_tag);
    if (execTags.length === 0 || moodTagsList.length === 0) continue;
    for (const exec of execTags) {
      for (const mood of moodTagsList) {
        const key = `${exec}|${mood}`;
        const existing = combos.get(key) ?? { total: 0, count: 0 };
        existing.total += getFinalResult(t);
        existing.count += 1;
        combos.set(key, existing);
      }
    }
  }

  let bestCombo: MonthlyDebrief["bestCombo"] = null;
  let worstCombo: MonthlyDebrief["worstCombo"] = null;
  if (combos.size > 0) {
    const comboArr = Array.from(combos.entries())
      .filter(([, v]) => v.count >= 2)
      .map(([key, v]) => {
        const [exec, mood] = key.split("|");
        return {
          execution: EXECUTION_LABELS[exec] ?? exec,
          mood: MOOD_LABELS[mood] ?? mood,
          avgPnl: v.total / v.count,
          count: v.count,
        };
      })
      .sort((a, b) => b.avgPnl - a.avgPnl);
    if (comboArr.length > 0) bestCombo = comboArr[0];
    if (comboArr.length > 1) worstCombo = comboArr[comboArr.length - 1];
  }

  // Generate insights
  const whatWentWell: DebriefInsight[] = [];
  const whatHurt: DebriefInsight[] = [];

  if (winRate != null && winRate >= 60) {
    whatWentWell.push({ type: "positive", text: `${winRate}% win rate across ${tradingDays} trading days` });
  } else if (winRate != null && winRate < 40 && wins + losses >= 5) {
    whatHurt.push({ type: "negative", text: `${winRate}% win rate — below breakeven` });
  }

  const followedPlanCount = execCounts.get("followed_plan") ?? 0;
  if (followedPlanCount >= 5) {
    whatWentWell.push({ type: "positive", text: `Followed your plan ${followedPlanCount} out of ${tradingDays} days` });
  }

  const overtradedCount = execCounts.get("overtraded") ?? 0;
  if (overtradedCount >= 3) {
    whatHurt.push({ type: "negative", text: `Overtraded on ${overtradedCount} days this month` });
  }

  const revengeCount = execCounts.get("revenge_traded") ?? 0;
  if (revengeCount >= 2) {
    whatHurt.push({ type: "negative", text: `Revenge traded on ${revengeCount} days` });
  }

  const fomoCount = execCounts.get("fomo_entry") ?? 0;
  if (fomoCount >= 2) {
    whatHurt.push({ type: "negative", text: `FOMO entries on ${fomoCount} days` });
  }

  const calmCount = moodCounts.get("calm") ?? 0;
  const confidentCount = moodCounts.get("confident") ?? 0;
  if (calmCount + confidentCount >= 5) {
    whatWentWell.push({ type: "positive", text: `Calm/confident mindset ${calmCount + confidentCount} days` });
  }

  const anxiousCount = moodCounts.get("anxious") ?? 0;
  const frustratedCount = moodCounts.get("frustrated") ?? 0;
  if (anxiousCount + frustratedCount >= 4) {
    whatHurt.push({ type: "negative", text: `Felt anxious or frustrated ${anxiousCount + frustratedCount} days` });
  }

  if (bestCombo && bestCombo.avgPnl > 0 && bestCombo.count >= 3) {
    whatWentWell.push({
      type: "positive",
      text: `${bestCombo.execution} + ${bestCombo.mood} = your winning formula (${bestCombo.count} days)`,
    });
  }

  if (worstCombo && worstCombo.avgPnl < 0 && worstCombo.count >= 3) {
    whatHurt.push({
      type: "negative",
      text: `${worstCombo.execution} + ${worstCombo.mood} = consistent losses (${worstCombo.count} days)`,
    });
  }

  if (bestDayOfWeek && worstDayOfWeek && bestDayOfWeek.day !== worstDayOfWeek.day) {
    if (bestDayOfWeek.avgPnl > 0) {
      whatWentWell.push({ type: "positive", text: `${bestDayOfWeek.day}s are your best day` });
    }
    if (worstDayOfWeek.avgPnl < 0) {
      whatHurt.push({ type: "negative", text: `${worstDayOfWeek.day}s are your weakest day` });
    }
  }

  if (pnlChange != null && pnlChange > 0) {
    whatWentWell.push({ type: "positive", text: "Improved over last month" });
  }

  if (restDays >= 3) {
    whatWentWell.push({ type: "positive", text: `${restDays} rest days — good discipline` });
  }

  // Theme for next month
  let theme = "Stay consistent — keep logging, keep improving.";
  if (revengeCount >= 2) {
    theme = "Eliminate revenge trading. One bad trade doesn't need to become two.";
  } else if (overtradedCount >= 3) {
    theme = "Quality over quantity. Fewer trades, better setups.";
  } else if (fomoCount >= 2) {
    theme = "Patience. Only trade setups you planned before market open.";
  } else if (anxiousCount + frustratedCount >= 4) {
    theme = "Protect your mental game. Size down when emotions run high.";
  } else if (winRate != null && winRate < 40 && wins + losses >= 5) {
    theme = "Back to basics. Review your edge and trade only A+ setups.";
  } else if (followedPlanCount >= 10 && winRate != null && winRate >= 60) {
    theme = "You're doing great. Don't fix what isn't broken — repeat.";
  } else if (bestDayOfWeek && worstDayOfWeek && worstDayOfWeek.avgPnl < 0) {
    theme = `Watch your ${worstDayOfWeek.day}s — consider reducing size or sitting out.`;
  }

  return {
    monthLabel,
    monthStart: format(start, "yyyy-MM-dd"),
    monthEnd: format(end, "yyyy-MM-dd"),
    totalPnl,
    avgDailyPnl,
    winRate,
    wins,
    losses,
    tradingDays,
    restDays,
    totalTrades,
    bestDay,
    worstDay,
    streak: loggingStreak,
    prevMonthPnl,
    pnlChange,
    weeks,
    avgWeeklyPnl,
    dayOfWeekStats,
    bestDayOfWeek,
    worstDayOfWeek,
    whatWentWell,
    whatHurt,
    topExecutionTag,
    topMoodTag,
    bestCombo,
    worstCombo,
    theme,
    hasEnoughData: monthTrades.length >= 5,
  };
}
