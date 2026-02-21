"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, User, Settings, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardNavProps {
  displayName?: string;
  plan?: "free" | "premium";
}

export function DashboardNav({ displayName, plan = "free" }: DashboardNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const handleSignOut = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto min-w-[160px] p-1" sideOffset={6}>
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">{displayName ?? "Profile"}</span>
            </div>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              plan === "premium"
                ? "bg-amber-100 text-amber-700"
                : "bg-muted text-muted-foreground"
            }`}>
              {plan === "premium" ? "Pro" : "Free"}
            </span>
          </Link>
          <div className="my-0.5 h-px bg-border" />
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </PopoverContent>
      </Popover>
    </nav>
  );
}
