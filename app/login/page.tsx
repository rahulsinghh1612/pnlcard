import { Suspense } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";

export const metadata = {
  title: "Sign in — PNLCard",
  description: "Sign in to PNLCard to log your trades and generate shareable recap cards.",
};

export default function LoginPage() {
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

        <Card className="p-8">
          <CardHeader className="p-0 text-center">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
