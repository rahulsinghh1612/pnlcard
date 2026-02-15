"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TradeEntryModal } from "./trade-entry-modal";

type LogTradeButtonProps = {
  userId: string;
  currency: string;
  tradingCapital: number | null;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
};

export function LogTradeButton({
  userId,
  currency,
  tradingCapital,
  variant = "default",
  size = "lg",
  className,
  children,
}: LogTradeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children ?? (
          <>
            <Plus className="h-4 w-4" />
            Log today&apos;s trade
          </>
        )}
      </Button>
      <TradeEntryModal
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        currency={currency}
        tradingCapital={tradingCapital}
        existingTrade={null}
      />
    </>
  );
}
