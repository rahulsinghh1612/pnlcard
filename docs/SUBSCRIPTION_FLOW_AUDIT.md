# Subscription Flow Audit

Last reviewed: 2026-05-11

## Goal

This document audits the current PnLCard subscription lifecycle against common SaaS subscription expectations and payment-provider best practices.

It focuses on:

- yearly free trials
- first-time subscribers
- cancelled trial users
- cancelled paid subscribers
- resubscribers
- account deletion and re-signup
- webhook-driven state changes

## External references

These are the main external references used for comparison:

- Razorpay: [About Webhooks](https://razorpay.com/docs/webhooks)
- Razorpay: [Subscriptions Webhook Events](https://razorpay.com/docs/webhooks/subscriptions/)
- Razorpay: [Cancel a Subscription](https://razorpay.com/docs/api/payments/subscriptions/cancel-subscription/?preferred-country=IN)
- Razorpay: [Subscriptions FAQs](https://razorpay.com/docs/payments/subscriptions/faqs/?locale=en-US)
- Stripe: [Using webhooks with subscriptions](https://docs.stripe.com/billing/subscriptions/webhooks)
- Stripe: [Use trial periods on subscriptions](https://docs.stripe.com/billing/subscriptions/trials)
- Stripe: [Cancel subscriptions](https://docs.stripe.com/billing/subscriptions/cancel)
- Stripe: [Limit customers to one subscription](https://docs.stripe.com/payments/checkout/limit-subscriptions)

## Best-practice baseline

Across subscription apps, the usual standards are:

- Webhooks are the source of truth for asynchronous billing state.
- The app can optimistically refresh UI after checkout, but must tolerate delayed provider updates.
- Trial eligibility is persisted separately from the current subscription state.
- Cancelling a trial stops the upcoming charge but does not remove already-granted access before the trial end date.
- Cancelling a paid subscription preserves access until the paid-through date.
- Resubscribers can subscribe again immediately.
- A user who already consumed a free trial does not get the same trial again.
- Subscription history should survive account deletion if the business wants to prevent repeat-trial abuse.
- The UI should always distinguish:
  - active and chargeable
  - active but already cancelled
  - expired
  - paid active
  - paid cancelled but still entitled until period end

## Current implementation summary

Current subscription state is spread across:

- `profiles.plan`
- `profiles.plan_expires_at`
- `profiles.trial_ends_at`
- `profiles.yearly_trial_used_at`
- `subscriptions.status`
- `subscriptions.plan_type`
- `subscriptions.current_period_end`

Key routes/components:

- [app/api/razorpay/create-subscription/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/razorpay/create-subscription/route.ts)
- [app/api/razorpay/verify-subscription/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/razorpay/verify-subscription/route.ts)
- [app/api/webhooks/razorpay/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/webhooks/razorpay/route.ts)
- [app/api/razorpay/cancel-subscription/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/razorpay/cancel-subscription/route.ts)
- [app/dashboard/settings/page.tsx](/Users/rahulsingh/Desktop/pnlcard/app/dashboard/settings/page.tsx)
- [components/dashboard/upgrade-button.tsx](/Users/rahulsingh/Desktop/pnlcard/components/dashboard/upgrade-button.tsx)
- [app/api/account/delete/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/account/delete/route.ts)

## Scenario audit

### 1. First-time yearly subscriber

Expected:

- gets the 7-day yearly free trial once
- sees immediate UI feedback
- trial end date is visible
- can cancel upcoming charge without losing trial access early

Current:

- supported
- `yearly_trial_used_at` is now set when the yearly trial starts
- client now retries/polls when checkout verification is temporarily delayed

Status: Mostly good

### 2. First-time monthly subscriber

Expected:

- no trial
- subscription starts immediately
- cancellation preserves access until paid-through date

Current:

- supported

Status: Good

### 3. Cancelled yearly-trial user

Expected:

- annual charge is cancelled
- access remains until trial end date
- UI clearly says the trial is cancelled but still active until the end date
- resubscribe is available immediately
- no second free trial

Current:

- charge cancellation is handled
- access-until-end-date behavior is now handled
- settings UI distinguishes active-chargeable vs cancelled-trial states
- yearly free trial reuse is blocked by `yearly_trial_used_at`
- resubscribe is available in settings

Status: Good, but should still be browser-tested against live Razorpay behavior

### 4. Cancelled paid subscriber

Expected:

- cancellation stops renewal
- access remains until paid-through date
- resubscribe is available immediately
- UI clearly shows `Access until DATE`

Current:

- paid cancellation preserves access via `plan_expires_at`
- settings offers `Renew subscription`

Gap:

- the UX language is functional but not yet as explicit as a full billing portal

Status: Acceptable

### 5. Resubscriber after cancellation

Expected:

- monthly and yearly should both be available immediately
- no second yearly free trial if already used once

Current:

- now supported in checkout logic and settings copy

Status: Good

### 6. Trial expiry

Expected:

- when the trial expires without cancellation, the annual charge should convert access correctly
- if payment fails, user should not be silently left in a confusing state

Current:

- yearly trial uses Razorpay subscription auth flow
- active subscription webhooks promote user to paid
- a cron exists for downgrading expired paid users

Gaps:

- no dedicated audit of failed yearly trial conversion
- no handling for all provider lifecycle states such as `halted`, `completed`, `paused` in product UX
- no clear user messaging for failed renewal / failed first charge after trial

Status: Partial

### 7. User deletes account, then signs up again

Expected:

- business must decide whether deleting the account should also erase trial/subscription eligibility history
- industry standard for anti-abuse is usually to preserve billing/trial history under a stable customer identity

Current:

- [app/api/account/delete/route.ts](/Users/rahulsingh/Desktop/pnlcard/app/api/account/delete/route.ts) deletes:
  - trades
  - subscriptions
  - profile
  - auth user
- this also deletes `yearly_trial_used_at`
- if the same person signs up again later as a fresh auth user, the app currently has no durable cross-account memory that the trial was already used

Status: Major gap

### 8. Duplicate / multi-account subscription abuse

Expected:

- one human should not be able to repeatedly claim first-time trials just by recreating accounts

Current:

- eligibility is stored only on `profiles`, keyed by `auth.users.id`
- deleting the account removes the eligibility record
- there is no durable billing-history table keyed by provider customer, email hash, phone, or another stable identity

Status: Major gap

## Current gaps vs best practice

### Gap 1. Trial history is not durable across account deletion

Risk:

- users can potentially regain yearly free trial eligibility by deleting and recreating the account

Why it matters:

- this is the single biggest lifecycle gap left in the current flow

Best-practice direction:

- preserve subscription/trial history in a durable billing identity table that is not deleted with the in-app profile

Suggested fix:

- add a `billing_customers` or `customer_entitlements` table
- key it by normalized email plus provider customer/subscription identifiers
- keep `yearly_trial_used_at`, `first_paid_at`, `last_subscription_status`
- on account deletion:
  - delete app data
  - optionally delete auth user
  - do not delete durable billing/trial history

Priority: P0

### Gap 2. Trial eligibility is not enforced from a provider-side customer identity

Risk:

- if a new auth account is created, app-side history can be bypassed

Suggested fix:

- persist Razorpay customer identity when available
- use that durable identity for trial eligibility checks

Priority: P0

### Gap 3. No full billing portal / manage-subscription surface

Risk:

- user actions are split across narrow buttons and status-specific UI

Suggested fix:

- create a single Billing section showing:
  - current status
  - renewal/charge date
  - next amount
  - cancel / resubscribe / resume actions
  - whether trial has already been consumed

Priority: P1

### Gap 4. Incomplete lifecycle coverage for non-happy-path provider states

Current code recognizes more statuses in the DB than the product really surfaces.

Missing explicit handling:

- `halted`
- `pending`
- `completed`
- `paused`
- post-trial first-charge failure
- renewal failure

Suggested fix:

- define a product-state mapping table from provider status -> app UX/status copy/action
- add UI and webhook handling for payment-failure states

Priority: P1

### Gap 5. Legacy migration history is confusing

Current migration history includes:

- [supabase/migrations/20260320000000_free_trial.sql](/Users/rahulsingh/Desktop/pnlcard/supabase/migrations/20260320000000_free_trial.sql)
  - originally gave all users a 14-day default trial
- [supabase/migrations/20260509000000_yearly_trial_only.sql](/Users/rahulsingh/Desktop/pnlcard/supabase/migrations/20260509000000_yearly_trial_only.sql)
  - removed the automatic default

Risk:

- future engineers may misunderstand the intended trial model

Suggested fix:

- add a short schema note in docs or a follow-up migration comment describing the final intended rules:
  - no automatic onboarding trial
  - yearly plan only can grant a one-time 7-day free trial

Priority: P2

### Gap 6. Trial nudges still assume every user with trial history is a trial candidate

Current file:

- [components/dashboard/trial-toast-nudge.tsx](/Users/rahulsingh/Desktop/pnlcard/components/dashboard/trial-toast-nudge.tsx)

Risk:

- messaging may become misleading for users who already cancelled, converted, or are no longer eligible for another trial

Suggested fix:

- rework nudges around actual billing state, not just `trial_ends_at` + history

Priority: P2

## Recommended target state

### Product rules

1. A yearly free trial is available once per real customer, not once per auth account.
2. Monthly never has a free trial.
3. If a user cancels during the yearly free trial:
   - the upcoming annual charge is cancelled
   - access remains until the trial end date
   - the yearly free trial is considered consumed forever
4. If a user cancels a paid subscription:
   - access remains until the paid-through date
   - they can resubscribe anytime
5. If a user resubscribes after previously using the yearly trial:
   - yearly starts immediately as paid
   - monthly starts immediately as paid
6. Account deletion does not erase billing/trial eligibility history.

### Data model additions

Recommended durable table:

- `billing_customers`
  - `id`
  - `normalized_email`
  - `latest_auth_user_id`
  - `razorpay_customer_id` if available
  - `latest_provider_subscription_id`
  - `yearly_trial_used_at`
  - `first_paid_at`
  - `last_known_status`
  - `deleted_account_at`

This lets the app preserve anti-abuse and billing history while still honoring account deletion for product data.

## Proposed implementation plan

### Phase 1. Close the major policy gap

- Add durable billing/trial history independent of `profiles`
- Stop deleting billing eligibility history on account deletion
- On signup/login, reconcile the auth account with prior billing history

### Phase 2. Normalize subscription state handling

- Create a single function that maps provider state + profile state -> product billing state
- Reuse it in settings, dashboard, paywalls, and checkout success handling

### Phase 3. Improve user-facing billing UX

- Replace ad hoc trial/subscription fragments with one clear Billing card
- Always show:
  - status
  - current access end date
  - next charge date
  - next charge amount
  - available actions

### Phase 4. Add lifecycle testing

Minimum test matrix:

- first-time monthly subscribe
- first-time yearly trial start
- yearly trial cancelled before charge
- yearly trial converts to paid
- yearly trial payment fails at conversion
- paid subscription cancelled at cycle end
- cancelled paid user resubscribes monthly
- cancelled paid user resubscribes yearly
- user who already used yearly trial selects yearly again
- user deletes account and signs up again
- user cancels from UPI app instead of app UI

## Recommended next fixes

In order:

1. Preserve trial/subscription history across account deletion.
2. Add a durable billing identity table and reconcile by email/provider identity.
3. Create a single billing-state mapper used everywhere.
4. Expand webhook + UI handling for failed and edge statuses.
5. Build a more complete Billing settings card with status, next charge, and actions.

## Bottom line

The current flow is much stronger than before for:

- yearly trial checkout
- trial cancellation
- cancelled-trial messaging
- resubscribe behavior
- preventing second yearly trials on the same profile

But the biggest remaining lifecycle gap is still this:

If a user deletes their account and signs up again, the app currently has no durable memory that the yearly free trial was already used.

That is the first thing I would fix next if we want the flow to be production-solid.
