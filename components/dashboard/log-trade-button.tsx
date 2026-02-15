"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TradeEntryModal } from "./trade-entry-modal";
import { format } from "date-fns";

type LogTradeButtonProps = {
  userId: string;
  currency: string;
  tradingCapital: number | null;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  /**
   * When provided, the button calls this instead of opening its own modal.
   * Use when the parent controls the trade modal (e.g. dashboard with calendar).
   */
  onOpenCreate?: (defaultDate?: string) => void;
};

export function LogTradeButton({
  userId,
  currency,
  tradingCapital,
  variant = "default",
  size = "lg",
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
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        {children ?? (
          <>
            <Plus className="h-4 w-4" />
            Log today&apos;s trade
          </>
        )}
      </Button>
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
