"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Something went wrong.</p>
          <button
            onClick={reset}
            style={{ marginTop: "1rem", fontSize: "0.875rem", fontWeight: 500, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
