/**
 * Email validation guardrails for signup.
 * Catches invalid formats, typos in common domains, and disposable addresses.
 */

// Common disposable/temporary email domains (partial list - can be extended)
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "yopmail.com",
  "temp-mail.org",
  "getnada.com",
  "maildrop.cc",
  "sharklasers.com",
  "guerrillamail.org",
  "mailnesia.com",
  "tempinbox.com",
  "dispostable.com",
  "mohmal.com",
  "emailondeck.com",
  "mailinator.net",
  "inboxkitten.com",
]);

// Common domain typos and their corrections
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outlook.con": "outlook.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "icloud.con": "icloud.com",
  "iclod.com": "icloud.com",
};

// Simplified but robust email regex (covers most valid addresses)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export type EmailValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, message: "Please enter your email address." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  const domain = trimmed.split("@")[1];
  if (!domain) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  // Check for disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: "Please use a permanent email address (temporary emails are not allowed).",
    };
  }

  // Check for common typos and suggest correction
  const suggestedDomain = DOMAIN_TYPOS[domain];
  if (suggestedDomain) {
    return {
      valid: false,
      message: `Did you mean @${suggestedDomain}? Please check for typos.`,
    };
  }

  return { valid: true };
}
