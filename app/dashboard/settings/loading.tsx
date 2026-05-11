"use client";

import { Loader2 } from "lucide-react";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-stone-100/90 ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span className="text-sm font-medium text-muted-foreground">
            Opening settings...
          </span>
        </div>
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-4 w-52" />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-5 w-56" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-4 w-80 max-w-full" />
            </div>
            <SkeletonBlock className="h-7 w-14 rounded-md" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex justify-center">
          <SkeletonBlock className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
