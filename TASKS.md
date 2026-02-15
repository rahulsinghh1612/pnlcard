# PNLCard — Build Tasks

Single checklist derived from [PNLCard_PRD.md](PNLCard_PRD.md) §15 (Build Timeline). Use this to know **what to do next** and track progress. Mark tasks with `[x]` when done.

**How to use:** Work in order. Each task is one concrete unit of work. Reference the PRD for details; reference [cursorrules](cursorrules) for structure and style.

---

## Week 1 — Build Everything

### Day 1–2: Foundation (setup, DB, auth, onboarding)

- [x] **1.1** Create Next.js 14+ App Router project with TypeScript and Tailwind.
- [x] **1.2** Add and configure Supabase (env vars, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`).
- [x] **1.3** Create Supabase migration: `profiles` table with RLS (users can CRUD own row).
- [x] **1.4** Create Supabase migration: `trades` table with RLS and UNIQUE(user_id, trade_date).
- [x] **1.5** Create Supabase migration: `subscriptions` table with RLS.
- [x] **1.6** Implement Supabase Auth: Google OAuth and Email/Password (login/signup).
- [x] **1.7** Add Next.js middleware: protect `/dashboard/*`, allow `/`, `/login`, `/card/[id]`, `/api/og/*`.
- [x] **1.8** Build login page at `/login` (Google button + email/password form).
- [x] **1.9** After signup, create or fetch profile; redirect to onboarding if no profile.
- [x] **1.10** Build onboarding page: Display Name, Trading Capital (optional), X Handle (optional), Currency (INR/USD). Save to `profiles`, then redirect to dashboard.

### Day 3: Dashboard

- [x] **3.1** Build dashboard layout: top bar (logo, display name, settings, logout).
- [x] **3.2** Quick stats row: this week’s P&L, win rate (this week), current streak.
- [x] **3.3** Calendar heatmap (month view): green = profit day, red = loss day, gray = no trade; click day to view/edit.
- [x] **3.4** “Log Today’s Trade” button — opens trade entry modal.
- [x] **3.5** Trade entry modal: Date, Number of Trades, Net P&L, Charges (optional), Capital Deployed (optional), Note (max 280). Validation per PRD §2.4. Save/Update/Delete with confirmation for delete.
- [x] **3.6** Recent entries list: last 7 days with date, P&L, # trades, “Generate Card” button per row.
- [x] **3.7** Empty state: no trades yet — illustration + “Log your first trade” + Log Trade button; hide calendar until ≥1 trade.
- [x] **3.8** Clicking a day with existing entry opens modal in edit mode (pre-filled, Update + Delete options).

### Day 4–5: Card generation

- [x] **4.1** Add `@vercel/og` (Satori). Create API route `/api/og/daily` — accepts query params, returns 1080×1080 PNG. Use PRD §3.3 and existing [PNLCard.jsx](PNLCard.jsx) Daily card logic.
- [x] **4.2** Create `/api/og/weekly` — 1080×1080 PNG per PRD §3.4.
- [x] **4.3** Create `/api/og/monthly` — 1080×1080 PNG per PRD §3.5 (heatmap below hero, 18px cells, green/red/empty).
- [x] **4.4** Support dark and light themes and profit/loss variants for all three card types.
- [x] **4.5** Dashboard card page `/dashboard/card`: card type toggle (Daily free, Weekly/Monthly with premium lock), theme toggle, live card preview (e.g. via image from API or client preview).
- [x] **4.6** “Download as Image” — fetch PNG from API and trigger download (1080×1080).
- [ ] **4.7** Shareable link: “Copy Link” → `pnlcard.com/card/[trade_id]` (or appropriate ID). Copy to clipboard.
- [x] **4.8** Public page `/card/[id]`: show card full-screen, OG meta tags with `og:image` pointing at `/api/og/daily?...` (or relevant OG route) so X/Instagram show rich preview.

### Day 6: Payments and gating

- [ ] **6.1** Razorpay: create subscription plans (monthly ₹199, yearly ₹1,499). Add Razorpay keys to env.
- [ ] **6.2** Upgrade flow: button in dashboard/settings → Razorpay checkout → redirect back.
- [ ] **6.3** Webhook `/api/webhooks/razorpay`: verify signature; on subscription activated/charged → upsert `subscriptions`, set `profiles.plan` = 'premium', `plan_expires_at`.
- [ ] **6.4** On subscription cancelled → update `subscriptions.status`, set `profiles.plan` = 'free', clear `plan_expires_at`.
- [ ] **6.5** Feature gating: check `profiles.plan`. Lock Weekly/Monthly cards and Story format for free users; show “Upgrade to Premium” CTA. Premium: no watermark, show X handle on cards.

### Day 7: Landing page

- [ ] **7.1** Landing page `/`: Hero (headline, subheadline, sample card image, “Start for Free” CTA).
- [ ] **7.2** How it works: 3 steps (Log → Generate → Share).
- [ ] **7.3** Card gallery: sample daily, weekly, monthly cards (dark + light).
- [ ] **7.4** Pricing: Free vs Premium comparison table.
- [ ] **7.5** Footer: privacy policy, terms, X account link.
- [ ] **7.6** SEO meta tags per PRD §11.1 (title, description, og:*, twitter:card).

---

## Week 2 — Polish and launch

### Day 8–9: Testing

- [ ] **8.1** E2E: Sign up → onboard → log trade → generate daily card → download → copy share link → open share link (OG preview).
- [ ] **8.2** E2E: Upgrade to premium (test/sandbox) → generate weekly/monthly card → verify no watermark, X handle shown.
- [ ] **8.3** Test all card variants: daily/weekly/monthly, dark/light, profit/loss. Edge cases from PRD §10 (zero P&L, no capital, duplicate date, etc.).
- [ ] **8.4** Verify webhook: subscription and cancellation update `profiles` and `subscriptions` correctly.

### Day 10: Bug fixes and polish

- [ ] **10.1** Fix any bugs found in testing.
- [ ] **10.2** Polish card design (fonts, spacing, 1080×1080) until pixel-perfect.
- [ ] **10.3** Test on mobile browsers (responsive dashboard and landing).

### Day 11: Deploy

- [ ] **11.1** Deploy to Vercel. Connect repo, set env vars (Supabase, Razorpay).
- [ ] **11.2** Connect pnlcard.com domain. SSL. Verify production (auth, cards, webhooks).

### Day 12–14: Launch

- [ ] **12.1** Dogfood: use PNLCard daily on X.
- [ ] **12.2** Announce to audience. Collect feedback and iterate.

---

## Optional (can do anytime)

- [ ] Settings page `/dashboard/settings`: edit display name, X handle, trading capital, currency, default card theme, timezone; account section (plan, sign out, delete account with confirmation).
- [ ] Story format download (1080×1920) for premium users.
- [ ] Welcome email after onboarding; subscription confirmation/cancelled emails (via Supabase or Resend).
- [ ] Vercel Analytics events per PRD §12 (signup, trade_logged, card_downloaded, etc.).

---

**Reference:** [PNLCard_PRD.md](PNLCard_PRD.md) · [cursorrules](cursorrules) · [PNLCard.jsx](PNLCard.jsx) (card visuals)
