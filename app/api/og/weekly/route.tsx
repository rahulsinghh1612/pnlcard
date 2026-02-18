/**
 * API route: GET /api/og/weekly
 *
 * Generates a 1080×1080 PNG weekly recap card.
 * Params: range, pnl, roi?, winRate, wl, days (JSON), bestDay, handle?, theme, currency?
 *
 * SATORI RULES: Every element with >1 child needs display:"flex".
 * All text via template literals. No fragments.
 */
import { ImageResponse } from "next/og";
import { getOgStyles } from "@/lib/og-card-styles";
import { getOgFonts } from "../og-fonts";

export const runtime = "edge";

const S = 1080 / 370;

type DayData = { day: string; pnl: number; win: boolean };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "10 - 16 Feb, 2026";
    const pnl = searchParams.get("pnl") ?? "+37,594";
    const roi = searchParams.get("roi");
    const winRate = searchParams.get("winRate") ?? "60%";
    const wl = searchParams.get("wl") ?? "3W - 2L";
    const totalTrades = parseInt(searchParams.get("totalTrades") ?? "0", 10) || 0;
    const daysJson = searchParams.get("days");
    const bestDay = searchParams.get("bestDay") ?? "Thu +21,294";
    const handle = searchParams.get("handle");
    const theme = searchParams.get("theme") ?? "light";
    const currency = searchParams.get("currency") ?? "INR";
    // INR: no symbol (redundant for Indian users). USD: show "$".
    const symbol = currency === "USD" ? "$" : "";

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

    const tradedDays = days.filter((d) => d.pnl !== 0);
    const maxAbsPnl = Math.max(...tradedDays.map((d) => Math.abs(d.pnl)), 1);
    const maxSqrt = Math.sqrt(maxAbsPnl);
    const isDark = theme === "dark";
    const pnlNum = parseFloat(pnl.replace(/[^0-9.\-]/g, "")) || 0;
    const isProfit = pnlNum >= 0;
    const s = getOgStyles(isDark, isProfit);
    const hasRoi = roi != null && roi !== "";
    const pnlLabel = symbol ? `NET P/L (${symbol})` : "NET P/L";

    // --- Build main children ---
    const mainChildren: React.ReactNode[] = [];

    mainChildren.push(
      <div
        key="pnl-label"
        style={{
          display: "flex",
          fontSize: Math.round(10 * S),
          color: s.text3,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 500,
          marginBottom: Math.round(4 * S),
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
          fontSize: Math.round(46 * S),
          fontWeight: 900,
          color: s.accent,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: Math.round(hasRoi ? 20 * S : 40 * S),
        }}
      >
        {pnl}
      </div>
    );

    if (hasRoi) {
      mainChildren.push(
        <div
          key="roi-section"
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: Math.round(22 * S),
          }}
        >
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
              fontSize: Math.round(26 * S),
              fontWeight: 900,
              color: s.accent,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {roi}
          </div>
        </div>
      );
    }

    // Bar chart with sqrt scale and P&L values
    const formatBarPnl = (v: number): string => {
      if (v === 0) return "—";
      const abs = Math.abs(v);
      const formatted = currency === "INR"
        ? abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
      return v >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    mainChildren.push(
      <div
        key="bars"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: Math.round(8 * S),
          height: Math.round(56 * S),
        }}
      >
        {days.map((day, i) => {
          const hasData = day.pnl !== 0;

          if (!hasData) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: Math.round(9 * S),
                    color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                    fontWeight: 500,
                  }}
                >
                  {day.day}
                </div>
              </div>
            );
          }

          const height = Math.max(
            (Math.sqrt(Math.abs(day.pnl)) / maxSqrt) * Math.round(36 * S),
            Math.round(6 * S)
          );
          const barColor = day.win
            ? isDark
              ? "rgba(34,197,94,0.5)"
              : "rgba(22,163,74,0.4)"
            : isDark
              ? "rgba(239,68,68,0.5)"
              : "rgba(220,38,38,0.4)";
          const valColor = day.win
            ? isDark ? "#22c55e" : "#16a34a"
            : isDark ? "#ef4444" : "#dc2626";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: Math.round(2 * S),
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(7 * S),
                  fontWeight: 600,
                  color: valColor,
                  lineHeight: 1,
                }}
              >
                {formatBarPnl(day.pnl)}
              </div>
              <div
                style={{
                  width: "100%",
                  height,
                  background: barColor,
                  borderRadius: Math.round(3 * S),
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(9 * S),
                  color: s.text3,
                  fontWeight: 500,
                }}
              >
                {day.day}
              </div>
            </div>
          );
        })}
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
              marginBottom: Math.round(10 * S),
            }}
          >
            <div style={{ display: "flex", fontSize: Math.round(13 * S), color: s.text3 }}>
              {range}
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
                {totalTrades === 1 ? "1 Trade" : `${totalTrades} Trades`}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {mainChildren}
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
              {"Weekly Recap"}
            </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1080, fonts }
    );
  } catch (e) {
    console.error("OG weekly card error:", e);
    return new Response(
      `Failed to generate image: ${e instanceof Error ? e.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
