"use client";

/**
 * Landing page demo: static mockup that mirrors the real dashboard UI.
 * Uses your real January 2026 data from lib/demo-trades (no Supabase/API).
 */
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BarChart3, CalendarDays, CalendarRange, CalendarCheck, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { DEMO_TRADES } from "@/lib/demo-trades";

type DashboardDemoProps = {
  step: number;
};

function formatPnl(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const sign = value >= 0 ? "+" : "-";
  return `${sign}₹${formatted}`;
}

// Compute from real January 2026 data
const getFinalResult = (t: { net_pnl: number; charges: number | null }) =>
  t.charges != null ? t.net_pnl - t.charges : t.net_pnl;
const DEMO_MONTH_PNL = DEMO_TRADES.reduce((sum, t) => sum + getFinalResult(t), 0);
const DEMO_DAILY = DEMO_TRADES[DEMO_TRADES.length - 1]; // Jan 31
const DEMO_WEEK_PNL = DEMO_TRADES.filter((t) => {
  const d = new Date(t.trade_date);
  const day = d.getDay();
  const date = d.getDate();
  return date >= 27 && date <= 31; // Last week of Jan
}).reduce((sum, t) => sum + getFinalResult(t), 0);

export function DashboardDemo({ step }: DashboardDemoProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto scale-[0.85] sm:scale-90 origin-top">
      <div className="rounded-xl border border-border bg-page overflow-hidden shadow-lg">
        <header className="border-b border-border bg-background/95 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="logo-capsule px-3 py-1 text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo-graph.png" alt="" className="h-3 w-3 object-contain" />
              Pnl Card
            </div>
            <div className="h-6 w-6 rounded-lg bg-muted" />
          </div>
        </header>

        <main className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
          <div
            className="rounded-xl border border-border p-4 shadow-sm"
            style={{
              background: `linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #fff 0%, #f8fafc 100%)`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-lg font-semibold text-muted-foreground">Hi, Trader</h1>
              <div className="sm:text-right">
                <p className="text-[10px] font-medium tracking-wider text-muted-foreground">
                  This Month&apos;s P&L
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-emerald-600">
                  {step === 0 ? "₹0" : formatPnl(DEMO_MONTH_PNL)}
                </p>
                {step === 2 && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-2.5 w-2.5" />
                    Generate Monthly Card
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="btn-gradient-flow group relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
              Log a trade
            </button>
          </div>

          {step <= 1 ? (
            <Card className="overflow-hidden border-dashed border-2 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-200/80 to-slate-300/60">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-sm font-medium text-foreground">No trades yet</h2>
              <p className="mt-1.5 max-w-xs mx-auto text-xs text-muted-foreground">
                Log your first trade to generate your first recap card and start sharing your progress.
              </p>
              <button
                type="button"
                className="mt-4 btn-gradient-flow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold border border-slate-300 bg-white text-slate-900 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Log a trade
              </button>
            </Card>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-gradient-to-br from-white via-white to-slate-50/40 p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-center gap-1">
                  <div className="h-6 w-6 rounded bg-muted" />
                  <span className="min-w-[100px] text-center text-xs font-semibold text-foreground">
                    January 2026
                  </span>
                  <div className="h-6 w-6 rounded bg-muted" />
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                    <span key={d} className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {(() => {
                    const pad = 3; // Jan 2026: 1st is Thursday, Monday-first grid
                    const days = 31;
                    const tradeByDay: Record<number, number> = {};
                    for (const t of DEMO_TRADES) {
                      const d = parseInt(format(new Date(t.trade_date), "d"), 10);
                      tradeByDay[d] = getFinalResult(t);
                    }
                    const cells: (number | null)[] = [...Array(pad).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
                    return cells.map((d, i) => {
                      if (d === null) return <div key={i} className="aspect-square rounded-sm bg-transparent" />;
                      const pnl = tradeByDay[d];
                      const isProfit = pnl != null ? pnl >= 0 : false;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm min-w-[12px] ${
                            pnl != null
                              ? isProfit ? "bg-emerald-200" : "bg-red-200"
                              : "bg-muted/40"
                          }`}
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-medium text-foreground mb-2">Generate cards</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border bg-gradient-to-br from-white to-slate-50/40 p-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-2">
                      <CalendarDays className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Daily</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-600">{formatPnl(getFinalResult(DEMO_DAILY))}</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {format(new Date(DEMO_DAILY.trade_date), "EEE, MMM d")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-white to-slate-50/40 p-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 mb-2">
                      <CalendarRange className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Weekly</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-600">{formatPnl(DEMO_WEEK_PNL)}</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">27 Jan – 2 Feb</p>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-white to-slate-50/40 p-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-2">
                      <CalendarCheck className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-600">{formatPnl(DEMO_MONTH_PNL)}</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">Jan 2026</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {step === 1 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-xl p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-xl p-5">
            <h3 className="text-sm font-semibold text-foreground text-center mb-4">Log a trade</h3>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo_date" className="text-xs">Date *</Label>
                <Input id="demo_date" value="31/01/2026" readOnly className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo_trades" className="text-xs">Number of trades *</Label>
                <Input id="demo_trades" value="3" readOnly className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo_pnl" className="text-xs">P&L (₹) *</Label>
                <Input id="demo_pnl" value="1,000" readOnly className="h-8 text-sm border-emerald-200 bg-emerald-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo_charges" className="text-xs">Charges & taxes (₹)</Label>
                <Input id="demo_charges" placeholder="e.g. 200.50" className="h-8 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" className="flex-1">Cancel</Button>
                <Button type="button" size="sm" className="flex-1">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
