"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatTradingCapital, parseTradingCapital } from "@/lib/utils";

interface ProfileFormProps {
  userId: string;
  initialData: {
    displayName: string;
    xHandle: string;
    currency: "INR" | "USD";
    timezone: string;
    tradingCapital: string;
  };
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "US Eastern (ET)" },
  { value: "America/Chicago", label: "US Central (CT)" },
  { value: "America/Denver", label: "US Mountain (MT)" },
  { value: "America/Los_Angeles", label: "US Pacific (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [xHandle, setXHandle] = useState(initialData.xHandle);
  const [currency, setCurrency] = useState(initialData.currency);
  const [timezone, setTimezone] = useState(initialData.timezone);
  const [tradingCapital, setTradingCapital] = useState(initialData.tradingCapital);

  // Format trading capital on mount and when currency changes
  useEffect(() => {
    if (tradingCapital) {
      const raw = tradingCapital.replace(/\D/g, "");
      setTradingCapital(formatTradingCapital(raw, currency));
    }
  }, [currency]); // eslint-disable-line react-hooks/exhaustive-deps -- format when currency changes

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error("Display name is required.");
      return;
    }

    const handle = xHandle.trim() || null;
    if (handle && !handle.startsWith("@")) {
      toast.error("X handle should start with @ (e.g. @yourhandle).");
      return;
    }

    const capital = parseTradingCapital(tradingCapital);
    if (tradingCapital.trim() && (capital === null || capital <= 0)) {
      toast.error("Trading capital must be a positive number.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedName,
        x_handle: handle,
        currency,
        timezone,
        trading_capital: capital,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated.");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Display name */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xHandle">X handle</Label>
            <Input
              id="xHandle"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@yourhandle"
            />
            <p className="text-xs text-muted-foreground">
              Shown on your generated cards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trading preferences */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-sm font-medium text-foreground">Trading preferences</h2>

          <div className="space-y-2">
            <Label>Currency</Label>
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

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
              {!TIMEZONES.some((tz) => tz.value === timezone) && (
                <option value={timezone}>{timezone.replace(/_/g, " ")}</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingCapital">Trading capital</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currency === "INR" ? "₹" : "$"}
              </span>
              <Input
                id="tradingCapital"
                value={tradingCapital}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setTradingCapital(raw === "" ? "" : formatTradingCapital(raw, currency));
                }}
                placeholder={currency === "INR" ? "e.g. 1,00,000" : "e.g. 100,000"}
                inputMode="numeric"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used for ROI calculations on your cards.
            </p>
          </div>
        </CardContent>
      </Card>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
