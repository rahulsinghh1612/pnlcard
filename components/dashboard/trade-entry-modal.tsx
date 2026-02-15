"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowDownToLine, Upload, Trash2 } from "lucide-react";

const tradeSchema = z.object({
  trade_date: z.string().min(1, "Date is required"),
  num_trades: z.number().min(1, "Must be at least 1"),
  net_pnl: z.number(),
  charges: z.number().min(0).nullable(),
  capital_deployed: z.number().positive().nullable(),
});

/** Round to 2 decimal places for DB storage. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format number with locale-aware commas (INR = en-IN, USD = en-US), up to 2 decimals. */
function formatWithLocale(value: number, currency: string): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Strip input to a valid number string: optional minus, digits, optional . and up to 2 decimals. */
function stripToNumberString(value: string, allowNegative: boolean): string {
  let s = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
  if (!allowNegative) s = s.replace(/-/g, "");
  else if (s.startsWith("-")) s = "-" + s.slice(1).replace(/-/g, "");
  else s = s.replace(/-/g, "");
  const parts = s.split(".");
  if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
  else if (parts.length === 2) s = parts[0] + "." + parts[1].slice(0, 2);
  return s;
}

/** Display value for number input: show commas when complete, raw when partial (e.g. "1."). */
function displayValue(raw: string, currency: string): string {
  if (raw === "" || raw === "-") return raw;
  if (raw.endsWith(".") || /\.\d$/.test(raw)) return raw;
  const n = parseFloat(raw.replace(/,/g, ""));
  if (Number.isNaN(n)) return raw;
  return formatWithLocale(n, currency);
}

type TradeFormData = {
  trade_date: string;
  num_trades: string;
  net_pnl: string;
  charges: string;
  capital_deployed: string;
};

type TradeEntry = {
  id: string;
  trade_date: string;
  num_trades: number;
  net_pnl: number;
  charges: number | null;
  capital_deployed: number | null;
  note: string | null;
};

type TradeEntryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currency: string;
  tradingCapital: number | null;
  /** Pre-filled trade for edit mode. If null, create mode. */
  existingTrade: TradeEntry | null;
  /** Default date when creating (e.g. today) */
  defaultDate?: string;
};

