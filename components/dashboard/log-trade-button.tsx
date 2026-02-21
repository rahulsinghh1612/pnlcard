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
          "group relative inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold",
          "border border-slate-300 bg-white text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900",
          "shadow-sm hover:shadow-lg hover:shadow-slate-900/20",
          "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
          className
        )}
      >
        {children ?? (
          <>
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Log a trade
          </>
        )}
      </button>
      {!onOpenCreate && (
        <TradeEntryModal
          open={open}
          onOpenChange={setOpen}
          userId={userId}
          currency={currency}
          tradingCapital={tradingCapital}
          existingTrade={null}
        />
      )}
    </>
  );
}
