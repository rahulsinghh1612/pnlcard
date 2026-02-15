/**
 * Shared style helpers for OG card generation.
 * Used by /api/og/* routes to generate 1080×1080 PNG cards.
 *
 * Why: Satori (used by ImageResponse) requires inline styles.
 * These helpers centralize colors, gradients, and typography
 * so all card types (daily, weekly, monthly) stay consistent.
 */

export type OgStyles = {
  accent: string;
  accentDim: string;
  subtleGlow: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  dateColor: string;
  labelColor: string;
  bg: string;
  text1: string;
  text3: string;
  divider: string;
  cardBorder: string;
  lbl: Record<string, unknown>;
};

export function getOgStyles(isDark: boolean, isProfit: boolean): OgStyles {
  const accent = isProfit
    ? isDark
      ? "#22c55e"
      : "#16a34a"
    : isDark
      ? "#ef4444"
      : "#dc2626";
  const accentDim = isProfit
    ? isDark
      ? "rgba(34,197,94,0.5)"
      : "rgba(22,163,74,0.3)"
    : isDark
      ? "rgba(239,68,68,0.5)"
      : "rgba(220,38,38,0.3)";
  const subtleGlow = isProfit
    ? isDark
      ? "rgba(34,197,94,0.08)"
      : "rgba(22,163,74,0.06)"
    : isDark
      ? "rgba(239,68,68,0.08)"
      : "rgba(220,38,38,0.06)";
  const pillBg = isProfit
    ? isDark
      ? "rgba(34,197,94,0.06)"
      : "rgba(22,163,74,0.08)"
    : isDark
      ? "rgba(239,68,68,0.06)"
      : "rgba(220,38,38,0.08)";
  const pillBorder = isProfit
    ? isDark
      ? "rgba(34,197,94,0.12)"
      : "rgba(22,163,74,0.14)"
    : isDark
      ? "rgba(239,68,68,0.12)"
      : "rgba(220,38,38,0.14)";
  const bg = isDark
    ? isProfit
      ? "linear-gradient(155deg, #09090b 0%, #071a0e 35%, #0a2a14 65%, #09090b 100%)"
      : "linear-gradient(155deg, #09090b 0%, #1a0708 35%, #2a0a0d 65%, #09090b 100%)"
    : isProfit
      ? "linear-gradient(155deg, #fafcfb 0%, #e8faf0 35%, #c8f4d4 60%, #a7e9b8 100%)"
      : "linear-gradient(155deg, #fafcfb 0%, #fef2f2 35%, #fde2e4 65%, #fafcfb 100%)";
  const text1 = isDark ? "#e4e4e7" : "#18181b";
  const text3 = isDark ? "#71717a" : "#52525b";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pillText = isProfit
    ? isDark
      ? "rgba(34,197,94,0.85)"
      : "#15803d"
    : isDark
      ? "rgba(239,68,68,0.85)"
      : "#b91c1c";
  const dateColor = isDark ? "#a1a1aa" : "#3f3f46";
  /** Scaled from original 10px at 370px → ~29px at 1080px */
  const lbl = {
    display: "flex" as const,
    fontSize: 29,
    color: text3,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontWeight: 500,
    marginBottom: 6,
  };
  return {
    accent,
    accentDim,
    subtleGlow,
    pillBg,
    pillBorder,
    pillText,
    dateColor,
    labelColor,
    bg,
    text1,
    text3,
    divider,
    cardBorder,
    lbl,
  };
}

/** Scale factor: design was 370px, output is 1080px */
export const OG_SCALE = 1080 / 370;
