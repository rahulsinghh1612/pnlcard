"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <nav className="flex items-center gap-3">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/dashboard/settings" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </nav>
  );
}
