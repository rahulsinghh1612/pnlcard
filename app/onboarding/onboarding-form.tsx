"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
        setError("X handle should start with @ (e.g. @yourhandle).");
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
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">
          Display name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should we call you?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">
          Currency <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-3">
          {(["INR", "USD"] as const).map((c) => (
            <Button
              key={c}
              type="button"
              variant={currency === c ? "default" : "outline"}
              className="flex-1"
              onClick={() => setCurrency(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tradingCapital">
          Trading capital <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="tradingCapital"
          type="text"
          value={tradingCapital}
          onChange={(e) => setTradingCapital(e.target.value)}
          placeholder="e.g. 100000"
          inputMode="numeric"
        />
        <p className="text-xs text-muted-foreground">
          Used for ROI calculations. You can add this later in settings.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="xHandle">
          X handle <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="xHandle"
          type="text"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          placeholder="@yourhandle"
        />
        <p className="text-xs text-muted-foreground">
          Shown on premium cards. Add later if you skip.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Setting up…" : "Get started"}
      </Button>
    </form>
  );
}
