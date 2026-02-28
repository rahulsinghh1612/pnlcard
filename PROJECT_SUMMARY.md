# PNLCard — Project Summary for LLM Handoff

**Purpose:** This document summarizes the PNLCard project so another LLM can quickly understand the codebase and continue development. Use it as context when starting work on the next steps.

---

## 1. What is PNLCard?

**PNLCard** is a social-first trading recap card generator. Traders log their daily P&L in under 60 seconds and generate shareable image cards for X (Twitter) and Instagram.

- **Tagline:** Log. Share. Grow.
- **Domain:** pnlcard.com
- **Company:** Next Alphabet
- **Target users:** Indian retail traders who post trading content on social media

**What it is NOT:** A full trading journal, equity tracker, broker integration, or analytics dashboard. It is a content creation tool.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth (Google OAuth + Email/Password) via @supabase/ssr |
| Styling | Tailwind CSS + shadcn/ui |
| Card generation | @vercel/og (Satori) — JSX → PNG |
| Payments | Razorpay (India only) |
| Hosting | Vercel |

---

## 3. Project Structure (Key Paths)

```
pnlcard/
├── app/
│   ├── page.tsx                    # Landing page (hero, demo, gallery, pricing)
│   ├── login/, signup/, forgot-password/, reset-password/
│   ├── onboarding/page.tsx         # First-time user setup
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard (stats, calendar, recent entries)
│   │   ├── card/page.tsx           # Card generator UI
│   │   ├── settings/page.tsx       # Account, plan, delete
│   │   └── profile/page.tsx
│   ├── card/
│   │   ├── [id]/page.tsx           # Public shareable daily card (OG meta)
│   │   ├── weekly/[date]/page.tsx  # Weekly card share page
│   │   └── monthly/[date]/page.tsx # Monthly card share page
│   └── api/
│       ├── og/daily/route.tsx      # 1080×1080 PNG generation
│       ├── og/weekly/route.tsx
│       ├── og/monthly/route.tsx
│       ├── razorpay/create-subscription/route.ts
│       ├── razorpay/cancel-subscription/route.ts
│       └── webhooks/razorpay/route.ts
├── components/
│   ├── ui/                         # shadcn components
│   ├── dashboard/                 # TradeEntryModal, CardGenerator, CalendarHeatmap, etc.
│   └── landing/                   # DemoSection, demo components
├── lib/
│   ├── supabase/client.ts, server.ts, admin.ts, middleware.ts
│   ├── razorpay.ts                 # getRazorpayInstance, verifyWebhookSignature, getPlanId
│   ├── card-data.ts                # buildDailyCardParams, buildWeeklyCardParams, buildMonthlyCardParams
│   ├── stats.ts                    # P&L, win rate, streak calculations
│   └── types.ts                    # Profile, Subscription, Trade types
└── supabase/migrations/            # profiles, trades, subscriptions + RLS
```

---

## 4. Database Schema (3 Tables)

### profiles
- `id` (uuid, PK, refs auth.users)
- `display_name`, `x_handle`, `currency`, `timezone`, `trading_capital`
- `plan` ('free' | 'premium'), `plan_expires_at`
- `card_theme` ('light' | 'dark')

### trades
- `id`, `user_id`, `trade_date`, `num_trades`, `net_pnl`, `charges`, `capital_deployed`, `note`
- **UNIQUE(user_id, trade_date)** — one entry per user per day

### subscriptions
- `id`, `user_id`, `provider`, `provider_subscription_id`, `plan_type`, `status`
- `current_period_start`, `current_period_end`
- **UNIQUE(user_id)** — one subscription per user (migration 20260222)

---

## 5. Current Implementation Status

### ✅ Completed (from TASKS.md)

- **Foundation:** Next.js, Supabase, auth (Google + email), onboarding, middleware
- **Dashboard:** Stats row, calendar heatmap, trade entry modal, recent entries, empty state
- **Card generation:** Daily, Weekly, Monthly OG routes (1080×1080), dark/light, profit/loss variants
- **Card page:** `/dashboard/card` with type toggle, theme toggle, download, copy link
- **Public card page:** `/card/[id]` with OG meta tags for rich previews
- **Razorpay:** Create subscription API, webhook handler (activated/charged/cancelled), UpgradeButton with checkout modal
- **Settings:** Plan display, UpgradeButton, CancelSubscriptionButton, DeleteAccountButton
- **Landing page:** Hero, demo section, card gallery, pricing table, footer, privacy/terms links

