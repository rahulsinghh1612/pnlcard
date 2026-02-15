"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

/**
 * Client-side providers for the app.
 * ThemeProvider: Forces light mode (per PRD - no dark mode for app UI).
 * Toaster: Enables toast notifications via sonner.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      {children}
      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}
