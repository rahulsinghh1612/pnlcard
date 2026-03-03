"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon, Pencil } from "lucide-react";
import { format } from "date-fns";

type Trade = {
  id: string;
  trade_date: string;
  net_pnl: number;
  charges: number | null;
  num_trades: number;
  capital_deployed: number | null;
  note: string | null;
  execution_tag: string | null;
  mood_tag: string | null;
};

type TradeDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade | null;
  currency: string;
  tradingCapital: number | null;
  onGenerateCard: () => void;
  onEditTrade: () => void;
};

const TAG_LABELS: Record<string, string> = {
  followed_plan: "Followed Plan",
  overtraded: "Overtraded",
  revenge_traded: "Revenge Traded",
  fomo_entry: "FOMO Entry",
  cut_early: "Cut Early",
  stayed_out: "Stayed Out",
  avoided_fomo: "Avoided FOMO",
  calm: "Calm",
  confident: "Confident",
  anxious: "Anxious",
  frustrated: "Frustrated",
  tired: "Tired",
};

const POSITIVE_TAGS = new Set([
  "followed_plan", "stayed_out", "avoided_fomo",
  "calm", "confident",
]);

function formatPnl(value: number, currency: string): string {
  const symbol = currency === "INR" ? "\u20B9" : "$";
  const abs = Math.abs(value);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const sign = value >= 0 ? "+" : "\u2212";
  return `${sign}${symbol}${formatted}`;
}

function formatNumber(value: number, currency: string): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function parseTags(tagStr: string | null): string[] {
  if (!tagStr) return [];
  return tagStr.split(",").map((s) => s.trim()).filter(Boolean);
}

export function TradeDetailModal({
  open,
  onOpenChange,
  trade,
  currency,
  tradingCapital,
  onGenerateCard,
  onEditTrade,
}: TradeDetailModalProps) {
  if (!trade) return null;

  const symbol = currency === "INR" ? "\u20B9" : "$";
  const finalResult = trade.charges != null
    ? trade.net_pnl - trade.charges
    : trade.net_pnl;
  const isProfit = finalResult >= 0;
  const capital = trade.capital_deployed ?? tradingCapital;
  const roi = capital != null && capital > 0
    ? (finalResult / capital) * 100
    : null;
  const isRestDay = trade.num_trades === 0;

  const executionTags = parseTags(trade.execution_tag);
  const moodTags = parseTags(trade.mood_tag);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-semibold text-foreground">
            {format(new Date(trade.trade_date + "T12:00:00"), "EEEE, d MMM yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-5">
          {/* P&L + stats */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {isRestDay ? "Rest Day" : "P&L"}
              </p>
              {isRestDay ? (
                <p className="mt-1 text-lg font-semibold text-muted-foreground">
                  No trades taken
                </p>
              ) : (
                <p className={`mt-1 text-2xl font-bold tracking-tight ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                  {formatPnl(finalResult, currency)}
                </p>
              )}
            </div>

            {!isRestDay && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trade.charges != null && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Charges
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {symbol}{formatNumber(trade.charges, currency)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Trades
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {trade.num_trades}
                  </p>
                </div>
                {roi != null && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      ROI
                    </p>
                    <p className={`mt-0.5 text-sm font-medium ${roi >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Execution tags */}
          {executionTags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Execution
              </p>
              <div className="flex flex-wrap gap-1.5">
                {executionTags.map((tag) => {
                  const isPositive = POSITIVE_TAGS.has(tag);
                  return (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        isPositive
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-red-400 bg-red-50 text-red-700"
                      }`}
                    >
                      {TAG_LABELS[tag] ?? tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mood tags */}
          {moodTags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Mood
              </p>
              <div className="flex flex-wrap gap-1.5">
                {moodTags.map((tag) => {
                  const isPositive = POSITIVE_TAGS.has(tag);
                  return (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        isPositive
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-red-400 bg-red-50 text-red-700"
                      }`}
                    >
                      {TAG_LABELS[tag] ?? tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.note && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Notes
              </p>
              <div className="rounded-xl border border-border bg-slate-50/50 p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {trade.note}
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerateCard}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ImageIcon className="h-4 w-4" />
              Generate Card
            </button>
            <button
              type="button"
              onClick={onEditTrade}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
