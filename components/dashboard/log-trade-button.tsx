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
      onOpenCreate(format(new Date(), "yyyy-MM-dd"));
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
          "group relative inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white",
          "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
          "shadow-lg shadow-slate-900/25 hover:shadow-xl hover:shadow-slate-900/30",
          "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
          className
        )}
      >
        {children ?? (
          <>
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Log today&apos;s trade
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
