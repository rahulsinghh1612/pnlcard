"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [tradingCapital, setTradingCapital] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const capital = tradingCapital.trim()
        ? parseFloat(tradingCapital.replace(/,/g, ""))
        : null;
      if (tradingCapital.trim() && (isNaN(capital!) || capital! <= 0)) {
        setError("Trading capital must be a positive number.");
        setIsLoading(false);
        return;
      }

      const handle = xHandle.trim() || null;
      if (handle && !handle.startsWith("@")) {
        setError("Handle should start with @ (e.g. @yourhandle).");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from("profiles").insert({
        id: userId,
        display_name: trimmedName,
        trading_capital: capital,
        x_handle: handle,
        currency,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
          Display name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should we call you?"
          required
          className="rounded-xl border-border bg-white px-4 py-2.5 text-sm transition-colors focus-visible:ring-emerald-300"
        />
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Currency <span className="text-red-500">*</span>
        </Label>
        <div className="flex rounded-xl border border-border bg-muted/50 p-1">
          {(["INR", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                currency === c
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "INR" ? "₹ INR" : "$ USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Trading capital */}
      <div className="space-y-2">
        <Label htmlFor="tradingCapital" className="text-sm font-medium text-foreground">
          Trading capital{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {currency === "INR" ? "₹" : "$"}
          </span>
          <Input
            id="tradingCapital"
            type="text"
            value={tradingCapital}
            onChange={(e) => setTradingCapital(e.target.value)}
            placeholder="e.g. 1,00,000"
            inputMode="numeric"
            className="rounded-xl border-border bg-white pl-8 pr-4 py-2.5 text-sm transition-colors focus-visible:ring-emerald-300"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Used for ROI calculations on your cards.
        </p>
      </div>

      {/* X handle */}
      <div className="space-y-2">
        <Label htmlFor="xHandle" className="text-sm font-medium text-foreground">
          Social handle{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="xHandle"
          type="text"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          placeholder="@yourhandle (X / Instagram)"
          className="rounded-xl border-border bg-white px-4 py-2.5 text-sm transition-colors focus-visible:ring-emerald-300"
        />
        <p className="text-xs text-muted-foreground">
          Displayed on your recap cards (X, Instagram, etc.).
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-gradient-flow group relative w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <span className="relative z-[1]">
          {isLoading ? "Setting up…" : "Let's go →"}
        </span>
      </button>
    </form>
  );
}
