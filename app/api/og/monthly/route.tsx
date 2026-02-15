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

const S = 1080 / 370;

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
    const pnlLabel = symbol ? `NET P/L (${symbol})` : "NET P/L";

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
          return (
            <div
              key={`${row}-${col}`}
              style={{
                flex: 1,
                height: cellHeightPx,
                borderRadius: Math.round(4 * S),
                background: c,
              }}
            />
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
          color: s.text3,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 500,
          marginBottom: Math.round(2 * S),
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
          marginBottom: Math.round(6 * S),
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
          gap: Math.round(18 * S),
        }}
      >
        {hasRoi ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: Math.round(10 * S),
                color: s.text3,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 500,
                marginBottom: Math.round(2 * S),
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
              color: s.text3,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 500,
              marginBottom: Math.round(2 * S),
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
      <div style={{ display: "flex", alignItems: "center", gap: Math.round(5 * S) }}>
        <div
          style={{
            width: Math.round(15 * S),
            height: Math.round(15 * S),
            borderRadius: Math.round(4 * S),
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.round(7 * S),
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {"P"}
        </div>
        <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.text3, fontWeight: 500 }}>
          {"PNLCard"}
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
            padding: `${Math.round(20 * S)}px ${Math.round(26 * S)}px ${Math.round(16 * S)}px`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: Math.round(8 * S),
            }}
          >
            <div style={{ display: "flex", fontSize: Math.round(14 * S), color: s.text1, fontWeight: 600 }}>
              {month}
            </div>
            <div
              style={{
                display: "flex",
                background: s.pillBg,
                border: `${Math.round(1 * S)}px solid ${s.pillBorder}`,
                borderRadius: Math.round(8 * S),
                padding: `${Math.round(2 * S)}px ${Math.round(9 * S)}px`,
              }}
            >
              <div style={{ display: "flex", fontSize: Math.round(11 * S), color: s.text1, fontWeight: 600 }}>
                {wl}
              </div>
            </div>
          </div>

          {/* Calendar heatmap */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: Math.round(4 * S) }}>
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
            {/* Best/Worst legend */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: Math.round(5 * S),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: Math.round(4 * S),
                }}
              >
                <div
                  style={{
                    width: Math.round(8 * S),
                    height: Math.round(8 * S),
                    borderRadius: Math.round(2 * S),
                    background: isDark
                      ? "rgba(34,197,94,0.7)"
                      : "rgba(22,163,74,0.6)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontSize: Math.round(10 * S),
                    color: isDark ? "#22c55e" : "#16a34a",
                    fontWeight: 600,
                  }}
                >
                  {`Best: ${best}`}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: Math.round(4 * S),
                }}
              >
                <div
                  style={{
                    width: Math.round(8 * S),
                    height: Math.round(8 * S),
                    borderRadius: Math.round(2 * S),
                    background: isDark
                      ? "rgba(239,68,68,0.7)"
                      : "rgba(220,38,38,0.6)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontSize: Math.round(10 * S),
                    color: isDark ? "#ef4444" : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {`Worst: ${worst}`}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              height: Math.round(1 * S),
              background: s.divider,
              marginBottom: Math.round(8 * S),
            }}
          />

          {/* Hero numbers */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: Math.round(4 * S) }}>
            {heroChildren}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            {watermarkLeft}
            <div style={{ display: "flex", fontSize: Math.round(10 * S), color: s.text3 }}>
              {"Monthly Recap"}
            </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1080, fonts }
    );
  } catch (e) {
    console.error("OG monthly card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
