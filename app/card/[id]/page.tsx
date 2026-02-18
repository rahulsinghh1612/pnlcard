/**
 * Public shareable card page: /card/[id]
 *
 * Displays a trading recap card full-screen. Used when someone shares
 * their card link on X/Instagram. OG meta tags point to the API so
 * platforms show a rich preview.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildDailyCardParams,
  type DailyCardParams,
} from "@/lib/card-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  let trade: { trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null } | null = null;
  let profile: { x_handle: string | null; trading_capital: number | null; card_theme: string; currency: string; timezone: string } | null = null;
  let tradesForCard: Array<{ id: string; trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null }> = [];

  try {
    const supabase = createAdminClient();
    if (!supabase) return { title: "Card — PNLCard" };
    const { data: t } = await supabase
      .from("trades")
      .select("id, user_id, trade_date, net_pnl, charges, num_trades, capital_deployed")
      .eq("id", id)
      .single();

    if (!t) return { title: "Card — PNLCard" };

    trade = {
      trade_date: t.trade_date,
      net_pnl: Number(t.net_pnl),
      charges: t.charges != null ? Number(t.charges) : null,
      num_trades: Number(t.num_trades),
      capital_deployed: t.capital_deployed != null ? Number(t.capital_deployed) : null,
    };

    const { data: p } = await supabase
      .from("profiles")
      .select("x_handle, trading_capital, card_theme, currency, timezone")
      .eq("id", t.user_id)
      .single();

    if (!p) return { title: "Card — PNLCard" };

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
    return { title: "Card — PNLCard" };
  }

  if (!trade || !profile) return { title: "Card — PNLCard" };

  const tradeForCard = {
    id,
    ...trade,
  };
  const dailyParams = buildDailyCardParams(
    tradeForCard,
    tradesForCard,
    profile
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://pnlcard.com";
  const ogUrl = buildOgImageUrl(dailyParams, baseUrl);

  return {
    title: `${dailyParams.date} — Daily Recap | PNLCard`,
    description: `Trading recap: ${dailyParams.netPnl}`,
    openGraph: {
      title: `${dailyParams.date} — Daily Recap`,
      description: `Trading recap: ${dailyParams.netPnl}`,
      images: [{ url: ogUrl, width: 1080, height: 1080 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dailyParams.date} — Daily Recap`,
      description: `Trading recap: ${dailyParams.netPnl}`,
      images: [ogUrl],
    },
  };
}

function buildOgImageUrl(params: DailyCardParams, baseUrl: string): string {
  const search = new URLSearchParams({
    date: params.date,
    pnl: params.pnl,
    netPnl: params.netPnl,
    trades: params.trades,
    streak: String(params.streak),
    theme: params.theme,
    currency: params.currency,
  });
  if (params.charges) search.set("charges", params.charges);
  if (params.netRoi) search.set("netRoi", params.netRoi ?? "");
  if (params.handle) search.set("handle", params.handle);
  return `${baseUrl}/api/og/daily?${search.toString()}`;
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;

  let trade: { user_id: string; trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null } | null = null;
  let profile: { x_handle: string | null; trading_capital: number | null; card_theme: string; currency: string; timezone: string } | null = null;
  let tradesForCard: Array<{ id: string; trade_date: string; net_pnl: number; charges: number | null; num_trades: number; capital_deployed: number | null }> = [];

  try {
    const supabase = createAdminClient();
    if (!supabase) notFound();
    const { data: t } = await supabase
      .from("trades")
      .select("id, user_id, trade_date, net_pnl, charges, num_trades, capital_deployed")
      .eq("id", id)
      .single();

    if (!t) notFound();
    trade = {
      user_id: t.user_id,
      trade_date: t.trade_date,
      net_pnl: Number(t.net_pnl),
      charges: t.charges != null ? Number(t.charges) : null,
      num_trades: Number(t.num_trades),
      capital_deployed: t.capital_deployed != null ? Number(t.capital_deployed) : null,
    };

    const { data: p } = await supabase
      .from("profiles")
      .select("x_handle, trading_capital, card_theme, currency, timezone")
      .eq("id", trade.user_id)
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
      .eq("user_id", trade.user_id)
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

  const tradeForCard = {
    id,
    trade_date: trade.trade_date,
    net_pnl: trade.net_pnl,
    charges: trade.charges,
    num_trades: trade.num_trades,
    capital_deployed: trade.capital_deployed,
  };

  const dailyParams = buildDailyCardParams(
    tradeForCard,
    tradesForCard,
    profile
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://pnlcard.com";
  const ogUrl = buildOgImageUrl(dailyParams, baseUrl);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] rounded-2xl overflow-hidden border border-border shadow-xl">
        <img
          src={ogUrl}
          alt={`Trading recap for ${dailyParams.date}`}
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
