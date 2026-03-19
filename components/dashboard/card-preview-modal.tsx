"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Pencil, Eye, EyeOff, Sparkles, Square, LayoutGrid, BarChart3, CalendarDays } from "lucide-react";
import type { AccessStatus } from "@/lib/types";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
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
  execution_tag: string | null;
  discipline_score: number | null;
};

type CardPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardType: "daily" | "weekly" | "monthly";
  trade: Trade | null;
  weekMondayStr?: string | null;
  monthDateStr?: string | null;
  allTrades: Trade[];
  baseUrl: string;
  profile: {
    x_handle: string | null;
    trading_capital: number | null;
    card_theme: string;
    currency: string;
    timezone: string;
  };
  accessStatus?: AccessStatus;
  userEmail?: string;
  userName?: string;
  onEditTrade: (trade: Trade) => void;
};

function buildDailyOgUrl(
  params: DailyCardParams,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    date: params.date,
    pnl: params.pnl,
    netPnl: params.netPnl,
    trades: params.trades,
    currency: params.currency,
  });
  if (showRoi && params.netRoi) search.set("netRoi", params.netRoi);
  if (params.handle) search.set("handle", params.handle);
  if (params.disciplineScore != null) search.set("disciplineScore", String(params.disciplineScore));
  if (params.executionTag) search.set("executionTag", params.executionTag);
  return `/api/og/daily?${search.toString()}`;
}

