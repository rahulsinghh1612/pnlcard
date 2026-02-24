import type { Metadata } from "next";
import Link from "next/link";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";

export const metadata: Metadata = {
  title: "Terms of Service — PNLCard",
  description: "Terms and conditions for using PNLCard.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-page">
      <nav className="border-b border-border bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <Link href="/" className="logo-capsule px-3 py-1.5 text-sm">
            <PnLCardLogo size={18} />
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-slate prose-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: February 22, 2026
        </p>

        <section className="mt-10 space-y-6 text-sm text-foreground/80 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              1. Acceptance of terms
            </h2>
            <p>
              By using PNLCard (&quot;the Service&quot;), operated by Next
              Alphabet, you agree to these Terms of Service. If you do not
              agree, please do not use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              2. Description of service
            </h2>
            <p>
              PNLCard is a web application that allows traders to log their daily
              profit and loss (P&amp;L) and generate shareable recap cards for
              social media. The Service is available in Free and Premium tiers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              3. User accounts
            </h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>One account per person. Automated or bot accounts are not permitted.</li>
              <li>
                We reserve the right to suspend or terminate accounts that
                violate these terms.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              4. Free and Premium plans
            </h2>
            <p className="mt-2">
              <strong>Free plan:</strong> Includes unlimited trade logging, daily
              recap cards, PNG download, and dark/light themes. Cards include
              PNLCard branding.
            </p>
            <p className="mt-2">
              <strong>Premium plan:</strong> Everything in Free, plus weekly and
              monthly recap cards, your X handle on cards, and no PNLCard
              watermark. Pricing is ₹249/month or ₹1,999/year.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              5. Payments and billing
            </h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Premium subscriptions are billed through Razorpay in Indian
                Rupees (INR).
              </li>
              <li>
                Subscriptions auto-renew at the end of each billing period
                (monthly or yearly) unless cancelled.
              </li>
              <li>
                You can cancel your subscription at any time from the Settings
                page. Cancellation takes effect at the end of the current billing
                period.
              </li>
              <li>
                We reserve the right to change pricing with 30 days advance
                notice. Existing subscriptions will continue at their current
                price until renewal.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              6. Refund and cancellation policy
            </h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                You can cancel your Premium subscription at any time from the
                Settings page. Your premium features remain active until the end
                of your current billing period.
              </li>
              <li>
                No refunds are issued for partial billing periods or unused time.
              </li>
              <li>
                We consider refund requests on a case-by-case basis for
                exceptional circumstances (e.g. duplicate charges, technical
                issues preventing use of the Service).
              </li>
              <li>
                For billing errors or refund requests, contact us within 7 days
                at{" "}
                <a
                  href="mailto:rahulsin1612@gmail.com"
                  className="text-emerald-600 hover:underline"
                >
                  rahulsin1612@gmail.com
                </a>
                . We will respond within 5 business days.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              7. User content and data
            </h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                You retain ownership of all trade data and content you enter into
                PNLCard.
              </li>
              <li>
                By generating and sharing cards, you grant PNLCard a
                non-exclusive license to display the PNLCard branding on free-tier
                cards.
              </li>
              <li>
                You are solely responsible for the accuracy of the trade data you
                enter. PNLCard does not verify or validate trading P&amp;L
                figures.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              8. Prohibited use
            </h2>
            <p>You may not use PNLCard to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Post misleading or fraudulent trading performance.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Interfere with or disrupt the Service.</li>
              <li>Attempt to gain unauthorized access to other accounts.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              9. Disclaimer
            </h2>
            <p>
              PNLCard is a content creation tool, not financial advice. We do not
              provide investment recommendations, portfolio management, or
              trading signals. The Service is provided &quot;as is&quot; without
              warranties of any kind.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              10. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, Next Alphabet shall not be
              liable for any indirect, incidental, or consequential damages
              arising from your use of PNLCard. Our total liability is limited to
              the amount you paid us in the 12 months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              11. Changes to terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              Service after changes constitutes acceptance. We will notify you of
              material changes via email or an in-app notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              12. Governing law
            </h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              13. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{" "}
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
