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

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUserAccessStatus } from "@/lib/utils";
import type { AccessStatus } from "@/lib/types";

async function checkAccessStatus(): Promise<AccessStatus> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "expired";
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, trial_ends_at")
    .eq("id", user.id)
    .single();
  return getUserAccessStatus(
    data ?? { plan: null, plan_expires_at: null, trial_ends_at: null }
  );
}

async function checkYearlyTrialEligibility(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("yearly_trial_used_at")
    .eq("id", user.id)
    .single();

  return !data?.yearly_trial_used_at;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type UpgradeButtonProps = {
  userEmail: string;
  userName: string;
  defaultCycle?: "monthly" | "yearly";
  directCycle?: "monthly" | "yearly";
  autoStartCycle?: "monthly" | "yearly";
  beforeOpenCheckout?: () => void;
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

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function UpgradeButton({
  userEmail,
  userName,
  defaultCycle = "yearly",
  directCycle,
  autoStartCycle,
  beforeOpenCheckout,
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
  const [yearlyTrialEligible, setYearlyTrialEligible] = useState(true);
  const autoStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pollForAccess = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 15;
    const check = async () => {
      attempts++;
      const status = await checkAccessStatus();
      if (status === "subscribed") {
        toast.success("Pro activated!");
        router.refresh();
        setLoading(false);
        return;
      }
      if (status === "trial") {
        toast.success("Your 7-day yearly trial has started!");
        router.refresh();
        setLoading(false);
        return;
      }
      if (attempts < maxAttempts) {
        setTimeout(check, 2000);
      } else {
        router.refresh();
        setLoading(false);
      }
    };
    setTimeout(check, 3000);
  }, [router]);

  const handleUpgrade = useCallback(async (selectedCycle: "monthly" | "yearly") => {
    setLoading(true);
    setShowPicker(false);

    try {
      beforeOpenCheckout?.();
      await waitForNextFrame();
      await wait(250);
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
        name: "PnLCard",
        description: `Pro — ${selectedCycle === "monthly" ? "₹249/month" : "₹1,999/year"}`,
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: {
          color: "#059669",
        },
        handler: async (response: RazorpayCheckoutResponse) => {
          const resolvedSubscriptionId =
            response.razorpay_subscription_id || subscriptionId;

          try {
            const verifyRes = await fetch("/api/razorpay/verify-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cycle: selectedCycle,
                paymentId: response.razorpay_payment_id,
                subscriptionId: resolvedSubscriptionId,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const data = await verifyRes.json().catch(() => ({}));
              const message = data.error || "Payment verification failed";
              const isRetryable =
                verifyRes.status >= 500 ||
                /identified|verify|fetch|timeout|tempor/i.test(message);

              if (isRetryable) {
                toast.success("Payment received. Finalizing your access...");
                pollForAccess();
                return;
              }

              throw new Error(message);
            }

            const data = await verifyRes.json();
            if (data.status === "subscribed") {
              toast.success("Pro activated!");
              router.refresh();
              setLoading(false);
              return;
            }
            if (data.status === "trial") {
              toast.success("Your 7-day yearly trial has started!");
              router.refresh();
              setLoading(false);
              return;
            }

            toast.success("Payment successful! Updating your access...");
            pollForAccess();
          } catch (error) {
            console.error("Payment verification error:", error);
            const message =
              error instanceof Error ? error.message : "Payment verification failed";
            const isRetryable =
              /identified|verify|fetch|timeout|tempor/i.test(message);

            if (isRetryable) {
              toast.success("Payment received. Finalizing your access...");
              pollForAccess();
              return;
            }

            toast.error(message);
            setLoading(false);
          }
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
  }, [beforeOpenCheckout, userEmail, userName, router, pollForAccess]);

  useEffect(() => {
    checkYearlyTrialEligibility()
      .then(setYearlyTrialEligible)
      .catch(() => setYearlyTrialEligible(false));
  }, []);

  useEffect(() => {
    if (!autoStartCycle || autoStartedRef.current) return;
    autoStartedRef.current = true;
    handleUpgrade(autoStartCycle);
  }, [autoStartCycle, handleUpgrade]);

  useEffect(() => {
    if (!showPicker) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!containerRef.current?.contains(target)) {
        setShowPicker(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showPicker]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (directCycle) {
            handleUpgrade(directCycle);
            return;
          }
          setShowPicker((prev) => !prev);
        }}
        className={
          className ??
          "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        <span className="relative z-[1] inline-flex items-center gap-1.5">
          {loading ? (
            "Processing…"
          ) : variant === "header" ? (
            <>
              <Crown className="h-3.5 w-3.5 shrink-0" />
              Go Pro
            </>
          ) : (
            children ?? "Upgrade to Pro"
          )}
        </span>
      </button>

      {showPicker && !loading && (
        <div
          className={`absolute z-50 w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-3.5 shadow-xl animate-in fade-in duration-200 ${
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
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 mb-1.5 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
              cycle === "monthly"
                ? "bg-emerald-50 text-emerald-800 font-medium shadow-sm"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <span className="block font-semibold">₹249/month</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Billed monthly • No free trial
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCycle("yearly");
              handleUpgrade("yearly");
            }}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
              cycle === "yearly"
                ? "bg-emerald-50 text-emerald-800 font-medium shadow-sm"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold">₹1,999/year</span>
              <span className="text-emerald-600 text-xs font-medium">
                Save 33%
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {yearlyTrialEligible ? "7-Day Free Trial" : "Starts immediately"}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {yearlyTrialEligible
                ? "₹5 temporary authorization • Auto-refunded • Annual billing starts after Day 7"
                : "Billed yearly • No free trial"}
            </p>
          </button>
        </div>
      )}
    </div>
  );
}
