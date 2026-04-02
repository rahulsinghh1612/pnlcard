import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PnLCard — The simplest trading journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          {/* Bar-chart card icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#f4f4f5",
              border: "2px solid #d4d4d8",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 3,
              padding: "0 8px 7px 8px",
            }}
          >
            <div style={{ width: 7, height: 12, borderRadius: 2, background: "#dc2626", opacity: 0.85 }} />
            <div style={{ width: 7, height: 18, borderRadius: 2, background: "#16a34a", opacity: 0.9 }} />
            <div style={{ width: 7, height: 24, borderRadius: 2, background: "#16a34a" }} />
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <div style={{ color: "#111827" }}>PnL</div>
            <div style={{ color: "#9ca3af" }}>Card</div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 52,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}
        >
          <div style={{ display: "flex" }}>The trading journal that only takes</div>
          <div style={{ display: "flex" }}>
            <div style={{ color: "#059669" }}>60 seconds</div>
            <div style={{ marginLeft: 14 }}>a day.</div>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#6b7280",
            marginTop: 24,
          }}
        >
          Log daily results. Built for simplicity and consistency.
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 32,
            border: "2px solid #e5e7eb",
            color: "#111827",
            fontSize: 18,
            fontWeight: 600,
            padding: "14px 36px",
            borderRadius: 12,
          }}
        >
          Start for Free
        </div>
      </div>
    ),
    { ...size },
  );
}
