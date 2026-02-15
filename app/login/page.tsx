import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — PNLCard",
  description: "Sign in to PNLCard to log your trades and generate shareable recap cards.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-900 font-semibold mb-8"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          PNLCard
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sign in to log your trades and generate cards
          </p>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-zinc-100" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account? Sign up with Google or email above.
        </p>
      </div>
    </main>
  );
}
