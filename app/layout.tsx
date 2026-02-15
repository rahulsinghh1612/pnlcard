import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PNLCard — Beautiful Trading Recap Cards",
  description:
    "Log your daily P&L in 60 seconds and generate stunning shareable cards for X and Instagram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
