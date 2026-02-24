/**
 * Public shareable weekly card page: /card/weekly/[date]?t=TRADE_ID
 *
 * The trade ID is used to look up the user. The date is the Monday of the week (YYYY-MM-DD).
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildWeeklyCardParams,
  type WeeklyCardParams,
} from "@/lib/card-data";

type PageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ t?: string }>;
};

function buildWeeklyOgUrl(params: WeeklyCardParams, baseUrl: string): string {
  const search = new URLSearchParams({
    range: params.range,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    totalTrades: String(params.totalTrades ?? 0),
    bestDay: params.bestDay,
    days: JSON.stringify(params.days),
    theme: params.theme,
    currency: params.currency,
  });
  if (params.roi) search.set("roi", params.roi);
  if (params.handle) search.set("handle", params.handle);
  return `${baseUrl}/api/og/weekly?${search.toString()}`;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { date } = await params;
  const { t: tradeId } = await searchParams;

  if (!tradeId) return { title: "Weekly Card — PNLCard" };

  let profile: { x_handle: string | null; trading_capital: number | null; card_theme: string; currency: string; timezone: string } | null = null;
  let tradesForCard: Array<{ id: string; trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null }> = [];

  try {
    const supabase = createAdminClient();
    if (!supabase) return { title: "Weekly Card — PNLCard" };
    const { data: t } = await supabase
      .from("trades")
      .select("user_id")
      .eq("id", tradeId)
      .single();

    if (!t) return { title: "Weekly Card — PNLCard" };

    const { data: p } = await supabase
      .from("profiles")
      .select("x_handle, trading_capital, card_theme, currency, timezone")
      .eq("id", t.user_id)
      .single();

    if (!p) return { title: "Weekly Card — PNLCard" };

    profile = {
      x_handle: p.x_handle,
      trading_capital: p.trading_capital != null ? Number(p.trading_capital) : null,
      card_theme: p.card_theme ?? "light",
      currency: p.currency ?? "INR",
      timezone: p.timezone ?? "Asia/Kolkata",
    };

    const { data: allTrades } = await supabase
      .from("trades")
      .select("id, trade_date, net_pnl, charges, num_trades, capital_deployed")
      .eq("user_id", t.user_id)
      .order("trade_date", { ascending: false });

    tradesForCard = (allTrades ?? []).map((tr) => ({
      id: tr.id,
      trade_date: tr.trade_date,
      net_pnl: Number(tr.net_pnl),
      charges: tr.charges != null ? Number(tr.charges) : null,
      num_trades: Number(tr.num_trades),
      capital_deployed: tr.capital_deployed != null ? Number(tr.capital_deployed) : null,
    }));
  } catch {
    return { title: "Weekly Card — PNLCard" };
  }

  if (!profile) return { title: "Weekly Card — PNLCard" };

  const weeklyParams = buildWeeklyCardParams(tradesForCard, date, profile);
  if (!weeklyParams) return { title: "Weekly Card — PNLCard" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pnlcard.com";
  const ogUrl = buildWeeklyOgUrl(weeklyParams, baseUrl);

  return {
    title: `${weeklyParams.range} — Weekly Recap | PNLCard`,
    description: `Trading recap: ${weeklyParams.pnl}`,
    openGraph: {
      title: `${weeklyParams.range} — Weekly Recap`,
      description: `Trading recap: ${weeklyParams.pnl}`,
      images: [{ url: ogUrl, width: 1080, height: 1080 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${weeklyParams.range} — Weekly Recap`,
      description: `Trading recap: ${weeklyParams.pnl}`,
      images: [ogUrl],
    },
  };
}

export default async function WeeklyCardPage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const { t: tradeId } = await searchParams;

  if (!tradeId) notFound();

  let profile: { x_handle: string | null; trading_capital: number | null; card_theme: string; currency: string; timezone: string } | null = null;
  let tradesForCard: Array<{ id: string; trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null }> = [];

  try {
    const supabase = createAdminClient();
    if (!supabase) notFound();
    const { data: t } = await supabase
      .from("trades")
      .select("user_id")
      .eq("id", tradeId)
      .single();

    if (!t) notFound();

    const { data: p } = await supabase
      .from("profiles")
      .select("x_handle, trading_capital, card_theme, currency, timezone")
      .eq("id", t.user_id)
      .single();

    if (!p) notFound();
    profile = {
      x_handle: p.x_handle,
      trading_capital: p.trading_capital != null ? Number(p.trading_capital) : null,
      card_theme: p.card_theme ?? "light",
      currency: p.currency ?? "INR",
      timezone: p.timezone ?? "Asia/Kolkata",
    };

    const { data: allTrades } = await supabase
      .from("trades")
      .select("id, trade_date, net_pnl, charges, num_trades, capital_deployed")
      .eq("user_id", t.user_id)
      .order("trade_date", { ascending: false });

    tradesForCard = (allTrades ?? []).map((tr) => ({
      id: tr.id,
      trade_date: tr.trade_date,
      net_pnl: Number(tr.net_pnl),
      charges: tr.charges != null ? Number(tr.charges) : null,
      num_trades: Number(tr.num_trades),
      capital_deployed: tr.capital_deployed != null ? Number(tr.capital_deployed) : null,
    }));
  } catch {
    notFound();
  }

  const weeklyParams = buildWeeklyCardParams(tradesForCard, date, profile);
  if (!weeklyParams) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pnlcard.com";
  const ogUrl = buildWeeklyOgUrl(weeklyParams, baseUrl);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] rounded-2xl overflow-hidden border border-border shadow-xl">
        <img
          src={ogUrl}
          alt={`Trading recap for ${weeklyParams.range}`}
          className="w-full h-auto"
        />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Create your own trading recap cards
      </p>
      <Link
        href="/"
        className="mt-3 text-sm font-medium text-primary hover:underline"
      >
        Start for Free — PNLCard
      </Link>
    </div>
  );
}
