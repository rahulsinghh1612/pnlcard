"use client";

/**
 * Upgrade button that opens the Razorpay checkout modal.
 *
 * How it works:
 * 1. User clicks the button and picks monthly or yearly
 * 2. We call our API route /api/razorpay/create-subscription
 * 3. The API creates a subscription on Razorpay and returns the subscription ID
 * 4. We load the Razorpay checkout script and open the payment modal
 * 5. After successful payment, Razorpay calls our webhook to activate the subscription
 * 6. We reload the page so the user sees their updated plan
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isPremiumUser } from "@/lib/utils";

async function checkPremiumStatus(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();
  return isPremiumUser(data ?? { plan: null, plan_expires_at: null });
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

type UpgradeButtonProps = {
  userEmail: string;
  userName: string;
  defaultCycle?: "monthly" | "yearly";
  className?: string;
  children?: React.ReactNode;
  /** Align dropdown to right edge (for header use). Default: left */
  dropdownAlign?: "left" | "right";
  /** Position dropdown above button (for modal use when space below is limited). Default: bottom */
  dropdownPosition?: "top" | "bottom";
  /** Header variant: Crown icon + "Go Pro" text. Ignores children when set. */
  variant?: "default" | "header";
};

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export function UpgradeButton({
  userEmail,
  userName,
  defaultCycle = "monthly",
  className,
  children,
  dropdownAlign = "left",
  dropdownPosition = "bottom",
  variant = "default",
}: UpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "yearly">(defaultCycle);
  const [showPicker, setShowPicker] = useState(false);

  const pollForPremium = async () => {
    let attempts = 0;
    const maxAttempts = 15;
    const check = async () => {
      attempts++;
      const isPremium = await checkPremiumStatus();
      if (isPremium) {
        toast.success("Pro activated!");
        router.refresh();
        return;
      }
      if (attempts < maxAttempts) {
        setTimeout(check, 2000);
      } else {
        router.refresh();
      }
    };
    setTimeout(check, 3000);
  };

  const handleUpgrade = async (selectedCycle: "monthly" | "yearly") => {
    setLoading(true);
    setShowPicker(false);

    try {
      await loadRazorpayScript();

      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle: selectedCycle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create subscription");
      }

      const { subscriptionId, keyId } = await res.json();

      const options: Record<string, unknown> = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "PNLCard",
        description: `Pro — ${selectedCycle === "monthly" ? "₹249/month" : "₹1,999/year"}`,
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: {
          color: "#059669",
        },
        handler: () => {
          toast.success(
            "Payment successful! Activating Pro features..."
          );
          pollForPremium();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setShowPicker((prev) => !prev)}
        className={
          className ??
          "btn-gradient-flow w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        <span className="relative z-[1] inline-flex items-center gap-1.5">
          {loading ? (
            "Processing…"
          ) : variant === "header" ? (
            <>
              <Crown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
              Go Pro
            </>
          ) : (
            children ?? "Upgrade to Pro"
          )}
        </span>
      </button>

      {showPicker && !loading && (
        <div
          className={`absolute z-50 min-w-[200px] rounded-xl border border-border bg-white p-3 shadow-xl animate-in fade-in duration-200 ${
            dropdownPosition === "top"
              ? "bottom-full mb-2 left-0 right-0 slide-in-from-bottom-2"
              : "top-full mt-2 slide-in-from-top-2"
          } ${dropdownAlign === "right" ? "right-0 left-auto" : "left-0 right-0"}`}
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Choose your plan:
          </p>
          <button
            type="button"
            onClick={() => {
              setCycle("monthly");
              handleUpgrade("monthly");
            }}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors mb-1.5 ${
              cycle === "monthly"
                ? "bg-emerald-50 text-emerald-800 font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <span className="font-semibold">₹249/month</span>
            <span className="text-muted-foreground ml-1.5">Billed monthly</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCycle("yearly");
              handleUpgrade("yearly");
            }}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              cycle === "yearly"
                ? "bg-emerald-50 text-emerald-800 font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <span className="font-semibold">₹1,999/year</span>
            <span className="text-emerald-600 ml-1.5 text-xs font-medium">
              Save 33%
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
