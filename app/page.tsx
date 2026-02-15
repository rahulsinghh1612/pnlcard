import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
      <div className="text-center max-w-lg">
        <div className="inline-flex w-14 h-14 rounded-xl bg-logo items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
          P
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          PNLCard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Log. Share. Grow.
        </p>
        <p className="mt-4 text-muted-foreground">
          Log your daily P&L in under 60 seconds. Generate beautiful shareable cards for X and Instagram.
        </p>
        <Button asChild size="lg" className="mt-8 bg-logo hover:opacity-90">
          <Link href="/login" className="inline-flex items-center gap-2">
            Start for Free
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </Button>
      </div>
    </main>
  );
}