### ⬜ Remaining / Incomplete

1. **Task 4.7 — Shareable link:** "Copy Link" exists but always uses daily trade ID. Weekly/monthly cards may need different share URLs (`/card/weekly/[date]`, `/card/monthly/[date]`). Verify and fix if needed.

2. **Task 6.x — Payments & gating (partially done):**
   - 6.1: Razorpay plans (₹199/mo, ₹1,499/yr in PRD; code uses ₹249/mo, ₹1,999/yr — verify pricing)
   - 6.2: Upgrade flow — **DONE** (UpgradeButton in settings + card generator)
   - 6.3–6.5: Webhook + gating — **DONE** (webhook updates profiles; CardGenerator gates weekly/monthly)

3. **Task 7.x — Landing page:** Most sections exist (hero, demo, gallery, pricing, footer). Task 7.6: SEO meta tags — verify `app/layout.tsx` and page-level metadata.

4. **Week 2 tasks:** E2E testing, bug fixes, polish, deploy to Vercel, domain, launch.

5. **Optional:** Settings page full edit (display name, X handle, capital, currency, theme, timezone); Story format (1080×1920); welcome/subscription emails; Vercel Analytics events.

---

## 6. Key Files to Know

| File | Purpose |
|-----|---------|
| `TASKS.md` | Build checklist — what's done, what's next |
| `PNLCard_PRD.md` | Full product spec (card design, logic, edge cases) |
| `cursorrules` | Code style, structure, conventions |
| `lib/card-data.ts` | Builds params for OG routes from trade/profile data |
| `lib/razorpay.ts` | Razorpay client, webhook verification, plan IDs |
| `components/dashboard/card-generator.tsx` | Card type/theme toggles, download, copy link, upgrade CTA |
| `components/dashboard/upgrade-button.tsx` | Razorpay checkout modal trigger |
| `app/api/webhooks/razorpay/route.ts` | Handles subscription.activated, .charged, .cancelled |

---

## 7. Environment Variables (.env.example)

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
RAZORPAY_PLAN_MONTHLY_ID, RAZORPAY_PLAN_YEARLY_ID
NEXT_PUBLIC_APP_URL (e.g. https://pnlcard.com)
```

---

## 8. Business Logic (from PRD)

- **ROI:** Optional. If no capital → hide ROI. Daily: (P&L - Charges) ÷ Capital × 100. Weekly/Monthly: sum of P&L ÷ profile capital × 100.
- **NET logic:** Show "Net P/L" only if charges exist for that day (daily) or ALL days in period (weekly/monthly).
- **Win rate:** Win = final result > 0, Loss = < 0, 0 = ignored. Win rate = wins ÷ (wins + losses).
- **Week:** Monday–Sunday (user timezone, default Asia/Kolkata).
- **Streak:** Consecutive profitable days; shown on daily cards only when ≥ 5.

---

## 9. Recommended Next Steps

1. **Verify shareable links:** Ensure Copy Link works correctly for weekly/monthly cards (different URL formats).
2. **Verify pricing:** PRD says ₹199/mo, ₹1,499/yr; code shows ₹249/mo, ₹1,999/yr. Align or document.
3. **SEO:** Add/verify meta tags in `app/layout.tsx` and landing page per PRD §11.1.
4. **E2E testing:** Sign up → onboard → log trade → generate card → download → copy link → open link.
5. **Deploy:** Vercel, env vars, pnlcard.com domain, test production webhooks.

---

## 10. Conventions (from cursorrules)

- **Files:** kebab-case. **Components:** PascalCase. **DB columns:** snake_case.
- Server Components by default; `"use client"` only when needed.
- Use `createServerClient` (server) or `createBrowserClient` (client) for Supabase.
- RLS on all tables. Never expose service_role key.
- Validate Razorpay webhook signatures.
- Keep files under 200 lines; split if larger.

---

*Last updated: Feb 26, 2025. Reference TASKS.md and PNLCard_PRD.md for full details.*
