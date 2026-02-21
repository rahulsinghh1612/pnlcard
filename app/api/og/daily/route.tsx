/**
 * API route: GET /api/og/daily
 *
 * Generates a 1080×1080 PNG daily recap card for social sharing.
 *
 * Query params: date, pnl, charges?, netPnl, netRoi?, trades, streak,
 *               handle?, theme, currency?
 *
 * SATORI RULES (the image generator is very strict):
 *  - Every element with >1 child MUST have display:"flex"
 *  - No {var} text patterns — always use template literals {`${var} text`}
 *  - No CSS Grid, no filter:blur, no box-shadow
 *  - Use <div> everywhere (no <span>)
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

/**
 * Scale factor: The original PNLCard.jsx was designed at 370×370px.
 * Our OG image is 1080×1080px. So we multiply all sizes by ~2.92.
 * This keeps the proportions identical to the original mockup.
 */
const S = 1080 / 370;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "12th Feb, 2026";
    const pnl = searchParams.get("pnl") ?? "+21,294";
    const charges = searchParams.get("charges");
    const netPnl = searchParams.get("netPnl") ?? pnl;
    const netRoi = searchParams.get("netRoi");
    const trades = searchParams.get("trades") ?? "3";
    const streak = parseInt(searchParams.get("streak") ?? "0", 10);
    const handle = searchParams.get("handle");
    const theme = searchParams.get("theme") ?? "light";
    const isDark = theme === "dark";
    const netPnlNum = parseFloat(netPnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = netPnlNum >= 0;
    const s = getOgStyles(isDark, isProfit);
    const hasCharges = charges != null && charges !== "";
    const hasRoi = netRoi != null && netRoi !== "";

    const pnlLabel = hasCharges ? "NET P/L" : "P/L";
    const roiLabel = hasCharges ? "NET ROI" : "ROI";
    const tradeCount = trades.trim();
    const tradesText = tradeCount === "1" ? "1 Trade" : `${trades} Trades`;
    const streakText = streak >= 5 ? `${streak}d streak` : "";

    // --- Build main section children (avoiding JSX conditionals) ---
    const mainChildren: React.ReactNode[] = [];

    const sectionGap = Math.round(14 * S);
    const labelToValueGap = Math.round(6 * S);
    const headerToContentGap = Math.round(8 * S);

    if (hasCharges) {
      mainChildren.push(
        <div
          key="charges"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: Math.round(32 * S),
          }}
        >
          <div style={{ display: "flex", fontSize: Math.round(13 * S), color: s.accent, fontWeight: 700 }}>
            {pnl}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: s.pillBg,
              border: `${Math.round(1 * S)}px solid ${s.pillBorder}`,
              borderRadius: Math.round(8 * S),
              padding: `${Math.round(3 * S)}px ${Math.round(10 * S)}px`,
            }}
          >
            <div style={{ display: "flex", fontSize: Math.round(12 * S), color: s.pillText, fontWeight: 500 }}>
              {`Charges & taxes: ${charges}`}
            </div>
          </div>
        </div>
      );
    }

    mainChildren.push(
      <div
        key="pnl-label"
        style={{
          display: "flex",
          fontSize: Math.round(10 * S),
          color: s.labelColor,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 500,
          marginBottom: labelToValueGap,
        }}
      >
        {pnlLabel}
      </div>
    );

    mainChildren.push(
      <div
        key="pnl-value"
        style={{
          display: "flex",
          fontSize: Math.round(50 * S),
          fontWeight: 800,
          color: s.accent,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: sectionGap,
        }}
      >
        {netPnl}
      </div>
    );

    if (hasRoi) {
      mainChildren.push(
        <div
          key="roi-label"
          style={{
            display: "flex",
            fontSize: Math.round(10 * S),
            color: s.labelColor,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
            marginBottom: labelToValueGap,
          }}
        >
          {roiLabel}
        </div>
      );
      mainChildren.push(
        <div
          key="roi-value"
          style={{
            display: "flex",
            fontSize: Math.round(42 * S),
            fontWeight: 800,
            color: s.accent,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {netRoi}
        </div>
      );
    }

    // --- Streak dots (last dot solid, rest muted to match target) ---
    const streakDots: React.ReactNode[] = [];
    if (streak >= 5) {
      for (let i = 0; i < Math.min(streak, 10); i++) {
        const isLast = i === Math.min(streak, 10) - 1;
        streakDots.push(
          <div
            key={`dot-${i}`}
            style={{
              width: Math.round(6 * S),
              height: Math.round(6 * S),
              borderRadius: Math.round(3 * S),
              background: s.accent,
              opacity: isLast ? 1 : 0.5,
            }}
          />
        );
      }
    }

    // --- Watermark left side ---
    const watermarkLeft = !handle ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: Math.round(14 * S),
          paddingRight: Math.round(14 * S),
          paddingTop: Math.round(6 * S),
          paddingBottom: Math.round(6 * S),
          borderRadius: 9999,
          background: s.logoBg,
          border: `${Math.round(1 * S)}px solid ${s.logoBorder}`,
        }}
      >
        <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.logoText, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {"Pnl Card"}
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", fontSize: Math.round(13 * S), color: s.text3, fontWeight: 500 }}>
        {handle}
      </div>
    );

    const fonts = await getOgFonts();

    return new ImageResponse(
      (
      <div
        style={{
          width: 1080,
          height: 1080,
          fontFamily: "Inter",
          background: s.bg,
          padding: `${Math.round(24 * S)}px ${Math.round(36 * S)}px ${Math.round(24 * S)}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
          {/* Header: date + trades pill — tighter gap so P&L/charges line sits closer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: headerToContentGap,
            }}
          >
            <div style={{ display: "flex", fontSize: Math.round(14 * S), color: s.dateColor, fontWeight: 500 }}>
              {date}
            </div>
            <div
              style={{
                display: "flex",
                background: s.pillBg,
                border: `${Math.round(1 * S)}px solid ${s.pillBorder}`,
                borderRadius: Math.round(8 * S),
                padding: `${Math.round(3 * S)}px ${Math.round(10 * S)}px`,
              }}
            >
              <div style={{ display: "flex", fontSize: Math.round(12 * S), color: s.pillText, fontWeight: 500 }}>
                {tradesText}
              </div>
            </div>
          </div>

          {/* Main content — centered in remaining space so vertical gap is even top & bottom */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            {mainChildren}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {streak >= 5 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: Math.round(6 * S),
                  marginBottom: Math.round(6 * S),
                }}
              >
                <div style={{ display: "flex", gap: Math.round(3 * S) }}>
                  {streakDots}
                </div>
                <div style={{ display: "flex", fontSize: Math.round(11 * S), color: s.text3, fontWeight: 500 }}>
                  {streakText}
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {watermarkLeft}
              <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.text3 }}>
                {"Daily Recap"}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        fonts,
      }
    );
  } catch (e) {
    console.error("OG daily card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
