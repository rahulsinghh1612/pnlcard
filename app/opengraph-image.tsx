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
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #fafafa 0%, #f0fdf4 50%, #fafafa 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #059669, #34d399)",
          }}
        />

        {/* Logo + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* Simple logo mark */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #059669, #34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.03em",
            }}
          >
            PnLCard
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 800,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex" }}>The trading journal that only takes</div>
          <div
            style={{
              display: "flex",
              background: "linear-gradient(90deg, #059669, #34d399)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            60 seconds a day
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#6b7280",
            marginTop: 20,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Log daily results. Track your edge. Share beautiful recap cards.
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#9ca3af",
            letterSpacing: "0.05em",
          }}
        >
          pnlcard.com
        </div>
      </div>
    ),
    { ...size }
  );
}
