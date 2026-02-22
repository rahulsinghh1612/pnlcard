import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PNLCard",
  description: "How PNLCard collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page">
      <nav className="border-b border-border bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <Link href="/" className="logo-capsule px-4 py-1.5 text-sm">
            Pnl Card
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-slate prose-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: February 22, 2026
        </p>

        <section className="mt-10 space-y-6 text-sm text-foreground/80 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              1. Who we are
            </h2>
            <p>
              PNLCard (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a
              product of Next Alphabet. This policy explains how we collect, use,
              and protect your information when you use pnlcard.com.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              2. Information we collect
            </h2>
            <p>We collect the following data when you use PNLCard:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Account information:</strong> Name, email address, and
                profile picture provided via Google sign-in.
              </li>
              <li>
                <strong>Profile data:</strong> Display name, X (Twitter) handle,
                preferred currency, timezone, and trading capital — entered by
                you during onboarding.
              </li>
              <li>
                <strong>Trade data:</strong> Daily P&amp;L entries including net
                profit/loss, number of trades, charges, capital deployed, and
                notes.
              </li>
              <li>
                <strong>Payment information:</strong> Subscription status and
                billing period. Payment card details are processed by Razorpay
                and never stored on our servers.
              </li>
              <li>
                <strong>Usage data:</strong> Pages visited and features used,
                collected through Vercel Analytics (anonymous, no cookies).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              3. How we use your information
            </h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>To provide and operate the PNLCard service.</li>
              <li>
                To generate trading recap cards with your data (P&amp;L, handle,
                stats).
              </li>
              <li>To process subscription payments via Razorpay.</li>
              <li>
                To send account-related emails (welcome, subscription
                confirmation, cancellation).
              </li>
              <li>To improve our product based on anonymous usage patterns.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              4. Data sharing
            </h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Supabase</strong> — database and authentication
                provider.
              </li>
              <li>
                <strong>Razorpay</strong> — payment processing (PCI-DSS
                compliant).
              </li>
              <li>
                <strong>Vercel</strong> — hosting and anonymous analytics.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              5. Data security
            </h2>
            <p>
              Your data is protected with Row Level Security (RLS) at the
              database level — each user can only access their own data. All
              connections use HTTPS. Authentication is handled by Supabase Auth
              with secure, httpOnly session cookies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              6. Data retention and deletion
            </h2>
            <p>
              Your data is retained as long as your account exists. You can
              delete your account at any time from the Settings page, which
              permanently removes all your data (profile, trades, and
              subscription records).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              7. Cookies
            </h2>
            <p>
              PNLCard uses essential cookies only — for authentication session
              management. We do not use advertising or tracking cookies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              8. Your rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access all data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Delete your account and all associated data.</li>
              <li>Export your trade data.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              9. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. We will notify you of
              significant changes via email or an in-app notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              10. Contact
            </h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a
                href="mailto:rahulsin1612@gmail.com"
                className="text-emerald-600 hover:underline"
              >
                rahulsin1612@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
