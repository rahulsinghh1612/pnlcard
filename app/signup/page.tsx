import { Suspense } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Create account — PNLCard",
  description: "Create your PNLCard account to start logging trades and generating shareable recap cards.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-2">
            <div className="logo-capsule px-5 py-2 text-base font-semibold">
              PnLCard
            </div>
          </Link>
          <span className="text-sm font-medium text-foreground/80">
            Log. Share. Grow.
          </span>
        </div>

        <Card className="p-8">
          <CardHeader className="p-0 text-center">
            <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with PNL Card — it&apos;s free
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
              <SignupForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
