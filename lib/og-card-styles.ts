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
  logoBg: string;
  logoText: string;
  logoBorder: string;
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
      ? "rgba(34,197,94,0.55)"
      : "rgba(22,163,74,0.3)"
    : isDark
      ? "rgba(239,68,68,0.55)"
      : "rgba(220,38,38,0.3)";
  const subtleGlow = isProfit
    ? isDark
      ? "rgba(34,197,94,0.14)"
      : "rgba(22,163,74,0.06)"
    : isDark
      ? "rgba(239,68,68,0.14)"
      : "rgba(220,38,38,0.06)";
  const pillBg = isProfit
    ? isDark
      ? "rgba(34,197,94,0.10)"
      : "rgba(22,163,74,0.08)"
    : isDark
      ? "rgba(239,68,68,0.10)"
      : "rgba(220,38,38,0.08)";
  const pillBorder = isProfit
    ? isDark
      ? "rgba(34,197,94,0.20)"
      : "rgba(22,163,74,0.14)"
    : isDark
      ? "rgba(239,68,68,0.20)"
      : "rgba(220,38,38,0.14)";
  const bg = isDark
    ? isProfit
      ? "linear-gradient(155deg, #0d0f13 0%, #0b2618 26%, #104a28 50%, #0b2618 74%, #0d0f13 100%)"
      : "linear-gradient(155deg, #0d0f13 0%, #260b10 26%, #4a1019 50%, #260b10 74%, #0d0f13 100%)"
    : isProfit
      ? "linear-gradient(155deg, #fafcfb 0%, #e8faf0 35%, #c8f4d4 60%, #a7e9b8 100%)"
      : "linear-gradient(155deg, #fafcfb 0%, #fef2f2 35%, #fde2e4 65%, #fafcfb 100%)";
  const text1 = isDark ? "#ececef" : "#18181b";
  const text3 = isDark ? "#8a8a94" : "#52525b";
  const labelColor = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.4)";
  const divider = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const pillText = isProfit
    ? isDark
      ? "rgba(34,197,94,0.90)"
      : "#15803d"
    : isDark
      ? "rgba(239,68,68,0.90)"
      : "#b91c1c";
  const dateColor = isDark ? "#b4b4bc" : "#3f3f46";
  const logoBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)";
  const logoText = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
  const logoBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
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
    logoBg,
    logoText,
    logoBorder,
  };
}

/** Scale factor: design was 370px, output is 1080px */
export const OG_SCALE = 1080 / 370;
