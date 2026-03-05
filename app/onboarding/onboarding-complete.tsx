"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function OnboardingComplete() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 onboarding-check-in">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>

      <h2 className="text-xl font-semibold text-foreground">
        You&apos;re all set
      </h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
        Log today&apos;s result to start building your calendar.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Takes less than 60 seconds.
      </p>

      <div className="w-full mt-6 space-y-2">
        <button
          type="button"
          onClick={() => {
            router.push("/dashboard?log=1");
            router.refresh();
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
        >
          Log your first trade
        </button>
        <button
          type="button"
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
