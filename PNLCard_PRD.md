

**PNLCard**

Product Requirements Document

Version 1.0 — February 2026

pnlcard.com

A Next Alphabet Product

**CONFIDENTIAL**

# **Table of Contents**

# **1\. Product Overview**

## **1.1 Product Summary**

**PNLCard** is a social-first trading recap card generator. Traders log their daily P\&L in under 60 seconds and generate beautiful, shareable image cards for X (Twitter), Instagram, and other social platforms.

It is NOT a full trading journal. It is a content creation tool for traders who post on social media.

## **1.2 Product Identity**

| Attribute | Value |
| :---- | :---- |
| Product Name | PNLCard |
| Company | Next Alphabet |
| Domain | pnlcard.com |
| Tagline | Log. Share. Grow. |
| Target User | Indian retail traders active on X/Instagram who post trading content |
| Core Value Prop | Dead-simple P\&L logging \+ stunning shareable cards \= viral growth loop |

## **1.3 What PNLCard Is NOT**

* Not a full trading journal (no detailed trade-by-trade logging)

* Not an equity tracking system (no compounding math)

* Not a broker integration platform (no auto-imports)

* Not an analytics dashboard (no charts, drawdown, equity curves)

* Not a mobile app (responsive web app works on mobile)

## **1.4 Product Philosophy**

Precision is good. Overengineering is bad. Clarity \> complexity. The card is the product.

# **2\. User Flow & Screens**

## **2.1 High-Level User Flow**

Landing Page → Sign Up (Google/Email) → Onboarding (first visit) → Dashboard → Log Trade (modal) → Generate Card → Download/Share

## **2.2 Screen 1: Landing Page**

**Route:** / (public, no auth required)

### **Content Sections**

* **Hero:** Headline, subheadline, sample card image, "Start for Free" CTA button

* **How It Works:** 3-step visual: Log → Generate → Share

* **Card Gallery:** Sample daily, weekly, and monthly cards (dark \+ light themes)

* **Pricing:** Free vs Premium comparison table

* **Footer:** Links to privacy policy, terms, X account

### **SEO Meta Tags**

\<title\>PNLCard — Beautiful Trading Recap Cards for Social Media\</title\>

\<meta name="description" content="Log your daily P\&L in 60 seconds and generate stunning shareable cards for X and Instagram. Free forever." /\>

\<meta property="og:title" content="PNLCard — Log. Share. Grow." /\>

\<meta property="og:description" content="Generate beautiful trading recap cards for social media." /\>

\<meta property="og:image" content="https://pnlcard.com/og-landing.png" /\>

## **2.3 Screen 2: Dashboard**

**Route:** /dashboard (authenticated)

### **Layout**

* **Top Bar:** PNLCard logo, user display name, settings icon, logout

* **Quick Stats Row:** This week's P\&L, Win rate (this week), Current streak

* **Calendar Heatmap:** Monthly view. Green \= profit day, Red \= loss day, Gray \= no trade. Click a day to view/edit entry.

* **Log Today's Trade:** Large prominent button. Opens trade entry modal.

* **Recent Entries:** Last 7 days as a list. Each row shows: date, P\&L, \# trades, "Generate Card" button.

### **Empty State (No trades logged yet)**

Show a friendly illustration with text: "Log your first trade to get started\!" and a prominent "Log Trade" button. No calendar heatmap until at least 1 trade exists.

### **Generate Card Access Points**

* "Generate Card" button on each recent entry row

* Click a day on the calendar heatmap → opens trade detail → "Generate Card"

* Dashboard quick action for weekly/monthly cards (premium badge if not subscribed)

## **2.4 Screen 3: Trade Entry Modal**

**Trigger:** "Log Today's Trade" button or clicking an empty day on calendar

### **Fields**

| Field | Type | Required | Default | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Date | Date picker | Yes | Today | Cannot log future dates. One entry per day (UNIQUE constraint). |
| Number of Trades | Integer input | Yes | Empty | Min: 1\. How many trades taken that day. |
| Net P\&L | Numeric input | Yes | Empty | Accepts negative values. Currency symbol shown based on profile. |
| Charges/Fees | Numeric input | No | Empty | Brokerage, STT, etc. If filled, card shows NET calculations. |
| Capital Deployed | Numeric input | No | Profile capital | Pre-filled from profile.trading\_capital. Editable per entry. |
| Note | Text input | No | Empty | Max 280 characters. One-line note about the day. |

