"use client";

import { useState, useEffect, useRef } from "react";
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
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { ArrowDownToLine, Upload, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";

const tradeSchema = z.object({
  trade_date: z.string().min(1, "Date is required"),
  num_trades: z.number().min(0),
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

const MISTAKE_TAGS = [
  { value: "overtraded", label: "Overtraded" },
  { value: "fomo_entry", label: "FOMO Entry" },
  { value: "no_stop_loss", label: "Didn't Respect Stop Loss" },
] as const;

const PILL_GREEN =
  "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
const PILL_RED =
  "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
const PILL_UNSELECTED =
  "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50";

type TradeFormData = {
  trade_date: string;
  num_trades: string;
  net_pnl: string;
  charges: string;
  capital_deployed: string;
  discipline_score: number | null;
  mistake_tags: string[];
  note: string;
};

type TradeEntry = {
  id: string;
  trade_date: string;
  num_trades: number;
  net_pnl: number;
  charges: number | null;
  capital_deployed: number | null;
  note: string | null;
  execution_tag: string | null;
  discipline_score: number | null;
};

type TradeEntryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currency: string;
  tradingCapital: number | null;
  existingTrade: TradeEntry | null;
  defaultDate?: string;
  existingTradeDates?: Set<string>;
  onEditExisting?: (date: string) => void;
  onGenerateCard?: () => void;
  /** When true, submit shows toast and closes without saving to DB (for landing demo) */
  demoMode?: boolean;
  loggingStreak?: number;
  weekLogCount?: number;
};

export function TradeEntryModal({
  open,
  onOpenChange,
  userId,
  currency,
  tradingCapital,
  existingTrade,
  defaultDate,
  existingTradeDates,
  onEditExisting,
  onGenerateCard,
  demoMode = false,
  loggingStreak = 0,
  weekLogCount = 0,
}: TradeEntryModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [pnlSign, setPnlSign] = useState<"profit" | "loss">("profit");
  const [noTrade, setNoTrade] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const rewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState<TradeFormData>({
    trade_date: "",
    num_trades: "1",
    net_pnl: "",
    charges: "",
    capital_deployed: "",
    discipline_score: null,
    mistake_tags: [],
    note: "",
  });

  const isEdit = existingTrade != null;
  const symbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    if (open) {
      setShowReward(false);
      if (rewardTimer.current) clearTimeout(rewardTimer.current);

      if (existingTrade) {
        const isNoTrade = existingTrade.num_trades === 0;
        setNoTrade(isNoTrade);
        setPnlSign(existingTrade.net_pnl < 0 ? "loss" : "profit");
        const hasDetails =
          existingTrade.charges != null ||
          existingTrade.capital_deployed != null ||
          existingTrade.execution_tag != null ||
          existingTrade.discipline_score != null ||
          (existingTrade.note != null && existingTrade.note.length > 0);
        setShowDetails(hasDetails);
        setForm({
          trade_date: existingTrade.trade_date,
          num_trades: String(existingTrade.num_trades),
          net_pnl: String(Math.abs(existingTrade.net_pnl)),
          charges: existingTrade.charges != null ? String(existingTrade.charges) : "",
          capital_deployed:
            existingTrade.capital_deployed != null
              ? String(existingTrade.capital_deployed)
              : "",
          discipline_score: existingTrade.discipline_score ?? null,
          mistake_tags: existingTrade.execution_tag ? existingTrade.execution_tag.split(",") : [],
          note: existingTrade.note ?? "",
        });
      } else {
        setNoTrade(false);
        setPnlSign("profit");
        setShowDetails(false);
        setForm({
          trade_date: defaultDate ?? "",
          num_trades: "1",
          net_pnl: "",
          charges: "",
          capital_deployed: "",
          discipline_score: null,
          mistake_tags: [],
          note: "",
        });
      }
    }
    return () => {
      if (rewardTimer.current) clearTimeout(rewardTimer.current);
    };
  }, [open, existingTrade, defaultDate, tradingCapital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const chargesVal =
      form.charges === "" ? null : Number(form.charges);
    const capitalVal =
      form.capital_deployed === "" ? null : Number(form.capital_deployed);

    let pnlNum = 0;
    if (!noTrade) {
      const pnlTrimmed = form.net_pnl.trim();
      if (pnlTrimmed === "") {
        toast.error("Please fill in all required fields.");
        return;
      }
      const parsed = Number(pnlTrimmed);
      if (isNaN(parsed)) {
        toast.error("Please enter a valid P&L.");
        return;
      }
      pnlNum = pnlSign === "loss" ? -Math.abs(parsed) : Math.abs(parsed);
    }

    const numTradesVal = noTrade ? 0 : parseInt(form.num_trades, 10);
    const result = tradeSchema.safeParse({
      trade_date: form.trade_date,
      num_trades: noTrade ? 0 : (Number.isNaN(numTradesVal) || numTradesVal < 1 ? 1 : numTradesVal),
      net_pnl: pnlNum,
      charges: noTrade ? null : chargesVal,
      capital_deployed: noTrade ? null : capitalVal,
    });

    if (!result.success) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (demoMode) {
      toast.success("Trade logged.");
      onOpenChange(false);
      return;
    }

    const data = result.data;
    const trimmedNote = form.note.trim();
    const payload = {
      trade_date: data.trade_date,
      num_trades: data.num_trades,
      net_pnl: round2(data.net_pnl),
      charges: data.charges != null ? round2(data.charges) : null,
      capital_deployed: data.capital_deployed != null ? round2(data.capital_deployed) : null,
      note: trimmedNote.length > 0 ? trimmedNote : null,
      discipline_score: form.discipline_score,
      execution_tag: form.mistake_tags.length > 0 ? form.mistake_tags.join(",") : null,
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
      } else {
        const { error } = await supabase
          .from("trades")
          .insert({ user_id: userId, ...payload });

        if (error) throw error;
      }

      setShowReward(true);
      rewardTimer.current = setTimeout(() => {
        setShowReward(false);
        onOpenChange(false);
        router.refresh();
      }, 2000);
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

  const isDuplicateDate =
    !isEdit &&
    !!existingTradeDates &&
    existingTradeDates.has(form.trade_date);

  const hasCharges =
    form.charges.trim() !== "" && !isNaN(Number(form.charges)) && Number(form.charges) >= 0;
  const chargesNum = hasCharges ? Number(form.charges) : 0;
  const rawPnl = form.net_pnl.trim() === "" ? 0 : Number(form.net_pnl);
  const signedPnl = pnlSign === "loss" ? -Math.abs(rawPnl) : Math.abs(rawPnl);
  const netPnl = hasCharges ? signedPnl - chargesNum : signedPnl;
  const finalResult = netPnl;
  const capitalNum =
    form.capital_deployed.trim() !== "" &&
    !isNaN(Number(form.capital_deployed)) &&
    Number(form.capital_deployed) > 0
      ? Number(form.capital_deployed)
      : null;
  const roi = capitalNum != null ? (finalResult / capitalNum) * 100 : null;

  const newWeekLogCount = isEdit ? weekLogCount : weekLogCount + 1;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md max-h-[90vh] rounded-2xl sm:rounded-lg flex flex-col overflow-hidden p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isEdit}
        >
          {showReward ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 animate-fade-in-up">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {isEdit ? "Trade updated!" : noTrade ? "Rest day logged!" : "Trade logged!"}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Day {newWeekLogCount}/7 this week</span>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="text-center shrink-0 px-6 pt-6 pb-0">
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
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onGenerateCard?.();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Generate Card"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <DialogTitle className="text-center">
                    Log trade
                  </DialogTitle>
                )}
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col min-h-0 flex-1 overflow-hidden"
              >
                <div className="space-y-6 overflow-y-auto min-h-0 flex-1 px-6 py-4">
                  {/* === Date === */}
                  <div className="space-y-2.5">
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

                  {isDuplicateDate && (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <p className="text-sm font-medium text-muted-foreground">
                        Trade already logged for this date.
                      </p>
                      {onEditExisting && (
                        <button
                          type="button"
                          onClick={() => onEditExisting(form.trade_date)}
                          className="rounded-full border border-emerald-500 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                        >
                          Edit it
                        </button>
                      )}
                    </div>
                  )}

                  {!isDuplicateDate && (
                  <>
                  {/* === Number of trades + No Trade pill === */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="num_trades" className="mb-0">Number of trades *</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !noTrade;
                          setNoTrade(next);
                          if (next) {
                            setForm((f) => ({ ...f, num_trades: "0", net_pnl: "", charges: "", capital_deployed: "" }));
                            setPnlSign("profit");
                          } else {
                            setForm((f) => ({ ...f, num_trades: "1" }));
                          }
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          noTrade ? PILL_GREEN : PILL_UNSELECTED
                        }`}
                      >
                        No trade today
                      </button>
                    </div>
                    <Input
                      id="num_trades"
                      type="text"
                      inputMode="numeric"
                      disabled={noTrade}
                      value={form.num_trades}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setForm((f) => ({ ...f, num_trades: digits }));
                      }}
                      onBlur={() => {
                        if (noTrade) return;
                        const n = parseInt(form.num_trades, 10);
                        if (!form.num_trades || Number.isNaN(n) || n < 1) {
                          setForm((f) => ({ ...f, num_trades: "1" }));
                        }
                      }}
                      placeholder={noTrade ? "0" : "e.g. 1"}
                      className={noTrade ? "opacity-50" : ""}
                    />
                  </div>

                  {/* === P&L — compact segmented toggle + input === */}
                  <div className={`space-y-2.5 ${noTrade ? "opacity-40 pointer-events-none" : ""}`}>
                    <Label htmlFor="net_pnl">P&L ({symbol}) *</Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPnlSign("profit")}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            pnlSign === "profit"
                              ? PILL_GREEN
                              : PILL_UNSELECTED
                          }`}
                        >
                          Profit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPnlSign("loss")}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            pnlSign === "loss"
                              ? PILL_RED
                              : PILL_UNSELECTED
                          }`}
                        >
                          Loss
                        </button>
                      </div>
                      <Input
                        id="net_pnl"
                        type="text"
                        inputMode="decimal"
                        className="no-spinner flex-1"
                        value={displayValue(form.net_pnl, currency)}
                        onChange={(e) => {
                          const newVal = stripToNumberString(e.target.value, false);
                          setForm((f) => ({ ...f, net_pnl: newVal }));
                        }}
                        placeholder={`e.g. 1,500`}
                      />
                    </div>
                    {rawPnl > 0 && (
                      <p className="text-sm">
                        {hasCharges ? "Net P&L:" : "P&L:"}{" "}
                        <span
                          className={
                            signedPnl >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"
                          }
                        >
                          {signedPnl >= 0 ? "+" : "-"}
                          {symbol}
                          {formatWithLocale(Math.abs(signedPnl), currency)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Discipline Score (1-5 dots, dynamic color) — always visible */}
                  {!noTrade && (
                    <div className="space-y-2.5">
                      <Label>Discipline Score</Label>
                      <div className="flex items-center justify-center gap-3">
                        {([1, 2, 3, 4, 5] as const).map((score) => {
                          const filled = form.discipline_score != null && score <= form.discipline_score;

                          const SCORE_COLORS: Record<number, { bg: string; border: string; hover: string }> = {
                            1: { bg: "bg-red-500 border-red-500", border: "border-red-500", hover: "hover:border-red-300 hover:bg-red-50" },
                            2: { bg: "bg-orange-500 border-orange-500", border: "border-orange-500", hover: "hover:border-orange-300 hover:bg-orange-50" },
                            3: { bg: "bg-yellow-500 border-yellow-500", border: "border-yellow-500", hover: "hover:border-yellow-300 hover:bg-yellow-50" },
                            4: { bg: "bg-emerald-400 border-emerald-400", border: "border-emerald-400", hover: "hover:border-emerald-300 hover:bg-emerald-50" },
                            5: { bg: "bg-emerald-600 border-emerald-600", border: "border-emerald-600", hover: "hover:border-emerald-400 hover:bg-emerald-50" },
                          };

                          const activeColor = form.discipline_score != null ? SCORE_COLORS[form.discipline_score] : null;

                          return (
                            <button
                              key={score}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  discipline_score: f.discipline_score === score ? null : score,
                                }))
                              }
                              className={`relative h-9 w-9 rounded-full border-2 transition-all duration-200 ${
                                filled && activeColor
                                  ? `${activeColor.bg} text-white shadow-sm`
                                  : `border-border bg-muted/30 text-muted-foreground ${SCORE_COLORS[score].hover}`
                              }`}
                            >
                              <span className="text-xs font-bold">{score}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center">
                        {form.discipline_score === null && "How disciplined were you today?"}
                        {form.discipline_score === 1 && "Broke all my rules"}
                        {form.discipline_score === 2 && "Slipped on a few rules"}
                        {form.discipline_score === 3 && "Mostly stuck to the plan"}
                        {form.discipline_score === 4 && "Followed the plan well"}
                        {form.discipline_score === 5 && "Executed flawlessly"}
                      </p>
                    </div>
                  )}

                  {/* Mistake Tags (multi-select) — always visible */}
                  {!noTrade && (
                    <div className="space-y-2.5">
                      <Label>Any mistakes?</Label>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {MISTAKE_TAGS.map((tag) => {
                          const selected = form.mistake_tags.includes(tag.value);
                          return (
                            <button
                              key={tag.value}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  mistake_tags: selected
                                    ? f.mistake_tags.filter((t) => t !== tag.value)
                                    : [...f.mistake_tags, tag.value],
                                }))
                              }
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                selected ? PILL_RED : PILL_UNSELECTED
                              }`}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* === Collapsible details: Charges, Capital, Notes === */}
                  {!showDetails && (
                    <button
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      Add details
                    </button>
                  )}

                  {showDetails && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDetails(false)}
                        className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-0.5 -mt-0.5 ml-auto"
                      >
                        <ChevronUp className="h-2.5 w-2.5" />
                        Hide details
                      </button>
                      {/* Charges & Capital — hidden on no-trade days */}
                      {!noTrade && (
                        <>
                          <div className="space-y-2.5">
                            <Label htmlFor="charges">Charges ({symbol})</Label>
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
                            <p className="text-[11px] text-muted-foreground">
                              Optional — brokerage, STT, taxes
                            </p>
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

                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="capital_deployed" className="mb-0">
                                Capital ({symbol}) deployed
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
                              placeholder="e.g. 1,00,000"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              Used to calculate ROI%
                            </p>
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
                        </>
                      )}

                      {/* Note */}
                      <div className="space-y-2.5">
                        <Label htmlFor="note">What happened today?</Label>
                        <textarea
                          id="note"
                          value={form.note}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, note: e.target.value }));
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          maxLength={2000}
                          rows={2}
                          placeholder="Quick reflection — what went right, what to improve..."
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {form.note.length}/2000
                        </p>
                      </div>
                    </>
                  )}
                  </>
                  )}
                </div>

                {!isDuplicateDate && (
                  <div className="shrink-0 border-t border-border/30 px-6 py-4">
                    <button
                      type="submit"
                      disabled={isLoading || isFutureDate}
                      className="btn-gradient-flow w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
                    >
                      <span className="relative z-[1]">
                        {isLoading ? "Saving…" : isEdit ? "Update" : "Save"}
                      </span>
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
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
