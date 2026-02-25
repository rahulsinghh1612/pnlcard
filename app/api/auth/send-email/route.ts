import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET!;

interface EmailHookPayload {
  user: {
    email: string;
    email_new?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
}

function buildConfirmLink(
  siteUrl: string,
  tokenHash: string,
  type: string,
  redirectTo: string
) {
  const base = siteUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next: redirectTo || "/dashboard",
  });
  return `${base}/auth/callback?${params.toString()}`;
}

function subjectFor(actionType: string): string {
  switch (actionType) {
    case "signup":
      return "Confirm your PnLCard account";
    case "recovery":
      return "Reset your PnLCard password";
    case "invite":
      return "You've been invited to PnLCard";
    case "magiclink":
      return "Your PnLCard login link";
    case "email_change":
      return "Confirm your new email for PnLCard";
    default:
      return "PnLCard — Action required";
  }
}

function htmlFor(actionType: string, link: string, token: string): string {
  const buttonStyle =
    "display:inline-block;padding:12px 32px;background-color:#16a34a;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;font-size:16px;";

  switch (actionType) {
    case "signup":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Welcome to PnLCard!</h2>
          <p style="color:#52525b;line-height:1.6;">Click the button below to confirm your email and activate your account.</p>
          <div style="margin:24px 0;">
            <a href="${link}" style="${buttonStyle}">Confirm Email</a>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">Or use this code: <strong>${token}</strong></p>
          <p style="color:#a1a1aa;font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>`;
    case "recovery":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#52525b;line-height:1.6;">Click the button below to reset your PnLCard password.</p>
          <div style="margin:24px 0;">
            <a href="${link}" style="${buttonStyle}">Reset Password</a>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">Or use this code: <strong>${token}</strong></p>
          <p style="color:#a1a1aa;font-size:13px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>`;
    case "email_change":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Confirm your new email</h2>
          <p style="color:#52525b;line-height:1.6;">Click the button below to confirm your email change on PnLCard.</p>
          <div style="margin:24px 0;">
            <a href="${link}" style="${buttonStyle}">Confirm Email Change</a>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">Or use this code: <strong>${token}</strong></p>
        </div>`;
    default:
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">PnLCard</h2>
          <p style="color:#52525b;line-height:1.6;">Click below to continue.</p>
          <div style="margin:24px 0;">
            <a href="${link}" style="${buttonStyle}">Continue</a>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">Code: <strong>${token}</strong></p>
        </div>`;
  }
}

export async function POST(req: Request) {
  if (!hookSecret) {
    return NextResponse.json(
      { error: { message: "Missing SEND_EMAIL_HOOK_SECRET" } },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Strip the "v1,whsec_" prefix if present — standardwebhooks expects raw base64
  const secret = hookSecret.replace("v1,whsec_", "");
  const wh = new Webhook(secret);

  let data: EmailHookPayload;
  try {
    data = wh.verify(payload, headers) as EmailHookPayload;
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid webhook signature" } },
      { status: 401 }
    );
  }

  const { user, email_data } = data;
  const { email_action_type, token, token_hash, site_url, redirect_to } =
    email_data;

  const siteUrl = site_url || "https://pnlcard.com";

  try {
    if (
      email_action_type === "email_change" &&
      email_data.token_new &&
      email_data.token_hash_new
    ) {
      // Secure email change: send two emails
      // New email gets token_new + token_hash
      const newEmailLink = buildConfirmLink(
        siteUrl,
        token_hash,
        "email_change",
        redirect_to
      );
      await resend.emails.send({
        from: "PnLCard <noreply@pnlcard.com>",
        to: [user.email_new || user.email],
        subject: subjectFor("email_change"),
        html: htmlFor("email_change", newEmailLink, email_data.token_new),
      });

      // Current email gets token + token_hash_new
      const currentEmailLink = buildConfirmLink(
        siteUrl,
        email_data.token_hash_new,
        "email_change",
        redirect_to
      );
      await resend.emails.send({
        from: "PnLCard <noreply@pnlcard.com>",
        to: [user.email],
        subject: subjectFor("email_change"),
        html: htmlFor("email_change", currentEmailLink, token),
      });
    } else {
      // Standard flow: signup, recovery, magic link, etc.
      const confirmLink = buildConfirmLink(
        siteUrl,
        token_hash,
        email_action_type,
        redirect_to
      );

      const { error } = await resend.emails.send({
        from: "PnLCard <noreply@pnlcard.com>",
        to: [user.email],
        subject: subjectFor(email_action_type),
        html: htmlFor(email_action_type, confirmLink, token),
      });

      if (error) {
        throw error;
      }
    }
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json(
      { error: { message: errMsg } },
      { status: 500 }
    );
  }

  return NextResponse.json({});
}
