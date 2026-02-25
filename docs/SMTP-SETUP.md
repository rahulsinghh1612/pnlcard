# Email Delivery Setup (Supabase Send Email Hook + Resend)

PnLCard uses Supabase's **Send Email Hook** to send auth emails (signup confirmation, password reset, etc.) via Resend's API. This bypasses Supabase's built-in SMTP and avoids regional connectivity issues.

---

## How it works

1. User signs up → Supabase creates the user.
2. Instead of sending via SMTP, Supabase calls `https://pnlcard.com/api/auth/send-email` (a webhook).
3. Our Next.js API route verifies the webhook signature and sends the email via Resend.
4. The app runs on Vercel, so it reliably connects to Resend regardless of Supabase's SMTP status.

---

## Setup Steps

### Step 1: Resend Account & API Key

1. Go to [resend.com](https://resend.com) and sign up.
2. **Domains** → Add `pnlcard.com` → Add DNS records → Wait for verification.
3. **API Keys** → Create API Key → Copy the key (starts with `re_`).

### Step 2: Environment Variables

Add to `.env.local` (local dev) and Vercel (production):

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (`re_...`) |
| `SEND_EMAIL_HOOK_SECRET` | Generated in Supabase Dashboard (format: `v1,whsec_<base64>`) |

### Step 3: Supabase Auth Hook Configuration

1. Go to **Supabase Dashboard** → your project.
2. **Authentication** → **Hooks** (or **Auth Hooks**).
3. Find **Send Email** hook → Enable it.
4. Set:
   - **Hook type:** HTTPS
   - **URL:** `https://pnlcard.com/api/auth/send-email`
   - **HTTP Headers:** none needed (signature verification is built-in)
5. Generate the hook secret and copy it to your env vars.
6. Save.

### Step 4: Test

1. Create a new account on the signup page.
2. Email should arrive within seconds via Resend.
3. Check Resend dashboard for delivery logs.

---

## Troubleshooting

- **Email not arriving:** Check Resend dashboard → Emails for delivery status.
- **401 from webhook:** Check that `SEND_EMAIL_HOOK_SECRET` matches what's in Supabase.
- **"Sender not verified":** Ensure `pnlcard.com` domain is verified in Resend.
- **Rate limits:** Resend free tier: 100 emails/day, 3,000/month.
