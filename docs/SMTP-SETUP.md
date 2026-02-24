# Custom SMTP Setup (Resend + Supabase)

Use Resend for reliable auth emails (signup confirmation, password reset). Supabase's default sender is rate-limited and often lands in spam.

---

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up (free).
2. Verify your email.

---

## Step 2: Get Your API Key

1. In Resend Dashboard → **API Keys** → **Create API Key**.
2. Name it (e.g. "Supabase Auth").
3. Copy the key (starts with `re_`). You won't see it again.

---

## Step 3: Verify Your Domain (for production)

1. In Resend → **Domains** → **Add Domain**.
2. Add `pnlcard.com` (or your domain).
3. Add the DNS records Resend provides (e.g. TXT, MX) to your domain registrar.
4. Wait for verification (usually a few minutes).

**For testing:** Resend can send from `onboarding@resend.dev` before domain verification. Use that as the sender email temporarily.

---

## Step 4: Configure Supabase SMTP

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **SMTP Settings** (or **Project Settings** → **Auth** → **SMTP**).
3. Enable **Custom SMTP** and enter:

| Field | Value |
|-------|-------|
| **Sender email** | `noreply@pnlcard.com` (after domain verification) or `onboarding@resend.dev` (for testing) |
| **Sender name** | `PnLCard` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your Resend API key (`re_...`) |

4. Click **Save**.

---

## Step 5: Test

1. Create a new account on your signup page.
2. Check the inbox (and spam) for the confirmation email.
3. It should arrive within seconds instead of minutes.

---

## Troubleshooting

- **Email not arriving:** Check spam/junk. Resend emails usually land in inbox if the domain is verified.
- **"Sender not verified":** Use `onboarding@resend.dev` for testing, or finish domain verification.
- **Rate limits:** Resend free tier: 100 emails/day, 3,000/month. Supabase default: 2 emails/hour.
