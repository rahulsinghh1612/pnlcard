import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/providers";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PnLCard — Log daily results",
  description:
    "Log your daily P&L in 60 seconds and generate stunning shareable cards for X and Instagram.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pnlcard.com"),
  openGraph: {
    title: "PnLCard — Log daily results",
    description: "Generate beautiful trading recap cards for social media.",
    url: "/",
    siteName: "PnLCard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PnLCard — Log daily results",
    description: "Generate beautiful trading recap cards for social media.",
    site: "@pnlcard",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${font.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
