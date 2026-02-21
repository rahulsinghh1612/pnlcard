import { Suspense } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — PNLCard",
  description: "Sign in to PNLCard to log your trades and generate shareable recap cards.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block mb-8">
          <div className="logo-capsule px-4 py-1.5 text-sm">
            Pnl Card
          </div>
        </Link>

        <Card className="p-8">
          <CardHeader className="p-0">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to log your trades and generate cards
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? Sign up with Google or email above.
        </p>
      </div>
    </main>
  );
}
