/**
 * API route: GET /api/og/weekly
 *
 * Generates a 1080×1080 PNG weekly recap card.
 * Clean white design with vertical bar chart.
 *
 * Params: range, pnl, roi?, roiLabel?, avgPerDay, days (JSON), handle?, currency?, format?
 *
 * SATORI RULES: Every element with >1 child needs display:"flex".
 * All text via template literals. No fragments.
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

type DayData = { day: string; pnl: number; win: boolean };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "10 – 16 Mar, 2026";
    const pnl = searchParams.get("pnl") ?? "+37,594";
    const roi = searchParams.get("roi");
    const roiLabel = searchParams.get("roiLabel") ?? "ROI";
    const avgPerDay = searchParams.get("avgPerDay") ?? "";
    const daysJson = searchParams.get("days");
    const handle = searchParams.get("handle");
    const format = searchParams.get("format") ?? "square";
    const currency = searchParams.get("currency") ?? "INR";

    const isStory = format === "story";
    const isOg = format === "og";
    const S = isOg ? 630 / 370 : isStory ? (1080 / 370) * 1.35 : 1080 / 370;
    const imgW = isOg ? 1200 : 1080;
    const imgH = isStory ? 1920 : isOg ? 630 : 1080;

    let days: DayData[] = [
      { day: "M", pnl: 12400, win: true },
      { day: "T", pnl: -3200, win: false },
      { day: "W", pnl: 8900, win: true },
      { day: "T", pnl: 21294, win: true },
      { day: "F", pnl: -1800, win: false },
      { day: "S", pnl: 0, win: false },
      { day: "S", pnl: 0, win: false },
    ];
    if (daysJson) {
      try {
        const parsed = JSON.parse(daysJson) as DayData[];
        if (Array.isArray(parsed) && parsed.length > 0) days = parsed;
      } catch {
        /* use default */
      }
    }

    const maxAbsPnl = Math.max(...days.map((d) => Math.abs(d.pnl)), 1);
    const pnlNum = parseFloat(pnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = pnlNum >= 0;
    const s = getOgStyles(isProfit);

    const hasRoi = roi != null && roi !== "";
    const hasAvg = avgPerDay !== "";

    const formatBarPnl = (v: number): string => {
      if (v === 0) return "";
      const abs = Math.abs(v);
      let formatted: string;
      if (abs >= 1000) {
        const k = abs / 1000;
        formatted = k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
      } else {
        formatted = currency === "INR"
          ? abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
      }
      return v >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    // --- Vertical bar chart (all 7 days) ---
    const barMaxHeight = Math.round((isStory ? 60 : 80) * S);
    const barWidth = Math.round((isStory ? 20 : 28) * S);

    const barColumns = days.map((day, i) => {
      const hasTrade = day.pnl !== 0;
      const ratio = hasTrade ? Math.abs(day.pnl) / maxAbsPnl : 0;
      const barH = hasTrade ? Math.max(Math.round(ratio * barMaxHeight), Math.round(6 * S)) : 0;
      const barColor = hasTrade
        ? day.win ? "rgba(22,163,74,0.35)" : "rgba(220,38,38,0.35)"
        : "transparent";
      const valColor = day.win ? "#16a34a" : "#dc2626";
      const label = formatBarPnl(day.pnl);

      return (
        <div
          key={`col-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: barWidth,
            gap: Math.round(4 * S),
          }}
        >
          {/* Value label above bar — fixed height so all columns align */}
          <div
            style={{
              display: "flex",
              height: Math.round(12 * S),
              alignItems: "flex-end",
              justifyContent: "center",
              fontSize: Math.round(8 * S),
              fontWeight: 600,
              color: hasTrade ? valColor : "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {label || "\u00A0"}
          </div>
          {/* Bar area — fixed height, bar anchored to bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              height: barMaxHeight,
              width: barWidth,
            }}
          >
            {barH > 0 ? (
              <div
                style={{
                  width: barWidth,
                  height: barH,
                  background: barColor,
                  borderRadius: `${Math.round(3 * S)}px ${Math.round(3 * S)}px 0 0`,
                }}
              />
            ) : (
              <div
                style={{
                  width: barWidth,
                  height: Math.round(2 * S),
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: Math.round(1 * S),
                }}
              />
            )}
          </div>
          {/* Day label below bar */}
          <div
            style={{
              display: "flex",
              fontSize: Math.round(10 * S),
              fontWeight: 500,
              color: hasTrade ? s.text3 : "rgba(0,0,0,0.2)",
            }}
          >
            {day.day}
          </div>
        </div>
      );
    });

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
        {/* Date range — pinned to top */}
        <div
          style={{
            display: "flex",
            fontSize: Math.round(13 * S),
            color: s.text1,
            fontWeight: 600,
            fontFamily: "SpaceGrotesk",
          }}
        >
          {range}
        </div>

        {/* Top spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* P&L label */}
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

        {/* Hero P&L */}
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
          {pnl}
        </div>

        {/* Spacer between P&L and stats */}
        <div style={{ height: Math.round(16 * S), display: "flex" }} />

        {/* ROI + Avg/Day inline (no card) */}
        <div style={{ display: "flex", gap: Math.round(24 * S) }}>
          {hasRoi && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(8 * S),
                  color: s.labelColor,
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: Math.round(2 * S),
                }}
              >
                {roiLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(16 * S),
                  fontWeight: 700,
                  color: s.accent,
                }}
              >
                {roi}
              </div>
            </div>
          )}
          {hasAvg && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(8 * S),
                  color: s.labelColor,
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: Math.round(2 * S),
                }}
              >
                {"Avg/Day"}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(16 * S),
                  fontWeight: 700,
                  color: s.accent,
                }}
              >
                {avgPerDay}
              </div>
            </div>
          )}
        </div>

        {/* Spacer between stats and chart */}
        <div style={{ height: Math.round(24 * S), display: "flex" }} />

        {/* Vertical bar chart — all 7 days */}
        <div
          style={{
            display: "flex",
            justifyContent: isStory ? "space-between" : "center",
            gap: isStory ? 0 : Math.round(10 * S),
          }}
        >
          {barColumns}
        </div>

        {/* Bottom spacer */}
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
            {"Weekly Recap"}
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
    console.error("OG weekly card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
