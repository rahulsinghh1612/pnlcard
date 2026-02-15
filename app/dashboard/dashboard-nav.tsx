"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavProps {
  displayName: string;
}

export function DashboardNav({ displayName }: DashboardNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex items-center gap-4">
      <span className="text-sm text-zinc-600">{displayName}</span>
      <Link
        href="/dashboard/settings"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        Settings
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        Sign out
      </button>
    </nav>
  );
}
