export type AuthErrorCode =
  | "validation"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "network"
  | "recovery_link_invalid"
  | "unknown";

export type AuthActionResult = {
  ok: boolean;
  code?: AuthErrorCode;
  message?: string;
  requiresEmailVerification?: boolean;
  requiresSignIn?: boolean;
  email?: string;
};
