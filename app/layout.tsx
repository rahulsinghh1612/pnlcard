import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PNLCard — Beautiful Trading Recap Cards for Social Media",
  description:
    "Log your daily P&L in 60 seconds and generate stunning shareable cards for X and Instagram. Free forever.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pnlcard.com"),
  openGraph: {
    title: "PNLCard — Log. Share. Grow.",
    description: "Generate beautiful trading recap cards for social media.",
    url: "/",
    siteName: "PNLCard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNLCard — Log. Share. Grow.",
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
    <html lang="en" className={`${font.variable} scroll-smooth`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
