"use client";

/**
 * Minimal debug page to isolate loading issues.
 * If this loads but / doesn't, the problem is in the landing page.
 * If this also fails, the problem is in layout/providers.
 */
export default function DebugPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Debug page loaded</h1>
        <p className="text-gray-600">If you see this, the app is working.</p>
        <a href="/" className="text-blue-600 underline hover:no-underline">
          Go to home page
        </a>
      </div>
    </main>
  );
}
