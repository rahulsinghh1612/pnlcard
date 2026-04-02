import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PnLCard — The simplest trading journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ── Sample calendar data (mirrors landing page) ─────────────── */
const CALENDAR = [
  // Row 1: week headers + first partial week
  [null, null, null, null, { pnl: 8400 }, { pnl: 2200 }, null],
  // Row 2
  [{ pnl: -3400 }, { pnl: -6200 }, { pnl: 3200 }, null, { pnl: -2800 }, { pnl: 4400 }, null],
  // Row 3
  [{ pnl: 9800 }, null, { pnl: 6200 }, { pnl: 8400 }, { pnl: -2000 }, null, null],
  // Row 4
  [{ pnl: 7600 }, { pnl: -2400 }, { pnl: 4800 }, { pnl: -3200 }, { pnl: 7600 }, null, null],
  // Row 5
  [null, { pnl: 8200 }, { pnl: 6400 }, { pnl: -1800 }, { pnl: 5600 }, { pnl: 2200 }, null],
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function cellColor(pnl: number | undefined): string {
  if (pnl === undefined) return "transparent";
  if (pnl > 5000) return "#bbf7d0";   // strong green
  if (pnl > 0) return "#dcfce7";      // light green
  if (pnl > -3000) return "#fee2e2";  // light red
  return "#fecaca";                     // strong red
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif",
          padding: 0,
        }}
      >
        {/* ── Left side: branding + headline ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "52%",
            padding: "48px 48px 48px 56px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: "linear-gradient(135deg, #059669, #34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              P
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em" }}>
              PnLCard
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 36,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            <div style={{ display: "flex" }}>The trading journal</div>
            <div style={{ display: "flex" }}>that only takes</div>
            <div
              style={{
                display: "flex",
                color: "#059669",
                marginTop: 4,
              }}
            >
              60 seconds a day
            </div>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 18, color: "#6b7280", marginTop: 16, lineHeight: 1.5 }}>
            Log daily results. Track your edge.
          </div>

          {/* CTA hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 28,
              background: "#111827",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 10,
              width: 170,
            }}
          >
            Start for Free
          </div>
        </div>

        {/* ── Right side: calendar preview ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "48%",
            padding: "40px 48px 40px 0",
          }}
        >
          {/* Card container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: 16,
              padding: "24px 20px",
              border: "1px solid #e5e7eb",
              width: "100%",
            }}
          >
            {/* Month header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>January 2026</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>+₹63,200</div>
            </div>

            {/* Day headers */}
            <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 62,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {CALENDAR.map((week, wi) => (
              <div key={wi} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                {week.map((cell, ci) => (
                  <div
                    key={ci}
                    style={{
                      width: 62,
                      height: 52,
                      borderRadius: 8,
                      background: cell ? cellColor(cell.pnl) : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cell && (
                      <div
                        style={{
                          display: "flex",
                          fontSize: 12,
                          fontWeight: 700,
                          color: cell.pnl >= 0 ? "#059669" : "#dc2626",
                        }}
                      >
                        {cell.pnl >= 0 ? "+" : ""}
                        {cell.pnl >= 1000 || cell.pnl <= -1000
                          ? `${(cell.pnl / 1000).toFixed(1)}k`
                          : cell.pnl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 6, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#dcfce7" }} />
                Profit
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#fecaca" }} />
                Loss
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#f3f4f6" }} />
                No trade
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
