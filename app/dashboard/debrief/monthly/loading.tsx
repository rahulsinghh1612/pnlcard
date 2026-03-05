export default function MonthlyDebriefLoading() {
  return (
    <div className="space-y-3 pb-12 animate-pulse">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 rounded-lg bg-muted" />
          <div className="flex gap-1">
            <div className="h-7 w-7 rounded-lg bg-muted" />
            <div className="h-7 w-7 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Card 1 — Hero P&L + metrics */}
      <div className="rounded-2xl border border-border bg-white px-6 py-6 sm:px-8">
        <div className="h-3 w-48 rounded bg-muted" />
        <div className="mt-4 h-10 w-32 rounded bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-slate-50/60 px-4 py-3.5">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-2 h-5 w-12 rounded bg-muted" />
          </div>
          <div className="rounded-xl border border-border bg-slate-50/60 px-4 py-3.5">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-2 h-5 w-12 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Card 2 — Week by Week */}
      <div className="rounded-2xl border border-border bg-white px-6 py-5 sm:px-8">
        <div className="h-3 w-24 rounded bg-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 h-7">
              <div className="h-3 w-24 rounded bg-muted shrink-0" />
              <div className="flex-1 h-4 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Card 3 — Chart area */}
      <div className="rounded-2xl border border-border bg-white px-6 py-5 sm:px-8">
        <div className="h-3 w-32 rounded bg-muted mb-4" />
        <div className="h-48 rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}
