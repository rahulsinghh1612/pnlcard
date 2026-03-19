/**
 * Shared style helpers for OG card generation.
 * Used by /api/og/* routes to generate 1080×1080 PNG cards.
 *
 * Light mode only — clean white background, no gradients.
 */

export type OgStyles = {
  accent: string;
  accentDim: string;
  footerText: string;
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

export function getOgStyles(isProfit: boolean): OgStyles {
  const accent = isProfit ? "#16a34a" : "#dc2626";
  const accentDim = isProfit ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)";
  const footerText = "rgba(0,0,0,0.35)";
  const pillBg = isProfit ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)";
  const pillBorder = isProfit ? "rgba(22,163,74,0.14)" : "rgba(220,38,38,0.14)";
  const bg = "#ffffff";
  const text1 = "#18181b";
  const text3 = "#52525b";
  const labelColor = "#71717a";
  const divider = "rgba(0,0,0,0.06)";
  const cardBorder = "rgba(0,0,0,0.08)";
  const pillText = isProfit ? "#15803d" : "#b91c1c";
  const dateColor = "#3f3f46";
  const logoBg = "rgba(255,255,255,0.55)";
  const logoText = "rgba(0,0,0,0.45)";
  const logoBorder = "rgba(0,0,0,0.06)";
  const lbl = {
    display: "flex" as const,
    fontSize: 29,
    color: labelColor,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontWeight: 500,
    marginBottom: 6,
  };
  return {
    accent,
    accentDim,
    footerText,
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
