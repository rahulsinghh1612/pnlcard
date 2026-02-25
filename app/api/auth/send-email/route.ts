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

function htmlFor(actionType: string, token: string): string {
  const codeStyle =
    "display:inline-block;padding:16px 32px;background-color:#f4f4f5;border:2px solid #e4e4e7;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;font-family:monospace;";

  switch (actionType) {
    case "signup":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Welcome to PnLCard!</h2>
          <p style="color:#52525b;line-height:1.6;">Enter this code on the verification page to confirm your account:</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="${codeStyle}">${token}</span>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">This code expires in 1 hour.</p>
          <p style="color:#a1a1aa;font-size:13px;margin-top:16px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>`;
    case "recovery":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#52525b;line-height:1.6;">Enter this code to reset your PnLCard password:</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="${codeStyle}">${token}</span>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">This code expires in 1 hour.</p>
          <p style="color:#a1a1aa;font-size:13px;margin-top:16px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>`;
    case "email_change":
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">Confirm your new email</h2>
          <p style="color:#52525b;line-height:1.6;">Enter this code to confirm your email change:</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="${codeStyle}">${token}</span>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">This code expires in 1 hour.</p>
        </div>`;
    default:
      return `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#18181b;margin-bottom:8px;">PnLCard</h2>
          <p style="color:#52525b;line-height:1.6;">Your verification code:</p>
          <div style="margin:24px 0;text-align:center;">
            <span style="${codeStyle}">${token}</span>
          </div>
          <p style="color:#a1a1aa;font-size:13px;">This code expires in 1 hour.</p>
        </div>`;
  }
}

export async function POST(req: Request) {
  console.log("[send-email] Hook called");

  if (!hookSecret) {
    console.error("[send-email] Missing SEND_EMAIL_HOOK_SECRET env var");
    return NextResponse.json(
      { error: { message: "Missing SEND_EMAIL_HOOK_SECRET" } },
      { status: 500 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[send-email] Missing RESEND_API_KEY env var");
    return NextResponse.json(
      { error: { message: "Missing RESEND_API_KEY" } },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  console.log("[send-email] Verifying webhook signature...");

  const secret = hookSecret.replace("v1,whsec_", "");
  const wh = new Webhook(secret);

  let data: EmailHookPayload;
  try {
    data = wh.verify(payload, headers) as EmailHookPayload;
  } catch (err) {
    console.error("[send-email] Signature verification failed:", err);
    return NextResponse.json(
      { error: { message: "Invalid webhook signature" } },
      { status: 401 }
    );
  }

  const { user, email_data } = data;
  const { email_action_type, token } = email_data;

  console.log(
    `[send-email] Sending ${email_action_type} email to ${user.email}`
  );

  try {
    if (
      email_action_type === "email_change" &&
      email_data.token_new &&
      email_data.token_hash_new
    ) {
      await resend.emails.send({
        from: "PnLCard <noreply@contact.pnlcard.com>",
        to: [user.email_new || user.email],
        subject: subjectFor("email_change"),
        html: htmlFor("email_change", email_data.token_new),
      });

      await resend.emails.send({
        from: "PnLCard <noreply@contact.pnlcard.com>",
        to: [user.email],
        subject: subjectFor("email_change"),
        html: htmlFor("email_change", token),
      });
    } else {
      const { data: sendData, error } = await resend.emails.send({
        from: "PnLCard <noreply@contact.pnlcard.com>",
        to: [user.email],
        subject: subjectFor(email_action_type),
        html: htmlFor(email_action_type, token),
      });

      if (error) {
        console.error("[send-email] Resend error:", JSON.stringify(error));
        throw error;
      }

      console.log("[send-email] Email sent successfully:", sendData);
    }
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Failed to send email";
    console.error("[send-email] Failed:", errMsg);
    return NextResponse.json(
      { error: { message: errMsg } },
      { status: 500 }
    );
  }

  console.log("[send-email] Done — returning 200");
  return NextResponse.json({});
}
