/**
 * Weekly & Monthly Debrief analysis engine.
 *
 * Takes a week/month's trades and produces structured insights:
 * - Discipline score analytics
 * - Mistake cost analysis
 * - Scoreboard (P&L, win rate, streak, best/worst day)
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
  addMonths,
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
  discipline_score: number | null;
  note: string | null;
};

function getFinalResult(t: TradeForDebrief): number {
  return t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
}

function isWin(t: TradeForDebrief): boolean {
  return getFinalResult(t) > 0;
}

const MISTAKE_LABELS: Record<string, string> = {
  overtraded: "Overtraded",
  fomo_entry: "FOMO Entry",
  no_stop_loss: "Didn't Respect Stop Loss",
};

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
  mistakeTags: string[];
  disciplineScore: number | null;
  isWin: boolean;
  isRestDay: boolean;
};

export type WeeklyPnlPoint = {
  weekLabel: string;
  pnl: number;
  isCurrent: boolean;
};

export type DisciplineScatterPoint = {
  score: number;
  pnl: number;
  date: string;
  dayLabel: string;
};

export type MistakeFrequency = {
  label: string;
  tag: string;
  count: number;
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

  // Single constraint for next week
  constraint: string;

  // Analytics
  weeklyPnlTrend: WeeklyPnlPoint[];
  avgDisciplineScore: number | null;
  disciplineScatter: DisciplineScatterPoint[];
  mistakeFrequency: MistakeFrequency[];
  totalMistakeDays: number;

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
  return getDay(now) === 0;
}

function parseTags(tagStr: string | null): string[] {
  if (!tagStr) return [];
  return tagStr.split(",").map((s) => s.trim()).filter(Boolean);
}

function computeDisciplineScatter(trades: TradeForDebrief[]): DisciplineScatterPoint[] {
  return trades
    .filter((t) => t.num_trades > 0 && t.discipline_score != null)
    .map((t) => ({
      score: t.discipline_score!,
      pnl: getFinalResult(t),
      date: t.trade_date,
      dayLabel: format(parseISO(t.trade_date), "EEE, d MMM"),
    }));
}

function computeMistakeFrequency(trades: TradeForDebrief[]): MistakeFrequency[] {
  const ALL_MISTAKES = ["overtraded", "fomo_entry", "no_stop_loss"];
  const countMap = new Map<string, number>();

  for (const t of trades) {
    if (t.num_trades === 0) continue;
    for (const tag of parseTags(t.execution_tag)) {
      countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
    }
  }

  return ALL_MISTAKES.map((tag) => ({
    label: MISTAKE_LABELS[tag] ?? tag,
    tag,
    count: countMap.get(tag) ?? 0,
  }));
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

  const dayMap = new Map<string, TradeForDebrief>();
  for (const t of weekTrades) {
    dayMap.set(t.trade_date, t);
  }

  const WEEKDAY_SHORTS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
      mistakeTags: trade ? parseTags(trade.execution_tag) : [],
      disciplineScore: trade?.discipline_score ?? null,
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

  // Mistake frequency
  const mistakeCounts = new Map<string, number>();
  for (const t of weekTrades) {
    for (const tag of parseTags(t.execution_tag)) {
      mistakeCounts.set(tag, (mistakeCounts.get(tag) ?? 0) + 1);
    }
  }

  // Generate insights
  const whatWentWell: DebriefInsight[] = [];
  const whatHurt: DebriefInsight[] = [];

  if (winRate != null && winRate >= 60) {
    whatWentWell.push({ type: "positive", text: `${winRate}% win rate — strong week` });
  } else if (winRate != null && winRate < 40 && wins + losses >= 3) {
    whatHurt.push({ type: "negative", text: `${winRate}% win rate — tough week` });
  }

  // Discipline insights
  const scoredTrades = activeTrades.filter((t) => t.discipline_score != null);
  if (scoredTrades.length > 0) {
    const avgScore = scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length;
    if (avgScore >= 4) {
      whatWentWell.push({ type: "positive", text: `Avg discipline ${avgScore.toFixed(1)}/5 — very disciplined` });
    } else if (avgScore <= 2) {
      whatHurt.push({ type: "negative", text: `Avg discipline ${avgScore.toFixed(1)}/5 — needs improvement` });
    }
  }

  // Mistake insights
  const overtradedCount = mistakeCounts.get("overtraded") ?? 0;
  if (overtradedCount >= 2) {
    whatHurt.push({ type: "negative", text: `Overtraded on ${overtradedCount} days` });
  }

  const fomoCount = mistakeCounts.get("fomo_entry") ?? 0;
  if (fomoCount >= 1) {
    whatHurt.push({ type: "negative", text: `FOMO entries on ${fomoCount} day${fomoCount > 1 ? "s" : ""}` });
  }

  const noStopCount = mistakeCounts.get("no_stop_loss") ?? 0;
  if (noStopCount >= 1) {
    whatHurt.push({ type: "negative", text: `Didn't respect stop loss on ${noStopCount} day${noStopCount > 1 ? "s" : ""}` });
  }

  const totalMistakes = overtradedCount + fomoCount + noStopCount;
  if (totalMistakes === 0 && tradingDays >= 3) {
    whatWentWell.push({ type: "positive", text: "Zero mistakes logged — clean week" });
  }

  // Rest day insight
  if (restDays > 0) {
    whatWentWell.push({ type: "positive", text: `Took ${restDays} rest day${restDays > 1 ? "s" : ""} — discipline` });
  }

  if (pnlChange != null && pnlChange > 0) {
    whatWentWell.push({ type: "positive", text: "Improved over last week" });
  }

  // Generate constraint
  let constraint = "Keep logging every day — consistency is the edge.";
  if (noStopCount >= 1) {
    constraint = "Always respect your stop loss. No exceptions.";
  } else if (overtradedCount >= 2) {
    constraint = "Set a max trade limit before market open.";
  } else if (fomoCount >= 1) {
    constraint = "Only take setups from your watchlist. No chasing.";
  } else if (winRate != null && winRate < 40 && wins + losses >= 3) {
    constraint = "Focus on fewer, higher-conviction trades.";
  } else if (scoredTrades.length > 0) {
    const avgScore = scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length;
    if (avgScore >= 4 && winRate != null && winRate >= 60) {
      constraint = "You're in a groove. Don't change anything — repeat.";
    }
  }

  const hasEnoughData = weekTrades.length >= 3;

  // Weekly P&L trend (last 6 weeks including current)
  const weeklyPnlTrend: WeeklyPnlPoint[] = [];
  for (let w = 5; w >= 0; w--) {
    const wMonday = subWeeks(start, w);
    const wSunday = endOfWeek(wMonday, { weekStartsOn: 1 });
    const wTrades = allTrades.filter((t) => {
      const d = parseISO(t.trade_date);
      return isWithinInterval(d, { start: wMonday, end: wSunday });
    });
    const wPnl = wTrades.reduce((s, t) => s + getFinalResult(t), 0);
    weeklyPnlTrend.push({
      weekLabel: `${format(wMonday, "d")}–${format(wSunday, "d MMM")}`,
      pnl: wPnl,
      isCurrent: w === 0,
    });
  }

  // Discipline analytics
  const avgDisciplineScore =
    scoredTrades.length > 0
      ? scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length
      : null;

  const disciplineScatter = computeDisciplineScatter(weekTrades);
  const mistakeFrequency = computeMistakeFrequency(weekTrades);
  const totalMistakeDays = weekTrades.filter(
    (t) => t.num_trades > 0 && parseTags(t.execution_tag).length > 0,
  ).length;

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
    constraint,
    weeklyPnlTrend,
    avgDisciplineScore,
    disciplineScatter,
    mistakeFrequency,
    totalMistakeDays,
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

export type MonthlyPnlPoint = {
  monthLabel: string;
  pnl: number;
  isCurrent: boolean;
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

  // Theme for next month
  theme: string;

  // Analytics
  monthlyPnlTrend: MonthlyPnlPoint[];
  avgDisciplineScore: number | null;
  disciplineScatter: DisciplineScatterPoint[];
  mistakeFrequency: MistakeFrequency[];
  totalMistakeDays: number;

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

  // Mistake frequency
  const mistakeCounts = new Map<string, number>();
  for (const t of monthTrades) {
    for (const tag of parseTags(t.execution_tag)) {
      mistakeCounts.set(tag, (mistakeCounts.get(tag) ?? 0) + 1);
    }
  }

  // Generate insights
  const whatWentWell: DebriefInsight[] = [];
  const whatHurt: DebriefInsight[] = [];

  if (winRate != null && winRate >= 60) {
    whatWentWell.push({ type: "positive", text: `${winRate}% win rate across ${tradingDays} trading days` });
  } else if (winRate != null && winRate < 40 && wins + losses >= 5) {
    whatHurt.push({ type: "negative", text: `${winRate}% win rate — below breakeven` });
  }

  // Discipline insights
  const scoredTrades = activeTrades.filter((t) => t.discipline_score != null);
  if (scoredTrades.length > 0) {
    const avgScore = scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length;
    if (avgScore >= 4) {
      whatWentWell.push({ type: "positive", text: `Avg discipline ${avgScore.toFixed(1)}/5 — consistently disciplined` });
    } else if (avgScore <= 2) {
      whatHurt.push({ type: "negative", text: `Avg discipline ${avgScore.toFixed(1)}/5 — needs improvement` });
    }
  }

  const overtradedCount = mistakeCounts.get("overtraded") ?? 0;
  if (overtradedCount >= 3) {
    whatHurt.push({ type: "negative", text: `Overtraded on ${overtradedCount} days this month` });
  }

  const fomoCount = mistakeCounts.get("fomo_entry") ?? 0;
  if (fomoCount >= 2) {
    whatHurt.push({ type: "negative", text: `FOMO entries on ${fomoCount} days` });
  }

  const noStopCount = mistakeCounts.get("no_stop_loss") ?? 0;
  if (noStopCount >= 2) {
    whatHurt.push({ type: "negative", text: `Didn't respect stop loss on ${noStopCount} days` });
  }

  const totalMistakes = overtradedCount + fomoCount + noStopCount;
  if (totalMistakes === 0 && tradingDays >= 5) {
    whatWentWell.push({ type: "positive", text: "Zero mistakes logged — disciplined month" });
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

  // Monthly P&L trend (last 6 months including current)
  const monthlyPnlTrend: MonthlyPnlPoint[] = [];
  for (let m = 5; m >= 0; m--) {
    const mStart = startOfMonth(subMonths(start, m));
    const mEnd = endOfMonth(mStart);
    const mTrades = allTrades.filter((t) => {
      const d = parseISO(t.trade_date);
      return isWithinInterval(d, { start: mStart, end: mEnd });
    });
    const mPnl = mTrades.reduce((s, t) => s + getFinalResult(t), 0);
    monthlyPnlTrend.push({
      monthLabel: format(mStart, "MMM"),
      pnl: mPnl,
      isCurrent: m === 0,
    });
  }

  // Discipline analytics
  const avgDisciplineScore =
    scoredTrades.length > 0
      ? scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length
      : null;

  const disciplineScatter = computeDisciplineScatter(monthTrades);
  const mistakeFrequency = computeMistakeFrequency(monthTrades);
  const totalMistakeDays = monthTrades.filter(
    (t) => t.num_trades > 0 && parseTags(t.execution_tag).length > 0,
  ).length;

  // Theme for next month
  let theme = "Stay consistent — keep logging, keep improving.";
  if (noStopCount >= 2) {
    theme = "Respect your stop loss every single trade. No exceptions.";
  } else if (overtradedCount >= 3) {
    theme = "Quality over quantity. Fewer trades, better setups.";
  } else if (fomoCount >= 2) {
    theme = "Patience. Only trade setups you planned before market open.";
  } else if (winRate != null && winRate < 40 && wins + losses >= 5) {
    theme = "Back to basics. Review your edge and trade only A+ setups.";
  } else if (scoredTrades.length > 0) {
    const avgScore = scoredTrades.reduce((s, t) => s + t.discipline_score!, 0) / scoredTrades.length;
    if (avgScore >= 4 && winRate != null && winRate >= 60) {
      theme = "You're doing great. Don't fix what isn't broken — repeat.";
    }
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
    theme,
    monthlyPnlTrend,
    avgDisciplineScore,
    disciplineScatter,
    mistakeFrequency,
    totalMistakeDays,
    hasEnoughData: monthTrades.length >= 5,
  };
}
