"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Pencil, Sun, Moon, Eye, EyeOff, Sparkles } from "lucide-react";
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  // Reset loading state when modal opens or card params change
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [imgSrc]);

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

  const fetchCardBlob = useCallback(async (): Promise<Blob | null> => {
    if (!ogUrl) return null;
    try {
      const res = await fetch(ogUrl);
      if (!res.ok) throw new Error("Failed to generate image");
      return await res.blob();
    } catch {
      toast.error("Failed to generate card image");
      return null;
    }
  }, [ogUrl]);

  const handleDownload = useCallback(async () => {
    const blob = await fetchCardBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Card downloaded!");
  }, [fetchCardBlob, downloadFilename]);

  const handleShareX = useCallback(async () => {
    const blob = await fetchCardBlob();
    if (!blob) return;

    const file = new File([blob], downloadFilename, { type: "image/png" });
    const shareText = "Check out my PnL Card! #PnLCard #Trading";

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text: shareText, files: [file] });
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening X — download the card first to attach it!");
  }, [fetchCardBlob, downloadFilename]);

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
          {/* Light / Dark pill toggle */}
          <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                theme === "light"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-3 w-3" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-3 w-3" />
              Dark
            </button>
          </div>

          {/* ROI pill toggle */}
          {hasRoi && (
            <button
              onClick={() => setShowRoi((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                showRoi
                  ? "bg-white border-border text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
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
          <div className="relative rounded-xl overflow-hidden border border-border shadow-sm bg-muted/30 min-h-[200px]">
            {/* Loading state: shimmer + sparkle */}
            {imgSrc && !imgLoaded && !imgError && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30"
                aria-hidden="true"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200/40" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner">
                    <Sparkles className="h-7 w-7 text-emerald-600 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Generating your card
                  </p>
                  <div className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-8 animate-shimmer rounded-full bg-emerald-400/70" />
                  </div>
                </div>
              </div>
            )}
            {imgError && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Couldn&apos;t load preview. Try again.
                </p>
              </div>
            )}
            {imgSrc && !imgError && (
              <img
                src={imgSrc}
                alt={`${title} preview`}
                className={`w-full h-auto transition-opacity duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgError(true);
                  toast.error("Failed to load preview. Try refreshing.");
                }}
              />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={handleDownload}
            className="btn-gradient-flow flex-1 border border-border rounded-lg px-4 py-2 text-sm font-medium"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download
            </span>
          </button>

          <button
            onClick={handleShareX}
            className="btn-gradient-flow border border-border rounded-lg px-3 py-2 text-sm font-medium"
            title="Share to X"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share
            </span>
          </button>

          {cardType === "daily" && trade && (
            <button
              onClick={handleEdit}
              className="btn-gradient-flow border border-border rounded-lg px-3 py-2 text-sm font-medium"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
