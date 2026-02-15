# PNLCard — Supabase Setup

This guide explains what’s already done and what you need to do to finish connecting Supabase.

---

## ✅ Done for you

1. **`.env.local`** — Pre-filled with your Supabase URL and Publishable Key from your PNLCard project.
2. **SQL migration** — `supabase/migrations/20260215000000_pnlcard_initial.sql` defines:
   - `profiles` — user settings (display name, currency, theme, etc.)
   - `trades` — daily P&L entries with UNIQUE(user_id, trade_date)
   - `subscriptions` — Razorpay subscription records
   - **Row Level Security (RLS)** — users can only access their own rows
   - **Triggers** — `updated_at` kept in sync on updates

---

## 🔴 One thing you need to do: run the migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your **pnlcard** project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Copy the full contents of `supabase/migrations/20260215000000_pnlcard_initial.sql`.
5. Paste into the editor and click **Run** (or Cmd/Ctrl+Enter).

The migration creates the tables and policies. Once it runs without errors, the database is ready for the app.

---

## If the Publishable Key doesn’t work

Supabase projects can show different key names. If you see errors about invalid API keys:

1. In Supabase: **Project Settings** → **API**.
2. Copy the **anon** (or **anon public**) key.
3. In `.env.local`, set:
   ```bash
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

The app supports both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## Service role key (for shareable card links)

The public card page `/card/[id]` fetches trade data to display shared cards. It uses the **service role** key (bypasses RLS) because visitors are not logged in.

1. In Supabase: **Project Settings** → **API**.
2. Copy the **service_role** key (keep it secret).
3. In `.env.local`, add:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

Without this key, shareable card links will show 404. The dashboard card generator still works (it uses the authenticated session).

---

## What you don't need to do

- Create tables by hand
- Write policies manually
- Provide the database password — the app uses the REST API via the anon/publishable key.

The direct connection string (`postgresql://postgres:[YOUR-PASSWORD]@...`) is only needed for tools like pgAdmin or migrations via the Supabase CLI, not for the Next.js app.

---

## Enable Google OAuth (optional)

To use "Continue with Google":

1. Supabase → **Authentication** → **Providers** → **Google**
2. Enable Google, add your OAuth client ID and secret (from [Google Cloud Console](https://console.cloud.google.com/))
3. Add redirect URL: `https://vdmcozjatornwushxjpp.supabase.co/auth/v1/callback`

For local dev, add `http://localhost:3000/auth/callback` under **Authentication** → **URL Configuration** → **Redirect URLs**.

---

## Fix: "Access blocked: Authorization Error" / "The OAuth client was not found" (Error 401: invalid_client)

This error means **Google doesn’t recognize the OAuth client** your app is using. Fix it by creating the right credentials in Google and then putting them in Supabase.

### Step 1 — Create OAuth credentials in Google Cloud

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or create one, e.g. "PNLCard").
3. Go to **APIs & Services** → **Credentials**.
4. Click **+ Create Credentials** → **OAuth client ID**.
5. If asked, set up the **OAuth consent screen** first:
   - User type: **External** (or Internal if it’s only for your org).
   - Fill App name (e.g. "PNLCard"), support email, and save.
6. Back in **Create OAuth client ID**:
   - Application type: **Web application**.
   - Name: e.g. "PNLCard Web".
   - Under **Authorized redirect URIs**, click **Add URI** and add **exactly**:
     - `https://vdmcozjatornwushxjpp.supabase.co/auth/v1/callback`
   - Save.
7. Copy the **Client ID** and **Client secret** (you’ll paste these into Supabase).

**Why this matters:** Google only allows sign-in if the redirect URI matches. Supabase receives the callback from Google at the URL above, so that URI must be listed in Google.

### Step 2 — Put the same credentials in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your **pnlcard** project.
2. Go to **Authentication** → **Providers** → **Google**.
3. Turn **Google** **ON**.
4. Paste the **Client ID** from Step 1 into **Client ID** (no spaces or typos).
5. Paste the **Client secret** from Step 1 into **Client secret**.
6. Save.

**Why this matters:** Supabase sends this Client ID to Google when you click "Sign in with Google". If the ID is wrong or from another project, Google returns "OAuth client was not found".

### Step 3 — Redirect URLs in Supabase (for your app)

So Supabase can send users back to your app after login:

1. In Supabase: **Authentication** → **URL Configuration** → **Redirect URLs**.
2. Add:
   - `http://localhost:3000/auth/callback` (local dev)
   - Your production URL if you have one, e.g. `https://yourdomain.com/auth/callback`

After this, try "Sign in with Google" again. If it still fails, double-check that the Client ID and secret in Supabase match the Web application client you created in Google Cloud, and that the redirect URI in Google is exactly `https://vdmcozjatornwushxjpp.supabase.co/auth/v1/callback`.
