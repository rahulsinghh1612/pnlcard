"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/email-validation";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a code to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              autoFocus
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send reset code"
              )}
            </Button>
          </form>

          <div className="mt-6">
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
