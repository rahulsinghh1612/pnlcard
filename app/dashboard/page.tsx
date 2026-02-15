import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { LogTradeButton } from "@/components/dashboard/log-trade-button";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import {
  getWeekBounds,
  getWeekPnl,
  getWeekWinRate,
  getCurrentStreak,
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
    .select("id, display_name, currency, timezone, trading_capital")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const timezone = profile.timezone ?? "Asia/Kolkata";
  const currency = profile.currency ?? "INR";

  const { start: weekStart, end: weekEnd } = getWeekBounds(timezone);

  const { data: trades } = await supabase
    .from("trades")
    .select("id, trade_date, net_pnl, charges, num_trades")
    .eq("user_id", user.id)
    .order("trade_date", { ascending: false });

  const tradesForStats = (trades ?? []).map((t) => ({
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
  }));

  const weekPnl = getWeekPnl(tradesForStats, weekStart, weekEnd);
  const weekWinRate = getWeekWinRate(tradesForStats, weekStart, weekEnd);
  const streak = getCurrentStreak(tradesForStats);

  const hasTrades = tradesForStats.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hi, {profile.display_name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {hasTrades
            ? "Here’s your trading recap."
            : "Log your first trade to get started."}
        </p>
      </div>

      <QuickStats
        weekPnl={weekPnl}
        weekWinRate={weekWinRate}
        streak={streak}
        currency={currency}
      />

      <LogTradeButton
        userId={user.id}
        currency={currency}
        tradingCapital={profile.trading_capital != null ? Number(profile.trading_capital) : null}
        className="w-full sm:w-auto"
      />

      {!hasTrades ? (
        <Card className="border-dashed p-12 text-center">
          <h2 className="text-lg font-medium text-foreground">
            No trades yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log your first trade to generate your first recap card.
          </p>
          <LogTradeButton
            userId={user.id}
            currency={currency}
            tradingCapital={profile.trading_capital != null ? Number(profile.trading_capital) : null}
            className="mt-6"
          />
        </Card>
      ) : (
        <RecentEntries
          trades={trades!.map((t) => ({
            id: t.id,
            trade_date: t.trade_date,
            net_pnl: Number(t.net_pnl),
            charges: t.charges != null ? Number(t.charges) : null,
            num_trades: t.num_trades,
          }))}
          currency={currency}
        />
      )}
    </div>
  );
}
