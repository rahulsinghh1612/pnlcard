"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface ProfileFormProps {
  userId: string;
  initialData: {
    displayName: string;
    xHandle: string;
    currency: "INR" | "USD";
    timezone: string;
    tradingCapital: string;
    cardTheme: "light" | "dark";
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
  const [cardTheme, setCardTheme] = useState(initialData.cardTheme);

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

    const capital = tradingCapital.trim()
      ? parseFloat(tradingCapital.replace(/,/g, ""))
      : null;
    if (tradingCapital.trim() && (capital === null || isNaN(capital) || capital <= 0)) {
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
        card_theme: cardTheme,
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
            <div className="flex gap-3">
              {(["INR", "USD"] as const).map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={currency === c ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCurrency(c)}
                >
                  {c === "INR" ? "₹ INR" : "$ USD"}
                </Button>
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
            <Input
              id="tradingCapital"
              value={tradingCapital}
              onChange={(e) => setTradingCapital(e.target.value)}
              placeholder="e.g. 100000"
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">
              Used for ROI calculations on your cards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card theme */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-sm font-medium text-foreground">Card theme</h2>
          <p className="text-xs text-muted-foreground">
            Default theme for your generated recap cards.
          </p>
          <div className="flex gap-3">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCardTheme(t)}
                className={`relative flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${
                  cardTheme === t
                    ? "border-foreground bg-muted"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                {cardTheme === t && (
                  <Check className="absolute top-2 right-2 h-3.5 w-3.5" />
                )}
                <div
                  className={`mx-auto mb-2 h-8 w-full rounded ${
                    t === "light" ? "bg-white border border-border" : "bg-zinc-900"
                  }`}
                />
                {t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="w-full" size="lg">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
