"use client";

import { createContext, useContext, useState, useEffect } from "react";

// ─── Types & Context ─────────────────────────────────────────────

export type CurrencyConfig = { isINR: boolean; fmt: (v: number) => string };

export function makeFmt(isINR: boolean) {
  return (v: number) => {
    const sign = v >= 0 ? "+" : "\u2212";
    const abs = Math.abs(v);
    return isINR
      ? `${sign}\u20B9${abs.toLocaleString("en-IN")}`
      : `${sign}$${abs.toLocaleString("en-US")}`;
  };
}

export const CurrencyCtx = createContext<CurrencyConfig>({
  isINR: true,
  fmt: makeFmt(true),
});

export function useCurrency(): CurrencyConfig {
  const [isINR, setIsINR] = useState(true);
  useEffect(() => {
    const lang = navigator.language ?? "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    setIsINR(
      lang.startsWith("en-IN") ||
        lang.startsWith("hi") ||
        tz.includes("Kolkata") ||
        tz.includes("Calcutta"),
    );
  }, []);
  return { isINR, fmt: makeFmt(isINR) };
}

export function useCurrencyCtx() {
  return useContext(CurrencyCtx);
}

// ─── Shared formatting helpers ───────────────────────────────────

export function formatCompactCurrency(value: number, isINR: boolean): string {
  const sign = value >= 0 ? "+" : "-";
  const abs = Math.abs(value);
  const symbol = isINR ? "\u20B9" : "$";
  const formatted = isINR
    ? abs.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${sign}${symbol}${formatted}`;
}

export function formatPnlCurrency(v: number, isINR: boolean): string {
  const sign = v >= 0 ? "+" : "-";
  const abs = Math.abs(v);
  const symbol = isINR ? "\u20B9" : "$";
  const formatted = isINR
    ? abs.toLocaleString("en-IN")
    : abs.toLocaleString("en-US");
  return `${sign}${symbol}${formatted}`;
}

export function formatPnlShortCurrency(v: number, isINR: boolean): string {
  const abs = Math.abs(v);
  const symbol = isINR ? "\u20B9" : "$";
  if (abs >= 1000) {
    const k = abs / 1000;
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${v >= 0 ? "+" : "-"}${symbol}${formatted}k`;
  }
  return `${v >= 0 ? "+" : "-"}${symbol}${abs}`;
}
