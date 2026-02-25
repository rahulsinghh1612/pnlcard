"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";

function ResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"code" | "password">("code");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === "password") {
      passwordRef.current?.focus();
    }
  }, [step]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError("Please enter the full code from your email.");
      return;
    }

    if (!emailParam) {
      setError("Email not found. Please go back and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: emailParam,
        token: trimmed,
        type: "recovery",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setStep("password");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;

    setResending(true);
    setError(null);
    setResent(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(emailParam);

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

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <KeyRound className="h-7 w-7 text-emerald-600" />
            </div>
          </div>

          {step === "code" ? (
            <>
              <div className="text-center">
                <h1 className="text-xl font-semibold text-foreground">
                  Enter reset code
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a code to{" "}
                  <span className="font-medium text-foreground">
                    {emailParam || "your email"}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  disabled={loading}
                  placeholder="Enter code"
                  className="w-full text-center text-2xl font-semibold tracking-[0.3em] py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 disabled:opacity-50 transition-all placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                  autoComplete="one-time-code"
                />

                <Button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify code"
                  )}
                </Button>
              </form>

              {error && (
                <p className="mt-4 text-sm text-destructive text-center">{error}</p>
              )}

              <div className="mt-6 space-y-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    onClick={handleResend}
                    disabled={resending || !emailParam}
                    className="text-emerald-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {resending ? "sending..." : resent ? "sent!" : "resend code"}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-xl font-semibold text-foreground">
                  Set new password
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <Input
                  ref={passwordRef}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 characters)"
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            </>
          )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-page">
          <div className="animate-pulse text-muted-foreground">Loading…</div>
        </main>
      }
    >
      <ResetContent />
    </Suspense>
  );
}
