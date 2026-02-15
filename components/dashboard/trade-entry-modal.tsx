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
import { format } from "date-fns";
import { ArrowDownToLine } from "lucide-react";

const tradeSchema = z.object({
  trade_date: z.string().min(1, "Date is required"),
  num_trades: z.number().min(1, "Must be at least 1"),
  net_pnl: z.number(),
  charges: z.number().min(0).nullable(),
  capital_deployed: z.number().positive().nullable(),
});

type TradeFormData = {
  trade_date: string;
  num_trades: number;
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
    num_trades: 1,
    net_pnl: "",
    charges: "",
    capital_deployed: tradingCapital != null ? String(tradingCapital) : "",
  });

  const isEdit = existingTrade != null;
  const symbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    if (open) {
      if (existingTrade) {
        setForm({
          trade_date: existingTrade.trade_date,
          num_trades: existingTrade.num_trades,
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
          num_trades: 1,
          net_pnl: "",
          charges: "",
          capital_deployed: tradingCapital != null ? String(tradingCapital) : "",
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

    const result = tradeSchema.safeParse({
      trade_date: form.trade_date,
      num_trades: form.num_trades,
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
      net_pnl: data.net_pnl,
      charges: data.charges,
      capital_deployed: data.capital_deployed,
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
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit trade" : "Log today's trade"}
            </DialogTitle>
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
                type="number"
                min={1}
                value={form.num_trades}
                onChange={(e) =>
                  setForm((f) => ({ ...f, num_trades: Number(e.target.value) || 1 }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="net_pnl">P&L ({symbol}) *</Label>
              <Input
                id="net_pnl"
                type="number"
                step="1"
                inputMode="numeric"
                className="no-spinner"
                value={form.net_pnl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, net_pnl: e.target.value }))
                }
                placeholder="e.g. 1500 or -500"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="charges">Charges / fees (optional)</Label>
              <Input
                id="charges"
                type="number"
                step="1"
                min={0}
                inputMode="numeric"
                className="no-spinner"
                value={form.charges}
                onChange={(e) =>
                  setForm((f) => ({ ...f, charges: e.target.value }))
                }
                placeholder="Brokerage, STT, etc."
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
                    {Math.abs(netPnl).toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="capital_deployed">
                Capital deployed for ROI (optional)
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
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  Fill from profile
                  <span className="ml-0.5 opacity-75">
                    · {symbol}
                    {Number(tradingCapital).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </button>
              )}
              <Input
                id="capital_deployed"
                type="number"
                step="1"
                min={0}
                inputMode="numeric"
                className="no-spinner"
                value={form.capital_deployed}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capital_deployed: e.target.value }))
                }
                placeholder="e.g. 100000"
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

            <DialogFooter className="mt-10 gap-2 sm:gap-0">
              {isEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
              <div className="flex flex-1 justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isFutureDate}>
                  {isLoading
                    ? "Saving…"
                    : isEdit
                      ? "Update"
                      : "Save"}
                </Button>
              </div>
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
