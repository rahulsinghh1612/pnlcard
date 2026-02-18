import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import {
  getMonthBounds,
  getMonthPnl,
} from "@/lib/stats";

export const metadata = {
  title: "Dashboard — PNLCard",
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
    .select("id, display_name, currency, timezone, trading_capital, x_handle, card_theme")
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
    .select("id, trade_date, net_pnl, charges, num_trades, capital_deployed, note")
    .eq("user_id", user.id)
    .order("trade_date", { ascending: false });

  const tradesForStats = (trades ?? []).map((t) => ({
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
  }));

  const monthPnl = getMonthPnl(tradesForStats, monthStart, monthEnd);

  const tradesForClient = (trades ?? []).map((t) => ({
    id: t.id,
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
    num_trades: Number(t.num_trades),
    capital_deployed:
      t.capital_deployed != null ? Number(t.capital_deployed) : null,
    note: t.note ?? null,
  }));

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
      cardTheme={profile.card_theme ?? "light"}
      trades={tradesForClient}
    />
  );
}
