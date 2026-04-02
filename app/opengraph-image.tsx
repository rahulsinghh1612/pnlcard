import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PnLCard — The simplest trading journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ── Calendar data matching the landing page dashboard ──────── */
type Cell = { day: number | null; pnl?: number };

const CAL: Cell[][] = [
  [{ day: null }, { day: null }, { day: null }, { day: 1 }, { day: 2, pnl: 8400 }, { day: 3, pnl: 2200 }, { day: 4 }],
  [{ day: 5, pnl: -3400 }, { day: 6, pnl: -6200 }, { day: 7, pnl: 3200 }, { day: 8 }, { day: 9, pnl: -2800 }, { day: 10, pnl: 4400 }, { day: 11 }],
  [{ day: 12, pnl: 9800 }, { day: 13 }, { day: 14, pnl: 6200 }, { day: 15, pnl: 8400 }, { day: 16, pnl: -2000 }, { day: 17 }, { day: 18 }],
  [{ day: 19, pnl: 7600 }, { day: 20, pnl: -2400 }, { day: 21, pnl: 4800 }, { day: 22, pnl: -3200 }, { day: 23, pnl: 7600 }, { day: 24 }, { day: 25 }],
  [{ day: 26 }, { day: 27, pnl: 8200 }, { day: 28, pnl: 6400 }, { day: 29, pnl: -1800 }, { day: 30, pnl: 5600 }, { day: 31, pnl: 2200 }, { day: null }],
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function bg(pnl: number | undefined): string {
  if (pnl === undefined) return "#f9fafb";
  if (pnl >= 8000) return "#86efac";
  if (pnl >= 4000) return "#bbf7d0";
  if (pnl > 0) return "#dcfce7";
  if (pnl >= -2000) return "#fee2e2";
  if (pnl >= -4000) return "#fecaca";
  return "#fca5a5";
}

function fmt(pnl: number): string {
  const abs = Math.abs(pnl);
  const sign = pnl >= 0 ? "+" : "-";
  if (abs >= 1000) return `${sign}\u20B9${(abs / 1000).toFixed(1).replace(".0", "")}k`;
  return `${sign}\u20B9${abs}`;
}

export default async function Image() {
  const CW = 66; // cell width
  const CH = 62; // cell height
  const GAP = 4;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* ── Left: branding ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "46%",
            padding: "48px 32px 48px 56px",
          }}
        >
          {/* Logo icon + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            {/* Bar-chart card icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#f4f4f5",
                border: "2px solid #d4d4d8",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 3,
                padding: "0 6px 6px 6px",
              }}
            >
              <div style={{ width: 6, height: 10, borderRadius: 2, background: "#dc2626", opacity: 0.85 }} />
              <div style={{ width: 6, height: 15, borderRadius: 2, background: "#16a34a", opacity: 0.9 }} />
              <div style={{ width: 6, height: 20, borderRadius: 2, background: "#16a34a" }} />
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}>
              <div style={{ color: "#111827" }}>PnL</div>
              <div style={{ color: "#9ca3af" }}>Card</div>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 34,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            <div style={{ display: "flex" }}>The trading journal</div>
            <div style={{ display: "flex" }}>that only takes</div>
            <div style={{ display: "flex", color: "#059669", marginTop: 4 }}>60 seconds a day</div>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 17, color: "#6b7280", marginTop: 16, lineHeight: 1.5 }}>
            Log daily results. Track your edge.
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 28,
              background: "#111827",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 10,
              width: 160,
            }}
          >
            Start for Free
          </div>
        </div>

        {/* ── Right: calendar dashboard ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "54%",
            padding: "32px 40px 32px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "white",
              borderRadius: 16,
              padding: "20px 18px 16px",
              border: "1px solid #e5e7eb",
              width: "100%",
            }}
          >
            {/* Month header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                padding: "0 4px",
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>January 2026</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#059669" }}>+₹63,200</div>
            </div>

            {/* Day-of-week headers */}
            <div style={{ display: "flex", gap: GAP }}>
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: CW,
                    height: 20,
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

            {/* Calendar rows */}
            {CAL.map((week, wi) => (
              <div key={wi} style={{ display: "flex", gap: GAP, marginTop: GAP }}>
                {week.map((cell, ci) => {
                  if (cell.day === null) {
                    return <div key={ci} style={{ width: CW, height: CH }} />;
                  }
                  const hasPnl = cell.pnl !== undefined;
                  return (
                    <div
                      key={ci}
                      style={{
                        width: CW,
                        height: CH,
                        borderRadius: 8,
                        background: hasPnl ? bg(cell.pnl) : "#f9fafb",
                        display: "flex",
                        flexDirection: "column",
                        padding: "4px 0 0 0",
                        position: "relative",
                      }}
                    >
                      {/* Date number */}
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          color: hasPnl
                            ? cell.pnl! >= 0
                              ? "#15803d"
                              : "#dc2626"
                            : "#9ca3af",
                          position: "absolute",
                          top: 4,
                          left: 6,
                        }}
                      >
                        {cell.day}
                      </div>
                      {/* P&L value */}
                      {hasPnl && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                            marginTop: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: cell.pnl! >= 0 ? "#15803d" : "#dc2626",
                            }}
                          >
                            {fmt(cell.pnl!)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginTop: 10, justifyContent: "center" }}>
              {[
                { label: "Profit", colors: ["#dcfce7", "#bbf7d0", "#86efac"] },
                { label: "Loss", colors: ["#fee2e2", "#fecaca", "#fca5a5"] },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#6b7280" }}
                >
                  {item.colors.map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  ))}
                  <div style={{ marginLeft: 2 }}>{item.label}</div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#6b7280" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#f3f4f6" }} />
                <div style={{ marginLeft: 2 }}>No trade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
