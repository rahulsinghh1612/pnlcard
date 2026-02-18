/**
 * Card generator page: /dashboard/card?date=YYYY-MM-DD
 *
 * Fetches trade data for the given date and renders the card generator
 * with live preview, theme/card type toggles, download, and copy link.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardGenerator } from "@/components/dashboard/card-generator";
import { parseISO, isWithinInterval } from "date-fns";
import {
  buildDailyCardParams,
  buildWeeklyCardParams,
  buildMonthlyCardParams,
  getWeekBoundsForDate,
} from "@/lib/card-data";

export const metadata = {
  title: "Generate Card — PNLCard",
  description: "Generate your trading recap card.",
};

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function CardGeneratorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateParam = params.date;

  if (!dateParam) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, x_handle, currency, timezone, trading_capital, plan, card_theme"
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: trades } = await supabase
    .from("trades")
    .select("id, trade_date, net_pnl, charges, num_trades, capital_deployed, note")
    .eq("user_id", user.id)
    .order("trade_date", { ascending: false });

  const tradesForCard = (trades ?? []).map((t) => ({
    id: t.id,
    trade_date: t.trade_date,
    net_pnl: Number(t.net_pnl),
    charges: t.charges != null ? Number(t.charges) : null,
    num_trades: t.num_trades,
    capital_deployed:
      t.capital_deployed != null ? Number(t.capital_deployed) : null,
  }));

  const profileForCard = {
    x_handle: profile.x_handle,
    trading_capital:
      profile.trading_capital != null ? Number(profile.trading_capital) : null,
    card_theme: profile.card_theme ?? "light",
    currency: profile.currency ?? "INR",
    timezone: profile.timezone ?? "Asia/Kolkata",
  };

  let tradeForDate = tradesForCard.find((t) => t.trade_date === dateParam);

  // If no trade on the exact date, find the first trade in the same week.
  // This handles the case where the weekly column passes a Monday that has no trade.
  if (!tradeForDate) {
    const tz = profileForCard.timezone ?? "Asia/Kolkata";
    const { start, end } = getWeekBoundsForDate(dateParam, tz);
    const weekTrades = tradesForCard
      .filter((t) => isWithinInterval(parseISO(t.trade_date), { start, end }))
      .sort((a, b) => a.trade_date.localeCompare(b.trade_date));
    tradeForDate = weekTrades[0] ?? null;
  }

  if (!tradeForDate) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Generate Card
        </h1>
        <p className="text-muted-foreground">
          No trade found for {dateParam}. Log a trade for this date first, or
          choose a date from your recent entries.
        </p>
      </div>
    );
  }

  const dailyParams = buildDailyCardParams(tradeForDate, tradesForCard, profileForCard);

  const weeklyParams = buildWeeklyCardParams(
    tradesForCard,
    dateParam,
    profileForCard
  );

  const monthlyParams = buildMonthlyCardParams(
    tradesForCard,
    dateParam,
    profileForCard
  );

  // TODO: revert to `profile.plan === "premium"` once Razorpay is integrated (Task 6)
  const isPremium = true;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Generate Card
      </h1>
      <p className="text-muted-foreground">
        Customize your recap card and download or share it.
      </p>
      <CardGenerator
        dailyParams={dailyParams}
        weeklyParams={weeklyParams}
        monthlyParams={monthlyParams}
        isPremium={isPremium}
        baseUrl={baseUrl}
      />
    </div>
  );
}
