"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

const CODE_LENGTH = 6;

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("").slice(0, CODE_LENGTH);
      digits.forEach((d, i) => {
        if (index + i < CODE_LENGTH) newCode[index + i] = d;
      });
      setCode(newCode);
      const nextIdx = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    const fullCode = newCode.join("");
    if (fullCode.length === CODE_LENGTH && newCode.every((d) => d)) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (otp: string) => {
    if (!emailParam) {
      setError("Email not found. Please go back and sign up again.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: emailParam,
        token: otp,
        type: "email",
      });

      if (error) {
        setError(error.message);
        setVerifying(false);
        setCode(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;

    setResending(true);
    setError(null);
    setResent(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailParam,
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
            Enter verification code
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {emailParam || "your email"}
            </span>
          </p>

          <div className="mt-6 flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={CODE_LENGTH}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={verifying}
                className="w-11 h-13 text-center text-xl font-semibold border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 disabled:opacity-50 transition-all"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {verifying && (
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">
              Verifying...
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the code? Check spam, or{" "}
              <button
                onClick={handleResend}
                disabled={resending || !emailParam}
                className="text-emerald-600 hover:underline font-medium disabled:opacity-50"
              >
                {resending ? "sending..." : resent ? "sent!" : "resend code"}
              </button>
            </p>

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
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-page">
          <div className="animate-pulse text-muted-foreground">Loading…</div>
        </main>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
