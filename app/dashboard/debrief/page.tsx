import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLoggingStreak } from "@/lib/stats";
import {
  buildWeeklyDebrief,
  getCurrentWeekMonday,
  type TradeForDebrief,
} from "@/lib/debrief";
import { DebriefReport } from "./debrief-report";
import { getUserAccessStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Weekly Review — PnLCard",
  description: "Your weekly trading performance report.",
};

export default async function DebriefPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, currency, timezone, plan, plan_expires_at, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const accessStatus = getUserAccessStatus(profile);
  const currency = profile.currency ?? "INR";

  const { data: trades } = await supabase
    .from("trades")
    .select(
      "id, trade_date, net_pnl, charges, num_trades, capital_deployed, execution_tag, discipline_score, note"
    )
    .eq("user_id", user.id)
    .order("trade_date", { ascending: false });

  const allTrades: TradeForDebrief[] = (trades ?? []).map((t) => ({
    id: t.id,
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
    num_trades: Number(t.num_trades),
    capital_deployed: t.capital_deployed != null ? Number(t.capital_deployed) : null,
    execution_tag: t.execution_tag ?? null,
    discipline_score: t.discipline_score != null ? Number(t.discipline_score) : null,
    note: t.note ?? null,
  }));

  const params = await searchParams;
  const mondayStr = params.week ?? getCurrentWeekMonday();

  const loggingStreak = getLoggingStreak(allTrades.map((t) => t.trade_date));
  const debrief = buildWeeklyDebrief(allTrades, mondayStr, loggingStreak);

  return (
    <DebriefReport
      debrief={debrief}
      currency={currency}
      accessStatus={accessStatus}
      displayName={profile.display_name}
      userEmail={user.email ?? ""}
      userName={profile.display_name}
    />
  );
}
