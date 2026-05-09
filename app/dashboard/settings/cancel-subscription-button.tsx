"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type CancelSubscriptionButtonProps = {
  mode?: "subscription" | "trial";
};

export function CancelSubscriptionButton({
  mode = "subscription",
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      const res = await fetch("/api/razorpay/cancel-subscription", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel subscription.");
        setCancelling(false);
        return;
      }

      toast.success(
        mode === "trial"
          ? "Yearly trial cancelled. You won't be charged."
          : "Subscription cancelled. You'll keep Pro access until the end of your billing period."
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:hover:bg-red-950/40"
        >
          {mode === "trial" ? "Cancel yearly trial" : "Cancel subscription"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "trial" ? "Cancel your yearly trial?" : "Cancel your subscription?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "trial"
              ? "If you cancel before the 7-day trial ends, your card will not be charged and your access will end immediately."
              : "You&apos;ll keep Pro access until the end of your current billing period. After that, you&apos;ll lose weekly &amp; monthly recap cards and story downloads. You can re-subscribe anytime."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelling}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {cancelling ? "Cancelling…" : "Yes, cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
