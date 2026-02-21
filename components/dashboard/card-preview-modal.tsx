"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  buildDailyCardParams,
  buildWeeklyCardParams,
  buildMonthlyCardParams,
  type TradeForCard,
  type DailyCardParams,
  type WeeklyCardParams,
  type MonthlyCardParams,
} from "@/lib/card-data";

type Trade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
  note: string | null;
};

type CardPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardType: "daily" | "weekly" | "monthly";
  trade: Trade | null;
  weekMondayStr?: string | null;
  monthDateStr?: string | null;
  allTrades: Trade[];
  profile: {
    x_handle: string | null;
    trading_capital: number | null;
    card_theme: string;
    currency: string;
    timezone: string;
  };
  onEditTrade: (trade: Trade) => void;
};

function buildDailyOgUrl(
  params: DailyCardParams,
  theme: string,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    date: params.date,
    pnl: params.pnl,
    netPnl: params.netPnl,
    trades: params.trades,
    streak: String(params.streak),
    theme,
    currency: params.currency,
  });
  if (params.charges) search.set("charges", params.charges);
  if (showRoi && params.netRoi) search.set("netRoi", params.netRoi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/daily?${search.toString()}`;
}

function buildWeeklyOgUrl(
  params: WeeklyCardParams,
  theme: string,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    range: params.range,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    totalTrades: String(params.totalTrades ?? 0),
    bestDay: params.bestDay,
    days: JSON.stringify(params.days),
    theme,
    currency: params.currency,
  });
  if (showRoi && params.roi) search.set("roi", params.roi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/weekly?${search.toString()}`;
}

function buildMonthlyOgUrl(
  params: MonthlyCardParams,
  theme: string,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    month: params.month,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    best: params.best,
    worst: params.worst,
    calendar: JSON.stringify(params.calendar),
    calendarGrid: JSON.stringify(params.calendarGrid),
    theme,
    currency: params.currency,
  });
  if (showRoi && params.roi) search.set("roi", params.roi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/monthly?${search.toString()}`;
}

export function CardPreviewModal({
  open,
  onOpenChange,
  cardType,
  trade,
  weekMondayStr,
  monthDateStr,
  allTrades,
  profile,
  onEditTrade,
}: CardPreviewModalProps) {
  const [theme, setTheme] = useState(profile.card_theme);
  const [showRoi, setShowRoi] = useState(profile.trading_capital != null);

  const tradesForCard: TradeForCard[] = useMemo(
    () =>
      allTrades.map((t) => ({
        id: t.id,
        trade_date: t.trade_date,
        net_pnl: t.net_pnl,
        charges: t.charges,
        num_trades: t.num_trades,
        capital_deployed: t.capital_deployed,
      })),
    [allTrades]
  );

  const dailyParams = useMemo(() => {
    if (cardType !== "daily" || !trade) return null;
    const tradeForCard: TradeForCard = {
      id: trade.id,
      trade_date: trade.trade_date,
      net_pnl: trade.net_pnl,
      charges: trade.charges,
      num_trades: trade.num_trades,
      capital_deployed: trade.capital_deployed,
    };
    return buildDailyCardParams(tradeForCard, tradesForCard, profile);
  }, [cardType, trade, tradesForCard, profile]);

  const weeklyParams = useMemo(() => {
    if (cardType !== "weekly" || !weekMondayStr) return null;
    return buildWeeklyCardParams(tradesForCard, weekMondayStr, profile);
  }, [cardType, weekMondayStr, tradesForCard, profile]);

  const monthlyParams = useMemo(() => {
    if (cardType !== "monthly" || !monthDateStr) return null;
    return buildMonthlyCardParams(tradesForCard, monthDateStr, profile);
  }, [cardType, monthDateStr, tradesForCard, profile]);

  const hasRoi =
    cardType === "daily"
      ? dailyParams?.netRoi != null
      : cardType === "weekly"
        ? weeklyParams?.roi != null
        : monthlyParams?.roi != null;

  const ogUrl = useMemo(() => {
    if (cardType === "daily" && dailyParams) {
      return buildDailyOgUrl(dailyParams, theme, showRoi);
    }
    if (cardType === "weekly" && weeklyParams) {
      return buildWeeklyOgUrl(weeklyParams, theme, showRoi);
    }
    if (cardType === "monthly" && monthlyParams) {
      return buildMonthlyOgUrl(monthlyParams, theme, showRoi);
    }
    return "";
  }, [cardType, dailyParams, weeklyParams, monthlyParams, theme, showRoi]);

  const imgSrc = useMemo(() => {
    if (!ogUrl) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${ogUrl}`;
  }, [ogUrl]);

  const downloadFilename = useMemo(() => {
    if (cardType === "daily" && dailyParams) {
      return `pnlcard-daily-${dailyParams.date.replace(/\s/g, "-")}.png`;
    }
    if (cardType === "weekly" && weeklyParams) {
      return `pnlcard-weekly-${weeklyParams.range.replace(/\s/g, "-")}.png`;
    }
    if (cardType === "monthly" && monthlyParams) {
      return `pnlcard-monthly-${monthlyParams.month.replace(/\s/g, "-")}.png`;
    }
    return "pnlcard.png";
  }, [cardType, dailyParams, weeklyParams, monthlyParams]);

  const handleDownload = useCallback(async () => {
    if (!ogUrl) return;
    try {
      const res = await fetch(ogUrl);
      if (!res.ok) throw new Error("Failed to generate image");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to download card");
    }
  }, [ogUrl, downloadFilename]);

  const handleEdit = useCallback(() => {
    if (!trade) return;
    onOpenChange(false);
    setTimeout(() => onEditTrade(trade), 150);
  }, [trade, onOpenChange, onEditTrade]);

  const isReady =
    (cardType === "daily" && dailyParams != null) ||
    (cardType === "weekly" && weeklyParams != null) ||
    (cardType === "monthly" && monthlyParams != null);

  if (!isReady) return null;

  const title =
    cardType === "daily"
      ? "Daily Card"
      : cardType === "weekly"
        ? "Weekly Card"
        : "Monthly Card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center gap-2 px-5 pb-4">
          {/* Light / Dark toggle */}
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                theme === "light"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Sun className="h-3 w-3" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Moon className="h-3 w-3" />
              Dark
            </button>
          </div>

          {/* ROI toggle */}
          {hasRoi && (
            <button
              onClick={() => setShowRoi((v) => !v)}
              className={`flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showRoi
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {showRoi ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              ROI
            </button>
          )}
        </div>

        {/* Card image */}
        <div className="px-5 pb-4">
          <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-muted/30">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={`${title} preview`}
                className="w-full h-auto"
                onError={() =>
                  toast.error("Failed to load preview. Try refreshing.")
                }
              />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-5 pb-5">
          <Button onClick={handleDownload} size="sm" className="flex-1">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
          {cardType === "daily" && trade && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit Trade
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
