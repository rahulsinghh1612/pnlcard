"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TradeEntryModal } from "./trade-entry-modal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type LogTradeButtonProps = {
  userId: string;
  currency: string;
  tradingCapital: number | null;
  className?: string;
  children?: React.ReactNode;
  onOpenCreate?: (defaultDate?: string) => void;
};

export function LogTradeButton({
  userId,
  currency,
  tradingCapital,
  className,
  children,
  onOpenCreate,
}: LogTradeButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (onOpenCreate) {
      onOpenCreate();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "btn-gradient-flow group relative inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold",
          "border border-slate-300 bg-white text-slate-900",
          "shadow-sm",
          "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2",
          className
        )}
      >
        <span className="inline-flex items-center gap-2.5">
          {children ?? (
            <>
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              Log a trade
            </>
          )}
        </span>
      </button>
      {!onOpenCreate && (
        <TradeEntryModal
          open={open}
          onOpenChange={setOpen}
          userId={userId}
          currency={currency}
          tradingCapital={tradingCapital}
          existingTrade={null}
          defaultDate={format(new Date(), "yyyy-MM-dd")}
        />
      )}
    </>
  );
}