### **Validation Rules**

* Date: Cannot be in the future. If entry already exists for that date, show "Edit existing entry" instead.

* Number of Trades: Must be \>= 1\.

* Net P\&L: Must be a valid number (can be 0, positive, or negative).

* Charges: Must be \>= 0 if provided.

* Capital Deployed: Must be \> 0 if provided.

* Note: Max 280 characters.

### **On Submit**

Save to trades table. Show success toast. If today's trade, refresh dashboard stats immediately. Optionally show "Generate Card" prompt.

### **Edit Flow**

If user clicks a day that already has an entry, pre-fill all fields. Show "Update" button instead of "Save". Also show a "Delete Entry" option (with confirmation).

## **2.5 Screen 4: Card Generator**

**Route:** /dashboard/card?date=2026-02-12 (or ?week=2026-W07 or ?month=2026-02)

### **Layout**

* **Card Preview:** Live-rendered card at center of screen. Updates in real-time as user changes options.

* **Card Type Toggle:** Daily (free) | Weekly (premium) | Monthly (premium). Premium options show lock icon if not subscribed.

* **Theme Toggle:** Dark | Light

* **Download Button:** "Download as Image" → downloads 1080x1080 PNG

* **Story Format Button:** "Download Story" → downloads 1080x1920 PNG (premium only)

* **Share Link Button:** "Copy Link" → copies shareable URL to clipboard

### **Card Generation Logic**

Cards are generated server-side using @vercel/og (Satori). The API route accepts parameters and returns a PNG image.

## **2.6 Onboarding (First Visit Only)**

**Trigger:** First time user lands on /dashboard after signup

### **Onboarding Steps**

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| Display Name | Text input | Yes | Shown on dashboard. Not on cards. |
| Trading Capital | Numeric input | No | Used for ROI calculation. Can skip and add later. |
| X Handle | Text input | No | e.g., @yourhandle. Shown on premium cards. |
| Currency | Toggle | Yes | INR (default) or USD. Affects card labels. |

After onboarding, redirect to dashboard. Show a "Log your first trade\!" prompt.

## **2.7 Settings Page**

**Route:** /dashboard/settings

### **Editable Fields**

* Display Name

* X Handle

* Trading Capital

* Currency (INR / USD)

* Default Card Theme (Dark / Light)

* Timezone (defaults to Asia/Kolkata)

### **Account Section**

* Current plan (Free / Premium) with upgrade/manage button

* Sign out button

* Delete account (with confirmation modal and permanent data deletion)

# **3\. Card Design Specification**

## **3.1 Card Dimensions**

| Format | Size | Tier | Use Case |
| :---- | :---- | :---- | :---- |
| Square | 1080 x 1080 px | Free \+ Premium | X feed, Instagram feed, default |
| Story | 1080 x 1920 px | Premium only | Instagram stories, X fleets |

## **3.2 Layout: Layout C (Ultra Minimal)**

Clean flat structure with gradient background. Numbers are the absolute focus. Minimal labels, maximum whitespace. No decorative elements.

### **Visual Logic**

* Profitable day/week/month: Green gradient background, green accent numbers

* Loss day/week/month: Red gradient background, red accent numbers

