/**
 * API route: GET /api/og/monthly
 *
 * Generates a 1080×1080 PNG monthly recap card with calendar heatmap.
 * Clean white design — month pinned to top, P&L + ROI/Avg inline, calendar heatmap.
 *
 * Params: month, pnl, roi?, roiLabel?, avgPerDay?, calendar (JSON), calendarGrid (JSON),
 *         handle?, currency?, format?
 *
 * SATORI RULES: display:"flex" on every multi-child element, template
 * literals for all text, no CSS Grid (use nested flex), no fragments.
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

const CELL_HEIGHT = 24;

const DEFAULT_CALENDAR_GRID: (number | null)[] = [
  null, null, null, null, null, null, 1,
  2, 3, 4, 5, 6, 7, 8,
  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, null,
];


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? "March 2026";
    const pnl = searchParams.get("pnl") ?? "+1,87,420";
    const roi = searchParams.get("roi");
    const roiLabel = searchParams.get("roiLabel") ?? "ROI";
    const avgPerDay = searchParams.get("avgPerDay") ?? "";
    const calendarJson = searchParams.get("calendar");
    const calendarGridJson = searchParams.get("calendarGrid");
    const handle = searchParams.get("handle");
    const format = searchParams.get("format") ?? "square";

    const isStory = format === "story";
    const isOg = format === "og";
    const S = isOg ? 630 / 370 : isStory ? (1080 / 370) * 1.35 : 1080 / 370;
    const imgW = isOg ? 1200 : 1080;
    const imgH = isStory ? 1920 : isOg ? 630 : 1080;

    let tradeData: Record<string, number> = {
      2: 8400, 3: 12600, 4: -3200, 5: 5800, 6: 15200,
      9: 24800, 10: -8200, 11: 6400, 12: 18900, 13: -4100,
      16: 21300, 17: 9800, 18: 14200, 19: -6700, 20: 11500,
      23: 7200, 24: 16800, 25: -5400, 26: 13100, 27: 10600,
    };
    if (calendarJson) {
      try {
        const parsed = JSON.parse(calendarJson) as Record<string, number>;
        if (parsed && typeof parsed === "object") tradeData = parsed;
      } catch {
        /* use default */
      }
    }

    let calendarGrid: (number | null)[] = DEFAULT_CALENDAR_GRID;
    if (calendarGridJson) {
      try {
        const parsed = JSON.parse(calendarGridJson) as (number | null)[];
        if (Array.isArray(parsed) && parsed.length > 0) calendarGrid = parsed;
      } catch {
        /* use default */
      }
    }

    const values = Object.values(tradeData).map(Math.abs);
    const maxVal = Math.max(...values, 1);

    const pnlNum = parseFloat(pnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = pnlNum >= 0;
    const s = getOgStyles(isProfit);

    const hasRoi = roi != null && roi !== "";
    const hasAvg = avgPerDay !== "";

    const getDotOpacity = (day: number): number => {
      const pnlVal = tradeData[day];
      if (pnlVal == null) return 0;
      const intensity = Math.abs(pnlVal) / maxVal;
      return 0.35 + intensity * 0.5;
    };
    const isWin = (day: number): boolean => (tradeData[day] ?? 0) > 0;

    const numRows = Math.ceil(calendarGrid.length / 7);
    const cellHeightPx = Math.round(CELL_HEIGHT * S);

    const calRows = Array.from({ length: numRows }, (_, row) => (
      <div
        key={row}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: Math.round(3 * S),
        }}
      >
        {calendarGrid.slice(row * 7, row * 7 + 7).map((day, col) => {
          if (day === null) {
            return (
              <div
                key={`${row}-${col}`}
                style={{ flex: 1, height: cellHeightPx }}
              />
            );
          }
          const hasTrade = tradeData[day] != null;
          return (
            <div
              key={`${row}-${col}`}
              style={{
                flex: 1,
                height: cellHeightPx,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: Math.round(18 * S),
                  height: Math.round(18 * S),
                  borderRadius: Math.round(4 * S),
                  background: hasTrade
                    ? isWin(day)
                      ? `rgba(22,163,74,${getDotOpacity(day)})`
                      : `rgba(220,38,38,${getDotOpacity(day)})`
                    : "rgba(0,0,0,0.06)",
                }}
              />
            </div>
          );
        })}
      </div>
    ));

    // --- Watermark ---
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
        {/* Month name — pinned to top */}
        <div
          style={{
            display: "flex",
            fontSize: Math.round(13 * S),
            color: s.text1,
            fontWeight: 600,
            fontFamily: "SpaceGrotesk",
          }}
        >
          {month}
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
            fontSize: Math.round(34 * S),
            fontWeight: 800,
            color: s.accent,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {pnl}
        </div>

        {/* Spacer between P&L and stats */}
        <div style={{ height: Math.round(12 * S), display: "flex" }} />

        {/* ROI + Avg/Day inline (no card) */}
        <div style={{ display: "flex", gap: Math.round(24 * S) }}>
          {hasRoi && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(7 * S),
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
                  fontSize: Math.round(14 * S),
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
                  fontSize: Math.round(7 * S),
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
                  fontSize: Math.round(14 * S),
                  fontWeight: 700,
                  color: s.accent,
                }}
              >
                {avgPerDay}
              </div>
            </div>
          )}
        </div>

        {/* Spacer between stats and calendar */}
        <div style={{ height: Math.round(16 * S), display: "flex" }} />

        {/* Calendar heatmap */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: Math.round(3 * S),
          }}
        >
          {calRows}
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
            {"Monthly Recap"}
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
    console.error("OG monthly card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
