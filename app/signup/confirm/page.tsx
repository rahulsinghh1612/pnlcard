"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayEmail = emailParam || email;

  const handleResend = async () => {
    const emailToUse = emailParam || email;
    if (!emailToUse) return;
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
      });

      if (error) {
        setError(error.message);
      } else {
        setResent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-2">
            <div className="logo-capsule px-4 py-2 text-base font-semibold">
              <PnLCardLogo size={22} />
            </div>
          </Link>
          <span className="text-sm font-medium text-foreground/80">
            Log. Share. Grow.
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{displayEmail || "your email"}</span>.
            Click the link to activate your account.
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder, or resend below.
          </p>

          {!emailParam && (
            <div className="mt-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="rounded-lg"
              />
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending || !(emailParam || email)}
            >
              {resending ? "Sending…" : resent ? "Email sent!" : "Resend confirmation email"}
            </Button>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupConfirmPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-page">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </main>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