* Dark theme: Deep dark base (\#09090b) with colored gradient

* Light theme: White base (\#fafcfb) with subtle colored gradient

### **Typography**

* Hero numbers: 800 weight, tight letter-spacing (-0.04em), line-height 1

* Labels: 10px, uppercase, 0.1em letter-spacing, muted color

* Accent color for profit (dark): \#22c55e, (light): \#16a34a

* Accent color for loss (dark): \#ef4444, (light): \#dc2626

## **3.3 Daily Card**

### **Content (With Charges)**

| Element | Font Size | Color | Position |
| :---- | :---- | :---- | :---- |
| Date | 13px | Muted | Top left |
| Trade count pill | 12px | Primary in accent pill | Top right |
| Raw P\&L \+ Charges | 13px | Dimmed accent \+ muted | Context line above hero |
| "NET P/L (₹)" label | 10px uppercase | Muted | Above hero number |
| Net P\&L value | 50px / 800 weight | Accent (green/red) | HERO |
| Divider line | 1px | Subtle border | Between P\&L and ROI |
| "NET ROI" label | 10px uppercase | Muted | Above ROI |
| Net ROI value | 42px / 800 weight | Accent (green/red) | HERO |
| Streak dots | 6px dots | Accent, increasing opacity | Above footer (5+ days only) |
| TradeCard branding / X handle | 10px | Muted | Footer left |
| "Daily Recap" | 10px | Muted | Footer right |

### **Content (Without Charges)**

When charges are not entered, the card simplifies:

* No "Net" prefix — labels show "P/L (₹)" and "ROI"

* No context line (raw P\&L \+ charges)

* P/L is the hero at 50px

* ROI is secondary hero at 42px

* If capital is missing, ROI is hidden completely

### **Streak Logic**

* Streak \= consecutive calendar days with a logged trade where final result \> 0

* Only shown at 5+ days

* Displayed as growing dots (increasing opacity from 0.3 to 1.0) \+ "7d streak" text

* Streak appears on Daily cards only (not Weekly or Monthly)

## **3.4 Weekly Card**

### **Content**

| Element | Font Size | Color | Position |
| :---- | :---- | :---- | :---- |
| Date range (Mon-Sun) | 13px | Muted | Top left |
| Win/Loss count pill (e.g., 3W · 2L) | 12px | Primary in accent pill | Top right |
| "NET P/L (₹)" label | 10px uppercase | Muted | Above hero |
| Net P\&L value | 46px / 800 weight | Accent | HERO |
| "NET ROI" label \+ value | 10px label, 26px value | Muted / Accent | Below hero, left |
| "WIN RATE" label \+ value | 10px label, 26px value | Muted / Accent | Below hero, right |
| Mini bar chart | 36px max height | Green/red bars | Mon-Fri breakdown |
| Best day text | 11px | Muted \+ accent | Below chart |
| Branding / "Weekly Recap" | 10px | Muted | Footer |

### **Week Definition**

Week \= Monday to Sunday. Based on user timezone (default: Asia/Kolkata). NOT rolling 7 days.

### **NET Logic**

If charges exist for ALL logged days in that week, show NET P/L and NET ROI. If even one day is missing charges, fall back to P/L and ROI (no "Net" prefix).

### **Weekly does NOT show**

* Streak dots

* Worst day

* Average P\&L

* Total trading days count

## **3.5 Monthly Card**

### **Content**

| Element | Font Size | Color | Position |
| :---- | :---- | :---- | :---- |
| Month \+ Year (e.g., February 2026\) | 14px bold | Primary | Top left |
| Win/Loss count pill | 11px | Primary in accent pill | Top right |
| "NET P/L (₹)" label | 10px uppercase | Muted | Above hero |
| Net P\&L value | 32px / 800 weight | Accent | HERO |
| "NET ROI" \+ "WIN RATE" | 10px label, 17px value | Muted / Accent | Side by side below hero |
| Best Day row | 8px label, 12px value | Muted / Green | Between stats and calendar |
| Worst Day row | 8px label, 12px value | Muted / Red | Beside best day |
| Calendar heatmap | 18px fixed-height cells | Green/Red/Empty | Full width grid |
| Day headers (M T W T F S S) | 7px | Muted | Above calendar |
| Branding / "Monthly Recap" | 10px | Muted | Footer |

### **Calendar Heatmap**

* 7-column grid (Mon-Sun)

* Fixed height cells (18px) — NOT aspect-ratio squares

* Green cell \= winning day, Red cell \= losing day, Dark/empty cell \= no trade

* Full width of card, no wasted space

### **NET Logic**

Same as weekly: NET only if ALL days have charges. Otherwise plain P/L.

### **Branding on Cards**

| Tier | Footer Left | Footer Right |
| :---- | :---- | :---- |
| Free | PNLCard logo \+ "PNLCard" text (watermark) | "Daily/Weekly/Monthly Recap" |
| Premium | User's X handle (e.g., @yourhandle) | "Daily/Weekly/Monthly Recap" |

# **4\. Capital & ROI Logic**

## **4.1 Capital Is Optional**

* Capital is optional on Daily, Weekly, and Monthly

* If capital is missing, ROI is hidden completely on the card

* No placeholders, no warnings, no forced inputs

## **4.2 Profile Capital**

* Profile stores trading\_capital as a default

* Pre-filled in Daily trade entry, editable per trade

* Used for Weekly/Monthly ROI calculation

* Capital is NOT auto-adjusted — no compounding, no balance tracking

## **4.3 ROI Calculation**

### **Daily**

* If charges entered: Net ROI \= (P\&L \- Charges) ÷ Capital × 100

* If no charges: ROI \= P\&L ÷ Capital × 100

* If no capital: ROI hidden

### **Weekly / Monthly**

* Sum of all P\&L (or Net P\&L) for the period ÷ Profile Capital × 100

* If profile capital not set: ROI hidden

## **4.4 Win Rate Calculation**

For each logged day: if final result \> 0, it is a Win. If final result \< 0, it is a Loss. If 0, ignored.

Final result \= Net P\&L if charges exist, otherwise P\&L.

Win Rate \= win\_days ÷ (win\_days \+ loss\_days)

## **4.5 Best & Worst Day**

* If NET active: Best \= max(Net P\&L), Worst \= min(Net P\&L)

* If NET not active: Best \= max(P\&L), Worst \= min(P\&L)

* Best Day shown on Weekly and Monthly cards

* Worst Day shown on Monthly cards only

# **5\. Tech Stack**

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Framework | Next.js 14+ (App Router) | SSR for SEO, API routes for backend, great DX with Cursor |
| Database | Supabase (PostgreSQL) | Auth \+ DB \+ RLS in one platform, free tier generous |
| Auth | Supabase Auth | Google OAuth \+ Email/Password, @supabase/ssr for App Router |
| Styling | Tailwind CSS | Fast iteration, Cursor generates it well |
| Image Generation | @vercel/og (Satori) | JSX → SVG → PNG, perfect for social cards |
| Payments (India) | Razorpay | ₹199/mo, ₹1,499/yr |
| Payments (Intl) | Lemon Squeezy (post-launch) | Not in V1. Add after India traction. |
| Hosting | Vercel | Zero-config Next.js deployment, free tier |
| Analytics | Vercel Analytics | Free, built-in, no extra setup |

# **6\. Database Schema**

## **6.1 Table: profiles**

| Column | Type | Default | Notes |
| :---- | :---- | :---- | :---- |
| id | uuid (PK) | from auth.users | References auth.users, ON DELETE CASCADE |
| display\_name | text | NOT NULL | User's display name |
| x\_handle | text | NULL | e.g., @yourhandle |
| currency | text | 'INR' | INR or USD |
| timezone | text | 'Asia/Kolkata' | For week/month calculations |
| trading\_capital | numeric(14,2) | NULL | Default capital for ROI calculation |
| plan | text | 'free' | 'free' or 'premium' |
| plan\_expires\_at | timestamptz | NULL | When premium expires |
| card\_theme | text | 'light' | 'light' or 'dark' |
| created\_at | timestamptz | now() | Account creation |
| updated\_at | timestamptz | now() | Last profile update |

## **6.2 Table: trades**

| Column | Type | Default | Notes |
| :---- | :---- | :---- | :---- |
| id | uuid (PK) | gen\_random\_uuid() | Auto-generated |
| user\_id | uuid (FK) | NOT NULL | References profiles(id), ON DELETE CASCADE |
| trade\_date | date | NOT NULL | The trading day |
| num\_trades | integer | NOT NULL | Number of trades taken |
| net\_pnl | numeric(12,2) | NOT NULL | The P\&L amount |
| charges | numeric(12,2) | NULL | Brokerage, STT, fees |
| capital\_deployed | numeric(14,2) | NULL | Capital for that day's ROI |
| note | text | NULL | Max 280 chars, optional note |
| created\_at | timestamptz | now() |  |
| updated\_at | timestamptz | now() |  |

**UNIQUE constraint:** (user\_id, trade\_date) — one entry per user per day.

## **6.3 Table: subscriptions**

| Column | Type | Default | Notes |
| :---- | :---- | :---- | :---- |
| id | uuid (PK) | gen\_random\_uuid() | Auto-generated |
| user\_id | uuid (FK) | NOT NULL | References profiles(id) |
| provider | text | NOT NULL | 'razorpay' (V1). 'lemonsqueezy' added later for international. |
| provider\_subscription\_id | text | NULL | External subscription ID |
| plan\_type | text | NOT NULL | 'monthly' or 'yearly' |
| status | text | NOT NULL | 'active' / 'cancelled' / 'expired' |
| current\_period\_start | timestamptz | NULL | Billing period start |
| current\_period\_end | timestamptz | NULL | Billing period end |
| created\_at | timestamptz | now() |  |
| updated\_at | timestamptz | now() |  |

## **6.4 Row Level Security**

RLS enabled on all three tables. Users can only SELECT, INSERT, UPDATE, DELETE their own rows.

CREATE POLICY "Users can CRUD own data" ON trades FOR ALL USING (auth.uid() \= user\_id);

CREATE POLICY "Users can read own profile" ON profiles FOR ALL USING (auth.uid() \= id);

CREATE POLICY "Users can read own subs" ON subscriptions FOR ALL USING (auth.uid() \= user\_id);

# **7\. API Routes**

## **7.1 Card Image Generation**

| Route | Method | Auth | Description |
| :---- | :---- | :---- | :---- |
| /api/og/daily | GET | No (public) | Generates daily card PNG. Params: date, pnl, charges, netPnl, netRoi, trades, streak, handle, theme |
| /api/og/weekly | GET | No (public) | Generates weekly card PNG. Params: weekStart, pnl, roi, winRate, wl, days (JSON), bestDay, handle, theme |
| /api/og/monthly | GET | No (public) | Generates monthly card PNG. Params: month, pnl, roi, winRate, wl, calendar (JSON), best, worst, handle, theme |

These routes are public (no auth) because they are used for OG meta tags on shareable card pages. Parameters are passed as query strings.

## **7.2 Trade CRUD**

| Route | Method | Auth | Description |
| :---- | :---- | :---- | :---- |
| /api/trades | GET | Yes | Get user's trades. Optional query: ?month=2026-02 |
| /api/trades | POST | Yes | Create a new trade entry |
| /api/trades/\[id\] | PUT | Yes | Update an existing trade entry |
| /api/trades/\[id\] | DELETE | Yes | Delete a trade entry |

Alternatively, use Supabase client directly from the frontend with RLS handling authorization. API routes are optional wrappers.

## **7.3 Payment Webhooks**

| Route | Method | Source | Description |
| :---- | :---- | :---- | :---- |
| /api/webhooks/razorpay | POST | Razorpay | Handles subscription.activated, subscription.charged, subscription.cancelled. Lemon Squeezy webhook added post-launch. |

### **Webhook Logic**

On subscription activation/payment:

* Upsert subscriptions table with provider details

* Update profiles.plan to 'premium'

* Set profiles.plan\_expires\_at to current\_period\_end

On subscription cancellation:

* Update subscriptions.status to 'cancelled'

* Update profiles.plan to 'free'

* Clear profiles.plan\_expires\_at

## **7.4 Shareable Card Pages**

| Route | Method | Auth | Description |
| :---- | :---- | :---- | :---- |
| /card/\[trade\_id\] | GET | No (public) | Public page showing a card with OG meta tags. Meta og:image points to /api/og/daily with trade data. |

### **How Sharing Works**

**1\.** User generates card → gets URL: pnlcard.com/card/\[trade\_id\]

**2\.** URL has OG meta tags → when pasted on X, the card shows as a rich preview

**3\.** Clicking the link shows the card full-screen \+ CTA: "Create your own PNLCard"

**4\.** This is the primary organic growth engine

# **8\. Pricing & Payments**

## **8.1 Free Tier**

* Unlimited trade logging

* Daily recap cards only

* Dark \+ Light card themes

* PNLCard watermark on all cards (logo \+ name in footer)

* No X handle displayed on cards

## **8.2 Premium Tier**

| Plan | Price (Razorpay, India) |
| :---- | :---- |
| Monthly | ₹199/month |
| Yearly | ₹1,499/year (save 37%) |

### **Premium Features**

* Remove PNLCard watermark from cards

* Display user's X handle on cards

* Weekly recap cards

* Monthly recap cards

* Story format (1080x1920) card downloads

## **8.3 Feature Gating Logic**

Check profiles.plan field. If 'free', gate premium features with a lock icon and "Upgrade to Premium" CTA. Premium check is simple string comparison — no complex permission system.

## **8.4 Revenue Targets**

| Milestone | Paying Users Needed (at ₹199/mo) |
| :---- | :---- |
| ₹1L MRR | \~500 users |
| ₹5L MRR | \~2,500 users |
| ₹8.5L MRR ($10K) | \~4,250 users |

# **9\. Authentication**

## **9.1 Auth Methods**

* Google OAuth (primary — one-click signup)

* Email \+ Password (secondary)

## **9.2 Auth Flow**

**1\.** User clicks "Start for Free" on landing page

**2\.** Redirect to /login with Google OAuth button \+ email/password form

**3\.** On successful auth, check if profile exists in profiles table

**4\.** If no profile → redirect to /onboarding

**5\.** If profile exists → redirect to /dashboard

## **9.3 Middleware**

Next.js middleware checks auth on all /dashboard/\* routes using @supabase/ssr. If not authenticated, redirect to /login. Public routes: /, /login, /card/\[id\], /api/og/\*.

# **10\. Error States & Edge Cases**

## **10.1 Trade Entry Edge Cases**

| Scenario | Behavior |
| :---- | :---- |
| User tries to log future date | Date picker prevents selection. Show: "Cannot log trades for future dates." |
| User tries to log duplicate date | Show existing entry in edit mode. Toast: "You already have an entry for this date. Editing it." |
| P\&L is exactly 0 | Allow it. Card shows ₹0. Green accent (treat as neutral/positive). Excluded from win rate calculation. |
| Charges exceed P\&L | Allow it. Net P\&L will be negative even if P\&L was positive. Card shows correctly. |
| No trades logged for a week | Weekly card shows "No trades logged this week" with empty state. |
| Only 1 day logged in a month | Monthly card still generates with single green/red cell in calendar. Win rate \= 100% or 0%. |
| Capital is 0 or missing | ROI is hidden on all cards. No errors, just omitted. |
| Note exceeds 280 chars | Frontend truncates input. Backend validates max length. |
| User deletes all trades | Dashboard reverts to empty state. Calendar is blank. |

## **10.2 Card Generation Edge Cases**

| Scenario | Behavior |
| :---- | :---- |
| Very large P\&L number (e.g., \+12,34,567.89) | Font size auto-scales down to fit card width. Test with 10-digit numbers. |
| Negative P\&L with charges | Shows: raw negative P\&L, charges, and an even more negative Net P\&L. Red gradient. |
| No X handle set (premium user) | Show PNLCard branding as fallback (same as free tier). |
| Week with only 1 trading day | Bar chart shows single bar. Win rate \= 100% or 0%. Best day \= only day. |
| Month with no trades | Don't allow card generation. Show: "No trades logged in this month." |

## **10.3 Payment Edge Cases**

| Scenario | Behavior |
| :---- | :---- |
| Payment fails | Show error toast. Keep user on free tier. Suggest retry. |
| Subscription expires mid-month | Immediately revert to free tier. Existing generated cards still accessible. |
| International user wants to pay | V1 is India-only (Razorpay). Show "International payments coming soon" message. Collect email for waitlist. |
| Webhook delivery fails | Implement webhook retry logic. Have a manual "Verify Payment" button in settings. |
| User cancels then re-subscribes | Create new subscription record. Update profile plan back to premium. |

# **11\. SEO & Meta Tags Strategy**

## **11.1 Landing Page**

| Tag | Value |
| :---- | :---- |
| title | PNLCard — Beautiful Trading Recap Cards for Social Media |
| meta description | Log your daily P\&L in 60 seconds and generate stunning shareable cards for X and Instagram. Free forever. |
| og:title | PNLCard — Log. Share. Grow. |
| og:description | Generate beautiful trading recap cards for social media. |
| og:image | https://pnlcard.com/og-landing.png (1200x630) |
| og:url | https://pnlcard.com |
| twitter:card | summary\_large\_image |
| twitter:site | @pnlcard |

## **11.2 Shareable Card Pages (/card/\[id\])**

| Tag | Value |
| :---- | :---- |
| title | \[User\] — Daily Recap | PNLCard |
| og:title | \[User\]'s Trading Recap |
| og:image | https://pnlcard.com/api/og/daily?... (dynamically generated card) |
| og:url | https://pnlcard.com/card/\[id\] |
| twitter:card | summary\_large\_image |

The og:image URL points to the /api/og endpoint which generates the card image on-the-fly. X and other platforms will fetch this URL to create a rich preview when the link is shared.

## **11.3 Robots & Sitemap**

* Allow indexing of: /, /card/\* pages

* Disallow indexing of: /dashboard/\*, /api/\*

* Generate sitemap.xml with landing page and popular public card pages

# **12\. Analytics Events**

Track with Vercel Analytics (free). Key events:

| Event Name | Trigger | Properties |
| :---- | :---- | :---- |
| signup | User creates account | method (google/email) |
| onboarding\_complete | User finishes onboarding | has\_capital, has\_handle, currency |
| trade\_logged | User saves a trade entry | has\_charges, has\_capital, has\_note |
| card\_generated | Card preview is loaded | type (daily/weekly/monthly), theme (dark/light) |
| card\_downloaded | User clicks Download | type, theme, format (square/story) |
| card\_link\_copied | User clicks Copy Link | type |
| card\_page\_viewed | Someone visits /card/\[id\] | referrer, card\_type |
| upgrade\_clicked | User clicks Upgrade/Premium CTA | source (card\_generator/dashboard/settings) |
| subscription\_started | Webhook confirms payment | provider, plan\_type |
| subscription\_cancelled | Webhook confirms cancellation | provider, plan\_type, tenure\_days |

# **13\. Email Templates**

Use Supabase Auth emails for auth-related flows. Custom emails for subscription events (can be sent via Supabase Edge Functions or Resend).

## **13.1 Welcome Email**

**Trigger:** After onboarding is complete

**Subject:** Welcome to PNLCard — your trading recap starts now

### **Content**

* Welcome message with user's display name

* Quick reminder: Log your first trade, generate your first card, share it

* Link to dashboard

* Support: reply to this email

## **13.2 Subscription Confirmation**

**Trigger:** After successful payment

**Subject:** You're now PNLCard Premium\!

### **Content**

* Thank you \+ plan details (monthly/yearly, amount, next billing date)

* What's unlocked: weekly cards, monthly cards, story format, custom handle, no watermark

* Link to generate your first premium card

## **13.3 Subscription Cancelled**

**Trigger:** After subscription cancellation

**Subject:** Your PNLCard Premium subscription has been cancelled

### **Content**

* Confirmation of cancellation

* When premium access ends

* What they'll lose (weekly/monthly cards, etc.)

* "We'd love to have you back" \+ re-subscribe link

## **13.4 Payment Failed**

**Trigger:** Subscription renewal payment fails

**Subject:** Action needed: your PNLCard payment failed

### **Content**

* Payment failed notice

* Link to update payment method

* Deadline before account reverts to free

# **14\. Growth Strategy**

## **14.1 Built-in Viral Loop**

User logs trade → generates card → shares on X/Instagram → card has PNLCard watermark → followers see it → some sign up → they share their cards → loop continues.

The free tier watermark is the growth engine. Every card shared by any free user is a free advertisement.

## **14.2 Personal Distribution**

* Founder uses PNLCard daily on X (dogfooding)

* YouTube channel starting next month → drives signups

* Every card shared by any user \= free advertising

## **14.3 Shareable Link Flow**

**1\.** User generates card → gets URL: pnlcard.com/card/\[id\]

**2\.** URL has OG meta tags → card shows as rich preview when pasted on X

**3\.** Clicking link shows card full-screen \+ CTA to sign up

**4\.** This is the primary growth engine

## **14.4 Key Metrics to Track**

* Signups per week

* Cards generated per day

* Cards shared (public card page views)

* Free → Premium conversion rate

* Monthly Recurring Revenue (MRR)

# **15\. Build Timeline (2 Weeks)**

## **15.1 Week 1: Build Everything**

| Day | Tasks |
| :---- | :---- |
| Day 1-2 | Project setup (Next.js \+ Tailwind \+ Supabase). Create all 3 tables with RLS. Implement auth (Google OAuth \+ Email). Build onboarding flow. |
| Day 3 | Dashboard: calendar heatmap, quick stats, trade entry modal, recent entries list. Empty states. |
| Day 4-5 | Card generation: implement @vercel/og routes for Daily, Weekly, Monthly cards. All themes (dark/light), all variants (profit/loss). Download as PNG. Shareable link with OG tags. |
| Day 6 | Razorpay integration. Webhook handler. Plan gating logic. Upgrade flow. |
| Day 7 | Landing page: hero, how it works, card gallery, pricing table, footer. |

## **15.2 Week 2: Polish \+ Launch**

| Day | Tasks |
| :---- | :---- |
| Day 8-9 | End-to-end testing: signup → log → generate → share → upgrade → verify webhooks. Test all card variants. |
| Day 10 | Fix bugs. Polish card design until pixel-perfect. Test on mobile browsers. |
| Day 11 | Deploy to Vercel. Connect pnlcard.com domain. SSL. Test production. |
| Day 12 | Start using PNLCard yourself on X. Dogfood daily. |
| Day 13-14 | Announce to audience on X. Collect feedback. Iterate. |

Requires 4-5 hours/day with Cursor \+ Claude assistance.

# **16\. Scope Control: What NOT to Build**

Maintaining a tight scope is critical for shipping in 2 weeks. The following are explicitly out of scope for V1:

| Feature | Reason |
| :---- | :---- |
| Broker auto-import | Massive scope, each broker has different API. Not a differentiator. |
| Detailed analytics/charts | TraderSync/TradeZella already do this. We're a card generator. |
| Mobile app | Responsive web works on mobile. Revisit after traction. |
| Team/social features | Stay solo-user focused. |
| AI insights | Buzzword, not needed for MVP. |
| Multiple card themes/custom colors | One great design \> five mediocre ones. Card color driven by P\&L. |
| Admin panel | Use Supabase dashboard directly for admin tasks. |
| Notification emails | Manual follow-up is fine early on (except subscription emails). |
| Capital display on cards | Removed during design review. ROI tells the story. |
| Mood tags | Removed for simplicity. Can add later if users request. |
| Dark/light mode for app UI | App defaults to light mode. Card theme is separate and also defaults to light. |
| Verified P\&L / broker connection | Can add CSV upload verification later as a premium upsell. |

# **17\. App Design Direction**

## **17.1 Visual Style**

**Inspiration:** Notion's clean light aesthetic \+ Linear's premium feel

* Light mode default for the app UI (dark mode available as option)

* Spacious layouts, lots of whitespace

* Color only comes from green (profit) and red (loss)

* Accent blue for interactive elements (buttons, links)

* Smooth micro-animations on interactions

* The card is the hero — dashboard is intentionally understated

* No emojis in the UI (except streak fire on cards)

## **17.2 Component Library**

Use shadcn/ui components with Tailwind for consistency. Key components: Button, Input, Modal (Dialog), Toast, Calendar, Dropdown, Toggle, Card (for dashboard entries).

*— End of PRD —*

This document contains everything needed to build PNLCard V1. Start with Day 1 of the build timeline and reference this PRD throughout development.