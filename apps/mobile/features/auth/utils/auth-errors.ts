import type {
  AuthActionResult,
  AuthErrorCode,
} from "@/features/auth/types/auth.types";

function fromCode(code: AuthErrorCode, message: string): AuthActionResult {
  return {
    ok: false,
    code,
    message,
  };
}

export function mapAuthError(error: unknown): AuthActionResult {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return fromCode("invalid_credentials", "Invalid email or password.");
  }

  if (normalized.includes("email not confirmed")) {
    return fromCode(
      "email_not_confirmed",
      "Please confirm your email before logging in.",
    );
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return fromCode(
      "rate_limited",
      "Too many attempts. Please wait a minute and try again.",
    );
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return fromCode(
      "network",
      "Network issue detected. Check your connection and retry.",
    );
  }

  return fromCode("unknown", message);
}
