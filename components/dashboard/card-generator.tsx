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
import { Download, Link2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { DailyCardParams } from "@/lib/card-data";
import type { WeeklyCardParams } from "@/lib/card-data";
import type { MonthlyCardParams } from "@/lib/card-data";

type CardGeneratorProps = {
  dailyParams: DailyCardParams;
  weeklyParams: WeeklyCardParams | null;
  monthlyParams: MonthlyCardParams | null;
  isPremium: boolean;
  baseUrl: string;
};

/** Use absolute URL for img src so it loads reliably across environments */
function getImageUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http")) return path;
  const origin = typeof window !== "undefined" ? window.location.origin : baseUrl;
  return `${origin}${path}`;
}

function buildDailyOgUrl(params: DailyCardParams, theme: string): string {
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
  if (params.netRoi) search.set("netRoi", params.netRoi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/daily?${search.toString()}`;
}

function buildWeeklyOgUrl(params: WeeklyCardParams, theme: string): string {
  const search = new URLSearchParams({
    range: params.range,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    bestDay: params.bestDay,
    days: JSON.stringify(params.days),
    theme,
    currency: params.currency,
  });
  if (params.roi) search.set("roi", params.roi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/weekly?${search.toString()}`;
}

function buildMonthlyOgUrl(params: MonthlyCardParams, theme: string): string {
  const search = new URLSearchParams({
    month: params.month,
    pnl: params.pnl,
    winRate: params.winRate,
    wl: params.wl,
    best: params.best,
    worst: params.worst,
    calendar: JSON.stringify(params.calendar),
    theme,
    currency: params.currency,
  });
  if (params.roi) search.set("roi", params.roi);
  if (params.handle) search.set("handle", params.handle);
  return `/api/og/monthly?${search.toString()}`;
}

export function CardGenerator({
  dailyParams,
  weeklyParams,
  monthlyParams,
  isPremium,
  baseUrl,
}: CardGeneratorProps) {
  const [theme, setTheme] = useState(dailyParams.theme);
  const [cardType, setCardType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  const canUseWeekly = isPremium && weeklyParams != null;
  const canUseMonthly = isPremium && monthlyParams != null;

  let ogUrl = "";
  if (cardType === "daily") {
    ogUrl = buildDailyOgUrl(dailyParams, theme);
  } else if (cardType === "weekly" && weeklyParams) {
    ogUrl = buildWeeklyOgUrl(weeklyParams, theme);
  } else if (cardType === "monthly" && monthlyParams) {
    ogUrl = buildMonthlyOgUrl(monthlyParams, theme);
  }

  const shareUrl = `${baseUrl}/card/${dailyParams.tradeId}`;

  const handleDownload = useCallback(async () => {
    if (!ogUrl) return;
    try {
      const res = await fetch(ogUrl);
      if (!res.ok) throw new Error("Failed to generate image");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pnlcard-${cardType}-${dailyParams.date.replace(/\s/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to download card");
    }
  }, [ogUrl, cardType, dailyParams.date]);

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
              {(t === "weekly" || t === "monthly") && !isPremium && (
                <Lock className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-border p-1">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
                theme === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

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
          <Card className="overflow-hidden p-4 flex justify-center bg-muted/30">
            <img
              src={getImageUrl(imgSrc, baseUrl)}
              alt="Card preview"
              className="max-w-full rounded-lg border border-border shadow-lg"
              style={{ maxHeight: 400 }}
              onError={() => {
                toast.error("Failed to load card preview. Try refreshing.");
              }}
            />
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download as Image
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