export function TradeEntryModal({
  open,
  onOpenChange,
  userId,
  currency,
  tradingCapital,
  existingTrade,
  defaultDate,
}: TradeEntryModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<TradeFormData>({
    trade_date: "",
    num_trades: "1",
    net_pnl: "",
    charges: "",
    capital_deployed: "",
  });

  const isEdit = existingTrade != null;
  const symbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    if (open) {
      if (existingTrade) {
        setForm({
          trade_date: existingTrade.trade_date,
          num_trades: String(Math.max(1, existingTrade.num_trades)),
          net_pnl: String(existingTrade.net_pnl),
          charges: existingTrade.charges != null ? String(existingTrade.charges) : "",
          capital_deployed:
            existingTrade.capital_deployed != null
              ? String(existingTrade.capital_deployed)
              : "",
        });
      } else {
        const today = defaultDate ?? format(new Date(), "yyyy-MM-dd");
        setForm({
          trade_date: today,
          num_trades: "1",
          net_pnl: "",
          charges: "",
          capital_deployed: "",
        });
      }
    }
  }, [open, existingTrade, defaultDate, tradingCapital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const chargesVal =
      form.charges === "" ? null : Number(form.charges);
    const capitalVal =
      form.capital_deployed === "" ? null : Number(form.capital_deployed);

    const pnlTrimmed = form.net_pnl.trim();
    if (pnlTrimmed === "") {
      toast.error("Please fill in all required fields.");
      return;
    }
    const pnlNum = Number(pnlTrimmed);
    if (isNaN(pnlNum)) {
      toast.error("Please enter a valid P&L.");
      return;
    }

    const numTradesVal = parseInt(form.num_trades, 10);
    const result = tradeSchema.safeParse({
      trade_date: form.trade_date,
      num_trades: Number.isNaN(numTradesVal) || numTradesVal < 1 ? 1 : numTradesVal,
      net_pnl: pnlNum,
      charges: chargesVal,
      capital_deployed: capitalVal,
    });

    if (!result.success) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const data = result.data;
    const payload = {
      trade_date: data.trade_date,
      num_trades: data.num_trades,
      net_pnl: round2(data.net_pnl),
      charges: data.charges != null ? round2(data.charges) : null,
      capital_deployed: data.capital_deployed != null ? round2(data.capital_deployed) : null,
      note: null,
    };

    setIsLoading(true);
    try {
      const supabase = createClient();

      if (isEdit) {
        const { error } = await supabase
          .from("trades")
          .update(payload)
          .eq("id", existingTrade.id)
          .eq("user_id", userId);

        if (error) throw error;
        toast.success("Trade updated.");
      } else {
        const { error } = await supabase
          .from("trades")
          .insert({ user_id: userId, ...payload });

        if (error) throw error;
        toast.success("Trade logged.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTrade) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", existingTrade.id)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Trade deleted.");
      setShowDeleteConfirm(false);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isFutureDate = form.trade_date > todayStr;

  const hasCharges =
    form.charges.trim() !== "" && !isNaN(Number(form.charges)) && Number(form.charges) >= 0;
  const chargesNum = hasCharges ? Number(form.charges) : 0;
  const pnlNum = form.net_pnl.trim() === "" ? 0 : Number(form.net_pnl);
  const netPnl = hasCharges ? pnlNum - chargesNum : pnlNum;
  const finalResult = netPnl;
  const capitalNum =
    form.capital_deployed.trim() !== "" &&
    !isNaN(Number(form.capital_deployed)) &&
    Number(form.capital_deployed) > 0
      ? Number(form.capital_deployed)
      : null;
  const roi = capitalNum != null ? (finalResult / capitalNum) * 100 : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isEdit}
        >
          <DialogHeader className="text-center">
            {isEdit ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 disabled:opacity-50"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <DialogTitle>Edit trade</DialogTitle>
                <Link
                  href={`/dashboard/card?date=${form.trade_date}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Generate Card"
                >
                  <Upload className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <DialogTitle className="text-center">
                Log today&apos;s trade
              </DialogTitle>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-3">
              <Label htmlFor="trade_date">Date *</Label>
              <DatePicker
                id="trade_date"
                value={form.trade_date}
                onChange={(v) =>
                  setForm((f) => ({ ...f, trade_date: v }))
                }
                max={todayStr}
                placeholder="DD/MM/YYYY"
              />
              {isFutureDate && (
                <p className="text-xs text-destructive">
                  Cannot log future dates.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="num_trades">Number of trades *</Label>
              <Input
                id="num_trades"
                type="text"
                inputMode="numeric"
                value={form.num_trades}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setForm((f) => ({ ...f, num_trades: digits }));
                }}
                onBlur={() => {
                  const n = parseInt(form.num_trades, 10);
                  if (!form.num_trades || Number.isNaN(n) || n < 1) {
                    setForm((f) => ({ ...f, num_trades: "1" }));
                  }
                }}
                placeholder="e.g. 1"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="net_pnl">P&L ({symbol}) *</Label>
              <Input
                id="net_pnl"
                type="text"
                inputMode="decimal"
                className="no-spinner"
                value={displayValue(form.net_pnl, currency)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    net_pnl: stripToNumberString(e.target.value, true),
                  }))
                }
                placeholder="e.g. 1,500.50 or -500"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="charges">Charges & taxes ({symbol})</Label>
              <Input
                id="charges"
                type="text"
                inputMode="decimal"
                className="no-spinner"
                value={displayValue(form.charges, currency)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    charges: stripToNumberString(e.target.value, false),
                  }))
                }
                placeholder="e.g. 200.50"
              />
              {hasCharges && (
                <p className="text-sm">
                  Net P&L:{" "}
                  <span
                    className={
                      netPnl >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"
                    }
                  >
                    {netPnl >= 0 ? "+" : "-"}
                    {symbol}
                    {formatWithLocale(Math.abs(netPnl), currency)}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="capital_deployed" className="mb-0">
                  Capital ({symbol}) deployed for ROI
                </Label>
                {tradingCapital != null && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        capital_deployed: String(tradingCapital!),
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-border/80 bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <ArrowDownToLine className="h-3 w-3 shrink-0 opacity-70" />
                    Fill from profile
                    <span className="ml-0.5 opacity-75">
                      · {symbol}
                      {formatWithLocale(Number(tradingCapital), currency)}
                    </span>
                  </button>
                )}
              </div>
              <Input
                id="capital_deployed"
                type="text"
                inputMode="decimal"
                className="no-spinner"
                value={displayValue(form.capital_deployed, currency)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capital_deployed: stripToNumberString(e.target.value, false),
                  }))
                }
                placeholder="e.g. 1,00,000 or 1,00,000.50"
              />
              {roi != null && (
                <p className="text-sm">
                  ROI:{" "}
                  <span
                    className={
                      roi >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"
                    }
                  >
                    {roi >= 0 ? "+" : ""}
                    {roi.toFixed(2)}%
                  </span>
                </p>
              )}
            </div>

            <DialogFooter className="mt-10">
              <Button type="submit" className="w-full" disabled={isLoading || isFutureDate}>
                {isLoading
                  ? "Saving…"
                  : isEdit
                    ? "Update"
                    : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
