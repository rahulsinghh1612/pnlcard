import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import {
  getMonthBounds,
  getMonthPnl,
  getLoggingStreak,
} from "@/lib/stats";
import { getLastCompletedWeekMonday, getDebriefWeekBounds } from "@/lib/debrief";
import { parseISO, isWithinInterval } from "date-fns";
import { getUserAccessStatus } from "@/lib/utils";
import type { AccessStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — PnLCard",
  description: "Your trading recap dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, currency, timezone, trading_capital, x_handle, plan, plan_expires_at, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const timezone = profile.timezone ?? "Asia/Kolkata";
  const currency = profile.currency ?? "INR";

  const { start: monthStart, end: monthEnd } = getMonthBounds(timezone);

  const { data: trades } = await supabase
    .from("trades")
    .select("id, trade_date, net_pnl, charges, num_trades, capital_deployed, note, execution_tag, discipline_score")
    .eq("user_id", user.id)
    .order("trade_date", { ascending: false });

  const tradesForStats = (trades ?? []).map((t) => ({
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
  }));

  const monthPnl = getMonthPnl(tradesForStats, monthStart, monthEnd);
  const loggingStreak = getLoggingStreak((trades ?? []).map((t) => t.trade_date));

  const tradesForClient = (trades ?? []).map((t) => ({
    id: t.id,
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
    num_trades: Number(t.num_trades),
    capital_deployed:
      t.capital_deployed != null ? Number(t.capital_deployed) : null,
    note: t.note ?? null,
    execution_tag: t.execution_tag ?? null,
    discipline_score: t.discipline_score != null ? Number(t.discipline_score) : null,
  }));

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://pnlcard.com";

  const accessStatus = getUserAccessStatus(profile);

  // Check if last completed week has enough trades for a debrief
  const lastMonday = getLastCompletedWeekMonday();
  const { start: debriefStart, end: debriefEnd } = getDebriefWeekBounds(lastMonday);
  const lastWeekTradeCount = tradesForClient.filter((t) => {
    const d = parseISO(t.trade_date);
    return isWithinInterval(d, { start: debriefStart, end: debriefEnd });
  }).length;
  const debriefReady = lastWeekTradeCount >= 3;

  return (
    <DashboardContent
      displayName={profile.display_name}
      monthPnl={monthPnl}
      currency={currency}
      timezone={timezone}
      userId={user.id}
      tradingCapital={
        profile.trading_capital != null ? Number(profile.trading_capital) : null
      }
      xHandle={profile.x_handle ?? null}
      trades={tradesForClient}
      baseUrl={baseUrl}
      accessStatus={accessStatus}
      userEmail={user.email ?? ""}
      loggingStreak={loggingStreak}
      debriefReady={debriefReady}
    />
  );
}
