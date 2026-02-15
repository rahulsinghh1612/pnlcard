import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — PNLCard",
  description: "Your trading recap dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Check if user has any trades
  const { data: trades } = await supabase
    .from("trades")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const hasTrades = (trades?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Hi, {profile.display_name}
        </h1>
        <p className="mt-1 text-zinc-500">
          {hasTrades
            ? "Here’s your trading recap."
            : "Log your first trade to get started."}
        </p>
      </div>

      {!hasTrades ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-zinc-900">
            No trades yet
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Log your first trade to generate your first recap card.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Log trade
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-zinc-400">
            (Trade entry modal coming in Day 3)
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Recent entries will appear here.</p>
        </div>
      )}
    </div>
  );
}
