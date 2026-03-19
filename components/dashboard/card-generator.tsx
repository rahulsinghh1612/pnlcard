"use client";

/**
 * Card generator UI: preview, theme/card type toggles, download, copy link.
 *
 * Why client component: Uses useState for toggles, and browser APIs
 * (fetch for download, navigator.clipboard for copy).
 */
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Link2, Square, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import type { DailyCardParams } from "@/lib/card-data";
import type { WeeklyCardParams } from "@/lib/card-data";
import type { MonthlyCardParams } from "@/lib/card-data";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import type { AccessStatus } from "@/lib/types";

type CardGeneratorProps = {
  dailyParams: DailyCardParams;
  weeklyParams: WeeklyCardParams | null;
  monthlyParams: MonthlyCardParams | null;
  accessStatus: AccessStatus;
  baseUrl: string;
  defaultCardType?: "daily" | "weekly" | "monthly";
  userEmail?: string;
  userName?: string;
};

/** Use absolute URL for img src so it loads reliably across environments */
function getImageUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http")) return path;
  const origin = typeof window !== "undefined" ? window.location.origin : baseUrl;
  return `${origin}${path}`;
}

function buildDailyOgUrl(params: DailyCardParams): string {
  const search = new URLSearchParams({
    date: params.date,
    pnl: params.pnl,
    netPnl: params.netPnl,
    trades: params.trades,
    currency: params.currency,
  });
  if (params.netRoi) search.set("netRoi", params.netRoi);
  if (params.handle) search.set("handle", params.handle);
  if (params.disciplineScore != null) search.set("disciplineScore", String(params.disciplineScore));
  if (params.executionTag) search.set("executionTag", params.executionTag);
  return `/api/og/daily?${search.toString()}`;
}

function buildWeeklyOgUrl(params: WeeklyCardParams): string {
  const search = new URLSearchParams({
    range: params.range,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    days: JSON.stringify(params.days),
    currency: params.currency,
    avgPerDay: params.avgPerDay,
  });
  if (params.roi) search.set("roi", params.roi);
  if (params.roiLabel) search.set("roiLabel", params.roiLabel);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/weekly?${search.toString()}`;
}

function buildMonthlyOgUrl(params: MonthlyCardParams): string {
  const search = new URLSearchParams({
    month: params.month,
    pnl: params.pnl,
    calendar: JSON.stringify(params.calendar),
    calendarGrid: JSON.stringify(params.calendarGrid),
    currency: params.currency,
    avgPerDay: params.avgPerDay,
  });
  if (params.roi) search.set("roi", params.roi);
  if (params.roiLabel) search.set("roiLabel", params.roiLabel);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/monthly?${search.toString()}`;
}

export function CardGenerator({
  dailyParams,
  weeklyParams,
  monthlyParams,
  accessStatus,
  baseUrl,
  defaultCardType,
  userEmail,
  userName,
}: CardGeneratorProps) {
  const [downloadFormat, setDownloadFormat] = useState<"square" | "story">("square");
  const [cardType, setCardType] = useState<"daily" | "weekly" | "monthly">(
    defaultCardType && ["daily", "weekly", "monthly"].includes(defaultCardType)
      ? defaultCardType
      : "daily"
  );

  const isExpired = accessStatus === "expired";
  const canUseWeekly = weeklyParams != null;
  const canUseMonthly = monthlyParams != null;

  let ogUrl = "";
  if (cardType === "daily") {
    ogUrl = buildDailyOgUrl(dailyParams);
  } else if (cardType === "weekly" && weeklyParams) {
    ogUrl = buildWeeklyOgUrl(weeklyParams);
  } else if (cardType === "monthly" && monthlyParams) {
    ogUrl = buildMonthlyOgUrl(monthlyParams);
  }

  const shareUrl = `${baseUrl}/card/${dailyParams.tradeId}`;

  const downloadLabel =
    cardType === "daily"
      ? dailyParams.date.replace(/\s/g, "-")
      : cardType === "weekly" && weeklyParams
        ? weeklyParams.range.replace(/\s/g, "-")
        : cardType === "monthly" && monthlyParams
          ? monthlyParams.month.replace(/\s/g, "-")
          : "card";

  const handleDownload = useCallback(async () => {
    if (!ogUrl) return;
    const url = downloadFormat === "story" ? `${ogUrl}${ogUrl.includes("?") ? "&" : "?"}format=story` : ogUrl;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate image");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const typeLabel = cardType.charAt(0).toUpperCase() + cardType.slice(1);
      a.download = `PnLCard-${typeLabel}-${downloadLabel}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to download card");
    }
  }, [ogUrl, cardType, downloadLabel, downloadFormat]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  const imgSrc = ogUrl;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-border p-1">
          {(["daily", "weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === "weekly" && !canUseWeekly) return;
                if (t === "monthly" && !canUseMonthly) return;
                setCardType(t);
              }}
              className={`relative flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                cardType === t
                  ? "bg-primary text-primary-foreground"
                  : (t === "weekly" && !canUseWeekly) || (t === "monthly" && !canUseMonthly)
                    ? "cursor-not-allowed text-muted-foreground opacity-60"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isExpired && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800 flex-1">
            Your trial has ended. Subscribe to generate and download cards.
          </p>
          <UpgradeButton
            userEmail={userEmail ?? ""}
            userName={userName ?? ""}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Subscribe
          </UpgradeButton>
        </div>
      )}

      {cardType === "weekly" && !weeklyParams && (
        <p className="text-sm text-muted-foreground">
          No trades logged this week. Log trades to generate a weekly card.
        </p>
      )}
      {cardType === "monthly" && !monthlyParams && (
        <p className="text-sm text-muted-foreground">
          No trades logged this month. Log trades to generate a monthly card.
        </p>
      )}

      {ogUrl && (
        <>
          <Card className="overflow-visible p-4 flex justify-center bg-muted/30">
            <img
              src={getImageUrl(imgSrc, baseUrl)}
              alt="Card preview"
              className="max-w-full rounded-2xl border border-border shadow-lg object-contain"
              style={{ maxHeight: 420 }}
              onError={() => {
                toast.error("Failed to load card preview. Try refreshing.");
              }}
            />
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setDownloadFormat("square")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  downloadFormat === "square"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Square (1080×1080) for feed"
              >
                <Square className="h-3 w-3" />
                Square
              </button>
              <button
                type="button"
                onClick={() => setDownloadFormat("story")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  downloadFormat === "story"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Story (1080×1920) for Instagram"
              >
                <LayoutGrid className="h-3 w-3" />
                Story
              </button>
            </div>
            <Button onClick={handleDownload} disabled={isExpired}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleCopyLink} disabled={isExpired}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
