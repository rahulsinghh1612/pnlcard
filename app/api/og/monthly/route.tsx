/**
 * API route: GET /api/og/monthly
 *
 * Generates a 1080×1080 PNG monthly recap card with calendar heatmap.
 * Params: month, pnl, roi?, winRate, wl, best, worst, calendar (JSON),
 *         handle?, theme, currency?
 *
 * SATORI RULES: display:"flex" on every multi-child element, template
 * literals for all text, no CSS Grid (use nested flex), no fragments.
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

/* S is computed inside the handler based on output format. */

const CELL_HEIGHT = 18;

const DEFAULT_CALENDAR_GRID: (number | null)[] = [
  null, null, null, null, null, null, 1,
  2, 3, 4, 5, 6, 7, 8,
  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, null,
];

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? "February 2026";
    const pnl = searchParams.get("pnl") ?? "+1,87,420";
    const roi = searchParams.get("roi");
    const winRate = searchParams.get("winRate") ?? "73.7%";
    const wl = searchParams.get("wl") ?? "14W - 5L";
    const best = searchParams.get("best") ?? "16th +24,800";
    const worst = searchParams.get("worst") ?? "4th -8,200";
    const calendarJson = searchParams.get("calendar");
    const calendarGridJson = searchParams.get("calendarGrid");
    const handle = searchParams.get("handle");
    const theme = searchParams.get("theme") ?? "light";
    const format = searchParams.get("format") ?? "square";
    const isStory = format === "story";
    const isOg = format === "og";
    const S = isOg ? 630 / 370 : 1080 / 370;
    const imgW = isOg ? 1200 : 1080;
    const imgH = isStory ? 1920 : isOg ? 630 : 1080;
    const currency = searchParams.get("currency") ?? "INR";
    // INR: no symbol (redundant for Indian users). USD: show "$".
    const symbol = currency === "USD" ? "$" : "";

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

    const isDark = theme === "dark";
    const emptyColor = isDark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.04)";
    const pnlNum = parseFloat(pnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = pnlNum >= 0;
    const s = getOgStyles(isDark, isProfit);
    const hasRoi = roi != null && roi !== "";
    const pnlLabel = symbol ? `Net P/L (${symbol})` : "Net P/L";

    const getCellColor = (day: number): string => {
      const pnlVal = tradeData[day];
      if (pnlVal == null) return emptyColor;
      const intensity = Math.abs(pnlVal) / maxVal;
      const minOpacity = 0.15;
      const maxOpacity = 0.75;
      const opacity = minOpacity + intensity * (maxOpacity - minOpacity);
      if (pnlVal > 0) {
        return isDark
          ? `rgba(34,197,94,${opacity})`
          : `rgba(22,163,74,${opacity})`;
      }
      return isDark
        ? `rgba(239,68,68,${opacity})`
        : `rgba(220,38,38,${opacity})`;
    };

    // --- Calendar header row ---
    const calHeaderCells = DAY_HEADERS.map((d, i) => (
      <div
        key={`h${i}`}
        style={{
          flex: 1,
          height: Math.round(12 * S),
          fontSize: Math.round(8 * S),
          color: s.text3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        }}
      >
        {d}
      </div>
    ));

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
          const c = getCellColor(day);
          const hasTrade = tradeData[day] != null;
          const dayNumColor = hasTrade
            ? isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"
            : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)";
          return (
            <div
              key={`${row}-${col}`}
              style={{
                flex: 1,
                height: cellHeightPx,
                borderRadius: Math.round(4 * S),
                background: c,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(7 * S),
                  fontWeight: 500,
                  color: dayNumColor,
                  lineHeight: 1,
                }}
              >
                {`${day}`}
              </div>
            </div>
          );
        })}
      </div>
    ));

    // --- Hero numbers children ---
    const heroChildren: React.ReactNode[] = [];

    heroChildren.push(
      <div
        key="pnl-label"
        style={{
          display: "flex",
          fontSize: Math.round(10 * S),
          color: s.labelColor,
          letterSpacing: "0.1em",
          fontWeight: 500,
          marginBottom: Math.round(4 * S),
        }}
      >
        {pnlLabel}
      </div>
    );

    heroChildren.push(
      <div
        key="pnl-value"
        style={{
          display: "flex",
          fontSize: Math.round(32 * S),
          fontWeight: 900,
          color: s.accent,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: Math.round(12 * S),
        }}
      >
        {pnl}
      </div>
    );

    heroChildren.push(
      <div
        key="stats-row"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: Math.round(24 * S),
        }}
      >
        {hasRoi ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: Math.round(10 * S),
                color: s.labelColor,
                letterSpacing: "0.1em",
                fontWeight: 500,
                marginBottom: Math.round(3 * S),
              }}
            >
              {"Net ROI"}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: Math.round(20 * S),
                fontWeight: 900,
                color: s.accent,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {roi}
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(10 * S),
              color: s.labelColor,
              letterSpacing: "0.1em",
              fontWeight: 500,
              marginBottom: Math.round(3 * S),
            }}
          >
            {"Win Rate"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: Math.round(20 * S),
              fontWeight: 900,
              color: s.accent,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {winRate}
          </div>
        </div>
      </div>
    );

    // --- Watermark ---
    const watermarkLeft = !handle ? (
      <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.footerText, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {"Pnl Card"}
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
          padding: `${Math.round(20 * S)}px ${Math.round(26 * S)}px ${Math.round(16 * S)}px`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Math.round(14 * S),
          }}
        >
          <div style={{ display: "flex", fontSize: Math.round(16 * S), color: s.accent, fontWeight: 700, fontFamily: "SpaceGrotesk" }}>
            {month}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", marginBottom: Math.round(10 * S) }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: Math.round(3 * S),
              }}
            >
              {calHeaderCells}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: Math.round(3 * S),
              }}
            >
              {calRows}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {heroChildren}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {watermarkLeft}
          <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.footerText }}>
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