function buildWeeklyOgUrl(
  params: WeeklyCardParams,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    range: params.range,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    days: JSON.stringify(params.days),
    currency: params.currency,
    avgPerDay: params.avgPerDay,
  });
  if (showRoi && params.roi) search.set("roi", params.roi);
  if (params.roiLabel) search.set("roiLabel", params.roiLabel);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/weekly?${search.toString()}`;
}

function buildMonthlyOgUrl(
  params: MonthlyCardParams,
  showRoi: boolean
): string {
  const search = new URLSearchParams({
    month: params.month,
    pnl: params.pnl,
    calendar: JSON.stringify(params.calendar),
    calendarGrid: JSON.stringify(params.calendarGrid),
    currency: params.currency,
    avgPerDay: params.avgPerDay,
  });
  if (showRoi && params.roi) search.set("roi", params.roi);
  if (params.roiLabel) search.set("roiLabel", params.roiLabel);
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
  baseUrl,
  profile,
  accessStatus = "expired",
  userEmail = "",
  userName = "",
  onEditTrade,
}: CardPreviewModalProps) {
  const isExpired = accessStatus === "expired";
  const isLocked = isExpired;
  const [showRoi, setShowRoi] = useState(profile.trading_capital != null);
  const [downloadFormat, setDownloadFormat] = useState<"square" | "story">("square");
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
        execution_tag: t.execution_tag,
        discipline_score: t.discipline_score,
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
      execution_tag: trade.execution_tag,
      discipline_score: trade.discipline_score,
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
      return buildDailyOgUrl(dailyParams, showRoi);
    }
    if (cardType === "weekly" && weeklyParams) {
      return buildWeeklyOgUrl(weeklyParams, showRoi);
    }
    if (cardType === "monthly" && monthlyParams) {
      return buildMonthlyOgUrl(monthlyParams, showRoi);
    }
    return "";
  }, [cardType, dailyParams, weeklyParams, monthlyParams, showRoi]);

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

  const shareUrl = useMemo(() => {
    if (cardType === "daily" && trade) {
      return `${baseUrl}/card/${trade.id}`;
    }
    if (cardType === "weekly" && weekMondayStr) {
      const monday = new Date(weekMondayStr + "T12:00:00");
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const weekTrade = allTrades.find((t) => {
        const d = new Date(t.trade_date + "T12:00:00");
        return d >= monday && d <= sunday;
      });
      if (weekTrade) {
        return `${baseUrl}/card/weekly/${weekMondayStr}?t=${weekTrade.id}`;
      }
    }
    if (cardType === "monthly" && monthDateStr) {
      const monthStr = monthDateStr.slice(0, 7);
      const monthStart = new Date(monthDateStr + "T12:00:00");
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const monthTrade = allTrades.find((t) => {
        const d = new Date(t.trade_date + "T12:00:00");
        return d >= monthStart && d <= monthEnd;
      });
      if (monthTrade) {
        return `${baseUrl}/card/monthly/${monthStr}?t=${monthTrade.id}`;
      }
    }
    return null;
  }, [baseUrl, cardType, trade, weekMondayStr, monthDateStr, allTrades]);

  const downloadFilename = useMemo(() => {
    if (cardType === "daily" && dailyParams) {
      return `PnLCard-Daily-${dailyParams.date.replace(/\s/g, "-")}.png`;
    }
    if (cardType === "weekly" && weeklyParams) {
      return `PnLCard-Weekly-${weeklyParams.range.replace(/\s/g, "-")}.png`;
    }
    if (cardType === "monthly" && monthlyParams) {
      return `PnLCard-Monthly-${monthlyParams.month.replace(/\s/g, "-")}.png`;
    }
    return "PnLCard.png";
  }, [cardType, dailyParams, weeklyParams, monthlyParams]);

  const fetchCardBlob = useCallback(async (format: "square" | "story" = "square"): Promise<Blob | null> => {
    if (!ogUrl) return null;
    const url = format === "story" ? `${ogUrl}${ogUrl.includes("?") ? "&" : "?"}format=story` : ogUrl;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate image");
      return await res.blob();
    } catch {
      toast.error("Failed to generate card image");
      return null;
    }
  }, [ogUrl]);

  const handleDownload = useCallback(async () => {
    const blob = await fetchCardBlob(downloadFormat);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Card downloaded!");
  }, [fetchCardBlob, downloadFilename, downloadFormat]);

  const handleShareX = useCallback(async () => {
    const shareText = shareUrl
      ? `Check out my PnL Card! ${shareUrl} #PnLCard #Trading`
      : "Check out my PnL Card! #PnLCard #Trading";

    const blob = await fetchCardBlob();
    if (!blob) return;

    const file = new File([blob], downloadFilename, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          text: shareText,
          files: [file],
        });
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    if (shareUrl) {
      toast.success("Opening X — the link will show your card preview!");
    } else {
      toast.success("Opening X — paste the link after sharing to show your card!");
    }
  }, [fetchCardBlob, downloadFilename, shareUrl]);

  const handleEdit = useCallback(() => {
    if (!trade) return;
    onOpenChange(false);
    setTimeout(() => onEditTrade(trade), 150);
  }, [trade, onOpenChange, onEditTrade]);

  const isReady =
    (cardType === "daily" && dailyParams != null) ||
    (cardType === "weekly" && weeklyParams != null) ||
    (cardType === "monthly" && monthlyParams != null);

  const isProfit = useMemo(() => {
    const pnlStr =
      cardType === "daily"
        ? dailyParams?.netPnl
        : cardType === "weekly"
          ? weeklyParams?.pnl
          : monthlyParams?.pnl;
    if (!pnlStr) return true;
    const num = parseFloat(pnlStr.replace(/[^0-9.\-]/g, "")) || 0;
    return num >= 0;
  }, [cardType, dailyParams?.netPnl, weeklyParams?.pnl, monthlyParams?.pnl]);

  if (!isReady) return null;

  const title =
    cardType === "daily"
      ? "Daily Card"
      : cardType === "weekly"
        ? "Weekly Card"
        : "Monthly Card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl sm:rounded-2xl" style={{ minHeight: 420 }}>
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        {isLocked ? (
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50/80 p-0">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 ring-2 ring-amber-100/80 ring-offset-2">
                  <Sparkles className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold tracking-tight text-foreground">
                    Subscribe to continue
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Your trial has ended. Subscribe to generate cards, download recaps, and keep logging trades.
                  </p>
                </div>
                <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left">
                  {[
                    { icon: BarChart3, text: "Keep logging trades daily" },
                    { icon: CalendarDays, text: "Generate all card types" },
                    { icon: Sparkles, text: "Uninterrupted access to reviews" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm text-muted-foreground">{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 space-y-2">
                  <UpgradeButton
                    userEmail={userEmail}
                    userName={userName}
                    dropdownPosition="top"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Subscribe to PnLCard
                  </UpgradeButton>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
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

              {/* Download format: Square (feed) vs Story */}
              <div className="inline-flex rounded-full border border-border p-0.5 bg-muted/40">
                <button
                  onClick={() => setDownloadFormat("square")}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    downloadFormat === "square"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Square (1080×1080) for feed"
                >
                  <Square className="h-2.5 w-2.5" />
                  Square
                </button>
                <button
                  onClick={() => setDownloadFormat("story")}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    downloadFormat === "story"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Story (1080×1920) for Instagram"
                >
                  <LayoutGrid className="h-2.5 w-2.5" />
                  Story
                </button>
              </div>
            </div>

            {/* Card image */}
            <div className="px-5 pb-4">
              <div className="relative rounded-xl overflow-hidden border border-border shadow-sm bg-muted/30 min-h-[200px]">
                {imgSrc && !imgLoaded && !imgError && (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                      isProfit
                        ? "bg-gradient-to-br from-slate-50 via-white to-emerald-50/30"
                        : "bg-gradient-to-br from-slate-50 via-white to-slate-100/50"
                    }`}
                    aria-hidden="true"
                  >
                    <div className="relative">
                      <div
                        className={`absolute inset-0 animate-ping rounded-full ${
                          isProfit ? "bg-emerald-200/40" : "bg-slate-200/40"
                        }`}
                      />
                      <div
                        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-inner ${
                          isProfit
                            ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                            : "bg-gradient-to-br from-slate-100 to-slate-50"
                        }`}
                      >
                        <Sparkles
                          className={`h-7 w-7 animate-pulse ${
                            isProfit ? "text-emerald-600" : "text-slate-500"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm font-medium text-foreground">
                        Generating your card
                      </p>
                      <div className="mx-auto h-1 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full w-8 animate-shimmer rounded-full ${
                            isProfit ? "bg-emerald-400/70" : "bg-slate-400/60"
                          }`}
                        />
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
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>

              <button
                onClick={handleShareX}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                title="Share to X"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share
              </button>

              {cardType === "daily" && trade && (
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
