import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50">
      <div className="text-center max-w-lg">
        <div className="inline-flex w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 items-center justify-center text-white text-2xl font-bold mb-6">
          P
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          PNLCard
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Log. Share. Grow.
        </p>
        <p className="mt-4 text-zinc-500">
          Log your daily P&L in under 60 seconds. Generate beautiful shareable cards for X and Instagram.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-base font-medium text-white transition hover:bg-zinc-800"
        >
          Start for Free
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
