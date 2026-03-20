/**
 * API route: GET /api/og/daily
 *
 * Generates a 1080×1080 PNG daily recap card for social sharing.
 * Clean white design with adaptive layout — sections omitted when data is missing.
 *
 * Query params: date, pnl, netPnl, netRoi?, trades, handle?, currency?,
 *               disciplineScore?, executionTag?, format?
 *
 * SATORI RULES:
 *  - Every element with >1 child MUST have display:"flex"
 *  - No {var} text patterns — always use template literals {`${var} text`}
 *  - No CSS Grid, no filter:blur, no box-shadow
 *  - Use <div> everywhere (no <span>)
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "Thursday, 19 Mar 2026";
    const netPnl = searchParams.get("netPnl") ?? searchParams.get("pnl") ?? "+21,294";
    const netRoi = searchParams.get("netRoi");
    const trades = searchParams.get("trades") ?? "3";
    const handle = searchParams.get("handle");
    const format = searchParams.get("format") ?? "square";
    const disciplineScoreRaw = searchParams.get("disciplineScore");
    const executionTag = searchParams.get("executionTag");

    const isStory = format === "story";
    const isOg = format === "og";
    const S = isOg ? 630 / 370 : isStory ? (1080 / 370) * 1.35 : 1080 / 370;
    const imgW = isOg ? 1200 : 1080;
    const imgH = isStory ? 1920 : isOg ? 630 : 1080;

    const netPnlNum = parseFloat(netPnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = netPnlNum >= 0;
    const s = getOgStyles(isProfit);

    const hasRoi = netRoi != null && netRoi !== "";
    const disciplineScore = disciplineScoreRaw ? parseInt(disciplineScoreRaw, 10) : null;
    const hasDiscipline = disciplineScore != null && disciplineScore >= 1 && disciplineScore <= 5;
    const hasTag = executionTag != null && executionTag !== "";

    const tradeCount = trades.trim();

    // Format execution tags: "fomo_entry,no_stop_loss" → ["FOMO Entry", "No Stop Loss"]
    const formatTag = (raw: string): string =>
      raw
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    const tagList = hasTag
      ? executionTag!.split(",").map((t) => formatTag(t.trim())).filter(Boolean)
      : [];

    // --- Build sections ---
    const sections: React.ReactNode[] = [];

    // Count optional sections to scale spacing adaptively
    const optionalCount = (hasRoi ? 1 : 0) + (hasDiscipline ? 1 : 0) + (tagList.length > 0 ? 1 : 0);
    const sectionGap = optionalCount >= 2 ? Math.round(14 * S) : Math.round(20 * S);

    // P&L label + hero number
    sections.push(
      <div key="pnl" style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: Math.round(10 * S),
            color: s.labelColor,
            letterSpacing: "0.12em",
            fontWeight: 600,
            marginBottom: Math.round(4 * S),
          }}
        >
          {"P&L"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: Math.round(38 * S),
            fontWeight: 800,
            color: s.accent,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {netPnl}
        </div>
      </div>
    );

    // TRADES + ROI side-by-side
    const statColumns: React.ReactNode[] = [];
    statColumns.push(
      <div key="trades-col" style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: Math.round(10 * S),
            color: s.labelColor,
            letterSpacing: "0.12em",
            fontWeight: 600,
            marginBottom: Math.round(3 * S),
          }}
        >
          {"TRADES"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: Math.round(18 * S),
            fontWeight: 700,
            color: s.accent,
          }}
        >
          {tradeCount}
        </div>
      </div>
    );

    if (hasRoi) {
      statColumns.push(
        <div key="roi-col" style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(10 * S),
              color: s.labelColor,
              letterSpacing: "0.12em",
              fontWeight: 600,
              marginBottom: Math.round(3 * S),
            }}
          >
            {"ROI"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(18 * S),
              fontWeight: 700,
              color: s.accent,
            }}
          >
            {netRoi}
          </div>
        </div>
      );
    }

    sections.push(
      <div key="stats" style={{ display: "flex", gap: Math.round(40 * S), marginTop: sectionGap }}>
        {statColumns}
      </div>
    );

    // Discipline dots
    if (hasDiscipline) {
      const dots: React.ReactNode[] = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= disciplineScore;
        dots.push(
          <div
            key={`dot-${i}`}
            style={{
              width: Math.round(10 * S),
              height: Math.round(10 * S),
              borderRadius: Math.round(5 * S),
              background: filled ? "#16a34a" : "#e5e7eb",
            }}
          />
        );
      }
      sections.push(
        <div key="discipline" style={{ display: "flex", flexDirection: "column", marginTop: sectionGap }}>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(10 * S),
              color: s.labelColor,
              letterSpacing: "0.12em",
              fontWeight: 600,
              marginBottom: Math.round(6 * S),
            }}
          >
            {"DISCIPLINE"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: Math.round(6 * S) }}>
            <div style={{ display: "flex", gap: Math.round(5 * S) }}>
              {dots}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: Math.round(12 * S),
                color: s.text3,
                fontWeight: 500,
                marginLeft: Math.round(4 * S),
              }}
            >
              {`${disciplineScore}/5`}
            </div>
          </div>
        </div>
      );
    }

    // Execution tag pills (mistakes)
    if (tagList.length > 0) {
      const pills = tagList.map((tag, i) => (
        <div
          key={`pill-${i}`}
          style={{
            display: "flex",
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.18)",
            borderRadius: Math.round(6 * S),
            padding: `${Math.round(4 * S)}px ${Math.round(12 * S)}px`,
            fontSize: Math.round(11 * S),
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {tag}
        </div>
      ));
      sections.push(
        <div key="tag" style={{ display: "flex", flexDirection: "column", marginTop: sectionGap }}>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(10 * S),
              color: s.labelColor,
              letterSpacing: "0.12em",
              fontWeight: 600,
              marginBottom: Math.round(6 * S),
            }}
          >
            {"MISTAKES"}
          </div>
          <div style={{ display: "flex", gap: Math.round(6 * S), flexWrap: "wrap" }}>
            {pills}
          </div>
        </div>
      );
    }

    // Footer
    const watermarkLeft = !handle ? (
      <div style={{ display: "flex", fontSize: Math.round(11 * S), color: s.footerText, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {"PnLCard"}
      </div>
    ) : (
      <div style={{ display: "flex", fontSize: Math.round(13 * S), color: s.footerText, fontWeight: 500 }}>
        {handle}
      </div>
    );

    const fonts = await getOgFonts();

    const cardContent = (
      <div
        style={{
          width: imgW,
          height: imgH,
          fontFamily: "Inter",
          background: s.bg,
          border: `2px solid ${s.accent}`,
          borderRadius: Math.round(12 * S),
          padding: `${Math.round(32 * S)}px ${Math.round(36 * S)}px ${Math.round(24 * S)}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Date — pinned to top */}
        <div
          style={{
            display: "flex",
            fontSize: Math.round(13 * S),
            color: s.text1,
            fontWeight: 600,
            fontFamily: "SpaceGrotesk",
          }}
        >
          {date}
        </div>

        {/* Main content — vertically centered in remaining space */}
        <div style={{ flex: 1, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {sections}
        </div>
        <div style={{ flex: 1, display: "flex" }} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {watermarkLeft}
          <div style={{ display: "flex", fontSize: Math.round(11 * S), color: s.footerText }}>
            {"Daily Recap"}
          </div>
        </div>
      </div>
    );

    return new ImageResponse(cardContent, {
      width: imgW,
      height: imgH,
      fonts,
    });
  } catch (e) {
    console.error("OG daily card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
