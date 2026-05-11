"use client";

import { Loader2 } from "lucide-react";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-stone-100/90 ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span className="text-sm font-medium text-muted-foreground">
            Opening profile...
          </span>
        </div>
        <SkeletonBlock className="h-8 w-32" />
        <SkeletonBlock className="h-4 w-72" />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>

          <div className="flex justify-end">
            <SkeletonBlock className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
