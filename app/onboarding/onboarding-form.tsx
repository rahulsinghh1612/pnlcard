"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700">
          Display name <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should we call you?"
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-zinc-700">
          Currency <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5 flex gap-3">
          {(["INR", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                currency === c
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="tradingCapital" className="block text-sm font-medium text-zinc-700">
          Trading capital <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          id="tradingCapital"
          type="text"
          value={tradingCapital}
          onChange={(e) => setTradingCapital(e.target.value)}
          placeholder="e.g. 100000"
          inputMode="numeric"
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Used for ROI calculations. You can add this later in settings.
        </p>
      </div>

      <div>
        <label htmlFor="xHandle" className="block text-sm font-medium text-zinc-700">
          X handle <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          id="xHandle"
          type="text"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          placeholder="@yourhandle"
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Shown on premium cards. Add later if you skip.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {isLoading ? "Setting up…" : "Get started"}
      </button>
    </form>
  );
}
